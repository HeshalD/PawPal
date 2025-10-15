import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import logo from "../Nav/logo.jpg";

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

  // helpers used to align with other PDFs
  const toDataURL = (url) => new Promise((resolve, reject) => {
    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      })
      .catch(reject);
  });

  const addPdfHeader = async (doc, title) => {
    const pageW = doc.internal.pageSize.getWidth();
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`Time: ${timeStr}`, 40, 28);
    doc.text(`Date: ${dateStr}`, pageW - 40, 28, { align: 'right' });
    try {
      const imgData = await toDataURL(logo);
      const imgW = 60, imgH = 60;
      doc.addImage(imgData, 'JPEG', (pageW - imgW) / 2, 34, imgW, imgH);
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text(title, pageW / 2, 34 + imgH + 18, { align: 'center' });
      doc.setDrawColor(0,0,0);
      doc.setLineWidth(0.8);
      doc.line(40, 34 + imgH + 26, pageW - 40, 34 + imgH + 26);
      return 34 + imgH + 36;
    } catch {
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text(title, pageW / 2, 46, { align: 'center' });
      doc.setDrawColor(0,0,0);
      doc.setLineWidth(0.8);
      doc.line(40, 56, pageW - 40, 56);
      return 66;
    }
  };

  const downloadOrderPDF = async () => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const M = 40;
      let y = await addPdfHeader(doc, 'PawPal - Order Summary');

      // Order meta
      doc.setFontSize(12);
      const orderId = (order.orderId || order._id || 'N/A').toString();
      doc.text(`Order ID: ${orderId}`, M, y); y += 16;
      doc.text(`Order Date: ${new Date(order.orderDate || new Date()).toLocaleString()}`, M, y); y += 16;
      const status = (order.status || 'pending');
      doc.text(`Status: ${status.charAt(0).toUpperCase()}${status.slice(1)}`, M, y); y += 16;
      doc.text(`Generated On: ${new Date().toLocaleString()}`, M, y); y += 24;

      // Customer Information
      doc.setFontSize(13);
      doc.text('Customer Information', M, y); y += 8;
      doc.line(M, y, pageW - M, y); y += 14;
      doc.setFontSize(12);
      doc.text(`Name: ${order.customerName || 'N/A'}`, M, y); y += 16;
      doc.text(`Email: ${order.customerEmail || 'N/A'}`, M, y); y += 16;
      doc.text(`Phone: ${order.customerPhone || 'N/A'}`, M, y); y += 16;
      const addrLines = doc.splitTextToSize(order.deliveryAddress || 'N/A', pageW - M*2 - 60);
      doc.text('Address:', M, y);
      doc.text(addrLines, M + 60, y);
      y += (addrLines.length * 12) + 16;

      const items = Array.isArray(order.items)
        ? order.items
        : [{ itemName: order.itemName, itemPrice: order.itemPrice, quantity: order.quantity, itemTotal: order.totalAmount }];

      doc.setFontSize(13);
      doc.text('Items', M, y); y += 8;
      doc.line(M, y, pageW - M, y);

      autoTable(doc, {
        startY: y + 8,
        head: [[ 'Item', 'Qty', 'Unit', 'Total' ]],
        body: items.map(it => {
          const qty = parseInt(it.quantity || 0, 10) || 0;
          const unit = Number.parseFloat(it.itemPrice) || 0;
          const lineTotal = Number.parseFloat(it.itemTotal) || (unit * qty);
          return [
            (it.itemName || '-').toString(),
            String(qty),
            `Rs. ${unit.toFixed(2)}`,
            `Rs. ${lineTotal.toFixed(2)}`
          ];
        }),
        theme: 'striped',
        headStyles: { fillColor: [102,56,230], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 4 },
        margin: { left: M, right: M }
      });

      y = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 10 : y + 40;

      // Summary (right aligned)
      const subtotal = items.reduce((t, it) => t + ((Number.parseFloat(it.itemPrice) || 0) * (parseInt(it.quantity || 0, 10) || 0)), 0);
      const totalAmount = Number.parseFloat(order.totalAmount || 0) || 0;
      const discount = Math.max(0, subtotal - totalAmount);
      const labelX = pageW - M - 180;
      const valueX = pageW - M;
      y += 10;
      doc.setFontSize(12);
      doc.text('Subtotal', labelX, y, { align: 'right' });
      doc.text(`Rs. ${subtotal.toFixed(2)}`, valueX, y, { align: 'right' });
      y += 16;
      if (discount > 0) {
        doc.text('Discount', labelX, y, { align: 'right' });
        doc.text(`- Rs. ${discount.toFixed(2)}`, valueX, y, { align: 'right' });
        y += 16;
      }
      doc.setLineWidth(0.5);
      doc.line(labelX - 120, y, valueX, y); y += 12;
      doc.setFontSize(13);
      doc.text('Total', labelX, y, { align: 'right' });
      doc.text(`Rs. ${totalAmount.toFixed(2)}`, valueX, y, { align: 'right' });
      y += 24;

      // Notes
      if (order.notes) {
        doc.setFontSize(12);
        doc.text('Notes', M, y); y += 8;
        doc.line(M, y, pageW - M, y); y += 12;
        const notesLines = doc.splitTextToSize(order.notes, pageW - M*2);
        doc.text(notesLines, M, y);
        y += (notesLines.length * 12) + 8;
      }

      // Footer
      doc.setFontSize(10);
      doc.text('Thank you for choosing PawPal!', M, pageH - 28);
      doc.text('For any queries, contact us at support@pawpal.com', M, pageH - 14);

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
