import React, { useEffect, useState } from 'react';
import axios from 'axios';

const URL = "http://localhost:5001/adoptions";

const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

function AdoptionDetailsDisplay() {
  const [adoption, setAdoption] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchHandler().then((data) => {
      setAdoption(data.adoptions);
    });
  }, []);

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditData({
      fullName: item.fullName || '',
      email: item.email || '',
      age: item.age ?? '',
      phone: item.phone || '',
      address: item.address || '',
      salary: item.salary ?? '',
      selectedPets: Array.isArray(item.selectedPets) ? item.selectedPets.join(', ') : '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const onEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async (id) => {
    try {
      const payload = {
        ...editData,
        age: editData.age === '' ? undefined : parseInt(editData.age, 10),
        salary: editData.salary === '' ? undefined : parseInt(editData.salary, 10),
        selectedPets: typeof editData.selectedPets === 'string'
          ? editData.selectedPets.split(',').map((s) => s.trim()).filter(Boolean)
          : editData.selectedPets,
      };
      await axios.put(`${URL}/${id}`, payload);
      // Refresh list locally
      setAdoption((prev) => prev.map((it) => it._id === id ? { ...it, ...{
        fullName: payload.fullName,
        email: payload.email,
        age: payload.age,
        phone: payload.phone,
        address: payload.address,
        salary: payload.salary,
        selectedPets: payload.selectedPets,
      }} : it));
      setEditingId(null);
      setEditData({});
    } catch (error) {
      console.error('Error updating record:', error);
      alert('Failed to update record. Please try again.');
    }
  };

  // Handle PDF viewing
  const handlePdfView = (pdfPath) => {
    const fullPdfUrl = `http://localhost:5001/${pdfPath}`;
    setSelectedPdf(fullPdfUrl);
  };

  const closePdfViewer = () => setSelectedPdf(null);

  // Download PDF
  const downloadPdf = (pdfPath, fileName) => {
    const fullPdfUrl = `http://localhost:5001/${pdfPath}`;
    const link = document.createElement('a');
    link.href = fullPdfUrl;
    link.download = fileName || 'salary-sheet.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Delete adoption
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this adoption record?")) {
      try {
        await axios.delete(`${URL}/${id}`);
        setAdoption(adoption.filter((item) => item._id !== id));
      } catch (error) {
        console.error("Error deleting record:", error);
      }
    }
  };

  // Update adoption (inline edit)
  const handleUpdate = (id) => {
    const item = adoption.find((a) => a._id === id);
    if (item) startEdit(item);
  };

  return (
    <div>
      <h1>Adoption Details Display Page</h1>
      {!adoption || adoption.length === 0 ? (
        <p>Loading...</p>
      ) : (
        adoption.map((item, index) => (
          <div
            key={index}
            style={{
              border: '1px solid #ccc',
              padding: '20px',
              margin: '10px 0',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9',
            }}
          >
            <h3>Adoption Request #{index + 1}</h3>
            {editingId === item._id ? (
              <div style={{ display: 'grid', gap: '10px' }}>
                <div>
                  <label><strong>Full Name:</strong></label>
                  <input name="fullName" value={editData.fullName} onChange={onEditChange} style={{ width: '100%', padding: '8px' }} />
                </div>
                <div>
                  <label><strong>Email:</strong></label>
                  <input name="email" value={editData.email} onChange={onEditChange} style={{ width: '100%', padding: '8px' }} />
                </div>
                <div>
                  <label><strong>Age:</strong></label>
                  <input type="number" name="age" value={editData.age} onChange={onEditChange} style={{ width: '100%', padding: '8px' }} />
                </div>
                <div>
                  <label><strong>Phone:</strong></label>
                  <input name="phone" value={editData.phone} onChange={onEditChange} style={{ width: '100%', padding: '8px' }} />
                </div>
                <div>
                  <label><strong>Address:</strong></label>
                  <textarea name="address" value={editData.address} onChange={onEditChange} style={{ width: '100%', padding: '8px' }} />
                </div>
                <div>
                  <label><strong>Monthly Salary:</strong></label>
                  <input type="number" name="salary" value={editData.salary} onChange={onEditChange} style={{ width: '100%', padding: '8px' }} />
                </div>
                <div>
                  <label><strong>Selected Pets (comma-separated):</strong></label>
                  <input name="selectedPets" value={editData.selectedPets} onChange={onEditChange} style={{ width: '100%', padding: '8px' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => saveEdit(item._id)} style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>💾 Save</button>
                  <button onClick={cancelEdit} style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✖ Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <p><strong>Full Name:</strong> {item.fullName}</p>
                <p><strong>Email:</strong> {item.email}</p>
                <p><strong>Age:</strong> {item.age}</p>
                <p><strong>Phone:</strong> {item.phone}</p>
                <p><strong>Address:</strong> {item.address}</p>
                <p><strong>Monthly Salary:</strong> ${item.salary?.toLocaleString()}</p>
                <div>
                  <strong>Selected Pets:</strong>
                  <ul>
                    {item.selectedPets && item.selectedPets.length > 0 ? (
                      item.selectedPets.map((pet, petIndex) => (
                        <li key={petIndex}>{pet}</li>
                      ))
                    ) : (
                      <li>No pets selected</li>
                    )}
                  </ul>
                </div>
              </>
            )}

            {/* Salary Sheet PDF Section */}
            <div style={{ marginTop: '15px' }}>
              <strong>Salary Sheet Document:</strong>
              {item.salarySheet ? (
                <div
                  style={{
                    marginTop: '10px',
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '10px',
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>📄</span>
                    <div>
                      <div style={{ fontWeight: '500', color: '#333' }}>
                        Salary Sheet PDF
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {item.salarySheet.split('/').pop()}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handlePdfView(item.salarySheet)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      👁️ View PDF
                    </button>
                    <button
                      onClick={() =>
                        downloadPdf(
                          item.salarySheet,
                          `salary-sheet-${item.fullName}.pdf`
                        )
                      }
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      ⬇️ Download
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    marginTop: '10px',
                    padding: '15px',
                    backgroundColor: '#fff3cd',
                    borderRadius: '8px',
                    border: '1px solid #ffeaa7',
                    color: '#856404',
                  }}
                >
                  ⚠️ No salary sheet uploaded
                </div>
              )}
            </div>

            {/* Update & Delete buttons */}
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
              {editingId === item._id ? null : (
                <button
                  onClick={() => handleUpdate(item._id)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ffc107',
                    color: '#000',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  ✏️ Update
                </button>
              )}
              <button
                onClick={() => handleDelete(item._id)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                🗑️ Delete
              </button>
            </div>

            <hr style={{ margin: '15px 0' }} />
          </div>
        ))
      )}

      {/* PDF Viewer Modal */}
      {selectedPdf && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              maxWidth: '90%',
              maxHeight: '90%',
              position: 'relative',
            }}
          >
            <button
              onClick={closePdfViewer}
              style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
              }}
            >
              ✕
            </button>
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#333' }}>Salary Sheet PDF</h3>
            </div>
            <iframe
              src={selectedPdf}
              width="800"
              height="600"
              style={{
                border: 'none',
                borderRadius: '4px',
                maxWidth: '100%',
                maxHeight: '70vh',
              }}
              title="Salary Sheet PDF"
            />
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <button
                onClick={() =>
                  downloadPdf(
                    selectedPdf.split('/').slice(-2).join('/'),
                    'salary-sheet.pdf'
                  )
                }
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                ⬇️ Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdoptionDetailsDisplay;