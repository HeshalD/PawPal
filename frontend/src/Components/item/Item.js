import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";

function Item({ item, onDelete }) {
  const { _id, Item_Name, Category, Description, Unit_of_Measure, Quantity, Price, image } = item;
  const navigate = useNavigate();

  const status = useMemo(() => {
    // Simple derived status for demo: alternate by price / category
    if (Price === 0) return { label: "Inactive", color: "bg-red-100 text-red-700" };
    if ((Price || 0) > 100) return { label: "Active", color: "bg-green-100 text-green-700" };
    return { label: "Pending", color: "bg-yellow-100 text-yellow-700" };
  }, [Price]);

  const handleDeleteClick = () => {
    const ok = window.confirm("Are you sure you want to delete this item?");
    if (!ok) return;
    onDelete && onDelete(_id);
  };

  return (
    <>
      <tr className="odd:bg-white even:bg-[#F5F5F5] hover:bg-[#EAF7F6] transition-colors">
        <td className="py-3 px-6 align-middle">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md overflow-hidden bg-[#f1f5f9] flex items-center justify-center">
              {image ? (
                <img src={`http://localhost:5000${image}`} alt="item" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-[#94a3b8]">N/A</span>
              )}
            </div>
            <div>
              <div className="text-[#0f172a] font-medium leading-tight">{Item_Name}</div>
              <div className="text-xs text-[#64748b]">{Description}</div>
            </div>
          </div>
        </td>
        <td className="py-3 px-6 align-middle whitespace-nowrap text-[#333333]">#{_id?.slice(-6)}</td>
        <td className="py-3 px-6 align-middle text-[#0f172a] whitespace-nowrap">{Price !== undefined ? `$${parseFloat(Price).toFixed(2)}` : '-'}</td>
        <td className="py-3 px-6 align-middle text-[#0f172a] whitespace-nowrap">{Quantity ?? 0}</td>
        <td className="py-3 px-6 align-middle text-[#334155] whitespace-nowrap">{Unit_of_Measure}</td>
        <td className="py-3 px-6 align-middle text-[#334155] whitespace-nowrap">{Category}</td>
        <td className="py-3 px-6 align-middle">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>{status.label}</span>
        </td>
        <td className="py-3 px-6 align-middle">
          <div className="inline-flex gap-2">
            <button onClick={() => navigate(`/items/${_id}/edit`)} className="bg-[#4CB5AE] hover:bg-[#3aa39c] text-white text-sm font-semibold py-1.5 px-3 rounded-md shadow-sm transition-colors">Edit</button>
            <button onClick={handleDeleteClick} className="bg-white border border-[#fee2e2] text-[#b91c1c] hover:bg-[#fff5f5] text-sm font-semibold py-1.5 px-3 rounded-md shadow-sm">Delete</button>
          </div>
        </td>
      </tr>
    </>
  );
}

export default Item;
