import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:5000/fosters";

export default function FosterSubmission() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [editData, setEditData] = useState({});

  const load = async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await axios.get(`${API_BASE}/${id}`);
      const foster = res.data.foster;
      setData(foster);
      setEditData({
        fullName: foster.fullName || "",
        address: foster.address || "",
        contact: foster.contact || "",
        email: foster.email || "",
        animalName: foster.animalName || "",
        animalType: foster.animalType || "",
        fosterFrom: foster.fosterFrom ? foster.fosterFrom.substring(0, 10) : "",
        fosterTo: foster.fosterTo ? foster.fosterTo.substring(0, 10) : "",
        experience: foster.experience || "No",
        homeEnvironment: foster.homeEnvironment || "",
        notes: foster.notes || "",
      });
    } catch (e) {
      setMsg(e?.response?.data?.message || "Failed to load submission");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === "contact" && value && !/^\d*$/.test(value)) return;
    if (name === "fullName" && value && !/^[a-zA-Z\s]*$/.test(value)) return;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const save = async () => {
    if (!data?._id) return;
    setSaving(true);
    setMsg("");
    try {
      const res = await axios.put(`${API_BASE}/${data._id}`, editData);
      setData(res.data.foster);
      setMsg("✅ Changes saved successfully.");
      setEditMode(false);
    } catch (e) {
      setMsg(`❌ Failed to save changes: ${e?.response?.data?.message || e.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-center">Loading your foster submission...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-xl w-full text-center">
          <h2 className="text-2xl font-bold mb-2">Submission not found</h2>
          <p className="text-gray-600 mb-4">{msg || "We couldn't find this foster submission."}</p>
          <Link to="/foster" className="inline-block bg-gradient-to-r from-[#E6738F] to-[#6638E6] text-white px-6 py-3 rounded-xl font-semibold">
            Go to Foster Form
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
            <h1 className="text-2xl font-bold">Your Foster Submission</h1>
            <p className="text-white/90 text-sm">ID: {data._id}</p>
          </div>

          <div className="p-6 space-y-6">
            {msg && (
              <div className={`p-3 rounded-lg border ${msg.startsWith("✅") ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                {msg}
              </div>
            )}

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-semibold text-gray-700">Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm border ${
                data.status === "approved"
                  ? "bg-green-100 text-green-800 border-green-200"
                  : data.status === "completed"
                  ? "bg-blue-100 text-blue-800 border-blue-200"
                  : "bg-yellow-100 text-yellow-800 border-yellow-200"
              }`}>
                {(data.status || "pending").toUpperCase()}
              </span>
            </div>

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
                    <div className="text-sm text-gray-500">Contact</div>
                    <div className="font-semibold text-gray-800">{data.contact}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-sm text-gray-500">Address</div>
                    <div className="font-semibold text-gray-800">{data.address}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-500">Animal Name / ID</div>
                    <div className="font-semibold text-gray-800">{data.animalName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Animal Type</div>
                    <div className="font-semibold text-gray-800">{data.animalType}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Foster From</div>
                    <div className="font-semibold text-gray-800">{data.fosterFrom ? new Date(data.fosterFrom).toLocaleDateString() : "-"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Foster To</div>
                    <div className="font-semibold text-gray-800">{data.fosterTo ? new Date(data.fosterTo).toLocaleDateString() : "-"}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-500">Experience</div>
                    <div className="font-semibold text-gray-800">{data.experience}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Home Environment</div>
                    <div className="font-semibold text-gray-800">{data.homeEnvironment || "-"}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Notes</div>
                  <div className="font-semibold text-gray-800 whitespace-pre-line">{data.notes || "-"}</div>
                </div>

                <div className="pt-2 flex gap-3">
                  {data.status === "pending" && (
                    <button onClick={() => setEditMode(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg font-medium">
                      Edit Details
                    </button>
                  )}
                  <Link to="/mainhome" className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-3 rounded-lg font-medium">
                    Back to Home
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input name="fullName" value={editData.fullName} onChange={onChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" />
                  <input name="email" value={editData.email} onChange={onChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" />
                  <input name="contact" value={editData.contact} onChange={onChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" />
                  <input name="address" value={editData.address} onChange={onChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" />
                  <input name="animalName" value={editData.animalName} onChange={onChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" />
                  <select name="animalType" value={editData.animalType} onChange={onChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200">
                    <option value="">Select animal type</option>
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Other">Other</option>
                  </select>
                  <input type="date" name="fosterFrom" value={editData.fosterFrom} onChange={onChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" />
                  <input type="date" name="fosterTo" value={editData.fosterTo} onChange={onChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" />
                  <select name="experience" value={editData.experience} onChange={onChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200">
                    <option value="No">No Previous Experience</option>
                    <option value="Yes">Yes, I have Experience</option>
                  </select>
                  <input name="homeEnvironment" value={editData.homeEnvironment} onChange={onChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" />
                </div>
                <textarea name="notes" rows={4} value={editData.notes} onChange={onChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 resize-none" />

                <div className="flex gap-3 pt-2">
                  <button onClick={save} disabled={saving} className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-5 py-3 rounded-lg font-medium">
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button onClick={() => setEditMode(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-3 rounded-lg font-medium">
                    Cancel
                  </button>
                </div>

                <div className="text-xs text-gray-500">Editing is disabled once the request is approved or completed by admin.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
