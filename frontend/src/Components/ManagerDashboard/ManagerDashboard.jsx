import React, { useEffect, useState } from 'react';
import { SponsorsAPI, toImageUrl } from '../../services/api';
import Nav from '../Nav/NavAdmin';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ManagerDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [pending, setPending] = useState([]);
  const [active, setActive] = useState([]);
  const [past, setPast] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [deleted, setDeleted] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [filteredData, setFilteredData] = useState({
    pending: [],
    active: [],
    past: [],
    rejected: [],
    deleted: []
  });
  const [reasonModal, setReasonModal] = useState({ open: false, action: null, id: null, reason: '' });
  const [imagePreview, setImagePreview] = useState({ open: false, url: null });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, a, pa, rj, dl] = await Promise.all([
        SponsorsAPI.managerPending(),
        SponsorsAPI.managerActive(),
        SponsorsAPI.managerPast(),
        SponsorsAPI.byStatus('rejected'),
        SponsorsAPI.byStatus('deleted'),
      ]);
      
      setPending(p.data.sponsors || []);
      setActive(a.data.sponsors || []);
      setPast(pa.data.sponsors || []);
      setRejected(rj.data.sponsors || []);
      setDeleted(dl.data.sponsors || []);
    } catch (e) {
      console.error('Manager load error:', e);
      setError(`Failed to load: ${e?.response?.data?.message || e.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    load(); 
  }, []);

  useEffect(() => {
    const filterData = (data) => {
      let filtered = data;
      
      if (searchTerm) {
        filtered = filtered.filter(item => 
          item.sponsorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
        
        filtered = filtered.filter(item => {
          const itemDate = new Date(item.createdAt || item.updatedAt);
          return itemDate >= filterDate;
        });
      }
      
      return filtered;
    };
    
    setFilteredData({
      pending: filterData(pending),
      active: filterData(active),
      past: filterData(past),
      rejected: filterData(rejected),
      deleted: filterData(deleted)
    });
  }, [pending, active, past, rejected, deleted, searchTerm, dateFilter]);

  const approve = async (id) => {
    try {
      await SponsorsAPI.approve(id);
      await load();
    } catch (e) {
      console.error('Approve error:', e);
      setError(`Approve failed: ${e?.response?.data?.message || e.message}`);
    }
  };

  const openReasonModal = (action, id) => {
    setReasonModal({ open: true, action, id, reason: '' });
  };

  const submitReason = async () => {
    const { action, id, reason } = reasonModal;
    if (!reason?.trim()) {
      return setError('Please provide a reason.');
    }
    try {
      if (action === 'reject') {
        await SponsorsAPI.reject(id, reason.trim());
      } else if (action === 'delete') {
        await SponsorsAPI.softDelete(id, reason.trim());
      }
      setReasonModal({ open: false, action: null, id: null, reason: '' });
      await load();
    } catch (e) {
      console.error('Reason action error:', e);
      setError(`${action === 'reject' ? 'Reject' : 'Delete'} failed: ${e?.response?.data?.message || e.message}`);
    }
  };

  const remove = async (id) => {
    try {
      await SponsorsAPI.remove(id);
      await load();
    } catch (e) {
      console.error('Remove error:', e);
      setError(`Remove failed: ${e?.response?.data?.message || e.message}`);
    }
  };

  const calculateSummary = () => {
    const allSponsors = [...pending, ...active, ...past, ...rejected];
    
    const totalAmount = allSponsors.reduce((sum, sponsor) => {
      const amount = Number(sponsor.sponsorAmount) || 0;
      return sum + amount;
    }, 0);
    
    const activeAmount = active.reduce((sum, sponsor) => {
      const amount = Number(sponsor.sponsorAmount) || 0;
      return sum + amount;
    }, 0);
    
    const pendingAmount = pending.reduce((sum, sponsor) => {
      const amount = Number(sponsor.sponsorAmount) || 0;
      return sum + amount;
    }, 0);
    
    return {
      totalSponsors: allSponsors.length,
      totalAmount,
      activeAmount,
      pendingAmount,
      activeCount: active.length,
      pendingCount: pending.length,
      pastCount: past.length,
      rejectedCount: rejected.length
    };
  };

  const summary = calculateSummary();

  const downloadReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(147, 51, 234);
    doc.text('PawPal Sponsor Report', pageWidth / 2, 20, { align: 'center' });
    
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
    
    const summaryData = [
      ['Total Sponsors', summary.totalSponsors.toString()],
      ['Total Amount', `Rs. ${summary.totalAmount.toLocaleString()}`],
      ['Active Amount', `Rs. ${summary.activeAmount.toLocaleString()}`],
      ['Pending Amount', `Rs. ${summary.pendingAmount.toLocaleString()}`],
      ['Active Count', summary.activeCount.toString()],
      ['Pending Count', summary.pendingCount.toString()],
      ['Past Count', summary.pastCount.toString()],
      ['Rejected Count', summary.rejectedCount.toString()]
    ];
    
    autoTable(doc, {
      startY: 60,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [147, 51, 234] },
      margin: { left: 14, right: 14 }
    });
    
    let currentY = doc.lastAutoTable.finalY + 10;
    
    // Pending Sponsors
    if (filteredData.pending.length > 0) {
      doc.setFontSize(12);
      doc.text('Pending Sponsors', 14, currentY);
      
      const pendingData = filteredData.pending.map(sponsor => [
        sponsor.sponsorName,
        sponsor.companyName || '-',
        sponsor.email,
        `Rs. ${Number(sponsor.sponsorAmount || 0).toLocaleString()}`,
        sponsor.durationMonths === 0.001 ? '1 min' : `${sponsor.durationMonths} months`,
        new Date(sponsor.createdAt).toLocaleDateString()
      ]);
      
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Name', 'Company', 'Email', 'Amount', 'Duration', 'Created']],
        body: pendingData,
        theme: 'striped',
        headStyles: { fillColor: [251, 191, 36] },
        styles: { fontSize: 8 },
        margin: { left: 14, right: 14 }
      });
      
      currentY = doc.lastAutoTable.finalY + 10;
    }
    
    // Active Sponsors
    if (filteredData.active.length > 0) {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }
      
      doc.setFontSize(12);
      doc.text('Active Sponsors', 14, currentY);
      
      const activeData = filteredData.active.map(sponsor => [
        sponsor.sponsorName,
        sponsor.companyName || '-',
        `Rs. ${Number(sponsor.sponsorAmount || 0).toLocaleString()}`,
        sponsor.durationMonths === 0.001 ? '1 min' : `${sponsor.durationMonths} months`,
        sponsor.startDate ? new Date(sponsor.startDate).toLocaleDateString() : '-',
        sponsor.endDate ? new Date(sponsor.endDate).toLocaleDateString() : '-'
      ]);
      
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Name', 'Company', 'Amount', 'Duration', 'Start Date', 'End Date']],
        body: activeData,
        theme: 'striped',
        headStyles: { fillColor: [34, 197, 94] },
        styles: { fontSize: 8 },
        margin: { left: 14, right: 14 }
      });
      
      currentY = doc.lastAutoTable.finalY + 10;
    }
    
    // Past Sponsors
    if (filteredData.past.length > 0) {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }
      
      doc.setFontSize(12);
      doc.text('Past Sponsors', 14, currentY);
      
      const pastData = filteredData.past.map(sponsor => [
        sponsor.sponsorName,
        sponsor.companyName || '-',
        `Rs. ${Number(sponsor.sponsorAmount || 0).toLocaleString()}`,
        sponsor.durationMonths === 0.001 ? '1 min' : `${sponsor.durationMonths} months`,
        sponsor.startDate ? new Date(sponsor.startDate).toLocaleDateString() : '-',
        sponsor.endDate ? new Date(sponsor.endDate).toLocaleDateString() : '-'
      ]);
      
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Name', 'Company', 'Amount', 'Duration', 'Start Date', 'End Date']],
        body: pastData,
        theme: 'striped',
        headStyles: { fillColor: [107, 114, 128] },
        styles: { fontSize: 8 },
        margin: { left: 14, right: 14 }
      });
      
      currentY = doc.lastAutoTable.finalY + 10;
    }
    
    // Rejected Sponsors
    if (filteredData.rejected.length > 0) {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }
      
      doc.setFontSize(12);
      doc.text('Rejected Sponsors', 14, currentY);
      
      const rejectedData = filteredData.rejected.map(sponsor => [
        sponsor.sponsorName,
        sponsor.companyName || '-',
        `Rs. ${Number(sponsor.sponsorAmount || 0).toLocaleString()}`,
        sponsor.rejectReason || '-',
        new Date(sponsor.createdAt).toLocaleDateString()
      ]);
      
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Name', 'Company', 'Amount', 'Reason', 'Created']],
        body: rejectedData,
        theme: 'striped',
        headStyles: { fillColor: [239, 68, 68] },
        styles: { fontSize: 8 },
        margin: { left: 14, right: 14 }
      });
      
      currentY = doc.lastAutoTable.finalY + 10;
    }
    
    // Deleted Sponsors
    if (filteredData.deleted.length > 0) {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }
      
      doc.setFontSize(12);
      doc.text('Deleted Sponsors', 14, currentY);
      
      const deletedData = filteredData.deleted.map(sponsor => [
        sponsor.sponsorName,
        sponsor.companyName || '-',
        `Rs. ${Number(sponsor.sponsorAmount || 0).toLocaleString()}`,
        sponsor.deleteReason || '-',
        new Date(sponsor.createdAt).toLocaleDateString()
      ]);
      
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Name', 'Company', 'Amount', 'Reason', 'Created']],
        body: deletedData,
        theme: 'striped',
        headStyles: { fillColor: [156, 163, 175] },
        styles: { fontSize: 8 },
        margin: { left: 14, right: 14 }
      });
    }
    
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
    doc.save(`sponsor-report-${dateFilter}-${new Date().toISOString().split('T')[0]}.pdf`);
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
              <p className="text-purple-600 font-medium">Loading Manager Dashboard...</p>
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
                    ⚙️Sponsor Management
                  </h1>
                  <p className="text-gray-600 mt-1">Pawpal Pet Care Management System</p>
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
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <div className="text-red-400">⚠️</div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Total Sponsors</p>
                    <p className="text-3xl font-bold font-gilroyBold">{summary.totalSponsors}</p>
                  </div>
                  <div className="text-4xl opacity-80">🤝</div>
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
                    <p className="text-white text-sm font-medium">Active Amount</p>
                    <p className="text-2xl font-bold font-gilroyBold">Rs. {summary.activeAmount.toLocaleString()}</p>
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
                    placeholder="🔍 Search sponsors..."
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

            <div className="space-y-8">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
                  <h3 className="text-lg font-semibold text-gray-900">⏳ Pending Sponsors ({filteredData.pending.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredData.pending.map((sponsor) => (
                        <tr key={sponsor._id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {sponsor.adImagePath ? (
                              <img
                                src={toImageUrl(sponsor.adImagePath)}
                                alt="Ad Thumbnail"
                                className="h-12 w-20 object-cover rounded border cursor-pointer"
                                onClick={() => setImagePreview({ open: true, url: toImageUrl(sponsor.adImagePath) })}
                              />
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{sponsor.sponsorName}</div>
                            <div className="text-sm text-gray-500">{sponsor.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {sponsor.companyName || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                            Rs. {Number(sponsor.sponsorAmount || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {sponsor.durationMonths === 0.001 ? '1 min' : `${sponsor.durationMonths} months`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              {sponsor.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(sponsor.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => approve(sponsor._id)}
                              className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-1 rounded-lg transition-colors duration-200"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => openReasonModal('reject', sponsor._id)}
                              className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-lg transition-colors duration-200"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => remove(sponsor._id)}
                              className="text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg transition-colors duration-200"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                  <h3 className="text-lg font-semibold text-gray-900">✅ Active Sponsors ({filteredData.active.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredData.active.map((sponsor) => (
                        <tr key={sponsor._id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{sponsor.sponsorName}</div>
                            <div className="text-sm text-gray-500">{sponsor.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {sponsor.companyName || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                            Rs. {Number(sponsor.sponsorAmount || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {sponsor.durationMonths === 0.001 ? '1 min' : `${sponsor.durationMonths} months`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {sponsor.startDate ? new Date(sponsor.startDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {sponsor.endDate ? new Date(sponsor.endDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => openReasonModal('delete', sponsor._id)}
                              className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-lg transition-colors duration-200"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
                  <h3 className="text-lg font-semibold text-gray-900">📅 Past Sponsors ({filteredData.past.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredData.past.map((sponsor) => (
                        <tr key={sponsor._id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{sponsor.sponsorName}</div>
                            <div className="text-sm text-gray-500">{sponsor.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {sponsor.companyName || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                            Rs. {Number(sponsor.sponsorAmount || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {sponsor.durationMonths === 0.001 ? '1 min' : `${sponsor.durationMonths} months`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {sponsor.startDate ? new Date(sponsor.startDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {sponsor.endDate ? new Date(sponsor.endDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              {sponsor.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-pink-50">
                  <h3 className="text-lg font-semibold text-gray-900">❌ Rejected Sponsors ({filteredData.rejected.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredData.rejected.map((sponsor) => (
                        <tr key={sponsor._id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{sponsor.sponsorName}</div>
                            <div className="text-sm text-gray-500">{sponsor.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {sponsor.companyName || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                            Rs. {Number(sponsor.sponsorAmount || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {sponsor.durationMonths === 0.001 ? '1 min' : `${sponsor.durationMonths} months`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {sponsor.rejectReason || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              {sponsor.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-red-50">
                  <h3 className="text-lg font-semibold text-gray-900">🗑️ Deleted Sponsors ({filteredData.deleted.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredData.deleted.map((sponsor) => (
                        <tr key={sponsor._id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{sponsor.sponsorName}</div>
                            <div className="text-sm text-gray-500">{sponsor.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {sponsor.companyName || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                            Rs. {Number(sponsor.sponsorAmount || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {sponsor.durationMonths === 0.001 ? '1 min' : `${sponsor.durationMonths} months`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {sponsor.deleteReason || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              {sponsor.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {reasonModal.open && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {reasonModal.action === 'reject' ? 'Enter rejection reason' : 'Enter deletion reason'}
                </h3>
                <p className="text-sm text-gray-600 mb-4">This reason will be shown under the {reasonModal.action === 'reject' ? 'Rejected' : 'Deleted'} ads list.</p>
                <textarea
                  value={reasonModal.reason}
                  onChange={(e) => setReasonModal(prev => ({ ...prev, reason: e.target.value }))}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Type your reason here..."
                />
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => setReasonModal({ open: false, action: null, id: null, reason: '' })}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitReason}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}

          {imagePreview.open && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setImagePreview({ open: false, url: null })}>
              <div className="relative max-w-4xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
                <button
                  className="absolute -top-10 right-0 text-white bg-black/60 hover:bg-black/80 px-3 py-1 rounded"
                  onClick={() => setImagePreview({ open: false, url: null })}
                >
                  Close ✕
                </button>
                <img src={imagePreview.url} alt="Ad Full Preview" className="w-full h-auto rounded shadow-2xl" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}