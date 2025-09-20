import React, { useState, useEffect } from 'react';
import './DonationManager.css';

const DonationManager = () => {
  const [donations, setDonations] = useState([]);
  const [allDonations, setAllDonations] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonations();
  }, [filter]);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      // Always fetch all donations first to get accurate counts
      const allResponse = await fetch('http://localhost:5000/donations');
      if (allResponse.ok) {
        const allData = await allResponse.json();
        setAllDonations(allData.donations || []);
        
        // Filter based on current filter
        let filteredDonations = allData.donations || [];
        if (filter === 'pending') {
          filteredDonations = (allData.donations || []).filter(d => d.status === 'pending');
        } else if (filter === 'completed') {
          filteredDonations = (allData.donations || []).filter(d => d.status === 'completed');
        }
        
        setDonations(filteredDonations);
      } else {
        console.error('Error fetching donations');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsCompleted = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/donations/${id}/complete`, {
        method: 'PUT',
      });

      if (response.ok) {
        alert('Donation marked as completed!');
        fetchDonations();
      } else {
        alert('Error updating donation status');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error updating donation status');
    }
  };

  const deleteDonation = async (id) => {
    if (window.confirm('Are you sure you want to delete this donation?')) {
      try {
        const response = await fetch(`http://localhost:5000/donations/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('Donation deleted successfully!');
          fetchDonations();
        } else {
          const errorData = await response.json();
          alert(`Cannot delete donation: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error deleting donation');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusText = status === 'pending' ? 'Pending' : 'Completed';
    return (
      <span className={`status-badge ${status}`}>
        {statusText}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="donation-manager">
        <div className="loading">Loading donations...</div>
      </div>
    );
  }

  return (
    <div className="donation-manager">
      <h2>Donation Management Dashboard</h2>
      
      <div className="filter-buttons">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          All Donations ({allDonations.length})
        </button>
        <button 
          className={filter === 'pending' ? 'active' : ''} 
          onClick={() => setFilter('pending')}
        >
          Pending ({allDonations.filter(d => d.status === 'pending').length})
        </button>
        <button 
          className={filter === 'completed' ? 'active' : ''} 
          onClick={() => setFilter('completed')}
        >
          Completed ({allDonations.filter(d => d.status === 'completed').length})
        </button>
      </div>

      <div className="donations-list">
        {donations.length === 0 ? (
          <div className="no-donations">
            <p>No donations found for the selected filter.</p>
          </div>
        ) : (
          donations.map((donation) => (
            <div key={donation._id} className="donation-card">
              <div className="donation-header">
                <h3>{donation.fullname}</h3>
                {getStatusBadge(donation.status)}
              </div>
              
              <div className="donation-details">
                <div className="detail-row">
                  <span className="label">Email:</span>
                  <span className="value">{donation.Email}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Phone:</span>
                  <span className="value">{donation.phone}</span>
                </div>
                <div className="detail-row">
                  <span className="label">NIC:</span>
                  <span className="value">{donation.NIC}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Address:</span>
                  <span className="value">{donation.Address}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Contribution Type:</span>
                  <span className="value">{donation.ContributionType}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Amount:</span>
                  <span className="value amount">{donation.Amount} {donation.Currency}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Frequency:</span>
                  <span className="value">{donation.donationFrequency}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Payment Method:</span>
                  <span className="value">{donation.PaymentMethod}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Created:</span>
                  <span className="value">{formatDate(donation.createdAt)}</span>
                </div>
                {donation.slipUpload && (
                  <div className="detail-row">
                    <span className="label">Payment Slip:</span>
                    <a 
                      href={`http://localhost:5000/${donation.slipUpload}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="slip-link"
                    >
                      View Slip
                    </a>
                  </div>
                )}
              </div>

              <div className="donation-actions">
                {donation.status === 'pending' && (
                  <button 
                    className="complete-btn"
                    onClick={() => markAsCompleted(donation._id)}
                  >
                    Mark as Completed
                  </button>
                )}
                {donation.status === 'pending' && !donation.slipUpload && (
                  <button 
                    className="delete-btn"
                    onClick={() => deleteDonation(donation._id)}
                  >
                    Delete
                  </button>
                )}
                {donation.status === 'pending' && donation.slipUpload && (
                  <span className="slip-uploaded-note">
                    ⚠️ Slip Uploaded - Cannot be deleted (Payment Made)
                  </span>
                )}
                {donation.status === 'completed' && (
                  <span className="completed-note">
                    ✓ Completed - Cannot be deleted (Financial Record)
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DonationManager;

