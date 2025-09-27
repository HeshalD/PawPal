import React, { useState } from "react";
import OrderConfirmationModal from "./OrderConfirmationModal";

function OrderModal({ item, isOpen, onClose, onOrder }) {
  const [orderDetails, setOrderDetails] = useState({
    quantity: 1,
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    deliveryAddress: "",
    notes: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const order = {
      itemId: item._id,
      itemName: item.Item_Name,
      itemPrice: item.Price,
      quantity: parseInt(orderDetails.quantity),
      totalAmount: parseFloat(item.Price) * parseInt(orderDetails.quantity),
      customerName: orderDetails.customerName,
      customerEmail: orderDetails.customerEmail,
      customerPhone: orderDetails.customerPhone,
      deliveryAddress: orderDetails.deliveryAddress,
      notes: orderDetails.notes,
      status: "pending",
      orderDate: new Date().toISOString()
    };

    try {
      const result = await onOrder(order);
      // Show confirmation modal with order details
      setConfirmedOrder(result || order);
      setShowConfirmation(true);
      // Don't close the modal yet, let user see confirmation
    } catch (error) {
      console.error("Order failed:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#6638E6] to-[#E6738F] text-white px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Place Order</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Item Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Item Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Item Name:</span>
                <p className="font-medium">{item.Item_Name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Price:</span>
                <p className="font-medium">Rs. {parseFloat(item.Price).toFixed(2)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Available Stock:</span>
                <p className="font-medium">{item.Quantity} {item.Unit_of_Measure}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Category:</span>
                <p className="font-medium">{item.Category}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Order Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                value={orderDetails.quantity}
                onChange={handleChange}
                min="1"
                max={item.Quantity}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Maximum available: {item.Quantity} {item.Unit_of_Measure}
              </p>
            </div>

            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={orderDetails.customerName}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter customer name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  value={orderDetails.customerEmail}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={orderDetails.customerPhone}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Amount
                </label>
                <input
                  type="text"
                  value={`Rs. ${(parseFloat(item.Price) * parseInt(orderDetails.quantity)).toFixed(2)}`}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100"
                  readOnly
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Address *
              </label>
              <textarea
                name="deliveryAddress"
                value={orderDetails.deliveryAddress}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter complete delivery address"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={orderDetails.notes}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Any special instructions or notes"
                rows={2}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-[#6638E6] to-[#E6738F] hover:from-[#6638E6] hover:to-[#E69AAE] text-white font-semibold px-6 py-2 rounded-md shadow-sm disabled:opacity-60 transition-all duration-300"
              >
                {submitting ? "Placing Order..." : "Place Order"}
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
          // Reset form and close modal
          setOrderDetails({
            quantity: 1,
            customerName: "",
            customerEmail: "",
            customerPhone: "",
            deliveryAddress: "",
            notes: ""
          });
          onClose();
        }}
      />
    </div>
  );
}

export default OrderModal;
