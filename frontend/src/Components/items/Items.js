import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Item from "../item/Item";
import { useNavigate } from "react-router-dom";
import Nav from "../Nav/NavAdmin";
import { Link } from "react-router-dom";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const URL = "http://localhost:5000/items";
const ORDERS_URL = "http://localhost:5000/orders";

const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

function Items() {
  const [items, setItem] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [noResults, setNoResults] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortMode, setSortMode] = useState("none");
  const [collapsed, setCollapsed] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const LOW_STOCK_THRESHOLD = 30;
  const navigate = useNavigate();

  // Fetch items on component mount
  useEffect(() => {
    const loadItems = async () => {
      try {
        const data = await fetchHandler();
        console.log("Fetched items:", data);
        setItem(data.items || []);
      } catch (error) {
        console.error("Failed to fetch items:", error);
        setItem([]);
      }
    };
    
    loadItems();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${URL}/${id}`);
      setItem((prev) => prev.filter((it) => it._id !== id));
      console.log("Item deleted successfully:", id);
    } catch (e) {
      console.error("Failed to delete", e);
      alert("Failed to delete item. Please try again.");
    }
  };

  const handleExportPdf = () => {
    if (!items || items.length === 0) {
      alert("No items to export!");
      return;
    }

    try {
      const doc = new jsPDF({ orientation: "landscape" });
      const columns = ["ID", "Name", "Image", "Price", "Stock", "Unit", "Category"];
      const rows = items.map((it) => [
        it._id || "-",
        it.Item_Name || "-",
        it.image ? `http://localhost:5000${it.image}` : "No Image",
        it.Price !== undefined ? `Rs. ${parseFloat(it.Price).toFixed(2)}` : "-",
        it.Quantity !== undefined ? it.Quantity.toString() : "0",
        it.Unit_of_Measure || "-",
        it.Category || "-"
      ]);

      doc.setFontSize(16);
      doc.text("Inventory Report", 14, 18);

      // Use autoTable as a function call
      autoTable(doc, {
        head: [columns],
        body: rows,
        startY: 22,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [102, 56, 230] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        theme: "striped",
        columnStyles: {
          2: { cellWidth: 30 },
          0: { cellWidth: 20 },
        }
      });

      const date = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      doc.save(`inventory-report-${date}.pdf`);
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Failed to generate PDF. Please check console for details.");
    }
  };

  const mapToGroup = (rawCategory) => {
    const c = (rawCategory || "").toString().toLowerCase();
    if (/(food|treat|diet|kibble|can|wet|dry)/.test(c)) return "Pet Food";
    if (/(med|medicine|drug|antibiotic|supplement|vitamin|vet)/.test(c)) return "Medicine";
    if (/(accessor|toy|leash|collar|bed|bowl|groom|brush|litter|carrier)/.test(c)) return "Accessories";
    return "Other";
  };

  const filteredItems = useMemo(() => {
    const q = (searchQuery || "").toLowerCase();
    return (items || []).filter((item) => {
      const matchesText = !q || [item.Item_Name, item.Category, item.Description, item.Unit_of_Measure, item._id]
        .filter(Boolean)
        .some((v) => v.toString().toLowerCase().includes(q));
      const group = mapToGroup(item.Category);
      const matchesCategory = categoryFilter === "All" || group === categoryFilter;
      return matchesText && matchesCategory;
    });
  }, [items, searchQuery, categoryFilter]);

  useEffect(() => {
    setNoResults(filteredItems.length === 0 && items.length > 0);
    setCurrentPage(1);
  }, [filteredItems.length, items.length]);

  const sortedItems = useMemo(() => {
    const base = [...filteredItems];
    if (sortMode === "category-asc" || sortMode === "category-desc") {
      base.sort((a, b) => {
        const ga = mapToGroup(a.Category).toLowerCase();
        const gb = mapToGroup(b.Category).toLowerCase();
        if (ga < gb) return sortMode === "category-asc" ? -1 : 1;
        if (ga > gb) return sortMode === "category-asc" ? 1 : -1;
        return (a.Item_Name || "").localeCompare(b.Item_Name || "");
      });
    }
    return base;
  }, [filteredItems, sortMode]);

  const lowStockItems = useMemo(() => {
    return (items || []).filter((it) => (it.Quantity || 0) < LOW_STOCK_THRESHOLD);
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const paginatedItems = useMemo(() => {
    const start = (currentPageClamped - 1) * pageSize;
    return sortedItems.slice(start, start + pageSize);
  }, [sortedItems, currentPageClamped, pageSize]);

  return (
    <div className="min-h-screen bg-white flex">
      <Nav collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div className={`flex-1 transition-all duration-300 ${
        collapsed ? 'ml-20' : 'ml-64'} p-6`}>
        <div className="w-full bg-[#F5F5F5] min-h-screen py-8">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-[#333333]">Products</h1>
              <div className="relative flex items-center gap-3">
                <Link to="/orders">
                  <button
                    onClick={() => navigate('/orders')} 
                    className="bg-white border border-[#E6F4F3] text-[#333333] font-medium px-4 py-2 rounded-md shadow-sm hover:bg-[#E69AAE] transition-colors"
                  >
                    View Orders
                  </button>
                </Link>
                
                <div className="hidden sm:flex items-center gap-2 bg-white border border-[#E6F4F3] rounded-full px-3 py-2 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#9aa7a6]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z" clipRule="evenodd"/>
                  </svg>
                  <input 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    value={searchQuery} 
                    type="text" 
                    placeholder="Search products..." 
                    className="outline-none text-sm text-[#333333] placeholder-[#9aa7a6] w-40" 
                  />
                </div>
                <button
                  onClick={() => setShowAlerts((s) => !s)}
                  className="relative inline-flex items-center justify-center bg-white border border-[#E6F4F3] rounded-full p-2 shadow-sm hover:bg-[#F5F5F5]"
                  aria-label="Low stock alerts"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#333333]">
                    <path d="M12 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 006 14h12a1 1 0 00.707-1.707L18 11.586V8a6 6 0 00-6-6z" />
                    <path d="M9 18a3 3 0 006 0H9z" />
                  </svg>
                  {lowStockItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                      {lowStockItems.length}
                    </span>
                  )}
                </button>
                {showAlerts && (
                  <div className="absolute right-0 top-12 z-50 w-[380px] bg-white rounded-2xl shadow-2xl border border-[#E6F4F3]">
                    <div className="px-4 py-3 flex items-center justify-between border-b border-[#E6F4F3] rounded-t-2xl">
                      <div className="flex items-center gap-2 text-[#0f172a] font-semibold">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-50 text-red-500">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.66.393l9 16.5A.75.75 0 0121 20.25H3a.75.75 0 01-.66-1.107l9-16.5A.75.75 0 0112 2.25zm0 5.25a.75.75 0 01.75.75v5.25a.75.75 0 01-1.5 0V8.25A.75.75 0 0112 7.5zm0 9a.75.75 0 100 1.5.75.75 0 000-1.5z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <span>Low Stock Alerts</span>
                      </div>
                      <button onClick={() => setShowAlerts(false)} className="p-1 rounded-md hover:bg-[#F5F5F5] text-[#64748b]">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path fillRule="evenodd" d="M6.225 4.811a.75.75 0 011.06 0L12 9.525l4.715-4.714a.75.75 0 111.06 1.06L13.06 10.586l4.714 4.715a.75.75 0 11-1.06 1.06L12 11.646l-4.715 4.715a.75.75 0 11-1.06-1.06l4.714-4.715-4.714-4.715a.75.75 0 010-1.06z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <div className="max-h-80 overflow-auto">
                      {lowStockItems.length > 0 ? (
                        <ul className="divide-y divide-[#E6F4F3]">
                          {lowStockItems.map((it) => (
                            <li key={it._id} className="px-4 py-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="text-[#0f172a] font-semibold leading-5">{it.Item_Name}</div>
                                  <div className="text-xs text-[#64748b] mt-0.5">Category: {it.Category || '-'} • ID: #{(it._id || '').slice(-6)}</div>
                                </div>
                                <div className="text-right ml-4">
                                  <div className="text-xs text-[#64748b]">Qty</div>
                                  <div className="text-red-600 font-semibold">{(it.Quantity ?? 0)}</div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="px-4 py-6 text-sm text-[#64706f]">No low stock items.</div>
                      )}
                    </div>
                    
                  </div>
                )}
                <div className="inline-flex items-center gap-2 bg-white border border-[#E6F4F3] rounded-md px-2 py-2 shadow-sm">
                  <span className="text-sm text-[#64706f]">Filter</span>
                  <select 
                    value={categoryFilter} 
                    onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }} 
                    className="bg-transparent text-sm text-[#333333] outline-none"
                  >
                    <option value="All">All</option>
                    <option value="Pet Food">Pet food</option>
                    <option value="Medicine">Medicine</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="inline-flex items-center gap-2 bg-white border border-[#E6F4F3] rounded-md px-2 py-2 shadow-sm">
                  <span className="text-sm text-[#64706f]">Sort</span>
                  <select 
                    value={sortMode} 
                    onChange={(e) => { setSortMode(e.target.value); setCurrentPage(1); }} 
                    className="bg-transparent text-sm text-[#333333] outline-none"
                  >
                    <option value="none">None</option>
                    <option value="category-asc">Category (A→Z)</option>
                    <option value="category-desc">Category (Z→A)</option>
                  </select>
                </div>
                <button 
                  onClick={handleExportPdf} 
                  className="bg-white border border-[#E6F4F3] text-[#333333] font-medium px-4 py-2 rounded-md shadow-sm hover:bg-[#E69AAE] transition-colors"
                >
                  Export PDF
                </button>
                <button 
                  onClick={() => navigate('/items/new')} 
                  className="bg-gradient-to-r from-[#6638E6] to-[#E6738F] hover:from-[#6638E6] hover:to-[#E69AAE] text-white font-semibold px-4 py-2 rounded-md shadow-sm transition-all"
                >
                  + Add New Product
                </button>
              </div>
            </div>

            
            
            <div className="overflow-x-auto bg-white shadow-lg rounded-lg border border-[#E6F4F3]">
              <div className="bg-gradient-to-r from-[#6638E6] to-[#E6738F] text-white px-6 py-3 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Items List</span>
                  <span className="text-white/80 text-sm">
                    Showing {paginatedItems.length} of {filteredItems.length} items
                  </span>
                </div>
              </div>
              
              <table className="table-auto w-full">
                <thead className="bg-[#E69AAE]/60">
                  <tr>
                    <th className="py-3 px-6 text-left text-[#333333] font-semibold">Product Name</th>
                    <th className="py-3 px-6 text-left text-[#333333] font-semibold">Product ID</th>
                    <th className="py-3 px-6 text-left text-[#333333] font-semibold">Price</th>
                    <th className="py-3 px-6 text-left text-[#333333] font-semibold">Stock</th>
                    <th className="py-3 px-6 text-left text-[#333333] font-semibold">Unit</th>
                    <th className="py-3 px-6 text-left text-[#333333] font-semibold">Category</th>
                    <th className="py-3 px-6 text-left text-[#333333] font-semibold">Status</th>
                    <th className="py-3 px-6 text-center text-[#333333] font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6F4F3]">
                  {paginatedItems && paginatedItems.length > 0 ? (
                    paginatedItems.map((item, i) => (
                      <Item key={`${item._id}-${i}`} item={item} onDelete={handleDelete} />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="py-8 px-6 text-center text-gray-500">
                        {items.length === 0 ? "Loading items..." : "No items found"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              
              <div className="flex items-center justify-between px-6 py-4 bg-white rounded-b-lg border-t border-[#E6F4F3]">
                <div className="text-[#333333]/70 text-sm">
                  {noResults ? "No items found" : `Page ${currentPageClamped} of ${totalPages}`}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    disabled={currentPageClamped === 1} 
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} 
                    className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                      currentPageClamped === 1 
                        ? 'text-[#9aa7a6] border-[#E6F4F3] bg-[#f8fafb] cursor-not-allowed' 
                        : 'text-[#333333] border-[#E6F4F3] bg-white hover:bg-[#F5F5F5]'
                    }`}
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
                    const page = idx + 1;
                    return (
                      <button 
                        key={page} 
                        onClick={() => setCurrentPage(page)} 
                        className={`w-8 h-8 rounded-md text-sm border transition-all ${
                          page === currentPageClamped 
                            ? 'bg-gradient-to-r from-[#6638E6] to-[#E6738F] text-white border-[#6638E6]' 
                            : 'bg-white text-[#333333] border-[#E6F4F3] hover:bg-[#E69AAE]'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button 
                    disabled={currentPageClamped === totalPages} 
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} 
                    className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                      currentPageClamped === totalPages 
                        ? 'text-[#9aa7a6] border-[#E6F4F3] bg-[#f8fafb] cursor-not-allowed' 
                        : 'text-[#333333] border-[#E6F4F3] bg-white hover:bg-[#F5F5F5]'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Items;