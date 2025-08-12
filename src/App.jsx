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

const COLORS = { primary: "#E50846", light: "#eaeaea", dark: "#161A40", white: "white", black: "black" };

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

// Simple UI Components
function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function Button({ children, onClick, disabled, variant = "primary" }) {
  const baseClass = "px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300"
  };
  
  return (
    <button 
      className={`${baseClass} ${variants[variant]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

function KPI({ icon: Icon, label, value, hint }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600">{label}</div>
          <div className="text-2xl font-semibold mt-1">{value}</div>
          {hint && <div className="text-xs mt-1 text-red-600">{hint}</div>}
        </div>
        <div className="p-2 rounded-xl bg-gray-100">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

function Section({ title, icon: Icon, description, children }) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-red-100">
          <Icon className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
      </div>
      {children}
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
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="p-3 rounded-2xl bg-red-100"
          >
            <Rocket className="h-6 w-6 text-red-600" />
          </motion.div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Marketing Dashboard</h1>
            <p className="text-sm text-gray-600">LinkedIn Ads & Posts • YouTube Stats • Website KPIs</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={fromISO} 
              onChange={(e) => setFromISO(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
            <span className="text-sm">bis</span>
            <input 
              type="date" 
              value={toISO} 
              onChange={(e) => setToISO(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <Button onClick={loadAll} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Daten laden"}
          </Button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid md:grid-cols-4 gap-4">
        <KPI 
          icon={Eye} 
          label={`LinkedIn Impressions (${rangeLabel})`} 
          value={li ? fmt0.format(li.impressions) : "–"} 
          hint={li ? `${fmt.format((li.ctr*100))}% CTR` : undefined} 
        />
        <KPI 
          icon={MousePointerClick} 
          label={`LinkedIn Klicks (${rangeLabel})`} 
          value={li ? fmt0.format(li.clicks) : "–"} 
          hint={li ? `${fmtMoney.format(li.cpc || 0)} CPC` : undefined} 
        />
        <KPI 
          icon={PlayCircle} 
          label={`YouTube Views (${rangeLabel})`} 
          value={yt ? fmt0.format(yt.views) : "–"} 
          hint={yt ? `${formatDuration(yt.averageViewDuration)} Avg View` : undefined} 
        />
        <KPI 
          icon={Users} 
          label={`Website Sessions (${rangeLabel})`} 
          value={web ? fmt0.format(web.sessions) : "–"} 
          hint={web ? `${fmt.format(web.bounceRate*100)}% Bounce` : undefined} 
        />
      </div>

      {/* LinkedIn Section */}
      <Section
        title="LinkedIn Performance"
        icon={Linkedin}
        description="Ads performance and organic reach"
      >
        {!li ? (
          <div className="flex items-center gap-3 text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading data...</span>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="space-y-3">
              <KPI icon={DollarSign} label="Spend" value={fmtMoney.format(li.spend)} />
              <KPI icon={TrendingUp} label="Leads" value={fmt0.format(li.leads)} />
            </div>
            <div className="lg:col-span-2">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={li.posts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Area 
                      type="monotone" 
                      dataKey="impressions" 
                      stroke={COLORS.primary} 
                      fill={COLORS.primary} 
                      fillOpacity={0.3} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="reactions" 
                      stroke={COLORS.dark} 
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
      >
        {!yt ? (
          <div className="flex items-center gap-3 text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading data...</span>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="space-y-3">
              <KPI icon={Eye} label="Views" value={fmt0.format(yt.views)} />
              <KPI icon={Clock3} label="Watch Time (min)" value={fmt0.format(yt.watchTime)} />
            </div>
            <div className="lg:col-span-2">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yt.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Line 
                      type="monotone" 
                      dataKey="views" 
                      stroke={COLORS.primary} 
                      strokeWidth={2}
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
      >
        {!web ? (
          <div className="flex items-center gap-3 text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading data...</span>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="space-y-3">
              <KPI icon={Users} label="Sessions" value={fmt0.format(web.sessions)} />
              <KPI icon={Share2} label="Conversions" value={fmt0.format(web.conversions)} />
            </div>
            <div className="lg:col-span-2">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={web.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="sessions" 
                      stroke={COLORS.dark} 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="conversions" 
                      stroke={COLORS.primary} 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* Footer */}
      <div className="text-xs text-gray-500 text-center pt-2">
        Demo mode active: Data is synthetic. Replace with real API calls for live data.
      </div>
    </div>
  );
}
