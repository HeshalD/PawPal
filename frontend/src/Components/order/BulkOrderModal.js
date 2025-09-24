import React, { useState } from "react";

function BulkOrderModal({ items, isOpen, onClose, onOrder }) {
  const [selectedItems, setSelectedItems] = useState({});
  const [customerInfo, setCustomerInfo] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    deliveryAddress: "",
    notes: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const handleItemSelect = (itemId, quantity) => {
    if (quantity > 0) {
      setSelectedItems(prev => ({
        ...prev,
        [itemId]: quantity
      }));
    } else {
      setSelectedItems(prev => {
        const newSelected = { ...prev };
        delete newSelected[itemId];
        return newSelected;
      });
    }
  };

  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotal = () => {
    return Object.entries(selectedItems).reduce((total, [itemId, quantity]) => {
      const item = items.find(i => i._id === itemId);
      return total + (parseFloat(item?.Price || 0) * quantity);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const orders = Object.entries(selectedItems).map(([itemId, quantity]) => {
        const item = items.find(i => i._id === itemId);
        return {
          itemId: item._id,
          itemName: item.Item_Name,
          itemPrice: item.Price,
          quantity: quantity,
          totalAmount: parseFloat(item.Price) * quantity,
          customerName: customerInfo.customerName,
          customerEmail: customerInfo.customerEmail,
          customerPhone: customerInfo.customerPhone,
          deliveryAddress: customerInfo.deliveryAddress,
          notes: customerInfo.notes,
          status: "pending",
          orderDate: new Date().toISOString()
        };
      });

      // Submit all orders
      for (const order of orders) {
        await onOrder(order);
      }

      onClose();
      setSelectedItems({});
      setCustomerInfo({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        deliveryAddress: "",
        notes: ""
      });
    } catch (error) {
      console.error("Bulk order submission failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#6638E6] to-[#E6738F] text-white px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Bulk Order</h2>
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Items Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Items</h3>
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Item</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Price</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Stock</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {items.map((item) => (
                      <tr key={item._id}>
                        <td className="px-4 py-2">
                          <div>
                            <div className="font-medium text-gray-900">{item.Item_Name}</div>
                            <div className="text-sm text-gray-500">{item.Category}</div>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-gray-900">Rs. {parseFloat(item.Price).toFixed(2)}</td>
                        <td className="px-4 py-2 text-gray-900">{item.Quantity} {item.Unit_of_Measure}</td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="0"
                            max={item.Quantity}
                            value={selectedItems[item._id] || 0}
                            onChange={(e) => handleItemSelect(item._id, parseInt(e.target.value) || 0)}
                            className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={customerInfo.customerName}
                    onChange={handleCustomerInfoChange}
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
                    value={customerInfo.customerEmail}
                    onChange={handleCustomerInfoChange}
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
                    value={customerInfo.customerPhone}
                    onChange={handleCustomerInfoChange}
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
                    value={`Rs. ${calculateTotal().toFixed(2)}`}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100"
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Address *
              </label>
              <textarea
                name="deliveryAddress"
                value={customerInfo.deliveryAddress}
                onChange={handleCustomerInfoChange}
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
                value={customerInfo.notes}
                onChange={handleCustomerInfoChange}
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
                disabled={submitting || Object.keys(selectedItems).length === 0}
                className="bg-gradient-to-r from-[#6638E6] to-[#E6738F] hover:from-[#6638E6] hover:to-[#E69AAE] text-white font-semibold px-6 py-2 rounded-md shadow-sm disabled:opacity-60 transition-all duration-300"
              >
                {submitting ? "Placing Orders..." : `Place ${Object.keys(selectedItems).length} Orders`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BulkOrderModal;

