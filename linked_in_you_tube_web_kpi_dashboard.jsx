import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
  XAxis,
  YAxis,
  Area,
  AreaChart,
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
} from "lucide-react";

/**
 * One-Stop Marketing Dashboard (LinkedIn + YouTube + Website KPIs)
 * ----------------------------------------------------------------
 * • Single-file React component you can drop into a Next.js/Vite app.
 * • Uses Tailwind + shadcn/ui + Recharts + Framer Motion.
 * • Includes demo mode with realistic mock data.
 * • Shows how to wire up real APIs; replace the fetch* functions below.
 *
 * ⚠️ Production tip: Do NOT call 3rd‑party APIs directly from the browser with raw tokens.
 *     Create a small serverless function / API route that holds your credentials and proxies
 *     the requests. This file shows where to plug those calls in.
 */

// -----------------------------
// Small utilities
// -----------------------------
const fmt = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });
const fmt0 = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
const fmtMoney = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });

// Color palette requested by user
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

// deterministic pseudo-random for demo data
function seeded(seed) {
  let t = seed % 2147483647;
  return () => (t = (t * 48271) % 2147483647) / 2147483647;
}

// -----------------------------
// Demo data generators
// -----------------------------
function genLinkedInMock(fromISO, toISO) {
  const dates = rangeDays(fromISO, toISO);
  const rnd = seeded(42);
  let impressions = 0, clicks = 0, spend = 0, leads = 0;
  const posts = dates.map((date) => {
    const imp = Math.round(800 + rnd() * 1800);
    const rea = Math.round(20 + rnd() * 120);
    const com = Math.round(rnd() * 18);
    const sha = Math.round(rnd() * 15);
    impressions += imp;
    clicks += Math.round(imp * (0.012 + rnd() * 0.01));
    spend += 15 + rnd() * 60;
    leads += Math.round(rnd() * 4);
    return { date, impressions: imp, reactions: rea, comments: com, shares: sha };
  });
  const ctr = clicks / impressions;
  const cpc = spend / clicks;
  const cpl = leads ? spend / leads : 0;
  const topAds = [
    { name: "C-Level ABM – Carousel", impressions: 32000, clicks: 540 },
    { name: "Demo Signup – Lead Gen Form", impressions: 28000, clicks: 610 },
    { name: "Thought Leadership – Video", impressions: 19000, clicks: 210 },
  ];
  // Generate mock post list (titles + performance in selected range)
  const postTitles = [
    "Case Study: 30% lower CAC",
    "Hiring: Performance Marketer",
    "Webinar: GA4 for B2B",
    "Product Update: Smart UTM",
    "Behind the Scenes: Ad Testing",
    "Guide: LinkedIn Ads Budget",
    "Customer Story: ACME",
    "Thought Leadership: B2B 2025",
    "How‑to: Dashboard in 10min",
    "Event Recap: SaaStock"
  ];
  const postItems = postTitles.map((title) => {
    const published = dates[Math.floor(rnd() * dates.length)];
    const imp = Math.round(4000 + rnd() * 18000);
    const clicksP = Math.round(imp * (0.012 + rnd() * 0.015));
    const reactions = Math.round(25 + rnd() * 250);
    const comments = Math.round(rnd() * 45);
    const shares = Math.round(rnd() * 30);
    const engagement = reactions + comments + shares;
    const engagementRate = engagement / imp;
    const ctrP = clicksP / imp;
    return { title, published, impressions: imp, clicks: clicksP, reactions, comments, shares, engagement, engagementRate, ctr: ctrP };
  }).sort((a,b)=>b.impressions - a.impressions);

  // Generate mock campaigns with KPIs
  const campaigns = [
    { name: "ABM Enterprise Q3", spend: 12500, impressions: 320000, clicks: 5200, leads: 180 },
    { name: "Demo Signups EMEA", spend: 8600, impressions: 210000, clicks: 4100, leads: 240 },
    { name: "Retargeting All Visitors", spend: 4300, impressions: 150000, clicks: 3800, leads: 95 },
    { name: "Brand Video Awareness", spend: 5200, impressions: 480000, clicks: 2600, leads: 40 },
  ].map((c)=>({ ...c, ctr: c.clicks / c.impressions, cpc: c.spend / Math.max(1, c.clicks), cpl: c.spend / Math.max(1, c.leads) }));
  return { spend, impressions, clicks, leads, ctr, cpc, cpl, posts, topAds, postItems, campaigns };
}

function genYouTubeMock(fromISO, toISO) {
  const dates = rangeDays(fromISO, toISO);
  const rnd = seeded(7);
  let views = 0, watchTime = 0, subsGained = 0, subsLost = 0, avgView = 0;
  const daily = dates.map((date) => {
    const v = Math.round(300 + rnd() * 1200);
    const wt = Math.round(v * (rnd() * 1.8 + 2.2)); // minutes
    const av = Math.round((wt / v) * 60); // seconds
    const sg = Math.round(rnd() * 15);
    const sl = Math.round(rnd() * 5);
    views += v; watchTime += wt; subsGained += sg; subsLost += sl; avgView += av;
    return { date, views: v, watchTime: wt, avgViewSeconds: av, subs: sg - sl };
  });
  avgView = avgView / daily.length;
  const topVideos = [
    { title: "LinkedIn Ads Masterclass (2025)", views: 18432 },
    { title: "Growth Dashboard in 10 Minutes", views: 13110 },
    { title: "GA4 for B2B Marketers", views: 9921 },
  ];
  return { views, watchTime, subsGained, subsLost, averageViewDuration: avgView, daily, topVideos };
}

function genWebMock(fromISO, toISO) {
  const dates = rangeDays(fromISO, toISO);
  const rnd = seeded(1337);
  let sessions = 0, users = 0, pageviews = 0, conversions = 0, revenue = 0, duration = 0;
  const daily = dates.map((date) => {
    const ses = Math.round(400 + rnd() * 1600);
    const usr = Math.round(ses * (0.75 + rnd() * 0.2));
    const pv = Math.round(ses * (1.7 + rnd() * 1.5));
    const conv = Math.round(ses * (0.015 + rnd() * 0.02));
    const rev = Math.round(conv * (50 + rnd() * 200));
    const dur = Math.round((120 + rnd() * 90));
    sessions += ses; users += usr; pageviews += pv; conversions += conv; revenue += rev; duration += dur;
    return { date, sessions: ses, users: usr, pageviews: pv, conversions: conv, revenue: rev, avgSessionSec: dur };
  });
  const bounceRate = 0.46; // fixed for demo
  const topSources = [
    { source: "google / organic", sessions: Math.round(sessions * 0.44) },
    { source: "linkedin / paid", sessions: Math.round(sessions * 0.18) },
    { source: "direct / none", sessions: Math.round(sessions * 0.17) },
    { source: "youtube / referral", sessions: Math.round(sessions * 0.11) },
    { source: "newsletter / email", sessions: Math.round(sessions * 0.10) },
  ];
  return {
    sessions, users, pageviews, conversions, revenue, bounceRate, avgSessionDuration: Math.round(duration / daily.length), daily, topSources,
  };
}

// -----------------------------
// API placeholders (replace with your backend calls)
// -----------------------------
async function fetchLinkedInReal({ token, accountId, fromISO, toISO }) {
  // Example shape. Replace with your serverless function call, e.g. 
  // const r = await fetch("/api/linkedin/insights?account=...&from=...&to=...", { headers: { Authorization: `Bearer ${token}` }});
  // return await r.json();
  return genLinkedInMock(fromISO, toISO); // demo fallback
}

async function fetchYouTubeReal({ apiKey, channelId, fromISO, toISO }) {
  // Hit your /api/youtube endpoint that merges YouTube Analytics + Data API.
  return genYouTubeMock(fromISO, toISO);
}

async function fetchWebReal({ provider, credential, propertyId, fromISO, toISO }) {
  // provider: "ga4" | "matomo" | "plausible" etc.
  return genWebMock(fromISO, toISO);
}

// -----------------------------
// Tiny UI atoms
// -----------------------------
function KPI({ icon: Icon, label, value, hint, positive=true }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="text-2xl font-semibold mt-1">{value}</div>
            {hint && (
              <div className="text-xs mt-1" style={{ color: positive ? COLORS.primary : COLORS.black }}>{hint}</div>
            )}
          </div>
          <div className="p-2 rounded-2xl bg-muted">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Section({ title, icon: Icon, description, children, right }) {
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </div>
          </div>
          {right}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function LoadingBlock({ text = "Lade Daten…" }) {
  return (
    <div className="flex items-center gap-3 text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{text}</span>
    </div>
  );
}

// -----------------------------
// Main Component
// -----------------------------
export default function MarketingOneStopDashboard() {
  const today = toISODate(new Date());
  const [fromISO, setFromISO] = useState(toISODate(daysBack(27)));
  const [toISO, setToISO] = useState(today);

  const [demoMode, setDemoMode] = useState(true);
  const [loading, setLoading] = useState(false);

  // Auth/config (kept in state for demo; move to server in prod)
  const [liToken, setLiToken] = useState("");
  const [liAccount, setLiAccount] = useState("");
  const [ytKey, setYtKey] = useState("");
  const [ytChannel, setYtChannel] = useState("");
  const [webProvider, setWebProvider] = useState("ga4");
  const [webCred, setWebCred] = useState("");
  const [webProperty, setWebProperty] = useState("");

  // Data
  const [li, setLi] = useState(null);
  const [yt, setYt] = useState(null);
  const [web, setWeb] = useState(null);

  const canLoad = demoMode || ((liToken && liAccount && ytKey && ytChannel && webCred && webProperty));

  async function loadAll() {
    setLoading(true);
    try {
      const [liRes, ytRes, webRes] = await Promise.all([
        demoMode ? genLinkedInMock(fromISO, toISO) : fetchLinkedInReal({ token: liToken, accountId: liAccount, fromISO, toISO }),
        demoMode ? genYouTubeMock(fromISO, toISO) : fetchYouTubeReal({ apiKey: ytKey, channelId: ytChannel, fromISO, toISO }),
        demoMode ? genWebMock(fromISO, toISO) : fetchWebReal({ provider: webProvider, credential: webCred, propertyId: webProperty, fromISO, toISO }),
      ]);
      setLi(liRes); setYt(ytRes); setWeb(webRes);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // auto-load on mount in demo mode
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rangeLabel = useMemo(() => {
    const days = rangeDays(fromISO, toISO).length;
    return `${days} Tage`;
  }, [fromISO, toISO]);

  return (
    <TooltipProvider>
      <style>{`:root{--primary:#E50846;--primary-foreground:white;--muted:#eaeaea;--muted-foreground:#161A40}`}</style>
      <div className="max-w-[1200px] mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-3 rounded-2xl bg-primary/10">
              <Rocket className="h-6 w-6 text-primary" />
            </motion.div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">One-Stop Marketing Dashboard</h1>
              <p className="text-sm text-muted-foreground">LinkedIn Ads & Posts • YouTube Stats • Website KPIs</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="demo">Demo</Label>
              <Switch id="demo" checked={demoMode} onCheckedChange={setDemoMode} />
            </div>
            <Button onClick={loadAll} disabled={!canLoad || loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Daten laden"}
            </Button>
          </div>
        </div>

        {/* Config */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Konfiguration & Zeitraum</CardTitle>
            <CardDescription>Nutze Demo‑Modus oder trage deine Zugangsdaten ein (empfohlen via Backend‑Proxy).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Von</Label>
                <Input type="date" value={fromISO} max={toISO} onChange={(e) => setFromISO(e.target.value)} />
              </div>
              <div>
                <Label>Bis</Label>
                <Input type="date" value={toISO} min={fromISO} onChange={(e) => setToISO(e.target.value)} />
              </div>
              <div className="flex items-end gap-2">
                <Button type="button" variant="secondary" onClick={() => { setFromISO(toISO); }}>Heute</Button>
                <Button type="button" variant="secondary" onClick={() => { setFromISO(toISODate(daysBack(6))); setToISO(today); }}>7T</Button>
                <Button type="button" variant="secondary" onClick={() => { setFromISO(toISODate(daysBack(27))); setToISO(today); }}>28T</Button>
                <Button type="button" variant="secondary" onClick={() => { setFromISO(toISODate(daysBack(89))); setToISO(today); }}>90T</Button>
              </div>
            </div>

            <Separator />

            <Tabs defaultValue="linkedin" className="w-full">
              <TabsList className="grid md:grid-cols-3 w-full">
                <TabsTrigger value="linkedin"><div className="flex items-center gap-2"><Linkedin className="h-4 w-4" />LinkedIn</div></TabsTrigger>
                <TabsTrigger value="youtube"><div className="flex items-center gap-2"><Youtube className="h-4 w-4" />YouTube</div></TabsTrigger>
                <TabsTrigger value="website"><div className="flex items-center gap-2"><Globe className="h-4 w-4" />Website</div></TabsTrigger>
              </TabsList>
              <TabsContent value="linkedin" className="pt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Token</Label>
                    <Input placeholder="Bearer …" value={liToken} onChange={(e) => setLiToken(e.target.value)} />
                  </div>
                  <div>
                    <Label>Account ID</Label>
                    <Input placeholder="urn:li:sponsoredAccount:… oder Numeric ID" value={liAccount} onChange={(e) => setLiAccount(e.target.value)} />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="youtube" className="pt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>API Key</Label>
                    <Input placeholder="AIza…" value={ytKey} onChange={(e) => setYtKey(e.target.value)} />
                  </div>
                  <div>
                    <Label>Channel ID</Label>
                    <Input placeholder="UC…" value={ytChannel} onChange={(e) => setYtChannel(e.target.value)} />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="website" className="pt-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Provider</Label>
                    <Input value={webProvider} onChange={(e) => setWebProvider(e.target.value)} placeholder="ga4 | matomo | plausible" />
                  </div>
                  <div>
                    <Label>Credential</Label>
                    <Input placeholder="z. B. Service‑Account Token" value={webCred} onChange={(e) => setWebCred(e.target.value)} />
                  </div>
                  <div>
                    <Label>Property / Site ID</Label>
                    <Input placeholder="GA4 Property ID oder Site ID" value={webProperty} onChange={(e) => setWebProperty(e.target.value)} />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Summary strip */}
        <div className="grid md:grid-cols-4 gap-4">
          <KPI icon={Eye} label={`LinkedIn Impressions (${rangeLabel})`} value={li ? fmt0.format(li.impressions) : "–"} hint={li ? `${fmt.format((li.ctr*100))}% CTR` : undefined} />
          <KPI icon={MousePointerClick} label={`LinkedIn Klicks (${rangeLabel})`} value={li ? fmt0.format(li.clicks) : "–"} hint={li ? `${fmtMoney.format(li.cpc || 0)} CPC` : undefined} />
          <KPI icon={PlayCircle} label={`YouTube Views (${rangeLabel})`} value={yt ? fmt0.format(yt.views) : "–"} hint={yt ? `${formatDuration(yt.averageViewDuration)} Avg View` : undefined} />
          <KPI icon={Users} label={`Website Sessions (${rangeLabel})`} value={web ? fmt0.format(web.sessions) : "–"} hint={web ? `${fmt.format(web.bounceRate*100)}% Bounce` : undefined} positive={false} />
        </div>

        {/* Sections */}
        <div className="grid gap-6">
          {/* LinkedIn */}
          <Section
            title="LinkedIn Ads & Posts"
            icon={Linkedin}
            description="Werbeleistung & organische Posts im Blick."
            right={<Badge variant="secondary">{rangeLabel}</Badge>}
          >
            {!li ? (
              <LoadingBlock />
            ) : (
              <div className="grid lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1 space-y-3">
                  <KPI icon={DollarSign} label="Spend" value={fmtMoney.format(li.spend)} hint={`CPL ${li.cpl ? fmtMoney.format(li.cpl) : "–"}`} />
                  <KPI icon={TrendingUp} label="Leads" value={fmt0.format(li.leads)} hint={`${fmt.format(li.ctr*100)}% CTR`} />
                </div>
                <div className="lg:col-span-2">
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={li.posts} margin={{ left: 8, right: 8, top: 10 }}>
                        <defs>
                          <linearGradient id="imp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopOpacity={0.4} stopColor={COLORS.primary} />
                            <stop offset="95%" stopOpacity={0} stopColor={COLORS.primary} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.light} />
                        <XAxis dataKey="date" hide />
                        <YAxis tickFormatter={(v)=>fmt0.format(v)} width={60} />
                        <RechartsTooltip formatter={(v)=>fmt0.format(v)} labelFormatter={(l)=>`Datum ${l}`} />
                        <Area type="monotone" dataKey="impressions" name="Impressions" strokeWidth={2} stroke={COLORS.primary} fillOpacity={1} fill="url(#imp)" />
                        <Line type="monotone" dataKey="reactions" name="Reactions" strokeWidth={2} stroke={COLORS.dark} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Zeitverlauf: Impressions & Reactions</div>
                </div>

                <div className="lg:col-span-3 grid md:grid-cols-2 gap-4">
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-base">Top Ads (Clicks)</CardTitle></CardHeader>
                    <CardContent className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={li.topAds} margin={{ left: 8, right: 8, top: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.light} />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Bar dataKey="clicks" name="Clicks" fill={COLORS.primary} />
                          <Bar dataKey="impressions" name="Impressions" fill={COLORS.dark} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-base">Post‑Engagement</CardTitle></CardHeader>
                    <CardContent className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={li.posts} margin={{ left: 8, right: 8, top: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.light} />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Line dataKey="reactions" name="Reactions" strokeWidth={2} />
                          <Line dataKey="comments" name="Comments" strokeWidth={2} />
                          <Line dataKey="shares" name="Shares" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                  <div className="lg:col-span-3 grid md:grid-cols-2 gap-4">
                    <Card className="shadow-sm">
                      <CardHeader className="pb-2"><CardTitle className="text-base">Top Posts im Zeitraum</CardTitle></CardHeader>
                      <CardContent className="overflow-auto">
                        {li.postItems && li.postItems.length > 0 ? (
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-muted-foreground">
                                <th className="py-2 pr-2">Post</th>
                                <th className="py-2 pr-2">Veröffentlicht</th>
                                <th className="py-2 pr-2">Impr.</th>
                                <th className="py-2 pr-2">Klicks</th>
                                <th className="py-2 pr-2">Engagement</th>
                                <th className="py-2 pr-2">ER%</th>
                                <th className="py-2 pr-2">CTR%</th>
                              </tr>
                            </thead>
                            <tbody>
                              {li.postItems.slice(0, 8).map((p, i) => (
                                <tr key={i} className="border-t">
                                  <td className="py-2 pr-2">{p.title}</td>
                                  <td className="py-2 pr-2">{p.published}</td>
                                  <td className="py-2 pr-2">{fmt0.format(p.impressions)}</td>
                                  <td className="py-2 pr-2">{fmt0.format(p.clicks)}</td>
                                  <td className="py-2 pr-2">{fmt0.format(p.engagement)}</td>
                                  <td className="py-2 pr-2">{fmt.format(p.engagementRate*100)}</td>
                                  <td className="py-2 pr-2">{fmt.format(p.ctr*100)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="text-sm text-muted-foreground">Keine Posts im Zeitraum.</div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                      <CardHeader className="pb-2"><CardTitle className="text-base">Kampagnen KPIs</CardTitle></CardHeader>
                      <CardContent className="overflow-auto">
                        {li.campaigns && li.campaigns.length > 0 ? (
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-muted-foreground">
                                <th className="py-2 pr-2">Kampagne</th>
                                <th className="py-2 pr-2">Spend</th>
                                <th className="py-2 pr-2">Impr.</th>
                                <th className="py-2 pr-2">Klicks</th>
                                <th className="py-2 pr-2">CTR%</th>
                                <th className="py-2 pr-2">CPC</th>
                                <th className="py-2 pr-2">Leads</th>
                                <th className="py-2 pr-2">CPL</th>
                              </tr>
                            </thead>
                            <tbody>
                              {li.campaigns.map((c, i) => (
                                <tr key={i} className="border-t">
                                  <td className="py-2 pr-2">{c.name}</td>
                                  <td className="py-2 pr-2">{fmtMoney.format(c.spend)}</td>
                                  <td className="py-2 pr-2">{fmt0.format(c.impressions)}</td>
                                  <td className="py-2 pr-2">{fmt0.format(c.clicks)}</td>
                                  <td className="py-2 pr-2">{fmt.format(c.ctr*100)}</td>
                                  <td className="py-2 pr-2">{fmtMoney.format(c.cpc)}</td>
                                  <td className="py-2 pr-2">{fmt0.format(c.leads)}</td>
                                  <td className="py-2 pr-2">{fmtMoney.format(c.cpl)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="text-sm text-muted-foreground">Keine Kampagnen-Daten.</div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
              </div>
            )}
          </Section>

          {/* YouTube */}
          <Section
            title="YouTube Kanal"
            icon={Youtube}
            description="Views, Watchtime, Abos & Top‑Videos"
            right={<Badge variant="secondary">{rangeLabel}</Badge>}
          >
            {!yt ? (
              <LoadingBlock />
            ) : (
              <div className="grid lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1 space-y-3">
                  <KPI icon={Eye} label="Views" value={fmt0.format(yt.views)} hint={`Ø View ${formatDuration(yt.averageViewDuration)}`} />
                  <KPI icon={Clock3} label="Watchtime (Minuten)" value={fmt0.format(yt.watchTime)} hint={`Netto‑Abos ${yt.subsGained - yt.subsLost >= 0 ? "+" : ""}${yt.subsGained - yt.subsLost}`} positive={yt.subsGained - yt.subsLost >= 0} />
                </div>
                <div className="lg:col-span-2">
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={yt.daily} margin={{ left: 8, right: 8, top: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.light} />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <RechartsTooltip />
                        <Area type="monotone" dataKey="views" name="Views" strokeWidth={2} stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.15} />
                        <Line type="monotone" dataKey="avgViewSeconds" name="Ø View (s)" strokeWidth={2} stroke={COLORS.dark} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="lg:col-span-3">
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={yt.topVideos} margin={{ left: 8, right: 8, top: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.light} />
                        <XAxis dataKey="title" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="views" name="Views" fill={COLORS.primary} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Top‑Videos nach Views</div>
                </div>
              </div>
            )}
          </Section>

          {/* Website */}
          <Section
            title="Website KPIs"
            icon={Globe}
            description="Sessions, Conversions, Umsatz, Quellen"
            right={<Badge variant="secondary">{rangeLabel}</Badge>}
          >
            {!web ? (
              <LoadingBlock />
            ) : (
              <div className="grid lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1 space-y-3">
                  <KPI icon={Users} label="Sessions" value={fmt0.format(web.sessions)} hint={`Users ${fmt0.format(web.users)}`} />
                  <KPI icon={Share2} label="Conversions" value={fmt0.format(web.conversions)} hint={`Umsatz ${fmtMoney.format(web.revenue)}`} />
                </div>
                <div className="lg:col-span-2">
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={web.daily} margin={{ left: 8, right: 8, top: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.light} />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Line dataKey="sessions" name="Sessions" strokeWidth={2} stroke={COLORS.dark} />
                        <Line dataKey="conversions" name="Conversions" strokeWidth={2} stroke={COLORS.primary} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="lg:col-span-3 grid md:grid-cols-2 gap-4">
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-base">Traffic‑Quellen</CardTitle></CardHeader>
                    <CardContent className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={web.topSources} margin={{ left: 8, right: 8, top: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.light} />
                          <XAxis dataKey="source" tick={{ fontSize: 12 }} />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="sessions" name="Sessions" fill={COLORS.primary} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-base">Engagement</CardTitle></CardHeader>
                    <CardContent className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[{ k: "Bounce Rate", v: Math.round(web.bounceRate * 1000) / 10 }, { k: "Ø Session (s)", v: web.avgSessionDuration }]}>
                          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.light} />
                          <XAxis dataKey="k" />
                          <YAxis />
                          <RechartsTooltip />
                          <Area dataKey="v" name="Wert" type="monotone" strokeWidth={2} stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.15} />
                        </AreaChart>
                      </ResponsiveContainer>
                      <div className="text-xs text-muted-foreground mt-1">Bounce Rate (%) und Ø Sitzungsdauer (Sekunden)</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </Section>
        </div>

        {/* Footer */}
        <div className="text-xs text-muted-foreground text-center pt-2">
          Demo‑Modus aktiv: Zahlen sind synthetisch. Ersetze fetch* Funktionen, um Live‑Daten einzubinden.
        </div>
      </div>
    </TooltipProvider>
  );
}
