import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Nav from '../Components/Nav/NavAdmin';
import { DonationsAPI, SponsorsAPI } from '../services/api';

const colors = {
  donation: {
    base: '#6638E6',
    light: '#8B6CF0',
    lighter: '#E9E3FF',
    hover: '#6638E6'
  },
  sponsor: {
    base: '#E6738F',
    light: '#E69AAE',
    lighter: '#FFF0F3',
    hover: '#E6738F'
  }
};

// Utility: Format date consistently
const fmtDate = (d) => {
  const dt = new Date(d);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Utility: Create date at start of day in local timezone
const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Utility: Create date at end of day in local timezone
const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

// Check if date is within range (inclusive)
function withinRange(date, start, end) {
  if (!date) return false;
  const t = new Date(date).getTime();
  return t >= start.getTime() && t <= end.getTime();
}

// Get preset date range
function getRangePreset(preset) {
  const now = new Date();
  const end = endOfDay(now);
  let start = startOfDay(now);
  
  if (preset === 'day') {
    start = startOfDay(now);
  } else if (preset === 'week') {
    start = startOfDay(now);
    start.setDate(start.getDate() - 6);
  } else if (preset === 'month') {
    start = startOfDay(now);
    start.setMonth(start.getMonth() - 1);
  } else if (preset === 'year') {
    start = startOfDay(now);
    start.setFullYear(start.getFullYear() - 1);
  }
  
  return { start, end };
}

// Build daily buckets for the range
function buildDailyBuckets(start, end) {
  const buckets = [];
  const cur = startOfDay(start);
  const e = startOfDay(end);
  
  while (cur <= e) {
    const key = cur.toISOString().slice(0, 10);
    const label = cur.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    buckets.push({ key, label, donation: 0, sponsor: 0 });
    cur.setDate(cur.getDate() + 1);
  }
  
  return buckets;
}

export default function Analyzer() {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [donations, setDonations] = useState([]);
  const [sponsors, setSponsors] = useState([]);

  const [preset, setPreset] = useState('week');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [metric, setMetric] = useState('count'); // 'count' | 'amount'

  // Calculate date range
  const { start, end } = useMemo(() => {
    if (preset !== 'range') return getRangePreset(preset);
    
    const s = from ? startOfDay(new Date(from)) : startOfDay(new Date());
    const e = to ? endOfDay(new Date(to)) : endOfDay(new Date());
    
    return { start: s, end: e };
  }, [preset, from, to]);

  // Load data
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dRes, sRes] = await Promise.all([
        DonationsAPI.getAll(),
        SponsorsAPI.list(),
      ]);
      setDonations(Array.isArray(dRes.data) ? dRes.data : (dRes.data?.donations || []));
      setSponsors(Array.isArray(sRes.data) ? sRes.data : (sRes.data?.sponsors || []));
    } catch (e) {
      console.error('Analyzer load error', e);
      setError(e?.response?.data?.message || e.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Filter data by date range
  const filtered = useMemo(() => {
    const d = donations.filter(x => 
      withinRange(x.createdAt || x.date || x.updatedAt, start, end)
    );
    const s = sponsors.filter(x => 
      withinRange(x.createdAt || x.updatedAt || x.startDate, start, end)
    );
    return { d, s };
  }, [donations, sponsors, start, end]);

  // Calculate counts
  const counts = useMemo(() => {
    return { 
      donation: filtered.d.length, 
      sponsor: filtered.s.length 
    };
  }, [filtered]);

  // Calculate amounts
  const amounts = useMemo(() => {
    const donationAmount = filtered.d.reduce((sum, x) => sum + (Number(x.Amount) || 0), 0);
    const sponsorAmount = filtered.s.reduce((sum, x) => sum + (Number(x.sponsorAmount) || 0), 0);
    return { donation: donationAmount, sponsor: sponsorAmount };
  }, [filtered]);

  // Totals and percentages for selected metric
  const totalSelected = metric === 'amount'
    ? (amounts.donation + amounts.sponsor)
    : (counts.donation + counts.sponsor);
  const pie = {
    donationPct: totalSelected > 0
      ? Math.round(((metric === 'amount' ? amounts.donation : counts.donation) / totalSelected) * 100)
      : 50,
    sponsorPct: totalSelected > 0
      ? Math.round(((metric === 'amount' ? amounts.sponsor : counts.sponsor) / totalSelected) * 100)
      : 50
  };

  // Build time series data
  const series = useMemo(() => {
    const buckets = buildDailyBuckets(start, end);
    const idx = Object.fromEntries(buckets.map((b, i) => [b.key, i]));

    filtered.d.forEach(x => {
      const date = new Date(x.createdAt || x.date || x.updatedAt);
      const key = date.toISOString().slice(0, 10);
      const val = metric === 'amount' ? (Number(x.Amount) || 0) : 1;
      if (idx[key] !== undefined) buckets[idx[key]].donation += val;
    });
    
    filtered.s.forEach(x => {
      const date = new Date(x.createdAt || x.updatedAt || x.startDate);
      const key = date.toISOString().slice(0, 10);
      const val = metric === 'amount' ? (Number(x.sponsorAmount) || 0) : 1;
      if (idx[key] !== undefined) buckets[idx[key]].sponsor += val;
    });
    
    return buckets;
  }, [filtered, start, end, metric]);

  // Chart Components
  const ChartContainer = ({ children, loading }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 relative">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      )}
      {children}
    </div>
  );

  const BarChart = () => {
    const donationVal = metric === 'amount' ? amounts.donation : counts.donation;
    const sponsorVal = metric === 'amount' ? amounts.sponsor : counts.sponsor;
    const max = Math.max(1, donationVal, sponsorVal);
    const h = 180;
    const scale = (v) => (v / max) * h;
    
    return (
      <div className="h-full flex flex-col">
        <h3 className="text-lg font-semibold mb-6 text-gray-800 flex items-center gap-2">
          {metric === 'amount' ? '💰 Total Amount' : '📊 Total Count'}
        </h3>
        <div className="flex-1 flex items-end justify-center gap-16 relative pb-8">
          {/* Grid lines background */}
          <div className="absolute inset-0 flex flex-col justify-between px-4 pointer-events-none">
            {[0, 25, 50, 75, 100].map(pct => (
              <div key={pct} className="border-t border-gray-200 border-dashed"></div>
            ))}
          </div>
          
          {/* Donation Bar */}
          <div className="flex flex-col items-center group cursor-pointer relative z-10">
            <div className="relative">
              {/* Glow effect */}
              <div 
                className="absolute inset-0 rounded-t-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300"
                style={{ 
                  height: Math.max(scale(counts.donation), 4),
                  background: colors.donation.light
                }}
              ></div>
              {/* Main bar */}
              <div 
                className="w-24 rounded-t-2xl transition-all duration-500 relative overflow-hidden shadow-lg group-hover:shadow-2xl" 
                style={{ 
                  height: Math.max(scale(donationVal), 4), 
                  background: `linear-gradient(to top, ${colors.donation.base}, ${colors.donation.light})` 
                }}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                {/* Animated stripes */}
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 20px)'
                }}></div>
              </div>
            </div>
            <div className="mt-4 flex flex-col items-center bg-purple-50 px-4 py-2 rounded-lg group-hover:bg-purple-100 transition-colors">
              <span className="text-sm font-semibold" style={{ color: colors.donation.hover }}>💝 Donations</span>
              <span className="text-3xl font-bold mt-1" style={{ color: colors.donation.hover }}>
                {metric === 'amount' ? `Rs. ${donationVal.toLocaleString()}` : donationVal}
              </span>
            </div>
          </div>
          
          {/* Sponsor Bar */}
          <div className="flex flex-col items-center group cursor-pointer relative z-10">
            <div className="relative">
              {/* Glow effect */}
              <div 
                className="absolute inset-0 rounded-t-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300"
                style={{ 
                  height: Math.max(scale(counts.sponsor), 4),
                  background: colors.sponsor.light
                }}
              ></div>
              {/* Main bar */}
              <div 
                className="w-24 rounded-t-2xl transition-all duration-500 relative overflow-hidden shadow-lg group-hover:shadow-2xl" 
                style={{ 
                  height: Math.max(scale(sponsorVal), 4), 
                  background: `linear-gradient(to top, ${colors.sponsor.base}, ${colors.sponsor.light})` 
                }}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                {/* Animated stripes */}
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 20px)'
                }}></div>
              </div>
            </div>
            <div className="mt-4 flex flex-col items-center px-4 py-2 rounded-lg transition-colors" 
                 style={{ backgroundColor: colors.sponsor.lighter }}>
              <span className="text-sm font-semibold" style={{ color: colors.sponsor.hover }}>🤝 Sponsors</span>
              <span className="text-3xl font-bold mt-1" style={{ color: colors.sponsor.hover }}>
                {metric === 'amount' ? `Rs. ${sponsorVal.toLocaleString()}` : sponsorVal}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const LineChart = () => {
    const w = 700;
    const h = 280;
    const pad = 50;
    const max = Math.max(1, ...series.map(b => Math.max(b.donation, b.sponsor)));
    
    const x = (i) => pad + (i * (w - 2 * pad) / Math.max(1, series.length - 1));
    const y = (v) => h - pad - (v * (h - 2 * pad) / max);
    
    const pathFor = (key, color) => {
      if (series.length === 0) return '';
      const path = series.map((b, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(b[key])}`).join(' ');
      return path;
    };

    const showLabels = series.length <= 14;
    
    return (
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
          {metric === 'amount' ? '💹 Daily Amount Trend' : '📈 Daily Count Trend'}
        </h3>
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 shadow-inner">
          <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
            <defs>
              {/* Gradient for donation line */}
              <linearGradient id="donationGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={colors.donation.light} stopOpacity="0.3" />
                <stop offset="100%" stopColor={colors.donation.light} stopOpacity="0" />
              </linearGradient>
              {/* Gradient for sponsor line */}
              <linearGradient id="sponsorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={colors.sponsor.light} stopOpacity="0.3" />
                <stop offset="100%" stopColor={colors.sponsor.light} stopOpacity="0" />
              </linearGradient>
              {/* Glow filter */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Grid lines with labels */}
            {[0, 0.25, 0.5, 0.75, 1].map(pct => (
              <g key={pct}>
                <line 
                  x1={pad} 
                  y1={y(max * pct)} 
                  x2={w - pad} 
                  y2={y(max * pct)} 
                  stroke={pct === 0 ? "#d1d5db" : "#f3f4f6"} 
                  strokeWidth={pct === 0 ? 2 : 1}
                  strokeDasharray={pct === 0 ? "0" : "4,4"}
                />
                <text 
                  x={pad - 12} 
                  y={y(max * pct)} 
                  textAnchor="end" 
                  dominantBaseline="middle" 
                  className="fill-gray-500 text-xs font-medium"
                >
                  {Math.round(max * pct)}
                </text>
              </g>
            ))}
            
            {/* Area fills */}
            {series.length > 0 && (
              <>
                <path 
                  d={`${pathFor('donation')} L ${x(series.length - 1)} ${h - pad} L ${pad} ${h - pad} Z`}
                  fill="url(#donationGrad)"
                  opacity="0.5"
                />
                <path 
                  d={`${pathFor('sponsor')} L ${x(series.length - 1)} ${h - pad} L ${pad} ${h - pad} Z`}
                  fill="url(#sponsorGrad)"
                  opacity="0.5"
                />
              </>
            )}
            
            {/* Lines with glow */}
            <path 
              d={pathFor('donation')} 
              fill="none" 
              stroke={colors.donation.base} 
              strokeWidth={3} 
              strokeLinecap="round" 
              strokeLinejoin="round"
              filter="url(#glow)"
            />
            <path 
              d={pathFor('sponsor')} 
              fill="none" 
              stroke={colors.sponsor.base} 
              strokeWidth={3} 
              strokeLinecap="round" 
              strokeLinejoin="round"
              filter="url(#glow)"
            />
            
            {/* Points with hover effect */}
            {series.map((b, i) => (
              <g key={i}>
                {/* Donation point */}
                <circle 
                  cx={x(i)} 
                  cy={y(b.donation)} 
                  r={5} 
                  fill="white" 
                  stroke={colors.donation.base}
                  strokeWidth={3}
                  className="hover:r-8 transition-all cursor-pointer"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
                >
                  <title>{`${b.label}: ${b.donation} donations`}</title>
                </circle>
                
                {/* Sponsor point */}
                <circle 
                  cx={x(i)} 
                  cy={y(b.sponsor)} 
                  r={5} 
                  fill="white" 
                  stroke={colors.sponsor.base}
                  strokeWidth={3}
                  className="hover:r-8 transition-all cursor-pointer"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
                >
                  <title>{`${b.label}: ${b.sponsor} sponsors`}</title>
                </circle>
              </g>
            ))}
            
            {/* X-axis labels */}
            {showLabels && series.map((b, i) => (
              i % Math.ceil(series.length / 10) === 0 && (
                <text 
                  key={i}
                  x={x(i)} 
                  y={h - pad + 20} 
                  textAnchor="middle" 
                  className="fill-gray-600 text-xs font-medium"
                >
                  {b.label}
                </text>
              )
            ))}
          </svg>
        </div>
        
        {/* Legend with stats */}
        <div className="flex flex-wrap gap-6 mt-6 justify-center">
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl shadow-sm hover:shadow-md transition-all" 
               style={{ backgroundColor: colors.donation.lighter }}>
            <div className="w-4 h-4 rounded-full shadow-md" style={{background: colors.donation.hover}}></div>
            <span className="font-semibold text-gray-700">Donations</span>
            <span className="font-bold text-lg" style={{ color: colors.donation.hover }}>
              {metric === 'amount' ? `Rs. ${amounts.donation.toLocaleString()}` : counts.donation}
            </span>
          </div>
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl shadow-sm hover:shadow-md transition-all" 
               style={{ backgroundColor: colors.sponsor.lighter }}>
            <div className="w-4 h-4 rounded-full shadow-md" style={{background: colors.sponsor.hover}}></div>
            <span className="font-semibold text-gray-700">Sponsors</span>
            <span className="font-bold text-lg" style={{ color: colors.sponsor.hover }}>
              {metric === 'amount' ? `Rs. ${amounts.sponsor.toLocaleString()}` : counts.sponsor}
            </span>
          </div>
          <div className="flex items-center gap-3 bg-blue-50 px-5 py-3 rounded-xl shadow-sm hover:shadow-md transition-all">
            <span className="text-xl">📅</span>
            <span className="font-semibold text-gray-700">Days Tracked</span>
            <span className="font-bold text-blue-700 text-lg">{series.length}</span>
          </div>
        </div>
      </div>
    );
  };

  const PieChart = () => {
    const size = 220;
    const r = 80;
    const c = Math.PI * 2 * r;
    const dPct = pie.donationPct;
    const sPct = pie.sponsorPct;
    const dLen = (dPct / 100) * c;
    const sLen = (sPct / 100) * c;
    
    return (
      <div className="h-full flex flex-col">
        <h3 className="text-lg font-semibold mb-6 text-gray-800 flex items-center gap-2">
          🥧 Distribution
        </h3>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative">
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-full blur-2xl opacity-30" style={{
              background: `conic-gradient(from 90deg, ${colors.donation.light} ${dPct}%, ${colors.sponsor.light} ${dPct}%)`
            }}></div>
            
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="filter drop-shadow-xl relative z-10"> 
              {/* Background circle with gradient */}
              <defs>
                <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f9fafb" />
                  <stop offset="100%" stopColor="#f3f4f6" />
                </linearGradient>
              </defs>
              <circle cx={size/2} cy={size/2} r={r} stroke="url(#bgGradient)" strokeWidth={24} fill="white" />
              
              {/* Donation arc with animation */}
              <circle 
                cx={size/2} 
                cy={size/2} 
                r={r} 
                stroke={colors.donation.base} 
                strokeWidth={24} 
                fill="none"
                strokeDasharray={`${dLen} ${c}`} 
                strokeDashoffset={c * 0.25}
                strokeLinecap="round"
                className="transition-all duration-700 hover:stroke-width-28"
                style={{ filter: 'drop-shadow(0 0 8px rgba(102, 56, 230, 0.4))' }}
              />
              
              {/* Sponsor arc with animation */}
              <circle 
                cx={size/2} 
                cy={size/2} 
                r={r} 
                stroke={colors.sponsor.base} 
                strokeWidth={24} 
                fill="none"
                strokeDasharray={`${sLen} ${c}`} 
                strokeDashoffset={c * 0.25 - dLen}
                strokeLinecap="round"
                className="transition-all duration-700 hover:stroke-width-28"
                style={{ filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.4))' }}
              />
              
              {/* Center text with better styling */}
              <text 
                x="50%" 
                y="42%" 
                dominantBaseline="middle" 
                textAnchor="middle" 
                className="fill-gray-800 font-bold" 
                fontSize="20"
              >
                {metric === 'amount' ? 'Total Amount' : 'Total Count'}
              </text>
              <text 
                x="50%" 
                y="60%" 
                dominantBaseline="middle" 
                textAnchor="middle" 
                className="fill-gray-500 font-medium" 
                fontSize="18"
              >
                {metric === 'amount' 
                  ? `Rs. ${(amounts.donation + amounts.sponsor).toLocaleString()}`
                  : counts.donation + counts.sponsor}
              </text>
            </svg>
          </div>
          
          <div className="flex flex-col gap-3 mt-8 w-full max-w-xs">
            <div className="flex items-center justify-between p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group" 
                 style={{background: `linear-gradient(135deg, ${colors.donation.lighter}, white)`}}>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full shadow-md group-hover:scale-110 transition-transform" 
                     style={{background: colors.donation.hover}}></div>
                <span className="font-semibold text-gray-700">Donations</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold" style={{ color: colors.donation.hover }}>
                  {metric === 'amount' ? `Rs. ${amounts.donation.toLocaleString()}` : counts.donation}
                </span>
                <span className="font-bold px-2 py-1 rounded-lg text-sm" 
                      style={{ color: colors.donation.hover, backgroundColor: colors.donation.lighter }}>
                  {dPct}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group" 
                 style={{background: `linear-gradient(135deg, ${colors.sponsor.lighter}, white)`}}>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full shadow-md group-hover:scale-110 transition-transform" 
                     style={{background: colors.sponsor.hover}}></div>
                <span className="font-semibold text-gray-700">Sponsors</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold" style={{ color: colors.sponsor.hover }}>
                  {metric === 'amount' ? `Rs. ${amounts.sponsor.toLocaleString()}` : counts.sponsor}
                </span>
                <span className="font-bold px-2 py-1 rounded-lg text-sm" 
                      style={{ color: colors.sponsor.hover, backgroundColor: colors.sponsor.lighter }}>
                  {sPct}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      <Nav collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'} overflow-y-auto`}>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
          {/* Header */}
          <div className="bg-white shadow-lg border-b border-purple-100 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    📈 Analytics Dashboard
                  </h1>
                  <p className="text-gray-600 mt-1">Donations & Sponsors Insights</p>
                </div>
                <button 
                  onClick={load}
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Refreshing...
                    </>
                  ) : (
                    <>
                      🔄 Refresh Data
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6 flex items-start gap-3">
                <span className="text-red-500 text-xl">⚠️</span>
                <div>
                  <h4 className="font-semibold text-red-800">Error Loading Data</h4>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Date Range Selector + Metric Toggle */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">📅 Date Range</h2>
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-600">Preset Range</label>
                  <select 
                    value={preset} 
                    onChange={e => setPreset(e.target.value)} 
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="day">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last Month</option>
                    <option value="year">Last Year</option>
                    <option value="range">Custom Range</option>
                  </select>
                </div>
                
                {preset === 'range' && (
                  <>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-600">From Date</label>
                      <input 
                        type="date" 
                        value={from} 
                        onChange={e => setFrom(e.target.value)} 
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-600">To Date</label>
                      <input 
                        type="date" 
                        value={to} 
                        onChange={e => setTo(e.target.value)} 
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}
                
                <div className="flex items-center gap-3 lg:ml-auto">
                  <div className="flex bg-gray-100 rounded-lg overflow-hidden border">
                    <button
                      className={`px-4 py-2 text-sm font-medium ${metric === 'count' ? 'bg-white text-purple-700' : 'text-gray-600 hover:text-purple-700'}`}
                      onClick={() => setMetric('count')}
                    >
                      Count
                    </button>
                    <button
                      className={`px-4 py-2 text-sm font-medium ${metric === 'amount' ? 'bg-white text-purple-700' : 'text-gray-600 hover:text-purple-700'}`}
                      onClick={() => setMetric('amount')}
                    >
                      Amount
                    </button>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium text-purple-700">
                      {fmtDate(start)} → {fmtDate(end)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Bar Chart - Full Height */}
              <div className="lg:col-span-1">
                <ChartContainer loading={loading}>
                  <BarChart />
                </ChartContainer>
              </div>
              
              {/* Pie Chart */}
              <div className="lg:col-span-1">
                <ChartContainer loading={loading}>
                  <PieChart />
                </ChartContainer>
              </div>
            </div>

            {/* Full Width Line Chart */}
            <ChartContainer loading={loading}>
              <LineChart />
            </ChartContainer>

            {/* Summary Stats */}
            {!loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="text-sm text-gray-600 mb-1">Total</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {metric === 'amount' 
                      ? `Rs. ${(amounts.donation + amounts.sponsor).toLocaleString()}`
                      : (counts.donation + counts.sponsor)}
                  </div>
                </div>
                <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: colors.donation.lighter }}>
                  <div className="text-sm mb-1" style={{ color: colors.donation.hover }}>Donations</div>
                  <div className="text-3xl font-bold" style={{ color: colors.donation.hover }}>
                    {metric === 'amount' ? `Rs. ${amounts.donation.toLocaleString()}` : counts.donation}
                  </div>
                </div>
                <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: colors.sponsor.lighter }}>
                  <div className="text-sm mb-1" style={{ color: colors.sponsor.hover }}>Sponsors</div>
                  <div className="text-3xl font-bold" style={{ color: colors.sponsor.hover }}>
                    {metric === 'amount' ? `Rs. ${amounts.sponsor.toLocaleString()}` : counts.sponsor}
                  </div>
                </div>
                <div className="bg-blue-50 rounded-xl shadow-lg p-6">
                  <div className="text-sm text-blue-600 mb-1">Date Range</div>
                  <div className="text-lg font-bold text-blue-700">{series.length} days</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}