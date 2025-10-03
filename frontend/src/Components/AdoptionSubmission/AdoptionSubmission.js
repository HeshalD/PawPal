import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:5000/adoptions";

export default function AdoptionSubmission() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");   

  useEffect(() => {
    const fetchOne = async () => {
      try {
        const res = await axios.get(`${API_BASE}/${id}`);
        setData(res.data.adoption);
        setEditData({
          fullName: res.data.adoption.fullName || "",
          email: res.data.adoption.email || "",
          age: res.data.adoption.age ?? "",
          phone: res.data.adoption.phone || "",
          address: res.data.adoption.address || "",
          salary: res.data.adoption.salary ?? "",
          selectedPets: Array.isArray(res.data.adoption.selectedPets)
            ? res.data.adoption.selectedPets.join(", ")
            : "",
        });
      } catch (e) {
        setMsg(
          e?.response?.data?.message || "Failed to load submission. Try again later."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchOne();
  }, [id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const save = async () => {
    setSaving(true);
    setMsg("");
    try {
      const payload = {
        ...editData,
        age: editData.age === "" ? undefined : parseInt(editData.age, 10),
        salary:
          editData.salary === "" ? undefined : parseInt(editData.salary, 10),
        selectedPets:
          typeof editData.selectedPets === "string"
            ? editData.selectedPets
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : editData.selectedPets,
      };
      const res = await axios.put(`${API_BASE}/${id}`, payload);
      setData(res.data.adoptions);
      setMsg("✅ Changes saved successfully.");
      setEditMode(false);
    } catch (e) {
      setMsg(
        `❌ Failed to save changes: ${
          e?.response?.data?.message || e.message || "Unknown error"
        }`
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-center">Loading your submission...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-xl w-full text-center">
          <h2 className="text-2xl font-bold mb-2">Submission not found</h2>
          <p className="text-gray-600 mb-4">{msg || "We couldn't find this adoption submission."}</p>
          <Link
            to="/adoption"
            className="inline-block bg-gradient-to-r from-[#E6738F] to-[#6638E6] text-white px-6 py-3 rounded-xl font-semibold"
          >
            Go to Adoption Form
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#6638E6] to-[#E6738F] p-6 text-white">
            <h1 className="text-2xl font-bold">Your Adoption Submission</h1>
            <p className="text-white/90 text-sm">ID: {data._id}</p>
          </div>

          <div className="p-6 space-y-6">
            {msg && (
              <div
                className={`p-3 rounded-lg border ${msg.startsWith("✅") ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}
              >
                {msg}
              </div>
            )}

            {/* Status */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-semibold text-gray-700">Status:</span>
              <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800 border border-yellow-200">
                {(data.status || "pending").toUpperCase()}
              </span>
            </div>

            {/* View mode */}
            {!editMode ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-500">Full Name</div>
                    <div className="font-semibold text-gray-800">{data.fullName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-semibold text-gray-800">{data.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Age</div>
                    <div className="font-semibold text-gray-800">{data.age} years</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="font-semibold text-gray-800">{data.phone}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-sm text-gray-500">Address</div>
                    <div className="font-semibold text-gray-800">{data.address}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Monthly Salary</div>
                    <div className="font-semibold text-gray-800">Rs {data.salary?.toLocaleString()}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-2">Selected Pets</div>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(data.selectedPets) && data.selectedPets.length > 0 ? (
                      data.selectedPets.map((p, i) => (
                        <span key={i} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200 text-sm">
                          {p}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">No pets selected</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-2">Salary Sheet (PDF)</div>
                  {data.salarySheet ? (
                    <div className="flex gap-3">
                      <a
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                        href={`http://localhost:5000/${data.salarySheet}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View PDF
                      </a>
                      <a
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                        href={`http://localhost:5000/${data.salarySheet}`}
                        download={`salary-sheet-${data.fullName}.pdf`}
                      >
                        Download
                      </a>
                    </div>
                  ) : (
                    <div className="text-amber-700 bg-amber-100 p-3 rounded-lg">No salary sheet uploaded</div>
                  )}
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => setEditMode(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg font-medium"
                  >
                    Edit Details
                  </button>
                  <Link
                    to="/adoptionViewPage"
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-3 rounded-lg font-medium"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            ) : (
              // Edit mode
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input
                      name="fullName"
                      value={editData.fullName}
                      onChange={onChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      name="email"
                      value={editData.email}
                      onChange={onChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={editData.age}
                      onChange={onChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                    <input
                      name="phone"
                      value={editData.phone}
                      onChange={onChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                    <textarea
                      name="address"
                      value={editData.address}
                      onChange={onChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Salary</label>
                    <input
                      type="number"
                      name="salary"
                      value={editData.salary}
                      onChange={onChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Selected Pets (comma-separated)</label>
                    <input
                      name="selectedPets"
                      value={editData.selectedPets}
                      onChange={onChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={save}
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-5 py-3 rounded-lg font-medium"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-3 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>

                <div className="text-xs text-gray-500">
                  Note: Salary sheet re-upload isn't available here. If you need to replace it, please contact support.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
