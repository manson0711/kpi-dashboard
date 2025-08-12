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
  black: "#000000" 
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

// Demo data generators (simplified versions)
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
  let views = 0, watchTime = 0, avgView = 0;
  const daily = dates.map((date) => {
    const v = Math.round(300 + rnd() * 1200);
    const wt = Math.round(v * (rnd() * 1.8 + 2.2));
    const av = Math.round((wt / v) * 60);
    views += v; watchTime += wt; avgView += av;
    return { date, views: v, watchTime: wt };
  });
  avgView = avgView / daily.length;
  return { views, watchTime, averageViewDuration: avgView, daily };
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
    return { date, sessions: ses, conversions: conv };
  });
  const bounceRate = 0.46;
  return { sessions, users, conversions, revenue, bounceRate, daily };
}

// Modern UI Components
function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
      {children}
    </div>
  );
}

function Button({ children, onClick, disabled, variant = "primary", className = "" }) {
  const baseClass = "px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 hover:scale-105 active:scale-95";
  const variants = {
    primary: "bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 shadow-lg disabled:opacity-50",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200"
  };
  
  return (
    <button 
      className={`${baseClass} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
    >
      {children}
    </button>
  );
}

function KPI({ icon: Icon, label, value, hint, trend }) {
  return (
    <Card className="p-6 hover:scale-105 transition-transform duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
            {label}
          </div>
          <div 
            className="text-3xl font-bold mb-2" 
            style={{ 
              fontFamily: "'Segoe UI', system-ui, sans-serif",
              color: COLORS.secondary 
            }}
          >
            {value}
          </div>
          {hint && (
            <div 
              className="text-sm font-medium" 
              style={{ 
                color: trend === 'positive' ? COLORS.primary : COLORS.secondary,
                fontFamily: "'Segoe UI', system-ui, sans-serif" 
              }}
            >
              {hint}
            </div>
          )}
        </div>
        <div 
          className="p-4 rounded-2xl" 
          style={{ backgroundColor: `${COLORS.primary}15` }}
        >
          <Icon className="h-8 w-8" style={{ color: COLORS.primary }} />
        </div>
      </div>
    </Card>
  );
}

function Section({ title, icon: Icon, description, children, badge }) {
  return (
    <Card className="overflow-hidden">
      <div 
        className="px-6 py-4 border-b border-gray-100"
        style={{ backgroundColor: `${COLORS.light}50` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="p-3 rounded-xl"
              style={{ backgroundColor: `${COLORS.primary}15` }}
            >
              <Icon className="h-6 w-6" style={{ color: COLORS.primary }} />
            </div>
            <div>
              <h2 
                className="text-xl font-bold" 
                style={{ 
                  fontFamily: "'Segoe UI', system-ui, sans-serif",
                  color: COLORS.secondary 
                }}
              >
                {title}
              </h2>
              {description && (
                <p 
                  className="text-sm mt-1" 
                  style={{ 
                    color: COLORS.secondary + '80',
                    fontFamily: "'Segoe UI', system-ui, sans-serif" 
                  }}
                >
                  {description}
                </p>
              )}
            </div>
          </div>
          {badge && (
            <span 
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ 
                backgroundColor: COLORS.light,
                color: COLORS.secondary,
                fontFamily: "'Segoe UI', system-ui, sans-serif" 
              }}
            >
              {badge}
            </span>
          )}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </Card>
  );
}

export default function App() {
  const today = toISODate(new Date());
  const [fromISO, setFromISO] = useState(toISODate(daysBack(27)));
  const [toISO, setToISO] = useState(today);
  const [loading, setLoading] = useState(false);
  
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
    return `${days} Tage`;
  }, [fromISO, toISO]);

  return (
    <div 
      className="min-h-screen p-6"
      style={{ 
        backgroundColor: COLORS.light + '30',
        fontFamily: "'Segoe UI', system-ui, sans-serif" 
      }}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="p-4 rounded-2xl"
              style={{ backgroundColor: `${COLORS.primary}15` }}
            >
              <Rocket className="h-8 w-8" style={{ color: COLORS.primary }} />
            </motion.div>
            <div>
              <h1 
                className="text-4xl font-bold mb-2" 
                style={{ 
                  fontFamily: "'Segoe UI', system-ui, sans-serif",
                  color: COLORS.secondary 
                }}
              >
                Marketing Dashboard
              </h1>
              <p 
                className="text-lg" 
                style={{ 
                  color: COLORS.secondary + '80',
                  fontFamily: "'Segoe UI', system-ui, sans-serif" 
                }}
              >
                LinkedIn Ads & Posts • YouTube Stats • Website KPIs
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <input 
                type="date" 
                value={fromISO} 
                onChange={(e) => setFromISO(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
              />
              <span className="text-sm font-medium" style={{ color: COLORS.secondary }}>bis</span>
              <input 
                type="date" 
                value={toISO} 
                onChange={(e) => setToISO(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
              />
            </div>
            <Button onClick={loadAll} disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Daten laden"}
            </Button>
          </div>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPI 
            icon={Eye} 
            label={`LinkedIn Impressions (${rangeLabel})`} 
            value={li ? fmt0.format(li.impressions) : "–"} 
            hint={li ? `${fmt.format((li.ctr*100))}% CTR` : undefined}
            trend="positive"
          />
          <KPI 
            icon={MousePointerClick} 
            label={`LinkedIn Klicks (${rangeLabel})`} 
            value={li ? fmt0.format(li.clicks) : "–"} 
            hint={li ? `${fmtMoney.format(li.cpc || 0)} CPC` : undefined}
            trend="positive"
          />
          <KPI 
            icon={PlayCircle} 
            label={`YouTube Views (${rangeLabel})`} 
            value={yt ? fmt0.format(yt.views) : "–"} 
            hint={yt ? `${formatDuration(yt.averageViewDuration)} Avg View` : undefined}
            trend="positive"
          />
          <KPI 
            icon={Users} 
            label={`Website Sessions (${rangeLabel})`} 
            value={web ? fmt0.format(web.sessions) : "–"} 
            hint={web ? `${fmt.format(web.bounceRate*100)}% Bounce` : undefined}
            trend="neutral"
          />
        </div>

        {/* LinkedIn Section */}
        <Section
          title="LinkedIn Performance"
          icon={Linkedin}
          description="Ads performance and organic reach"
          badge={rangeLabel}
        >
          {!li ? (
            <div className="flex items-center gap-3" style={{ color: COLORS.secondary + '80' }}>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>Loading data...</span>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="space-y-4">
                <KPI icon={DollarSign} label="Spend" value={fmtMoney.format(li.spend)} trend="neutral" />
                <KPI icon={TrendingUp} label="Leads" value={fmt0.format(li.leads)} trend="positive" />
              </div>
              <div className="lg:col-span-2">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={li.posts} margin={{ left: 10, right: 10, top: 20, bottom: 20 }}>
                      <defs>
                        <linearGradient id="impressions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.light} />
                      <XAxis 
                        dataKey="date" 
                        style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: '12px' }}
                      />
                      <YAxis 
                        style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: '12px' }}
                      />
                      <RechartsTooltip 
                        contentStyle={{ 
                          fontFamily: "'Segoe UI', system-ui, sans-serif",
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
                        strokeWidth={3}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="reactions" 
                        stroke={COLORS.secondary} 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </Section>

        {/* YouTube Section */}
        <Section
          title="YouTube Analytics"
          icon={Youtube}
          description="Channel performance and engagement"
          badge={rangeLabel}
        >
          {!yt ? (
            <div className="flex items-center gap-3" style={{ color: COLORS.secondary + '80' }}>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>Loading data...</span>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="space-y-4">
                <KPI icon={Eye} label="Views" value={fmt0.format(yt.views)} trend="positive" />
                <KPI icon={Clock3} label="Watch Time (min)" value={fmt0.format(yt.watchTime)} trend="positive" />
              </div>
              <div className="lg:col-span-2">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={yt.daily} margin={{ left: 10, right: 10, top: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.light} />
                      <XAxis 
                        dataKey="date" 
                        style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: '12px' }}
                      />
                      <YAxis 
                        style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: '12px' }}
                      />
                      <RechartsTooltip 
                        contentStyle={{ 
                          fontFamily: "'Segoe UI', system-ui, sans-serif",
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
            </div>
          )}
        </Section>

        {/* Website Section */}
        <Section
          title="Website Analytics"
          icon={Globe}
          description="Traffic, conversions and user behavior"
          badge={rangeLabel}
        >
          {!web ? (
            <div className="flex items-center gap-3" style={{ color: COLORS.secondary + '80' }}>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>Loading data...</span>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="space-y-4">
                <KPI icon={Users} label="Sessions" value={fmt0.format(web.sessions)} trend="positive" />
                <KPI icon={Share2} label="Conversions" value={fmt0.format(web.conversions)} trend="positive" />
              </div>
              <div className="lg:col-span-2">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={web.daily} margin={{ left: 10, right: 10, top: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.light} />
                      <XAxis 
                        dataKey="date" 
                        style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: '12px' }}
                      />
                      <YAxis 
                        style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: '12px' }}
                      />
                      <RechartsTooltip 
                        contentStyle={{ 
                          fontFamily: "'Segoe UI', system-ui, sans-serif",
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
                      />
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
            </div>
          )}
        </Section>

        {/* Footer */}
        <div 
          className="text-center py-4" 
          style={{ 
            color: COLORS.secondary + '60',
            fontFamily: "'Segoe UI', system-ui, sans-serif",
            fontSize: '14px'
          }}
        >
          Demo mode active: Data is synthetic. Replace with real API calls for live data.
        </div>
      </div>
    </div>
  );
}
