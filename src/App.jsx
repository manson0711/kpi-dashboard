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
  PieChart,
  Pie,
  Cell,
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
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",
  success: "#10b981",
  warning: "#f59e0b",
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
  const cpl = leads ? spend / leads : 0;
  return { spend, impressions, clicks, leads, ctr, cpc, cpl, posts };
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
  const engagement = 0.045;
  return { views, watchTime, subscribers, engagement, averageViewDuration: avgView, daily };
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

// UI Components
function KPICard({ label, value, change, changeType, subtitle, icon: Icon }) {
  const changeColor = changeType === 'positive' ? COLORS.success : 
                      changeType === 'negative' ? COLORS.primary : COLORS.gray500;
  const ChangeIcon = changeType === 'positive' ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium text-gray-600" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
          {label}
        </div>
        {Icon && <Icon className="h-5 w-5 text-gray-400" />}
      </div>
      <div className="space-y-2">
        <div className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
          {value}
        </div>
        {change && (
          <div className="flex items-center gap-1">
            <ChangeIcon className="h-4 w-4" style={{ color: changeColor }} />
            <span className="text-sm font-medium" style={{ color: changeColor }}>
              {change}
            </span>
          </div>
        )}
        {subtitle && (
          <div className="text-sm text-gray-500" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ children, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
        isActive 
          ? 'text-white shadow-sm' 
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
      }`}
      style={{ 
        backgroundColor: isActive ? COLORS.primary : 'transparent',
        fontFamily: "'Segoe UI', system-ui, sans-serif" 
      }}
    >
      {children}
    </button>
  );
}

function ChartCard({ title, children, className = "" }) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        {title}
      </h3>
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

  const renderLinkedInContent = () => (
    <div className="space-y-6">
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          label="Impressions"
          value={li ? fmt0.format(li.impressions) : "–"}
          change={li ? `${fmt.format((li.ctr*100))}% CTR` : undefined}
          changeType="positive"
          icon={Eye}
        />
        <KPICard 
          label="Clicks"
          value={li ? fmt0.format(li.clicks) : "–"}
          change={li ? `${fmtMoney.format(li.cpc || 0)} CPC` : undefined}
          changeType="neutral"
          icon={MousePointerClick}
        />
        <KPICard 
          label="Spend"
          value={li ? fmtMoney.format(li.spend) : "–"}
          change={li ? `${fmtMoney.format(li.cpl || 0)} CPL` : undefined}
          changeType="neutral"
          icon={DollarSign}
        />
        <KPICard 
          label="Leads"
          value={li ? fmt0.format(li.leads) : "–"}
          change="12.5%"
          changeType="positive"
          icon={TrendingUp}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Impressions Over Time">
          {li && (
            <div className="h-64">
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
          )}
        </ChartCard>

        <ChartCard title="Engagement Metrics">
          {li && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={li.posts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <RechartsTooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="reactions" 
                    stroke={COLORS.primary} 
                    strokeWidth={2}
                    name="Reactions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );

  const renderYouTubeContent = () => (
    <div className="space-y-6">
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          label="Views"
          value={yt ? fmt0.format(yt.views) : "–"}
          change="8.2%"
          changeType="positive"
          icon={Eye}
        />
        <KPICard 
          label="Watch Time"
          value={yt ? `${fmt0.format(yt.watchTime)}m` : "–"}
          change="15.1%"
          changeType="positive"
          icon={Clock3}
        />
        <KPICard 
          label="Subscribers"
          value={yt ? fmt0.format(yt.subscribers) : "–"}
          change="3.4%"
          changeType="positive"
          icon={Users}
        />
        <KPICard 
          label="Avg View Duration"
          value={yt ? formatDuration(yt.averageViewDuration) : "–"}
          change="2.1%"
          changeType="positive"
          icon={PlayCircle}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Views Over Time">
          {yt && (
            <div className="h-64">
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
          )}
        </ChartCard>

        <ChartCard title="Watch Time Distribution">
          {yt && (
            <div className="h-64">
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
          )}
        </ChartCard>
      </div>
    </div>
  );

  const renderWebsiteContent = () => (
    <div className="space-y-6">
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          label="Sessions"
          value={web ? fmt0.format(web.sessions) : "–"}
          change="5.7%"
          changeType="positive"
          icon={Users}
        />
        <KPICard 
          label="Users"
          value={web ? fmt0.format(web.users) : "–"}
          change="4.2%"
          changeType="positive"
          icon={Eye}
        />
        <KPICard 
          label="Conversions"
          value={web ? fmt0.format(web.conversions) : "–"}
          change="18.3%"
          changeType="positive"
          icon={TrendingUp}
        />
        <KPICard 
          label="Revenue"
          value={web ? fmtMoney.format(web.revenue) : "–"}
          change="22.1%"
          changeType="positive"
          icon={DollarSign}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Sessions vs Conversions">
          {web && (
            <div className="h-64">
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
                    strokeWidth={2}
                    name="Sessions"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="conversions" 
                    stroke={COLORS.primary} 
                    strokeWidth={2}
                    name="Conversions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Revenue Over Time">
          {web && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={web.daily}>
                  <defs>
                    <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <RechartsTooltip />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={COLORS.success} 
                    fill="url(#revenue)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: COLORS.gray50,
        fontFamily: "'Segoe UI', system-ui, sans-serif" 
      }}
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                className="p-3 rounded-xl"
                style={{ backgroundColor: `${COLORS.primary}15` }}
              >
                <Rocket className="h-8 w-8" style={{ color: COLORS.primary }} />
              </motion.div>
              <div>
                <h1 
                  className="text-3xl font-bold" 
                  style={{ 
                    fontFamily: "'Segoe UI', system-ui, sans-serif",
                    color: COLORS.secondary 
                  }}
                >
                  Marketing Dashboard
                </h1>
                <p 
                  className="text-gray-500 mt-1" 
                  style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
                >
                  Track performance across LinkedIn, YouTube, and your website
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <input 
                  type="date" 
                  value={fromISO} 
                  onChange={(e) => setFromISO(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:border-transparent"
                  style={{ 
                    fontFamily: "'Segoe UI', system-ui, sans-serif",
                    focusRingColor: COLORS.primary 
                  }}
                />
                <span className="text-sm text-gray-500">to</span>
                <input 
                  type="date" 
                  value={toISO} 
                  onChange={(e) => setToISO(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:border-transparent"
                  style={{ 
                    fontFamily: "'Segoe UI', system-ui, sans-serif",
                    focusRingColor: COLORS.primary 
                  }}
                />
              </div>
              <button
                onClick={loadAll} 
                disabled={loading}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
                style={{ 
                  backgroundColor: COLORS.primary,
                  fontFamily: "'Segoe UI', system-ui, sans-serif" 
                }}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh Data"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-1">
            <TabButton 
              isActive={activeTab === 'linkedin'} 
              onClick={() => setActiveTab('linkedin')}
            >
              <Linkedin className="h-4 w-4 mr-2" />
              LinkedIn
            </TabButton>
            <TabButton 
              isActive={activeTab === 'youtube'} 
              onClick={() => setActiveTab('youtube')}
            >
              <Youtube className="h-4 w-4 mr-2" />
              YouTube
            </TabButton>
            <TabButton 
              isActive={activeTab === 'website'} 
              onClick={() => setActiveTab('website')}
            >
              <Globe className="h-4 w-4 mr-2" />
              Website
            </TabButton>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3" style={{ color: COLORS.gray500 }}>
              <Loader2 className="h-6 w-6 animate-spin" />
              <span style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>Loading data...</span>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'linkedin' && renderLinkedInContent()}
            {activeTab === 'youtube' && renderYouTubeContent()}
            {activeTab === 'website' && renderWebsiteContent()}
          </>
        )}
      </div>
    </div>
  );
}
