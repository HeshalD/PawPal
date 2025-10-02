import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE = "http://localhost:5000/orders";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(API_BASE);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      if (error.code === 'ERR_NETWORK') {
        alert("Cannot connect to server. Please make sure the backend is running on http://localhost:5000");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    if (!orderId) {
      alert("Invalid order ID");
      return;
    }

    if (!window.confirm("Are you sure you want to accept this order? It will be marked as completed.")) {
      return;
    }

    try {
      console.log("Sending accept request for order:", orderId);
      console.log("Request URL:", `${API_BASE}/${orderId}`);
      console.log("Request payload:", { status: "completed" });

      const response = await axios.patch(
        `${API_BASE}/${orderId}`,
        { status: "completed" },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 5000, // 5 second timeout
        }
      );

      console.log("Accept response:", response.data);

      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: "completed", completedDate: new Date() } : order
        )
      );

      alert("Order accepted and marked as completed!");
    } catch (error) {
      console.error("Failed to accept order:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });

      if (error.code === 'ERR_NETWORK') {
        alert("Network Error: Cannot connect to the server. Please check if the backend is running on http://localhost:5000");
      } else if (error.code === 'ECONNABORTED') {
        alert("Request timeout. The server took too long to respond.");
      } else {
        const errorMsg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Unknown error occurred";
        alert(`Failed to accept order: ${errorMsg}`);
      }
    }
  };

  const handleRejectOrder = async (orderId) => {
    if (!orderId) {
      alert("Invalid order ID");
      return;
    }

    if (!window.confirm("Are you sure you want to reject this order? This action cannot be undone.")) {
      return;
    }

    try {
      console.log("Sending reject request for order:", orderId);
      console.log("Request URL:", `${API_BASE}/${orderId}`);
      console.log("Request payload:", { status: "cancelled" });

      const response = await axios.patch(
        `${API_BASE}/${orderId}`,
        { status: "cancelled" },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 5000,
        }
      );

      console.log("Reject response:", response.data);

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: "cancelled", cancelledDate: new Date() } : order
        )
      );

      alert("Order has been cancelled successfully!");
    } catch (error) {
      console.error("Failed to reject order:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });

      if (error.code === 'ERR_NETWORK') {
        alert("Network Error: Cannot connect to the server. Please check if the backend is running on http://localhost:5000");
      } else if (error.code === 'ECONNABORTED') {
        alert("Request timeout. The server took too long to respond.");
      } else {
        const errorMsg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Unknown error occurred";
        alert(`Failed to reject order: ${errorMsg}`);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  if (loading) {
    return (
      <div className="w-full bg-[#F5F5F5] min-h-screen py-8">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-lg text-gray-600">Loading orders...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#F5F5F5] min-h-screen py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#333333]">
            Orders Management
          </h1>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 bg-white border border-[#E6F4F3] rounded-md px-2 py-2 shadow-sm">
              <span className="text-sm text-[#64706f]">Filter</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-transparent text-sm text-[#333333] outline-none"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto bg-white shadow-lg rounded-lg border border-[#E6F4F3]">
          <div className="bg-gradient-to-r from-[#6638E6] to-[#E6738F] text-white px-6 py-3 rounded-t-lg">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Orders List</span>
              <span className="text-white/80 text-sm">
                Showing {filteredOrders.length} of {orders.length} orders
              </span>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No orders found</div>
              <div className="text-gray-400 text-sm mt-2">
                {filter === "all"
                  ? "No orders have been placed yet."
                  : `No ${filter} orders found.`}
              </div>
            </div>
          ) : (
            <table className="table-auto w-full">
              <thead className="bg-[#E69AAE]/60">
                <tr>
                  <th className="py-3 px-6 text-left text-[#333333] font-semibold">Order ID</th>
                  <th className="py-3 px-6 text-left text-[#333333] font-semibold">Item</th>
                  <th className="py-3 px-6 text-left text-[#333333] font-semibold">Customer</th>
                  <th className="py-3 px-6 text-left text-[#333333] font-semibold">Quantity</th>
                  <th className="py-3 px-6 text-left text-[#333333] font-semibold">Total Amount</th>
                  <th className="py-3 px-6 text-left text-[#333333] font-semibold">Status</th>
                  <th className="py-3 px-6 text-left text-[#333333] font-semibold">Order Date</th>
                  <th className="py-3 px-6 text-center text-[#333333] font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6F4F3]">
                {filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="odd:bg-white even:bg-[#F5F5F5] hover:bg-[#EAF7F6] transition-colors"
                  >
                    <td className="py-3 px-6">{order.orderId}</td>
                    <td className="py-3 px-6 align-middle">
                      <div>
                        <div className="text-[#0f172a] font-medium">
                          {Array.isArray(order.items)
                            ? order.items.map((it, idx) => (
                                <div key={idx}>{it.itemName}</div>
                              ))
                            : "No items"}
                        </div>
                        <div className="text-xs text-[#64748b]">
                          Rs. {parseFloat(order.itemPrice).toFixed(2)} each
                        </div>
                        {Array.isArray(order.items) ? (
                          <div className="text-xs text-[#64748b]">
                            Items: {order.items.length} | Total Qty:{" "}
                            {order.items.reduce((sum, it) => sum + (parseInt(it.quantity) || 0), 0)}
                          </div>
                        ) : (
                          <div className="text-xs text-[#64748b]">Qty: {order.quantity}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-6 align-middle">
                      <div>
                        <div className="text-[#0f172a] font-medium">{order.customerName}</div>
                        <div className="text-xs text-[#64748b]">{order.customerEmail}</div>
                        <div className="text-xs text-[#64748b]">{order.customerPhone}</div>
                      </div>
                    </td>
                    <td className="py-3 px-6 align-middle text-[#0f172a] whitespace-nowrap">
                      {Array.isArray(order.items)
                        ? order.items.reduce((sum, it) => sum + (parseInt(it.quantity) || 0), 0)
                        : order.quantity}
                    </td>
                    <td className="py-3 px-6 align-middle text-[#0f172a] whitespace-nowrap">
                      Rs. {parseFloat(order.totalAmount).toFixed(2)}
                    </td>
                    <td className="py-3 px-6 align-middle">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-6 align-middle text-[#334155] whitespace-nowrap">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-6 align-middle">
                      <div className="inline-flex gap-2">
                        {order.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleAcceptOrder(order._id)}
                              className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-1.5 px-3 rounded-md shadow-sm transition-colors"
                              title="Accept and complete this order"
                            >
                              ✓ Accept
                            </button>
                            <button
                              onClick={() => handleRejectOrder(order._id)}
                              className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-1.5 px-3 rounded-md shadow-sm transition-colors"
                              title="Reject and cancel this order"
                            >
                              ✗ Reject
                            </button>
                          </>
                        )}
                        {order.status === "completed" && (
                          <span className="text-green-600 text-sm font-medium">✓ Completed</span>
                        )}
                        {order.status === "cancelled" && (
                          <span className="text-red-600 text-sm font-medium">✗ Cancelled</span>
                        )}
                        {order.status === "accepted" && (
                          <span className="text-blue-600 text-sm font-medium">Accepted</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Orders;