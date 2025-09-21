import React, { useEffect, useState } from 'react';
import { SponsorsAPI, toImageUrl } from '../../services/api';

export default function ManagerDashboard() {
  const [pending, setPending] = useState([]);
  const [active, setActive] = useState([]);
  const [past, setPast] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [filteredData, setFilteredData] = useState({
    pending: [],
    active: [],
    past: [],
    rejected: []
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, a, pa, rj] = await Promise.all([
        SponsorsAPI.managerPending(),
        SponsorsAPI.managerActive(),
        SponsorsAPI.managerPast(),
        SponsorsAPI.byStatus('rejected'),
      ]);
      
      console.log('Loaded pending sponsors:', p.data.sponsors);
      console.log('Pending sponsors amounts:', p.data.sponsors?.map(s => ({ 
        name: s.sponsorName, 
        amount: s.sponsorAmount, 
        type: typeof s.sponsorAmount 
      })));
      
      setPending(p.data.sponsors || []);
      setActive(a.data.sponsors || []);
      setPast(pa.data.sponsors || []);
      setRejected(rj.data.sponsors || []);
    } catch (e) {
      console.error('Manager load error:', e);
      setError(`Failed to load: ${e?.response?.data?.message || e.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    console.log('ManagerDashboard mounted, loading data...');
    load(); 
  }, []);

  // Filter data based on search term and date filter
  useEffect(() => {
    const filterData = (data) => {
      let filtered = data;
      
      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(item => 
          item.sponsorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Apply date filter
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
      rejected: filterData(rejected)
    });
  }, [pending, active, past, rejected, searchTerm, dateFilter]);

  const approve = async (id) => {
    try {
      await SponsorsAPI.approve(id);
      await load();
    } catch (e) {
      console.error('Approve error:', e);
      setError(`Approve failed: ${e?.response?.data?.message || e.message}`);
    }
  };

  const reject = async (id) => {
    try {
      await SponsorsAPI.reject(id);
      await load();
    } catch (e) {
      console.error('Reject error:', e);
      setError(`Reject failed: ${e?.response?.data?.message || e.message}`);
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

  // Calculate summary statistics
  const calculateSummary = () => {
    const allSponsors = [...pending, ...active, ...past, ...rejected];
    
    // Debug logging
    console.log('All sponsors for summary:', allSponsors.map(s => ({
      name: s.sponsorName,
      amount: s.sponsorAmount,
      type: typeof s.sponsorAmount
    })));
    
    const totalAmount = allSponsors.reduce((sum, sponsor) => {
      const amount = Number(sponsor.sponsorAmount) || 0;
      console.log(`Adding amount: ${amount} for sponsor: ${sponsor.sponsorName}`);
      return sum + amount;
    }, 0);
    
    const activeAmount = active.reduce((sum, sponsor) => {
      const amount = Number(sponsor.sponsorAmount) || 0;
      console.log(`Active amount: ${amount} for sponsor: ${sponsor.sponsorName}`);
      return sum + amount;
    }, 0);
    
    const pendingAmount = pending.reduce((sum, sponsor) => {
      const amount = Number(sponsor.sponsorAmount) || 0;
      console.log(`Pending amount: ${amount} for sponsor: ${sponsor.sponsorName}`);
      return sum + amount;
    }, 0);
    
    console.log('Calculated amounts:', { totalAmount, activeAmount, pendingAmount });
    
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

  // Download functionality
  const downloadReport = () => {
    const reportData = generateReportData();
    
    // Generate CSV format
    const csvContent = generateCSVReport(reportData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sponsor-report-${dateFilter}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateReportData = () => {
    return {
      summary,
      pending: filteredData.pending,
      active: filteredData.active,
      past: filteredData.past,
      rejected: filteredData.rejected,
      generatedAt: new Date().toISOString(),
      filter: dateFilter,
      searchTerm: searchTerm || 'All'
    };
  };

  const generateCSVReport = (data) => {
    let csv = 'Sponsor Management Report\n';
    csv += `Generated: ${new Date(data.generatedAt).toLocaleString()}\n`;
    csv += `Filter: ${data.filter}\n`;
    csv += `Search: ${data.searchTerm}\n\n`;
    
    csv += 'SUMMARY\n';
    csv += `Total Sponsors,${data.summary.totalSponsors}\n`;
    csv += `Total Amount,Rs. ${data.summary.totalAmount.toLocaleString()}\n`;
    csv += `Active Amount,Rs. ${data.summary.activeAmount.toLocaleString()}\n`;
    csv += `Pending Amount,Rs. ${data.summary.pendingAmount.toLocaleString()}\n\n`;
    
    csv += 'PENDING SPONSORS\n';
    csv += 'Name,Company,Email,Phone,Amount,Duration,Status,Created\n';
    data.pending.forEach(sponsor => {
      csv += `"${sponsor.sponsorName}","${sponsor.companyName || ''}","${sponsor.email}","${sponsor.phone}","${sponsor.sponsorAmount}","${sponsor.durationMonths} months","${sponsor.status}","${new Date(sponsor.createdAt).toLocaleDateString()}"\n`;
    });
    
    csv += '\nACTIVE SPONSORS\n';
    csv += 'Name,Company,Email,Phone,Amount,Duration,Status,Start Date,End Date\n';
    data.active.forEach(sponsor => {
      csv += `"${sponsor.sponsorName}","${sponsor.companyName || ''}","${sponsor.email}","${sponsor.phone}","${sponsor.sponsorAmount}","${sponsor.durationMonths} months","${sponsor.status}","${sponsor.startDate ? new Date(sponsor.startDate).toLocaleDateString() : ''}","${sponsor.endDate ? new Date(sponsor.endDate).toLocaleDateString() : ''}"\n`;
    });
    
    csv += '\nPAST SPONSORS\n';
    csv += 'Name,Company,Email,Phone,Amount,Duration,Status,Start Date,End Date\n';
    data.past.forEach(sponsor => {
      csv += `"${sponsor.sponsorName}","${sponsor.companyName || ''}","${sponsor.email}","${sponsor.phone}","${sponsor.sponsorAmount}","${sponsor.durationMonths} months","${sponsor.status}","${sponsor.startDate ? new Date(sponsor.startDate).toLocaleDateString() : ''}","${sponsor.endDate ? new Date(sponsor.endDate).toLocaleDateString() : ''}"\n`;
    });
    
    csv += '\nREJECTED SPONSORS\n';
    csv += 'Name,Company,Email,Phone,Amount,Duration,Status,Created\n';
    data.rejected.forEach(sponsor => {
      csv += `"${sponsor.sponsorName}","${sponsor.companyName || ''}","${sponsor.email}","${sponsor.phone}","${sponsor.sponsorAmount}","${sponsor.durationMonths} months","${sponsor.status}","${new Date(sponsor.createdAt).toLocaleDateString()}"\n`;
    });
    
    return csv;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">Loading Manager Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-gilroyBold">
                ⚙️ Manager Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Professional Pet Care Management System</p>
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

        {/* Summary Cards */}
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

        {/* Search and Filter Controls */}
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

        {/* Data Tables */}
        <div className="space-y-8">
          {/* Pending Sponsors */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
              <h3 className="text-lg font-semibold text-gray-900">⏳ Pending Sponsors ({filteredData.pending.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
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
                          onClick={() => reject(sponsor._id)}
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

          {/* Active Sponsors */}
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
                          onClick={() => remove(sponsor._id)}
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

          {/* Past Sponsors */}
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

          {/* Rejected Sponsors */}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(sponsor.createdAt).toLocaleDateString()}
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
        </div>
      </div>
    </div>
  );
}
