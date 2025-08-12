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
  ArrowDownRight,
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
  black: "#000000",
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
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: COLORS.lightGray,
      fontFamily: 'Segoe UI, system-ui, sans-serif'
    }}>
      {/* Header */}
      <div style={{ backgroundColor: COLORS.white, borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: `${COLORS.primary}15`
                }}
              >
                <Rocket style={{ width: '32px', height: '32px', color: COLORS.primary }} />
              </motion.div>
              <div>
                <h1 style={{ 
                  fontSize: '32px', 
                  fontWeight: 'bold', 
                  margin: '0 0 8px 0',
                  color: COLORS.secondary,
                  fontFamily: 'Segoe UI, system-ui, sans-serif'
                }}>
                  Marketing Dashboard
                </h1>
                <p style={{ 
                  margin: 0, 
                  color: COLORS.gray,
                  fontFamily: 'Segoe UI, system-ui, sans-serif'
                }}>
                  Track performance across LinkedIn, YouTube, and your website
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <input 
                type="date" 
                value={fromISO} 
                onChange={(e) => setFromISO(e.target.value)}
                style={{
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  fontFamily: 'Segoe UI, system-ui, sans-serif',
                  outline: 'none'
                }}
              />
              <span style={{ color: COLORS.gray, fontSize: '14px' }}>to</span>
              <input 
                type="date" 
                value={toISO} 
                onChange={(e) => setToISO(e.target.value)}
                style={{
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  fontFamily: 'Segoe UI, system-ui, sans-serif',
                  outline: 'none'
                }}
              />
              <button
                onClick={loadAll} 
                disabled={loading}
                style={{
                  backgroundColor: COLORS.primary,
                  color: COLORS.white,
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'Segoe UI, system-ui, sans-serif',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? <Loader2 style={{ width: '16px', height: '16px' }} className="animate-spin" /> : 'Refresh Data'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ backgroundColor: COLORS.white, borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[
              { key: 'linkedin', label: 'LinkedIn', icon: Linkedin },
              { key: 'youtube', label: 'YouTube', icon: Youtube },
              { key: 'website', label: 'Website', icon: Globe }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: activeTab === key ? COLORS.primary : 'transparent',
                  color: activeTab === key ? COLORS.white : COLORS.gray,
                  fontFamily: 'Segoe UI, system-ui, sans-serif',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon style={{ width: '16px', height: '16px' }} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {loading ? (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '48px 0',
            gap: '12px'
          }}>
            <Loader2 style={{ width: '24px', height: '24px', color: COLORS.gray }} className="animate-spin" />
            <span style={{ color: COLORS.gray, fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
              Loading data...
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* KPI Cards Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px'
            }}>
              {activeTab === 'linkedin' && li && (
                <>
                  <div style={{
                    backgroundColor: COLORS.white,
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: COLORS.gray,
                        fontFamily: 'Segoe UI, system-ui, sans-serif'
                      }}>
                        Impressions
                      </div>
                      <Eye style={{ width: '20px', height: '20px', color: COLORS.gray }} />
                    </div>
                    <div style={{ 
                      fontSize: '36px', 
                      fontWeight: 'bold', 
                      color: COLORS.secondary,
                      marginBottom: '8px',
                      fontFamily: 'Segoe UI, system-ui, sans-serif'
                    }}>
                      {fmt0.format(web.users)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ArrowUpRight style={{ width: '16px', height: '16px', color: COLORS.primary }} />
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: COLORS.primary,
                        fontFamily: 'Segoe UI, system-ui, sans-serif'
                      }}>
                        4.2%
                      </span>
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: COLORS.white,
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: COLORS.gray,
                        fontFamily: 'Segoe UI, system-ui, sans-serif'
                      }}>
                        Conversions
                      </div>
                      <TrendingUp style={{ width: '20px', height: '20px', color: COLORS.gray }} />
                    </div>
                    <div style={{ 
                      fontSize: '36px', 
                      fontWeight: 'bold', 
                      color: COLORS.secondary,
                      marginBottom: '8px',
                      fontFamily: 'Segoe UI, system-ui, sans-serif'
                    }}>
                      {fmt0.format(web.conversions)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ArrowUpRight style={{ width: '16px', height: '16px', color: COLORS.primary }} />
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: COLORS.primary,
                        fontFamily: 'Segoe UI, system-ui, sans-serif'
                      }}>
                        18.3%
                      </span>
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: COLORS.white,
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: COLORS.gray,
                        fontFamily: 'Segoe UI, system-ui, sans-serif'
                      }}>
                        Revenue
                      </div>
                      <DollarSign style={{ width: '20px', height: '20px', color: COLORS.gray }} />
                    </div>
                    <div style={{ 
                      fontSize: '36px', 
                      fontWeight: 'bold', 
                      color: COLORS.secondary,
                      marginBottom: '8px',
                      fontFamily: 'Segoe UI, system-ui, sans-serif'
                    }}>
                      {fmtMoney.format(web.revenue)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ArrowUpRight style={{ width: '16px', height: '16px', color: COLORS.primary }} />
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: COLORS.primary,
                        fontFamily: 'Segoe UI, system-ui, sans-serif'
                      }}>
                        22.1%
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Charts Section */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '24px'
            }}>
              {activeTab === 'linkedin' && li && (
                <>
                  <div style={{
                    backgroundColor: COLORS.white,
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <h3 style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: COLORS.secondary,
                      margin: '0 0 24px 0',
                      fontFamily: 'Segoe UI, system-ui, sans-serif'
                    }}>
                      Impressions Over Time
                    </h3>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={li.posts}>
                          <defs>
                            <linearGradient id="impressions" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                              <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 12, fontFamily: 'Segoe UI' }} />
                          <YAxis tick={{ fontSize: 12, fontFamily: 'Segoe UI' }} />
                          <RechartsTooltip 
                            contentStyle={{ 
                              fontFamily: 'Segoe UI, system-ui, sans-serif',
                              border: 'none',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                          />
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
                  </div>

                  <div style={{
                    backgroundColor: COLORS.white,
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <h3 style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: COLORS.secondary,
                      margin: '0 0 24px 0',
                      fontFamily: 'Segoe UI, system-ui, sans-serif'
                    }}>
                      Engagement Metrics
                    </h3>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={li.posts}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 12, fontFamily: 'Segoe UI' }} />
                          <YAxis tick={{ fontSize: 12, fontFamily: 'Segoe UI' }} />
                          <RechartsTooltip 
                            contentStyle={{ 
                              fontFamily: 'Segoe UI, system-ui, sans-serif',
                              border: 'none',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                          />
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
                  </div>
                </>
              )}

              {activeTab === 'youtube' && yt && (
                <>
                  <div style={{
                    backgroundColor: COLORS.white,
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <h3 style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: COLORS.secondary,
                      margin: '0 0 24px 0',
                      fontFamily: 'Segoe UI, system-ui, sans-serif'
                    }}>
                      Views Over Time
                    </h3>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={yt.daily}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 12, fontFamily: 'Segoe UI' }} />
                          <YAxis tick={{ fontSize: 12, fontFamily: 'Segoe UI' }} />
                          <RechartsTooltip 
                            contentStyle={{ 
                              fontFamily: 'Segoe UI, system-ui, sans-serif',
                              border: 'none',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                          />
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
                  </div>

                  <div style={{
                    backgroundColor: COLORS.white,
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <h3 style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: COLORS.secondary,
                      margin: '0 0 24px 0',
                      fontFamily: 'Segoe UI, system-ui, sans-serif'
                    }}>
                      Watch Time Distribution
                    </h3>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={yt.daily.slice(-7)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 12, fontFamily: 'Segoe UI' }} />
                          <YAxis tick={{ fontSize: 12, fontFamily: 'Segoe UI' }} />
                          <RechartsTooltip 
                            contentStyle={{ 
                              fontFamily: 'Segoe UI, system-ui, sans-serif',
                              border: 'none',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                          />
                          <Bar dataKey="watchTime" fill={COLORS.primary} name="Watch Time (min)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'website' && web && (
                <>
                  <div style={{
                    backgroundColor: COLORS.white,
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <h3 style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: COLORS.secondary,
                      margin: '0 0 24px 0',
                      fontFamily: 'Segoe UI, system-ui, sans-serif'
                    }}>
                      Sessions vs Conversions
                    </h3>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={web.daily}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 12, fontFamily: 'Segoe UI' }} />
                          <YAxis tick={{ fontSize: 12, fontFamily: 'Segoe UI' }} />
                          <RechartsTooltip 
                            contentStyle={{ 
                              fontFamily: 'Segoe UI, system-ui, sans-serif',
                              border: 'none',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                          />
                          <Legend wrapperStyle={{ fontFamily: 'Segoe UI, system-ui, sans-serif' }} />
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
                  </div>

                  <div style={{
                    backgroundColor: COLORS.white,
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <h3 style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: COLORS.secondary,
                      margin: '0 0 24px 0',
                      fontFamily: 'Segoe UI, system-ui, sans-serif'
                    }}>
                      Revenue Over Time
                    </h3>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={web.daily}>
                          <defs>
                            <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                              <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 12, fontFamily: 'Segoe UI' }} />
                          <YAxis tick={{ fontSize: 12, fontFamily: 'Segoe UI' }} />
                          <RechartsTooltip 
                            contentStyle={{ 
                              fontFamily: 'Segoe UI, system-ui, sans-serif',
                              border: 'none',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                          />
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
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}'bold', 
                      color: COLORS.secondary,
                      marginBottom: '8px',
                      fontFamily: 'Segoe UI, system-ui, sans-serif'
                    }}>
                      {fmt0.format(li.impressions)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ArrowUpRight style={{ width: '16px', height: '16px', color: COLORS.primary }} />
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: COLORS.primary,
                        fontFamily: 'Segoe UI, system-ui, sans-serif'
                      }}>
                        {fmt.format(li.ctr * 100)}% CTR
                      </span>
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: COLORS.white,
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: COLORS.gray,
                        fontFamily: 'Segoe UI, system-ui, sans-serif'
                      }}>
                        Clicks
                      </div>
                      <MousePointerClick style={{ width: '20px', height: '20px', color: COLORS.gray }} />
                    </div>
                    <div style={{ 
                      fontSize: '36px', 
                      fontWeight: 'bold', 
                      color: COLORS.secondary,
                      marginBottom: '8px',
                      fontFamily: 'Segoe UI, system-ui, sans-serif'
                    }}>
                      {fmt0.format(li.clicks)}
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: COLORS.gray,
                      fontFamily: 'Segoe UI, system-ui, sans-serif'
                    }}>
                      {fmtMoney.format(li.cpc)} CPC
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: COLORS.white,
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: COLORS.gray,
                        fontFamily: 'Segoe UI, system-ui, sans-serif'
                      }}>
                        Spend
                      </div>
                      <DollarSign style={{ width: '20px', height: '20px', color: COLORS.gray }} />
                    </div>
                    <div style={{ 
                      fontSize: '36px', 
                      fontWeight: 'bold', 
                      color: COLORS.secondary,
                      marginBottom: '8px',
                      fontFamily: 'Segoe UI, system-ui, sans-serif'
                    }}>
                      {fmtMoney.format(li.spend)}
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: COLORS.gray,
                      fontFamily: 'Segoe UI, system-ui, sans-serif'
                    }}>
                      CPL: {fmtMoney.format(li.spend / Math.max(1, li.leads))}
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: COLORS.white,
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: COLORS.gray,
                        fontFamily: 'Segoe UI, system-ui, sans-serif'
                      }}>
                        Leads
                      </div>
                      <TrendingUp style={{ width: '20px', height: '20px', color: COLORS.gray }} />
                    </div>
                    <div style={{ 
                      fontSize: '36px', 
                      fontWeight: 'bold', 
                      color: COLORS.secondary,
                      marginBottom: '8px',
                      fontFamily: 'Segoe UI, system-ui, sans-serif'
                    }}>
                      {fmt0.format(li.leads)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ArrowUpRight style={{ width: '16px', height: '16px', color: COLORS.primary }} />
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: COLORS.primary,
                        fontFamily: 'Segoe UI, system-ui, sans-serif'
                      }}>
                        12.5%
                      </span>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'youtube' && yt && (
                <>
                  <div style={{
                    backgroundColor: COLORS.white,
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: COLORS.gray,
                        fontFamily: 'Segoe UI, system-ui, sans-serif'
                      }}>
                        Views
                      </div>
                      <Eye style={{ width: '20px', height: '20px', color: COLORS.gray }} />
                    </div>
                    <div style={{ 
                      fontSize: '36px', 
                      fontWeight: 'bold', 
                      color: COLORS.secondary,
                      marginBottom: '8px',
                      fontFamily: 'Segoe UI, system-ui, sans-serif'
                    }}>
                      {fmt0.format(yt.views)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ArrowUpRight style={{ width: '16px', height: '16px', color: COLORS.primary }} />
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: COLORS.primary,
                        fontFamily: 'Segoe UI, system-ui, sans-serif'
                      }}>
                        8.2%
                      </span>
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: COLORS.white,
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: COLORS.gray,
                        fontFamily: 'Segoe UI, system-ui, sans-serif'
                      }}>
                        Watch Time
                      </div>
                      <Clock3 style={{ width: '20px', height: '20px', color: COLORS.gray }} />
                    </div>
                    <div style={{ 
                      fontSize: '36px', 
                      fontWeight: 'bold', 
                      color: COLORS.secondary,
                      marginBottom: '8px',
                      fontFamily: 'Segoe UI, system-ui, sans-serif'
                    }}>
                      {fmt0.format(yt.watchTime)}m
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ArrowUpRight style={{ width: '16px', height: '16px', color: COLORS.primary }} />
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: COLORS.primary,
                        fontFamily: 'Segoe UI, system-ui, sans-serif'
                      }}>
                        15.1%
                      </span>
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: COLORS.white,
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: COLORS.gray,
                        fontFamily: 'Segoe UI, system-ui, sans-serif'
                      }}>
                        Subscribers
                      </div>
                      <Users style={{ width: '20px', height: '20px', color: COLORS.gray }} />
                    </div>
                    <div style={{ 
                      fontSize: '36px', 
                      fontWeight: 'bold', 
                      color: COLORS.secondary,
                      marginBottom: '8px',
                      fontFamily: 'Segoe UI, system-ui, sans-serif'
                    }}>
                      {fmt0.format(yt.subscribers)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ArrowUpRight style={{ width: '16px', height: '16px', color: COLORS.primary }} />
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: COLORS.primary,
                        fontFamily: 'Segoe UI, system-ui, sans-serif'
                      }}>
                        3.4%
                      </span>
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: COLORS.white,
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: COLORS.gray,
                        fontFamily: 'Segoe UI, system-ui, sans-serif'
                      }}>
                        Avg View Duration
                      </div>
                      <PlayCircle style={{ width: '20px', height: '20px', color: COLORS.gray }} />
                    </div>
                    <div style={{ 
                      fontSize: '36px', 
                      fontWeight: 'bold', 
                      color: COLORS.secondary,
                      marginBottom: '8px',
                      fontFamily: 'Segoe UI, system-ui, sans-serif'
                    }}>
                      {formatDuration(yt.averageViewDuration)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ArrowUpRight style={{ width: '16px', height: '16px', color: COLORS.primary }} />
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: COLORS.primary,
                        fontFamily: 'Segoe UI, system-ui, sans-serif'
                      }}>
                        2.1%
                      </span>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'website' && web && (
                <>
                  <div style={{
                    backgroundColor: COLORS.white,
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: COLORS.gray,
                        fontFamily: 'Segoe UI, system-ui, sans-serif'
                      }}>
                        Sessions
                      </div>
                      <Users style={{ width: '20px', height: '20px', color: COLORS.gray }} />
                    </div>
                    <div style={{ 
                      fontSize: '36px', 
                      fontWeight: 'bold', 
                      color: COLORS.secondary,
                      marginBottom: '8px',
                      fontFamily: 'Segoe UI, system-ui, sans-serif'
                    }}>
                      {fmt0.format(web.sessions)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ArrowUpRight style={{ width: '16px', height: '16px', color: COLORS.primary }} />
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: COLORS.primary,
                        fontFamily: 'Segoe UI, system-ui, sans-serif'
                      }}>
                        5.7%
                      </span>
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: COLORS.white,
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: COLORS.gray,
                        fontFamily: 'Segoe UI, system-ui, sans-serif'
                      }}>
                        Users
                      </div>
                      <Eye style={{ width: '20px', height: '20px', color: COLORS.gray }} />
                    </div>
                    <div style={{ 
                      fontSize: '36px', 
                      fontWeight:
