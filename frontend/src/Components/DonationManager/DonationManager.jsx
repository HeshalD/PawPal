import React, { useState, useEffect } from 'react';
import { DonationsAPI } from '../../services/api';
import Nav from '../Nav/NavAdmin';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../Nav/logo.jpg';
import { Bell } from 'lucide-react';

const DonationManager = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [donations, setDonations] = useState([]);
  const [allDonations, setAllDonations] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [filteredDonations, setFilteredDonations] = useState([]);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 20;

  // Auto-refresh toggle
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Notification state for new pending donations
  const [notifOpen, setNotifOpen] = useState(false);
  const [newPending, setNewPending] = useState([]);
  const LAST_SEEN_KEY = 'donation_last_seen_at';
  const getLastSeen = () => {
    const v = localStorage.getItem(LAST_SEEN_KEY);
    return v ? new Date(v) : new Date(0);
  };
  const markAllSeen = () => {
    localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
    setNewPending([]);
    setNotifOpen(false);
  };

  // Auto-refresh every 10 seconds (only if enabled)
  useEffect(() => {
    fetchDonations();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchDonations(true); // Pass true to indicate auto-refresh
      }, 10000); // Refresh every 10 seconds
      
      return () => clearInterval(interval);
    }
  }, [filter, autoRefresh]);

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
    setCurrentPage(1);
  }, [donations, searchTerm, dateFilter]);

  const fetchDonations = async (isAutoRefresh = false) => {
    setLoading(true);
    try {
      const allResponse = await DonationsAPI.getAll();
      let newDonations = allResponse.data.donations || [];
      
      // Sort by newest first (most recent donations at the top)
      newDonations = newDonations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // If it's an auto-refresh and we have new data, go to page 1
      if (isAutoRefresh && newDonations.length !== allDonations.length) {
        setCurrentPage(1);
      }
      
      setAllDonations(newDonations);

      // Update notification list with pending items after last seen
      const lastSeen = getLastSeen();
      const pendingSinceLast = newDonations.filter(d => d.status === 'pending' && new Date(d.createdAt) > lastSeen);
      setNewPending(pendingSinceLast);
      
      let filteredDonations = newDonations;
      if (filter === 'pending') {
        filteredDonations = newDonations.filter(d => d.status === 'pending');
      } else if (filter === 'completed') {
        filteredDonations = newDonations.filter(d => d.status === 'completed');
      }
      
      setDonations(filteredDonations);
      setLastRefresh(new Date());
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

  // Pagination calculations
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredDonations.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredDonations.length / recordsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // PDF helpers
  const toDataURL = (url) => new Promise((resolve, reject) => {
    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      })
      .catch(reject);
  });

  const addPdfHeader = async (doc, title) => {
    const pageWidth = doc.internal.pageSize.width;
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();

    // Left time, Right date
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`Time: ${timeStr}`, 14, 14);
    doc.text(`Date: ${dateStr}`, pageWidth - 14, 14, { align: 'right' });

    try {
      const imgData = await toDataURL(logo);
      const imgW = 28; const imgH = 28;
      doc.addImage(imgData, 'JPEG', (pageWidth - imgW) / 2, 16, imgW, imgH);
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text(title, pageWidth / 2, 16 + imgH + 8, { align: 'center' });
      doc.setDrawColor(0,0,0);
      doc.setLineWidth(0.5);
      doc.line(14, 16 + imgH + 12, pageWidth - 14, 16 + imgH + 12);
      return 16 + imgH + 18;
    } catch {
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text(title, pageWidth / 2, 24, { align: 'center' });
      doc.setDrawColor(0,0,0);
      doc.setLineWidth(0.5);
      doc.line(14, 30, pageWidth - 14, 30);
      return 36;
    }
  };

  const downloadReport = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    const startAfterHeaderY = await addPdfHeader(doc, 'PawPal Donation Report');
    
    // metadata grid
    autoTable(doc, {
      startY: startAfterHeaderY,
      head: [['Metric', 'Value']],
      body: [
        ['Filter', dateFilter === 'all' ? 'All Time' : dateFilter],
        ['Search', searchTerm || 'All']
      ],
      theme: 'grid',
      headStyles: { fillColor: [147, 51, 234] },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 }
    });
    
    doc.setFontSize(14);
    doc.setTextColor(0);
    const summaryTitleY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 8 : startAfterHeaderY + 8;
    doc.text('Summary', 14, summaryTitleY);
    
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
      startY: summaryTitleY + 5,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [147, 51, 234] },
      margin: { left: 14, right: 14 }
    });
    
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
      headStyles: { fillColor: [236, 72, 153] },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 }
    });
    
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
                  <div className="flex items-center space-x-4 relative">
                    <div className="relative">
                      <button
                        onClick={() => setNotifOpen(o => !o)}
                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
                        title="Notifications"
                      >
                        <div className="relative">
                          <Bell className="w-5 h-5 text-gray-700" />
                          {newPending.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                              {newPending.length}
                            </span>
                          )}
                        </div>
                      </button>
                      {notifOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <div className="px-4 py-2 border-b flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-800">New Donation Requests</span>
                            {newPending.length > 0 && (
                              <button onClick={markAllSeen} className="text-xs text-purple-600 hover:underline">Mark all as seen</button>
                            )}
                          </div>
                          <div className="max-h-64 overflow-auto">
                            {newPending.length === 0 ? (
                              <div className="p-4 text-sm text-gray-500">No new pending donations.</div>
                            ) : (
                              newPending.slice(0, 10).map(d => (
                                <div key={d._id} className="p-3 border-b last:border-b-0">
                                  <div className="text-sm font-medium text-gray-900">{d.fullname} • {d.Amount} {d.Currency}</div>
                                  <div className="text-xs text-gray-500">{new Date(d.createdAt).toLocaleString()}</div>
                                  <div className="text-xs text-yellow-700 mt-1">Pending</div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* ✅ Auto-refresh toggle button */}
                    <button
                      onClick={() => setAutoRefresh(!autoRefresh)}
                      className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl ${
                        autoRefresh
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                          : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                      }`}
                    >
                      {autoRefresh ? '🔄 Auto-Refresh ON' : '⏸️ Auto-Refresh OFF'}
                    </button>
                    
                    <button
                      onClick={downloadReport}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      📊 Download Report
                    </button>
                  </div>
                </div>
              </div>
              
              {/* ✅ Last refresh time display */}
              <div className="pb-4">
                <p className="text-sm text-gray-500">
                  Last updated: {lastRefresh.toLocaleTimeString()} {autoRefresh && '• Refreshing every 10 seconds'}
                </p>
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
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">💝 Donations ({filteredDonations.length})</h3>
                  <p className="text-sm text-gray-600">
                    Showing {indexOfFirstRecord + 1}-{Math.min(indexOfLastRecord, filteredDonations.length)} of {filteredDonations.length}
                  </p>
                </div>
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
                    {currentRecords.map((donation) => (
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

              {filteredDonations.length > recordsPerPage && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        currentPage === 1
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-purple-500 text-white hover:bg-purple-600'
                      }`}
                    >
                      ← Previous
                    </button>

                    <div className="flex gap-2">
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNum = index + 1;
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => paginate(pageNum)}
                              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                currentPage === pageNum
                                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                  : 'bg-white text-gray-700 hover:bg-purple-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (
                          pageNum === currentPage - 2 ||
                          pageNum === currentPage + 2
                        ) {
                          return <span key={pageNum} className="px-2">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        currentPage === totalPages
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-purple-500 text-white hover:bg-purple-600'
                      }`}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
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