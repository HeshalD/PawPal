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

// Build a human-friendly ID consistent with list view
const makeDisplayId = (it) => {
  try {
    const cat = (it?.Category || "GEN").toString().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3) || "GEN";
    const nm = (it?.Item_Name || "").toString().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3);
    const suffix = (it?._id || "").toString().slice(-4).toUpperCase();
    return `PP-${cat}${nm ? `-${nm}` : ""}-${suffix || "XXXX"}`;
  } catch {
    return it?._id || "-";
  }
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
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({ code: "", discountPercent: "" });
  const [coupons, setCoupons] = useState([]);
  const [couponFilter, setCouponFilter] = useState('all'); // all | active | expired
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
        makeDisplayId(it) || "-",
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

  const fetchCoupons = async () => {
    try {
      const res = await fetch('http://localhost:5000/coupons');
      if (!res.ok) throw new Error('Failed to fetch coupons');
      const data = await res.json();
      const backendCoupons = Array.isArray(data.coupons) ? data.coupons : (Array.isArray(data) ? data : []);
      // merge with local coupons
      const local = JSON.parse(localStorage.getItem('pp_coupons') || '[]');
      const merged = [...backendCoupons, ...local.filter(lc => !backendCoupons.find(bc => (bc.code||'').toUpperCase() === (lc.code||'').toUpperCase()))];
      setCoupons(merged);
    } catch (err) {
      console.error('Coupons fetch error:', err);
      const local = JSON.parse(localStorage.getItem('pp_coupons') || '[]');
      setCoupons(local);
    }
  };

  const deleteCoupon = async (coupon) => {
    const code = (coupon?.code || '').toUpperCase();
    if (!code) return;
    const confirmed = window.confirm(`Remove coupon ${code}?`);
    if (!confirmed) return;
    try {
      if (coupon?._id) {
        const res = await fetch(`http://localhost:5000/coupons/${coupon._id}`, { method: 'DELETE' });
        if (!res.ok) {
          // try by code if server supports it
          await fetch('http://localhost:5000/coupons', { method: 'DELETE', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ code }) });
        }
      } else {
        await fetch('http://localhost:5000/coupons', { method: 'DELETE', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ code }) });
      }
      // Always remove from localStorage too to avoid merge re-adding it
      try {
        const local = JSON.parse(localStorage.getItem('pp_coupons') || '[]');
        const updated = local.filter(c => (c.code || '').toUpperCase() !== code);
        localStorage.setItem('pp_coupons', JSON.stringify(updated));
      } catch {}
      await fetchCoupons();
    } catch (err) {
      // Fallback: remove from localStorage
      try {
        const local = JSON.parse(localStorage.getItem('pp_coupons') || '[]');
        const updated = local.filter(c => (c.code || '').toUpperCase() !== code);
        localStorage.setItem('pp_coupons', JSON.stringify(updated));
        await fetchCoupons();
      } catch(e) {
        console.error('Failed to remove coupon locally', e);
      }
    }
  };

  useEffect(() => {
    if (showCouponModal) {
      fetchCoupons();
    }
  }, [showCouponModal]);

  // Compute filtered view for coupons list
  const filteredCoupons = useMemo(() => {
    const f = (couponFilter || 'all').toLowerCase();
    if (f === 'all') return coupons;
    return (coupons || []).filter(c => {
      const st = (c.status || '').toLowerCase();
      // default unknown status to 'active' for local-only entries
      const norm = st || 'active';
      return norm === f;
    });
  }, [coupons, couponFilter]);

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
                <button 
                  onClick={() => setShowCouponModal(true)}
                  className="bg-white border border-[#E6F4F3] text-[#333333] font-medium px-4 py-2 rounded-md shadow-sm hover:bg-[#E69AAE] transition-colors"
                >
                  Manage Coupons
                </button>
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
                            <path fillRule="evenodd" d="M12 2.25a.75.75 0 011.06 0L12 9.525l4.715-4.714a.75.75 0 111.06 1.06L13.06 10.586l4.714 4.715a.75.75 0 11-1.06 1.06L12 11.646l-4.715 4.715a.75.75 0 11-1.06-1.06l4.714-4.715-4.714-4.715a.75.75 0 010-1.06z" clipRule="evenodd"/>
                          </svg>
                        </span>
                        <span>Low Stock Alerts</span>
                      </div>
                      <button onClick={() => setShowAlerts(false)} className="p-1 rounded-md hover:bg-[#F5F5F5] text-[#64748b]">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path fillRule="evenodd" d="M6.225 4.811a.75.75 0 011.06 0L12 9.525l4.715-4.714a.75.75 0 111.06 1.06L13.06 10.586l4.714 4.715a.75.75 0 11-1.06 1.06L12 11.646l-4.715 4.715a.75.75 0 11-1.06-1.06l4.714-4.715-4.714-4.715a.75.75 0 010-1.06z" clipRule="evenodd"/>
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

            {showCouponModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/40" onClick={() => setShowCouponModal(false)} />
                <div className="relative bg-white rounded-2xl shadow-2xl border border-[#E6F4F3] w-full max-w-lg">
                  <div className="px-5 py-4 border-b border-[#E6F4F3] flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#0f172a]">Manage Coupons</h3>
                    <button onClick={() => setShowCouponModal(false)} className="p-1 rounded-md hover:bg-[#F5F5F5]">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#64748b]"><path fillRule="evenodd" d="M6.225 4.811a.75.75 0 011.06 0L12 9.525l4.715-4.714a.75.75 0 111.06 1.06L13.06 10.586l4.714 4.715a.75.75 0 11-1.06 1.06L12 11.646l-4.715 4.715a.75.75 0 11-1.06-1.06l4.714-4.715-4.714-4.715a.75.75 0 010-1.06z" clipRule="evenodd"/></svg>
                    </button>
                  </div>
                  <div className="p-5 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-[#475569] mb-1">Coupon Code</label>
                        <input
                          value={couponForm.code}
                          onChange={(e)=>setCouponForm((f)=>({...f, code: e.target.value.toUpperCase()}))}
                          placeholder="PAWPAL10"
                          className="w-full px-3 py-2 border border-[#E6F4F3] rounded-md focus:ring-2 focus:ring-[#6638E6] focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-[#475569] mb-1">Discount (%)</label>
                        <input
                          type="number"
                          min="1"
                          max="90"
                          value={couponForm.discountPercent}
                          onChange={(e)=>setCouponForm((f)=>({...f, discountPercent: e.target.value}))}
                          placeholder="10"
                          className="w-full px-3 py-2 border border-[#E6F4F3] rounded-md focus:ring-2 focus:ring-[#6638E6] focus:border-transparent outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={()=>setShowCouponModal(false)} className="px-4 py-2 rounded-md border border-[#E6F4F3]">Close</button>
                      <button
                        onClick={async()=>{
                          const payload={ code:(couponForm.code||'').trim().toUpperCase(), discountPercent: Number(couponForm.discountPercent)||0 };
                          if(!payload.code || !payload.discountPercent){ return; }
                          try{
                            const res = await fetch('http://localhost:5000/coupons',{ method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ ...payload, discount: payload.discountPercent })});
                            if(!res.ok){ const j=await res.json().catch(()=>({message:'Failed'})); throw new Error(j.message||'Failed to create coupon'); }
                            await fetchCoupons();
                            setCouponForm({code:'', discountPercent:''});
                            setShowCouponModal(false);
                          }catch(err){ 
                            console.error('Backend create failed, saving locally:', err);
                            // fallback to localStorage
                            try {
                              const local = JSON.parse(localStorage.getItem('pp_coupons') || '[]');
                              const exists = local.find(c => (c.code||'').toUpperCase() === payload.code);
                              const updated = exists 
                                ? local.map(c => ((c.code||'').toUpperCase()===payload.code? { ...c, discountPercent: payload.discountPercent }: c))
                                : [...local, { code: payload.code, discountPercent: payload.discountPercent }];
                              localStorage.setItem('pp_coupons', JSON.stringify(updated));
                              await fetchCoupons();
                              setCouponForm({code:'', discountPercent:''});
                              setShowCouponModal(false);
                            } catch (e) {
                              console.error('Failed to save coupon locally');
                            }
                          }
                        }}
                        className="px-4 py-2 rounded-md text-white bg-[#6638E6] hover:bg-[#5a2fce]"
                      >Create</button>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#0f172a] mb-2">Existing Coupons</div>
                      <div className="flex items-center gap-2 mb-2">
                        <button onClick={()=>setCouponFilter('all')} className={`px-2 py-1 rounded-md text-sm border ${couponFilter==='all'?'bg-[#6638E6] text-white border-[#6638E6]':'bg-white text-[#333333] border-[#E6F4F3]'}`}>All</button>
                        <button onClick={()=>setCouponFilter('active')} className={`px-2 py-1 rounded-md text-sm border ${couponFilter==='active'?'bg-green-600 text-white border-green-600':'bg-white text-[#333333] border-[#E6F4F3]'}`}>Active</button>
                        <button onClick={()=>setCouponFilter('expired')} className={`px-2 py-1 rounded-md text-sm border ${couponFilter==='expired'?'bg-gray-600 text-white border-gray-600':'bg-white text-[#333333] border-[#E6F4F3]'}`}>Expired</button>
                      </div>
                      <div className="max-h-48 overflow-auto border border-[#E6F4F3] rounded-md">
                        {filteredCoupons.length>0 ? (
                          <ul className="divide-y divide-[#E6F4F3]">
                            {filteredCoupons.map((c)=>(
                              <li key={c._id||c.code} className="px-3 py-2 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <span className="font-medium text-[#0f172a]">{c.code}</span>
                                  <span className="text-[#64748b] text-sm">{c.discountPercent}%</span>
                                  {(() => {
                                    const st = (c.status||'active').toLowerCase();
                                    const isExpired = st === 'expired';
                                    return (
                                      <span className={`px-2 py-0.5 rounded-full text-xs ${isExpired? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'}`}>
                                        {isExpired ? 'Expired' : 'Active'}
                                      </span>
                                    );
                                  })()}
                                </div>
                                <div className="flex items-center gap-3">
                                  {c.expiresAt && (
                                    <span className="text-xs text-[#64748b]" title="Expires">
                                      {new Date(c.expiresAt).toLocaleDateString()}
                                    </span>
                                  )}
                                  {typeof c.usesRemaining === 'number' && (
                                    <span className="text-xs text-[#64748b]" title="Uses remaining">
                                      {c.usesRemaining}
                                    </span>
                                  )}
                                  <button
                                    onClick={() => deleteCoupon(c)}
                                    title="Remove coupon"
                                    className="p-1.5 rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-1 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V7"/>
                                    </svg>
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="px-3 py-4 text-sm text-[#64748b]">No coupons yet.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
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