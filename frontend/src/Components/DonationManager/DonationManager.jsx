import React, { useState, useEffect } from 'react';
import { DonationsAPI } from '../../services/api';
import Nav from '../Nav/NavAdmin';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DonationManager = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [donations, setDonations] = useState([]);
  const [allDonations, setAllDonations] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [filteredDonations, setFilteredDonations] = useState([]);

  useEffect(() => {
    fetchDonations();
  }, [filter]);

  useEffect(() => {
    const filterDonations = (data) => {
      let filtered = data;
      
      if (searchTerm) {
        filtered = filtered.filter(donation => 
          donation.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          donation.Email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          donation.ContributionType?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (dateFilter !== 'all') {
        const now = new Date();
        const filterDate = new Date();
        
        switch (dateFilter) {
          case 'daily':
            filterDate.setDate(now.getDate() - 1);
            break;
          case 'weekly':
            filterDate.setDate(now.getDate() - 7);
            break;
          case 'monthly':
            filterDate.setMonth(now.getMonth() - 1);
            break;
          case 'yearly':
            filterDate.setFullYear(now.getFullYear() - 1);
            break;
          default:
            break;
        }
        
        filtered = filtered.filter(donation => {
          const donationDate = new Date(donation.createdAt);
          return donationDate >= filterDate;
        });
      }
      
      return filtered;
    };
    
    setFilteredDonations(filterDonations(donations));
  }, [donations, searchTerm, dateFilter]);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const allResponse = await DonationsAPI.getAll();
      setAllDonations(allResponse.data.donations || []);
      
      let filteredDonations = allResponse.data.donations || [];
      if (filter === 'pending') {
        filteredDonations = (allResponse.data.donations || []).filter(d => d.status === 'pending');
      } else if (filter === 'completed') {
        filteredDonations = (allResponse.data.donations || []).filter(d => d.status === 'completed');
      }
      
      setDonations(filteredDonations);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsCompleted = async (id) => {
    try {
      await DonationsAPI.markCompleted(id);
      alert('Donation marked as completed!');
      fetchDonations();
    } catch (error) {
      console.error('Error:', error);
      alert('Error updating donation status');
    }
  };

  const deleteDonation = async (id) => {
    if (window.confirm('Are you sure you want to delete this donation?')) {
      try {
        await DonationsAPI.delete(id);
        alert('Donation deleted successfully!');
        fetchDonations();
      } catch (error) {
        console.error('Error:', error);
        alert(`Cannot delete donation: ${error.response?.data?.message || 'Unknown error'}`);
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
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
        status === 'pending' 
          ? 'bg-yellow-100 text-yellow-800' 
          : 'bg-green-100 text-green-800'
      }`}>
        {statusText}
      </span>
    );
  };

  const calculateSummary = () => {
    const totalAmount = allDonations.reduce((sum, donation) => sum + (Number(donation.Amount) || 0), 0);
    const pendingAmount = allDonations.filter(d => d.status === 'pending').reduce((sum, donation) => sum + (Number(donation.Amount) || 0), 0);
    const completedAmount = allDonations.filter(d => d.status === 'completed').reduce((sum, donation) => sum + (Number(donation.Amount) || 0), 0);
    
    return {
      totalDonations: allDonations.length,
      totalAmount,
      pendingAmount,
      completedAmount,
      pendingCount: allDonations.filter(d => d.status === 'pending').length,
      completedCount: allDonations.filter(d => d.status === 'completed').length
    };
  };

  const summary = calculateSummary();

  const downloadReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(147, 51, 234); // Purple color
    doc.text('PawPal Donation Report', pageWidth / 2, 20, { align: 'center' });
    
    // Report metadata
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 35);
    doc.text(`Filter: ${dateFilter === 'all' ? 'All Time' : dateFilter}`, 14, 40);
    doc.text(`Search: ${searchTerm || 'All'}`, 14, 45);
    
    // Summary section
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Summary', 14, 55);
    
    doc.setFontSize(10);
    const summaryData = [
      ['Total Donations', summary.totalDonations.toString()],
      ['Total Amount', `Rs. ${summary.totalAmount.toLocaleString()}`],
      ['Completed Amount', `Rs. ${summary.completedAmount.toLocaleString()}`],
      ['Pending Amount', `Rs. ${summary.pendingAmount.toLocaleString()}`],
      ['Completed Count', summary.completedCount.toString()],
      ['Pending Count', summary.pendingCount.toString()]
    ];
    
    autoTable(doc, {
      startY: 60,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [147, 51, 234] },
      margin: { left: 14, right: 14 }
    });
    
    // Donations table
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text('Donations', 14, finalY);
    
    const tableData = filteredDonations.map(donation => [
      donation.fullname,
      donation.Email,
      donation.phone,
      `${donation.Amount} ${donation.Currency}`,
      donation.ContributionType,
      donation.donationFrequency,
      donation.status,
      new Date(donation.createdAt).toLocaleDateString()
    ]);
    
    autoTable(doc, {
      startY: finalY + 5,
      head: [['Name', 'Email', 'Phone', 'Amount', 'Type', 'Frequency', 'Status', 'Date']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [236, 72, 153] }, // Pink color
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 }
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Save the PDF
    doc.save(`donation-report-${dateFilter}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex">
        <Nav collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={`flex-1 transition-all duration-300 ${
          collapsed ? 'ml-16' : 'ml-64'
        } p-6`}>
          <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-purple-600 font-medium">Loading Donations...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      <Nav collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div className={`flex-1 transition-all duration-300 ${
        collapsed ? 'ml-16' : 'ml-64'
      } p-6`}>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="bg-white shadow-lg border-b border-purple-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 font-gilroyBold">
                    💝 Donation Management
                  </h1>
                  <p className="text-gray-600 mt-1">PawPal Pet Care Donation System</p>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={downloadReport}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    📊 Download Report
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Total Donations</p>
                    <p className="text-3xl font-bold font-gilroyBold">{summary.totalDonations}</p>
                  </div>
                  <div className="text-4xl opacity-80">💝</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-100 text-sm font-medium">Total Amount</p>
                    <p className="text-2xl font-bold font-gilroyBold">Rs. {summary.totalAmount.toLocaleString()}</p>
                  </div>
                  <div className="text-4xl opacity-80">💰</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">Completed Amount</p>
                    <p className="text-2xl font-bold font-gilroyBold">Rs. {summary.completedAmount.toLocaleString()}</p>
                  </div>
                  <div className="text-4xl opacity-80">✅</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">Pending Amount</p>
                    <p className="text-2xl font-bold font-gilroyBold">Rs. {summary.pendingAmount.toLocaleString()}</p>
                  </div>
                  <div className="text-4xl opacity-80">⏳</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="🔍 Search donations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="all">📅 All Time</option>
                  <option value="daily">📅 Last 24 Hours</option>
                  <option value="weekly">📅 Last 7 Days</option>
                  <option value="monthly">📅 Last 30 Days</option>
                  <option value="yearly">📅 Last Year</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 mb-8">
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    filter === 'all'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                  onClick={() => setFilter('all')}
                >
                  All Donations ({allDonations.length})
                </button>
                <button
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    filter === 'pending'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                  onClick={() => setFilter('pending')}
                >
                  Pending ({allDonations.filter(d => d.status === 'pending').length})
                </button>
                <button
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    filter === 'completed'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                  onClick={() => setFilter('completed')}
                >
                  Completed ({allDonations.filter(d => d.status === 'completed').length})
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                <h3 className="text-lg font-semibold text-gray-900">💝 Donations ({filteredDonations.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDonations.map((donation) => (
                      <tr key={donation._id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{donation.fullname}</div>
                          <div className="text-sm text-gray-500">{donation.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {donation.Email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                          {donation.Amount} {donation.Currency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {donation.ContributionType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {donation.donationFrequency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(donation.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(donation.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {donation.status === 'pending' && (
                            <button
                              onClick={() => markAsCompleted(donation._id)}
                              className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-1 rounded-lg transition-colors duration-200"
                            >
                              Complete
                            </button>
                          )}
                          {donation.status === 'pending' && !donation.slipUpload && (
                            <button
                              onClick={() => deleteDonation(donation._id)}
                              className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-lg transition-colors duration-200"
                            >
                              Delete
                            </button>
                          )}
                          {donation.slipUpload && (
                            <a
                              href={`http://localhost:5000/${donation.slipUpload}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-lg transition-colors duration-200"
                            >
                              View Slip
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {filteredDonations.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No donations found</h3>
                <p className="text-gray-600">No donations match your current filter criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationManager;