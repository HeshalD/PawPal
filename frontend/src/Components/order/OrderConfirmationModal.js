import React, { useState } from "react";
import jsPDF from "jspdf";

function OrderConfirmationModal({ order, isOpen, onClose }) {
  const [copySuccess, setCopySuccess] = useState(false);
  
  if (!isOpen || !order) return null;

  const copyOrderId = async () => {
    const orderId = order.orderId || order._id;
    try {
      await navigator.clipboard.writeText(orderId);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = orderId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const downloadOrderPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Set up the document
      doc.setFontSize(20);
      doc.text("PawPal - Order Confirmation", 20, 20);
      
      // Add order details
      doc.setFontSize(12);
      const orderId = order.orderId || order._id || 'N/A';
      doc.text(`Order ID: ${orderId}`, 20, 40);
      doc.text(`Order Date: ${new Date(order.orderDate || new Date()).toLocaleDateString()}`, 20, 50);
      doc.text(`Status: ${(order.status || 'pending')?.charAt(0).toUpperCase() + (order.status || 'pending')?.slice(1)}`, 20, 60);
      
      // Customer information
      doc.setFontSize(14);
      doc.text("Customer Information", 20, 80);
      doc.setFontSize(12);
      doc.text(`Name: ${order.customerName || 'N/A'}`, 20, 95);
      doc.text(`Email: ${order.customerEmail || 'N/A'}`, 20, 105);
      doc.text(`Phone: ${order.customerPhone || 'N/A'}`, 20, 115);
      
      // Handle long addresses by splitting them
      const address = order.deliveryAddress || 'N/A';
      const addressLines = doc.splitTextToSize(`Address: ${address}`, 170);
      doc.text(addressLines, 20, 125);
      
      // Items information
      doc.setFontSize(14);
      doc.text("Order Items", 20, 145 + (addressLines.length - 1) * 5);
      doc.setFontSize(12);
      
      let yPosition = 160 + (addressLines.length - 1) * 5;
      
      // Handle both single item and multiple items
      if (order.items && Array.isArray(order.items)) {
        // Multiple items (from cart)
        order.items.forEach((item, index) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(`${index + 1}. ${item.itemName || 'N/A'}`, 20, yPosition);
          doc.text(`   Quantity: ${item.quantity || 0}`, 30, yPosition + 8);
          doc.text(`   Price: Rs. ${parseFloat(item.itemPrice || 0).toFixed(2)} each`, 30, yPosition + 16);
          doc.text(`   Total: Rs. ${parseFloat(item.itemTotal || 0).toFixed(2)}`, 30, yPosition + 24);
          yPosition += 35;
        });
      } else {
        // Single item (from individual order)
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`1. ${order.itemName || 'N/A'}`, 20, yPosition);
        doc.text(`   Quantity: ${order.quantity || 0}`, 30, yPosition + 8);
        doc.text(`   Price: Rs. ${parseFloat(order.itemPrice || 0).toFixed(2)} each`, 30, yPosition + 16);
        doc.text(`   Total: Rs. ${parseFloat(order.totalAmount || 0).toFixed(2)}`, 30, yPosition + 24);
        yPosition += 35;
      }
      
      // Total amount
      doc.setFontSize(14);
      doc.text(`Total Amount: Rs. ${parseFloat(order.totalAmount || 0).toFixed(2)}`, 20, yPosition + 10);
      
      // Notes if any
      if (order.notes) {
        doc.setFontSize(12);
        const notesLines = doc.splitTextToSize(`Notes: ${order.notes}`, 170);
        doc.text(notesLines, 20, yPosition + 30);
      }
      
      // Footer
      doc.setFontSize(10);
      doc.text("Thank you for choosing PawPal!", 20, doc.internal.pageSize.height - 20);
      doc.text("For any queries, contact us at support@pawpal.com", 20, doc.internal.pageSize.height - 10);
      
      // Save the PDF
      const fileName = `PawPal_Order_${orderId.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const formatOrderDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold">Order Confirmed!</h2>
            </div>
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
          {/* Success Message */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Your order has been placed successfully!
            </h3>
            <p className="text-gray-600">
              We'll process your order and send you updates via email.
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Order Details</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-sm text-gray-600">Order ID:</span>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-lg text-[#6638E6]">
                    {order.orderId || order._id}
                  </p>
                  <button
                    onClick={copyOrderId}
                    className="relative p-1 text-gray-500 hover:text-[#6638E6] transition-colors group"
                    title="Copy Order ID"
                  >
                    {copySuccess ? (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                    {copySuccess && (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        Copied!
                      </div>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Order Date:</span>
                <p className="font-medium">{formatOrderDate(order.orderDate)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Status:</span>
                <p className="font-medium">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Total Amount:</span>
                <p className="font-medium text-lg text-green-600">
                  Rs. {parseFloat(order.totalAmount).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Name:</span>
                <p className="font-medium">{order.customerName}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Email:</span>
                <p className="font-medium">{order.customerEmail}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Phone:</span>
                <p className="font-medium">{order.customerPhone}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Delivery Address:</span>
                <p className="font-medium">{order.deliveryAddress}</p>
              </div>
            </div>
            
            {order.notes && (
              <div className="mt-4">
                <span className="text-sm text-gray-600">Notes:</span>
                <p className="font-medium">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h4>
            
            {order.items && Array.isArray(order.items) ? (
              // Multiple items (from cart)
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium text-gray-800">{item.itemName}</h5>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-600">Price: Rs. {parseFloat(item.itemPrice).toFixed(2)} each</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          Rs. {parseFloat(item.itemTotal).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Single item (from individual order)
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium text-gray-800">{order.itemName}</h5>
                    <p className="text-sm text-gray-600">Quantity: {order.quantity}</p>
                    <p className="text-sm text-gray-600">Price: Rs. {parseFloat(order.itemPrice).toFixed(2)} each</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      Rs. {parseFloat(order.totalAmount).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={downloadOrderPDF}
              className="flex-1 bg-gradient-to-r from-[#6638E6] to-[#E6738F] hover:from-[#6638E6] hover:to-[#E69AAE] text-white font-semibold py-3 px-6 rounded-md shadow-sm transition-all duration-300 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF Summary
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold py-3 px-6 rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmationModal;
