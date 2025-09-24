import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Item from "../item/Item";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";

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
  const [sortMode, setSortMode] = useState("none"); // none | category-asc | category-desc
  const navigate = useNavigate();

  useEffect(() => {
    fetchHandler().then((data) => setItem(data.items));
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${URL}/${id}`);
      setItem((prev) => prev.filter((it) => it._id !== id));
    } catch (e) {
      console.error("Failed to delete", e);
      // Optionally surface UI feedback here
    }
  };

  const handleOrder = async (orderData) => {
    try {
      await axios.post(ORDERS_URL, orderData);
      alert("Order placed successfully!");
    } catch (error) {
      console.error("Failed to place order:", error);
      alert("Failed to place order. Please try again.");
      throw error;
    }
  };

  /* legacy export + search kept for reference */

const handleExportPdf = () => {
  if (!items || items.length === 0) {
    alert("No items to export!");
    return;
  }

  const doc = new jsPDF({ orientation: "landscape" });
  const columns = ["ID", "Name", "Image", "Price", "Stock", "Unit", "Category"];
  const rows = items.map((it) => [
    it._id || "-",
    it.Item_Name || "-",
    it.image ? `http://localhost:5000${it.image}` : "No Image",
    it.Price !== undefined ? `$${parseFloat(it.Price).toFixed(2)}` : "-",
    it.Quantity !== undefined ? it.Quantity.toString() : "0",
    it.Unit_of_Measure || "-",
    it.Category || "-"
  ]);

  doc.setFontSize(16);
  doc.text("Inventory Report", 14, 18);

  doc.autoTable({
    head: [columns],
    body: rows,
    startY: 22,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [102, 56, 230] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    theme: "striped",
    columnStyles: {
      2: { cellWidth: 30 }, // Image column
      0: { cellWidth: 20 }, // ID column
    }
  });

  const date = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  doc.save(`inventory-report-${date}.pdf`);
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
  setNoResults(filteredItems.length === 0);
  setCurrentPage(1);
}, [filteredItems.length]);

const sortedItems = useMemo(() => {
  const base = [...filteredItems];
  if (sortMode === "category-asc" || sortMode === "category-desc") {
    base.sort((a, b) => {
      const ga = mapToGroup(a.Category).toLowerCase();
      const gb = mapToGroup(b.Category).toLowerCase();
      if (ga < gb) return sortMode === "category-asc" ? -1 : 1;
      if (ga > gb) return sortMode === "category-asc" ? 1 : -1;
      // secondary by item name
      return (a.Item_Name || "").localeCompare(b.Item_Name || "");
    });
  }
  return base;
}, [filteredItems, sortMode]);

const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
const currentPageClamped = Math.min(currentPage, totalPages);
const paginatedItems = useMemo(() => {
  const start = (currentPageClamped - 1) * pageSize;
  return sortedItems.slice(start, start + pageSize);
}, [sortedItems, currentPageClamped, pageSize]);


  return (
    <div className="w-full bg-[#F5F5F5] min-h-screen py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#333333]">Product</h1>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-white border border-[#E6F4F3] rounded-full px-3 py-2 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#9aa7a6]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z" clipRule="evenodd"/></svg>
              <input onChange={(e) => setSearchQuery(e.target.value)} value={searchQuery} type="text" placeholder="Search" className="outline-none text-sm text-[#333333] placeholder-[#9aa7a6]" />
            </div>
            <div className="inline-flex items-center gap-2 bg-white border border-[#E6F4F3] rounded-md px-2 py-2 shadow-sm">
              <span className="text-sm text-[#64706f]">Filter</span>
              <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }} className="bg-transparent text-sm text-[#333333] outline-none">
                <option value="All">All</option>
                <option value="Pet Food">Pet food</option>
                <option value="Medicine">Medicine</option>
                <option value="Accessories">Accessories</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="inline-flex items-center gap-2 bg-white border border-[#E6F4F3] rounded-md px-2 py-2 shadow-sm">
              <span className="text-sm text-[#64706f]">Sort</span>
              <select value={sortMode} onChange={(e) => { setSortMode(e.target.value); setCurrentPage(1); }} className="bg-transparent text-sm text-[#333333] outline-none">
                <option value="none">None</option>
                <option value="category-asc">Category (A→Z)</option>
                <option value="category-desc">Category (Z→A)</option>
              </select>
            </div>
            <button onClick={handleExportPdf} className="bg-white border border-[#E6F4F3] text-[#333333] font-medium px-4 py-2 rounded-md shadow-sm hover:bg-[#E69AAE]">Export</button>
            <button onClick={() => navigate('/items/new')} className="bg-gradient-to-r from-[#6638E6] to-[#E6738F] hover:from-[#6638E6] hover:to-[#E69AAE] text-white font-semibold px-4 py-2 rounded-md shadow-sm">+ Add New Product</button>
          </div>
        </div>

        <div className="overflow-x-auto bg-white shadow-lg rounded-lg border border-[#E6F4F3]">
          <div className="bg-gradient-to-r from-[#6638E6] to-[#E6738F] text-white px-6 py-3 rounded-t-lg">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Items List</span>
              <span className="text-white/80 text-sm">Showing {paginatedItems.length} of {filteredItems.length}</span>
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
                <th className="py-3 px-6 text-center text-[#333333] font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6F4F3]">
              {paginatedItems && paginatedItems.map((item, i) => (
                <Item key={`${item._id}-${i}`} item={item} onDelete={handleDelete} onOrder={handleOrder} />
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between px-6 py-4 bg-white rounded-b-lg border-t border-[#E6F4F3]">
            <div className="text-[#333333]/70 text-sm">
              {noResults ? "No items found" : `Page ${currentPageClamped} of ${totalPages}`}
            </div>
            <div className="flex items-center gap-2">
              <button disabled={currentPageClamped === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className={`px-3 py-1.5 rounded-md text-sm border ${currentPageClamped === 1 ? 'text-[#9aa7a6] border-[#E6F4F3] bg-[#f8fafb]' : 'text-[#333333] border-[#E6F4F3] bg-white hover:bg-[#F5F5F5]'}`}>Previous</button>
              {Array.from({ length: totalPages }).slice(0, 5).map((_, idx) => {
                const page = idx + 1;
                return (
                  <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded-md text-sm border ${page === currentPageClamped ? 'bg-gradient-to-r from-[#6638E6] to-[#E6738F] text-white border-[#6638E6]' : 'bg-white text-[#333333] border-[#E6F4F3] hover:bg-[#E69AAE]'}`}>{page}</button>
                );
              })}
              <button disabled={currentPageClamped === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className={`px-3 py-1.5 rounded-md text-sm border ${currentPageClamped === totalPages ? 'text-[#9aa7a6] border-[#E6F4F3] bg-[#f8fafb]' : 'text-[#333333] border-[#E6F4F3] bg-white hover:bg-[#F5F5F5]'}`}>Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Items;
