import React, { useState } from 'react';
import { useCart } from '../../Contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import OrderConfirmationModal from '../order/OrderConfirmationModal';

const Cart = ({ isOpen, onClose }) => {
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getTotalItems, 
    getTotalPrice,
    getItemTotal 
  } = useCart();
  
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    setShowCheckout(true);
  };

  const handleCloseCheckout = () => {
    setShowCheckout(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Cart Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>
      
      {/* Cart Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
        {/* Cart Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Shopping Cart ({getTotalItems()})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Add some items to get started!</p>
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-[#6638E6] to-[#E6738F] text-white px-6 py-2 rounded-md hover:from-[#6638E6] hover:to-[#E69AAE] transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item._id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  {/* Item Image */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img
                        src={`http://localhost:5000${item.image}`}
                        alt={item.Item_Name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">
                        🐾
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {item.Item_Name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Rs. {item.Price ? parseFloat(item.Price).toFixed(2) : '0.00'}
                    </p>
                    <p className="text-xs text-gray-400">
                      Stock: {item.Quantity || 0}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    
                    <span className="w-8 text-center text-sm font-medium text-gray-900">
                      {item.quantity}
                    </span>
                    
                    <button
                      onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                      disabled={item.quantity >= (item.Quantity || 0)}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      Rs. {getItemTotal(item).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-xs text-red-600 hover:text-red-800 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-6">
            {/* Total */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-xl font-bold text-[#6638E6]">
                Rs. {getTotalPrice().toFixed(2)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-[#6638E6] to-[#E6738F] text-white py-3 rounded-md font-semibold hover:from-[#6638E6] hover:to-[#E69AAE] transition-colors"
              >
                Proceed to Checkout
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={clearCart}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md font-medium hover:bg-gray-200 transition-colors"
                >
                  Clear Cart
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md font-medium hover:bg-gray-200 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          items={items}
          totalPrice={getTotalPrice()}
          onClose={handleCloseCheckout}
          onOrderComplete={() => {
            clearCart();
            setShowCheckout(false);
            onClose();
          }}
        />
      )}
    </>
  );
};

// Checkout Modal Component
const CheckoutModal = ({ items, totalPrice, onClose, onOrderComplete }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryAddress: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const generateOrderId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `PP-${timestamp}-${random}`.toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare order data with all items
      const orderData = {
        ...formData,
        items: items.map(item => ({
          itemId: item._id,
          itemName: item.Item_Name,
          itemPrice: item.Price,
          quantity: item.quantity,
          itemTotal: item.Price * item.quantity
        })),
        totalAmount: totalPrice
      };
      
      const response = await fetch('http://localhost:5000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      
      if (response.ok) {
        const orderId = result.order?.orderId || generateOrderId();
        setOrderId(orderId);
        
        // Create order object for confirmation modal
        const orderForConfirmation = {
          ...orderData,
          orderId: orderId,
          orderDate: new Date().toISOString(),
          status: 'pending'
        };
        
        setConfirmedOrder(orderForConfirmation);
        setShowConfirmation(true);
        // Don't call onOrderComplete yet, let user see confirmation
      } else {
        throw new Error(result.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Order Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item._id} className="flex justify-between text-sm">
                  <span>{item.Item_Name} x {item.quantity}</span>
                  <span>Rs. {(item.Price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total:</span>
                <span>Rs. {totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6638E6] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6638E6] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6638E6] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Address *
              </label>
              <textarea
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6638E6] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6638E6] focus:border-transparent outline-none"
                placeholder="Any special instructions..."
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-[#6638E6] to-[#E6738F] text-white py-2 rounded-md font-semibold hover:from-[#6638E6] hover:to-[#E69AAE] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        order={confirmedOrder}
        isOpen={showConfirmation}
        onClose={() => {
          setShowConfirmation(false);
          setConfirmedOrder(null);
          // Now complete the order process
          onOrderComplete();
        }}
      />
    </div>
  );
};

export default Cart;
