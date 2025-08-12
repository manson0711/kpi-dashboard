import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts";
import {
  Rocket,
  TrendingUp,
  Clock3,
  PlayCircle,
  Share2,
  DollarSign,
  MousePointerClick,
  Users,
  Eye,
  Youtube,
  Linkedin,
  Globe,
  Loader2,
  ArrowUpRight,
} from "lucide-react";

// Utility functions
const fmt = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });
const fmt0 = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
const fmtMoney = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });

const COLORS = { 
  primary: "#E50846", 
  secondary: "#161A40", 
  light: "#eaeaea", 
  white: "#ffffff", 
  gray: "#6b7280",
  lightGray: "#f9fafb",
};

function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return "–";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}m ${s}s`;
}

function daysBack(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function toISODate(d) {
  const x = new Date(d);
  return x.toISOString().slice(0, 10);
}

function rangeDays(startISO, endISO) {
  const res = [];
  const start = new Date(startISO);
  const end = new Date(endISO);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    res.push(toISODate(d));
  }
  return res;
}

function seeded(seed) {
  let t = seed % 2147483647;
  return () => (t = (t * 48271) % 2147483647) / 2147483647;
}

// Demo data generators
function genLinkedInMock(fromISO, toISO) {
  const dates = rangeDays(fromISO, toISO);
  const rnd = seeded(42);
  let impressions = 0, clicks = 0, spend = 0, leads = 0;
  const posts = dates.map((date) => {
    const imp = Math.round(800 + rnd() * 1800);
    const rea = Math.round(20 + rnd() * 120);
    impressions += imp;
    clicks += Math.round(imp * (0.012 + rnd() * 0.01));
    spend += 15 + rnd() * 60;
    leads += Math.round(rnd() * 4);
    return { date, impressions: imp, reactions: rea };
  });
  const ctr = clicks / impressions;
  const cpc = spend / clicks;
  return { spend, impressions, clicks, leads, ctr, cpc, posts };
}

function genYouTubeMock(fromISO, toISO) {
  const dates = rangeDays(fromISO, toISO);
  const rnd = seeded(7);
  let views = 0, watchTime = 0, avgView = 0, subscribers = 0;
  const daily = dates.map((date) => {
    const v = Math.round(300 + rnd() * 1200);
    const wt = Math.round(v * (rnd() * 1.8 + 2.2));
    const av = Math.round((wt / v) * 60);
    const subs = Math.round(rnd() * 25);
    views += v; watchTime += wt; avgView += av; subscribers += subs;
    return { date, views: v, watchTime: wt, subscribers: subs };
  });
  avgView = avgView / daily.length;
  return { views, watchTime, subscribers, averageViewDuration: avgView, daily };
}

function genWebMock(fromISO, toISO) {
  const dates = rangeDays(fromISO, toISO);
  const rnd = seeded(1337);
  let sessions = 0, users = 0, conversions = 0, revenue = 0;
  const daily = dates.map((date) => {
    const ses = Math.round(400 + rnd() * 1600);
    const usr = Math.round(ses * (0.75 + rnd() * 0.2));
    const conv = Math.round(ses * (0.015 + rnd() * 0.02));
    const rev = Math.round(conv * (50 + rnd() * 200));
    sessions += ses; users += usr; conversions += conv; revenue += rev;
    return { date, sessions: ses, conversions: conv, revenue: rev };
  });
  const bounceRate = 0.46;
  const avgSessionDuration = 145;
  return { sessions, users, conversions, revenue, bounceRate, avgSessionDuration, daily };
}

// KPI Card Component
function KPICard({ label, value, change, icon: Icon }) {
  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <div className="kpi-label">{label}</div>
        {Icon && <Icon className="kpi-icon" />}
      </div>
      <div className="kpi-value">{value}</div>
      {change && (
        <div className="kpi-change">
          <ArrowUpRight className="change-icon" />
          <span>{change}</span>
        </div>
      )}
    </div>
  );
}

// Chart Card Component
function ChartCard({ title, children }) {
  return (
    <div className="chart-card">
      <h3 className="chart-title">{title}</h3>
      {children}
    </div>
  );
}

export default function App() {
  const today = toISODate(new Date());
  const [fromISO, setFromISO] = useState(toISODate(daysBack(27)));
  const [toISO, setToISO] = useState(today);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('linkedin');
  
  const [li, setLi] = useState(null);
  const [yt, setYt] = useState(null);
  const [web, setWeb] = useState(null);

  async function loadAll() {
    setLoading(true);
    try {
      const [liRes, ytRes, webRes] = await Promise.all([
        genLinkedInMock(fromISO, toISO),
        genYouTubeMock(fromISO, toISO),
        genWebMock(fromISO, toISO),
      ]);
      setLi(liRes); setYt(ytRes); setWeb(webRes);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const rangeLabel = useMemo(() => {
    const days = rangeDays(fromISO, toISO).length;
    return `${days} days`;
  }, [fromISO, toISO]);

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: 'Segoe UI', system-ui, sans-serif;
          background-color: ${COLORS.lightGray};
        }
        
        .dashboard {
          min-height: 100vh;
          background-color: ${COLORS.lightGray};
        }
        
        .header {
          background-color: ${COLORS.white};
          border-bottom: 1px solid #e5e7eb;
          padding: 24px;
        }
        
        .header-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 24px;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .header-icon {
          padding: 12px;
          border-radius: 12px;
          background-color: ${COLORS.primary}15;
        }
        
        .header-title {
          font-size: 32px;
          font-weight: bold;
          color: ${COLORS.secondary};
          margin: 0 0 8px 0;
        }
        
        .header-subtitle {
          color: ${COLORS.gray};
          margin: 0;
        }
        
        .header-controls {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        
        .date-input {
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 14px;
          outline: none;
        }
        
        .refresh-btn {
          background-color: ${COLORS.primary};
          color: ${COLORS.white};
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .refresh-btn:disabled {
          opacity: 0.6;
        }
        
        .tabs {
          background-color: ${COLORS.white};
          border-bottom: 1px solid #e5e7eb;
          padding: 0 24px;
        }
        
        .tabs-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          gap: 4px;
        }
        
        .tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 500;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          background-color: transparent;
          color: ${COLORS.gray};
          transition: all 0.2s ease;
        }
        
        .tab.active {
          background-color: ${COLORS.primary};
          color: ${COLORS.white};
        }
        
        .content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 24px;
        }
        
        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 0;
          gap: 12px;
          color: ${COLORS.gray};
        }
        
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }
        
        .kpi-card {
          background-color: ${COLORS.white};
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: all 0.2s ease;
        }
        
        .kpi-card:hover {
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .kpi-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        
        .kpi-label {
          font-size: 14px;
          font-weight: 500;
          color: ${COLORS.gray};
        }
        
        .kpi-icon {
          width: 20px;
          height: 20px;
          color: ${COLORS.gray};
        }
        
        .kpi-value {
          font-size: 36px;
          font-weight: bold;
          color: ${COLORS.secondary};
          margin-bottom: 8px;
        }
        
        .kpi-change {
          display: flex;
          align-items: center;
          gap: 4px;
          color: ${COLORS.primary};
          font-size: 14px;
          font-weight: 500;
        }
        
        .change-icon {
          width: 16px;
          height: 16px;
        }
        
        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 24px;
        }
        
        .chart-card {
          background-color: ${COLORS.white};
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .chart-title {
          font-size: 18px;
          font-weight: 600;
          color: ${COLORS.secondary};
          margin: 0 0 24px 0;
        }
        
        .chart-container {
          height: 300px;
        }
        
        @media (max-width: 768px) {
          .header-container {
            flex-direction: column;
            align-items: stretch;
          }
          
          .header-controls {
            justify-content: center;
          }
          
          .kpi-grid {
            grid-template-columns: 1fr;
          }
          
          .charts-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      
      <div className="dashboard">
        {/* Header */}
        <div className="header">
          <div className="header-container">
            <div className="header-left">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                className="header-icon"
              >
                <Rocket style={{ width: 32, height: 32, color: COLORS.primary }} />
              </motion.div>
              <div>
                <h1 className="header-title">Marketing Dashboard</h1>
                <p className="header-subtitle">Track performance across LinkedIn, YouTube, and your website</p>
              </div>
            </div>

            <div className="header-controls">
              <input 
                type="date" 
                value={fromISO} 
                onChange={(e) => setFromISO(e.target.value)}
                className="date-input"
              />
              <span style={{ color: COLORS.gray, fontSize: 14 }}>to</span>
              <input 
                type="date" 
                value={toISO} 
                onChange={(e) => setToISO(e.target.value)}
                className="date-input"
              />
              <button onClick={loadAll} disabled={loading} className="refresh-btn">
                {loading ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : 'Refresh Data'}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <div className="tabs-container">
            <button 
              className={`tab ${activeTab === 'linkedin' ? 'active' : ''}`}
              onClick={() => setActiveTab('linkedin')}
            >
              <Linkedin style={{ width: 16, height: 16 }} />
              LinkedIn
            </button>
            <button 
              className={`tab ${activeTab === 'youtube' ? 'active' : ''}`}
              onClick={() => setActiveTab('youtube')}
            >
              <Youtube style={{ width: 16, height: 16 }} />
              YouTube
            </button>
            <button 
              className={`tab ${activeTab === 'website' ? 'active' : ''}`}
              onClick={() => setActiveTab('website')}
            >
              <Globe style={{ width: 16, height: 16 }} />
              Website
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="content">
          {loading ? (
            <div className="loading">
              <Loader2 style={{ width: 24, height: 24 }} className="animate-spin" />
              <span>Loading data...</span>
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="kpi-grid">
                {activeTab === 'linkedin' && li && (
                  <>
                    <KPICard 
                      label="Impressions"
                      value={fmt0.format(li.impressions)}
                      change={`${fmt.format(li.ctr * 100)}% CTR`}
                      icon={Eye}
                    />
                    <KPICard 
                      label="Clicks"
                      value={fmt0.format(li.clicks)}
                      change={fmtMoney.format(li.cpc) + " CPC"}
                      icon={MousePointerClick}
                    />
                    <KPICard 
                      label="Spend"
                      value={fmtMoney.format(li.spend)}
                      change={`CPL: ${fmtMoney.format(li.spend / Math.max(1, li.leads))}`}
                      icon={DollarSign}
                    />
                    <KPICard 
                      label="Leads"
                      value={fmt0.format(li.leads)}
                      change="12.5%"
                      icon={TrendingUp}
                    />
                  </>
                )}

                {activeTab === 'youtube' && yt && (
                  <>
                    <KPICard 
                      label="Views"
                      value={fmt0.format(yt.views)}
                      change="8.2%"
                      icon={Eye}
                    />
                    <KPICard 
                      label="Watch Time"
                      value={`${fmt0.format(yt.watchTime)}m`}
                      change="15.1%"
                      icon={Clock3}
                    />
                    <KPICard 
                      label="Subscribers"
                      value={fmt0.format(yt.subscribers)}
                      change="3.4%"
                      icon={Users}
                    />
                    <KPICard 
                      label="Avg View Duration"
                      value={formatDuration(yt.averageViewDuration)}
                      change="2.1%"
                      icon={PlayCircle}
                    />
                  </>
                )}

                {activeTab === 'website' && web && (
                  <>
                    <KPICard 
                      label="Sessions"
                      value={fmt0.format(web.sessions)}
                      change="5.7%"
                      icon={Users}
                    />
                    <KPICard 
                      label="Users"
                      value={fmt0.format(web.users)}
                      change="4.2%"
                      icon={Eye}
                    />
                    <KPICard 
                      label="Conversions"
                      value={fmt0.format(web.conversions)}
                      change="18.3%"
                      icon={TrendingUp}
                    />
                    <KPICard 
                      label="Revenue"
                      value={fmtMoney.format(web.revenue)}
                      change="22.1%"
                      icon={DollarSign}
                    />
                  </>
                )}
              </div>

              {/* Charts */}
              <div className="charts-grid">
                {activeTab === 'linkedin' && li && (
                  <>
                    <ChartCard title="Impressions Over Time">
                      <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={li.posts}>
                            <defs>
                              <linearGradient id="impressions" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <RechartsTooltip />
                            <Area 
                              type="monotone" 
                              dataKey="impressions" 
                              stroke={COLORS.primary} 
                              fill="url(#impressions)"
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </ChartCard>

                    <ChartCard title="Engagement Metrics">
                      <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={li.posts}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <RechartsTooltip />
                            <Line 
                              type="monotone" 
                              dataKey="reactions" 
                              stroke={COLORS.primary} 
                              strokeWidth={3}
                              name="Reactions"
                              dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </ChartCard>
                  </>
                )}

                {activeTab === 'youtube' && yt && (
                  <>
                    <ChartCard title="Views Over Time">
                      <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={yt.daily}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <RechartsTooltip />
                            <Line 
                              type="monotone" 
                              dataKey="views" 
                              stroke={COLORS.primary} 
                              strokeWidth={3}
                              dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </ChartCard>

                    <ChartCard title="Watch Time Distribution">
                      <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={yt.daily.slice(-7)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <RechartsTooltip />
                            <Bar dataKey="watchTime" fill={COLORS.primary} name="Watch Time (min)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </ChartCard>
                  </>
                )}

                {activeTab === 'website' && web && (
                  <>
                    <ChartCard title="Sessions vs Conversions">
                      <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={web.daily}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <RechartsTooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="sessions" 
                              stroke={COLORS.secondary} 
                              strokeWidth={3}
                              name="Sessions"
                              dot={{ fill: COLORS.secondary, strokeWidth: 2, r: 4 }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="conversions" 
                              stroke={COLORS.primary} 
                              strokeWidth={3}
                              name="Conversions"
                              dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </ChartCard>

                    <ChartCard title="Revenue Over Time">
                      <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={web.daily}>
                            <defs>
                              <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <RechartsTooltip />
                            <Area 
                              type="monotone" 
                              dataKey="revenue" 
                              stroke={COLORS.primary} 
                              fill="url(#revenue)"
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </ChartCard>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
