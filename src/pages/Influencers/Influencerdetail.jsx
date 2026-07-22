import React, { useState } from "react";
import {
  BadgeCheck,
  MessageCircle,
  UserPlus,
  MoreHorizontal,
  MapPin,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  Heart,
  Eye,
  Trophy,
  Music2,
  Camera,
  Video,
  MessageCircleReply,
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  Star,
  Download,
  ThumbsUp,
  MessageSquare,
  Share2,
  MousePointerClick,
  ArrowUpRight,
  Bell,
  RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Link } from "react-router-dom";

/* ---------------------------------------------------------
   Brand tokens
--------------------------------------------------------- */

const BRAND = {
  "--color-primary": "#16115A",
  "--color-secondary": "#2E1C8D",
  "--color-tertiary": "#FEB209",
};
const PURPLE = "#2E1C8D";
const NAVY = "#16115A";
const GOLD = "#FEB209";
const GREEN = "#22C55E";
const RED = "#EF4444";
const SKY = "#0EA5E9";

/* ---------------------------------------------------------
   Mock data
--------------------------------------------------------- */

const PROFILE = {
  name: "Abebe Kebede",
  username: "@abebe.creates",
  category: "Lifestyle & Comedy",
  bio: "Telling everyday Addis stories with a laugh. Partnering with brands that get it.",
  location: "Addis Ababa, Ethiopia",
  joined: "Joined March 2023",
};

const STATS = [
  {
    label: "Followers",
    value: "245K",
    trend: "+3.2%",
    up: true,
    icon: Users,
    data: [4, 6, 5, 8, 7, 9, 11, 10, 13],
  },
  {
    label: "Engagement Rate",
    value: "8.7%",
    trend: "Excellent",
    up: true,
    icon: Heart,
    data: [6, 7, 6, 8, 8, 9, 8, 9, 10],
  },
  {
    label: "Completed Campaigns",
    value: "86",
    trend: "+5 this quarter",
    up: true,
    icon: Trophy,
    data: [2, 3, 3, 4, 5, 4, 6, 7, 7],
  },
  {
    label: "Average Views",
    value: "410K",
    trend: "-1.4%",
    up: false,
    icon: Eye,
    data: [9, 10, 11, 10, 9, 10, 9, 8, 9],
  },
];

const PLATFORMS = [
  { name: "TikTok", icon: Music2, followers: "180K", reach: "520K", views: "410K", likes: "62K" },
  { name: "Instagram", icon: Camera, followers: "52K", reach: "140K", views: "98K", likes: "14K" },
  { name: "YouTube", icon: Video, followers: "9.8K", reach: "61K", views: "48K", likes: "3.1K" },
  { name: "Facebook", icon: MessageCircleReply, followers: "3.2K", reach: "18K", views: "12K", likes: "900" },
];

const GENDER_DATA = [
  { name: "Female", value: 60, color: PURPLE },
  { name: "Male", value: 38, color: SKY },
  { name: "Other", value: 2, color: GOLD },
];

const AGE_DATA = [
  { range: "13–17", value: 6 },
  { range: "18–24", value: 38 },
  { range: "25–34", value: 34 },
  { range: "35–44", value: 15 },
  { range: "45+", value: 7 },
];

const LOCATIONS = [
  { flag: "🇪🇹", country: "Ethiopia", value: 62 },
  { flag: "🇰🇪", country: "Kenya", value: 12 },
  { flag: "🇺🇸", country: "USA", value: 10 },
  { flag: "🇬🇧", country: "UK", value: 8 },
  { flag: "🇨🇦", country: "Canada", value: 8 },
];

const PERFORMANCE_METRICS = {
  Reach: [32, 40, 38, 46, 50, 48, 55, 60, 58, 64, 70, 75],
  Views: [28, 34, 33, 40, 44, 42, 48, 52, 50, 56, 62, 68],
  Engagement: [6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 12, 13],
  Conversions: [1, 1.4, 1.2, 1.8, 2, 1.9, 2.3, 2.6, 2.4, 2.9, 3.2, 3.6],
};
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const EARNINGS_MONTHLY = MONTHS.map((m, i) => ({
  month: m,
  amount: [1200,1450,1600,2100,1900,2400,2650,3000,2800,3400,3600,3850][i],
}));

const CAMPAIGNS_TABLE = [
  { name: "Summer Refresh", brand: "Coca-Cola", status: "Active", budget: "$1,800", deadline: "Jul 28", perf: 82 },
  { name: "Back to Campus", brand: "Samsung", status: "Draft", budget: "$2,400", deadline: "Aug 12", perf: 0 },
  { name: "New Sneaker Drop", brand: "Adidas", status: "Completed", budget: "$3,100", deadline: "Jun 02", perf: 94 },
  { name: "Holiday Teaser", brand: "Spotify", status: "Cancelled", budget: "$900", deadline: "—", perf: 0 },
];

const STATUS_STYLE = {
  Active: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Draft: "bg-slate-100 text-slate-500 border-slate-200",
  Completed: "bg-sky-50 text-sky-600 border-sky-200",
  Cancelled: "bg-rose-50 text-rose-600 border-rose-200",
};

const RECENT_CAMPAIGNS = [
  {
    brand: "Nike", name: "Run Addis 2026", platform: "TikTok", budget: "$2,200", duration: "Jun 1–Jun 21",
    status: "Completed", likes: "48K", comments: "1.2K", shares: "3.4K", views: "620K", ctr: "4.8%", roi: "3.1x",
  },
  {
    brand: "Apple", name: "Shot on iPhone — Addis", platform: "Instagram", budget: "$3,000", duration: "May 10–May 30",
    status: "Completed", likes: "61K", comments: "2.1K", shares: "5.6K", views: "890K", ctr: "5.6%", roi: "4.0x",
  },
  {
    brand: "Samsung", name: "Unfold Your Story", platform: "YouTube", budget: "$1,600", duration: "Jul 3–Jul 17",
    status: "Active", likes: "12K", comments: "410", shares: "980", views: "140K", ctr: "3.1%", roi: "—",
  },
];

const RECENT_EARNINGS = [
  { brand: "Nike", amount: "+$1,200", when: "Yesterday" },
  { brand: "Apple", amount: "+$2,400", when: "2 days ago" },
  { brand: "Samsung", amount: "+$980", when: "Last week" },
];

const TOP_BRANDS = ["Nike", "Apple", "Samsung", "Amazon", "Adidas", "Spotify", "Google", "Meta"];

const REVIEWS = [
  { name: "Selam T.", campaign: "Run Addis 2026", date: "Jun 24, 2026", text: "Abebe delivered ahead of schedule and the content outperformed every benchmark we set." },
  { name: "Marcus O.", campaign: "Shot on iPhone — Addis", date: "Jun 2, 2026", text: "Professional, easy to brief, and the audience engagement was well above our average creator." },
];

const ACTIVITY = [
  { icon: CheckCircle2, text: "Campaign \"Run Addis 2026\" marked completed", when: "2h ago", color: "text-emerald-500" },
  { icon: Wallet, text: "Payment of $1,200 received from Nike", when: "1d ago", color: "text-[var(--color-secondary)]" },
  { icon: Users, text: "Gained 1,240 new followers on TikTok", when: "2d ago", color: "text-sky-500" },
  { icon: Bell, text: "New campaign invitation from Spotify", when: "3d ago", color: "text-[var(--color-tertiary)]" },
  { icon: RefreshCw, text: "Profile details updated", when: "5d ago", color: "text-slate-400" },
];

/* ---------------------------------------------------------
   Small primitives
--------------------------------------------------------- */

function Card({ className = "", children }) {
  return (
    <div className={`rounded-lg border border-slate-200 bg-white/90 p-4 shadow-[0_2px_16px_-6px_rgba(22,17,90,0.08)] backdrop-blur-sm sm:p-6 ${className}`}>
      {children}
    </div>
  );
}

function SectionHeader({ title, subtitle, right }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div>
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

function Sparkline({ data, color }) {
  const points = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={36}>
      <AreaChart data={points} margin={{ top: 2, left: 0, right: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`spark-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#spark-${color.replace("#", "")})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ProgressBar({ value, color = PURPLE, trackClass = "bg-slate-100" }) {
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full ${trackClass}`}>
      <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[status] || "bg-slate-100 text-slate-500 border-slate-200"}`}>
      {status}
    </span>
  );
}

/* ---------------------------------------------------------
   Sections
--------------------------------------------------------- */

function ProfileHeader() {
  return (
    <Card>
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div
            className="flex h-[100px] w-[100px] shrink-0 items-center justify-center rounded-full text-3xl font-semibold text-white sm:h-[120px] sm:w-[120px]"
            style={{ background: `linear-gradient(135deg, ${PURPLE}, ${NAVY})` }}
          >
            AK
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-semibold text-slate-800">{PROFILE.name}</h1>
              <BadgeCheck className="h-5 w-5 text-[var(--color-secondary)]" />
            </div>
            <p className="text-sm text-slate-400">{PROFILE.username} · {PROFILE.category}</p>
            <p className="mt-2 max-w-md text-sm text-slate-600">{PROFILE.bio}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {PROFILE.location}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {PROFILE.joined}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link to={"/influencers/edit/1"} className="flex  cursor-pointer items-center gap-1.5 rounded-lg bg-[var(--color-secondary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary)]">
            <UserPlus className="h-4 w-4" /> Edit Profile
          </Link>
          <button className="flex  cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
            <Star className="h-4 w-4" /> Add Review
          </button>
        </div>
      </div>
    </Card>
  );
}

function StatsRow() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {STATS.map((s) => (
        <Card key={s.label} className="!p-4">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-secondary)]/10">
              <s.icon className="h-4.5 w-4.5 text-[var(--color-secondary)]" />
            </div>
            <span className={`flex items-center gap-0.5 text-xs font-semibold ${s.up ? "text-emerald-500" : "text-rose-500"}`}>
              {s.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {s.trend}
            </span>
          </div>
          <div className="mt-3 text-2xl font-semibold text-slate-800">{s.value}</div>
          <div className="text-xs text-slate-400">{s.label}</div>
          <div className="mt-2">
            <Sparkline data={s.data} color={s.up ? GREEN : RED} />
          </div>
        </Card>
      ))}
    </div>
  );
}

function SocialPlatforms() {
  return (
    <Card>
      <SectionHeader title="Social Platforms" subtitle="Performance across connected accounts" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {PLATFORMS.map((p) => (
          <div key={p.name} className="rounded-2xl border border-slate-100 p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-secondary)]/10">
                <p.icon className="h-4 w-4 text-[var(--color-secondary)]" />
              </div>
              <span className="text-sm font-semibold text-slate-700">{p.name}</span>
            </div>
            <dl className="space-y-1.5 text-xs">
              {[["Followers", p.followers], ["Avg. Reach", p.reach], ["Avg. Views", p.views], ["Avg. Likes", p.likes]].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-slate-400">{k}</dt>
                  <dd className="font-medium text-slate-700">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AudienceAnalytics() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card>
        <SectionHeader title="Audience Gender" />
        <div className="flex items-center gap-4">
          <ResponsiveContainer width={120} height={120}>
            <PieChart>
              <Pie data={GENDER_DATA} dataKey="value" innerRadius={38} outerRadius={56} paddingAngle={3}>
                {GENDER_DATA.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5">
            {GENDER_DATA.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-slate-500">{d.name}</span>
                <span className="font-semibold text-slate-700">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </Card>


      <Card className="">
        <SectionHeader title="Audience Locations" />
        <div className="space-y-2.5">
          {LOCATIONS.map((l) => (
            <div key={l.country}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-slate-500">{l.flag} {l.country}</span>
                <span className="font-semibold text-slate-700">{l.value}%</span>
              </div>
              <ProgressBar value={l.value} color={GOLD} trackClass="bg-[var(--color-tertiary)]/15" />
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">Availability</span>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Available
          </span>
        </div>
        <dl className="space-y-2.5 text-sm">
          <div className="flex justify-between"><dt className="text-slate-400">Price Range</dt><dd className="font-medium text-slate-700">$500–$3,000</dd></div>
          <div className="flex justify-between"><dt className="text-slate-400">Response Time</dt><dd className="font-medium text-slate-700">~2 hours</dd></div>
          <div className="flex justify-between"><dt className="text-slate-400">Languages</dt><dd className="font-medium text-slate-700">English, Amharic</dd></div>
        </dl>
        <div className="mt-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Categories</span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {["Lifestyle", "Beauty", "Travel", "Food", "Technology"].map((c) => (
              <span key={c} className="rounded-full border border-slate-200 px-2.5 py-0.5 text-xs text-slate-500">{c}</span>
            ))}
          </div>
        </div>
    
      </Card>
    </div>
  );
}

function PerformanceOverview() {
  const [metric, setMetric] = useState("Reach");
  const data = MONTHS.map((m, i) => ({ month: m, value: PERFORMANCE_METRICS[metric][i] }));
  return (
    <Card>
      <SectionHeader
        title="Campaign Performance"
        subtitle="Last 12 months"
        right={
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(PERFORMANCE_METRICS).map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  metric === m ? "bg-[var(--color-secondary)] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        }
      />
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="perfFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PURPLE} stopOpacity={0.28} />
              <stop offset="100%" stopColor={PURPLE} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#F1F5F9" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
          <Area type="monotone" dataKey="value" stroke={PURPLE} strokeWidth={2.5} fill="url(#perfFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

function Earnings() {
  const cards = [
    { label: "Total Earnings", value: "$34,850", icon: Wallet },
    { label: "Pending", value: "$2,340", icon: Clock },
    { label: "Withdrawn", value: "$31,400", icon: CheckCircle2 },
    { label: "Average Campaign", value: "$860", icon: Trophy },
  ];
  return (
    <Card>
      <SectionHeader title="Earnings" subtitle="Lifetime performance across all campaigns" />
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-slate-100 p-4">
            <c.icon className="h-4 w-4 text-[var(--color-secondary)]" />
            <div className="mt-2 text-lg font-semibold text-slate-800">{c.value}</div>
            <div className="text-xs text-slate-400">{c.label}</div>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={EARNINGS_MONTHLY} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="earnBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PURPLE} stopOpacity={0.95} />
              <stop offset="100%" stopColor={PURPLE} stopOpacity={0.55} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#F1F5F9" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
          <Bar dataKey="amount" fill="url(#earnBar)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

function ActiveCampaignsTable() {
  return (
    <Card>
      <SectionHeader title="Active Campaigns" />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              <th className="py-2 pr-3">Campaign</th>
              <th className="py-2 pr-3">Brand</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Budget</th>
              <th className="py-2 pr-3">Deadline</th>
              <th className="py-2 pr-3">Performance</th>
              <th className="py-2 pr-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {CAMPAIGNS_TABLE.map((c) => (
              <tr key={c.name} className="border-b border-slate-50 last:border-none">
                <td className="py-3 pr-3 font-medium text-slate-700">{c.name}</td>
                <td className="py-3 pr-3 text-slate-500">{c.brand}</td>
                <td className="py-3 pr-3"><StatusBadge status={c.status} /></td>
                <td className="py-3 pr-3 text-slate-500">{c.budget}</td>
                <td className="py-3 pr-3 text-slate-500">{c.deadline}</td>
                <td className="py-3 pr-3">
                  {c.perf > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="w-16"><ProgressBar value={c.perf} color={PURPLE} /></div>
                      <span className="text-xs font-medium text-slate-500">{c.perf}%</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-300">—</span>
                  )}
                </td>
                <td className="py-3 pr-3 text-right">
                  <button className="text-xs font-semibold text-[var(--color-secondary)] hover:underline">View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function RecentCampaignCards() {
  return (
    <Card>
      <SectionHeader title="Recent Campaigns" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {RECENT_CAMPAIGNS.map((c) => (
          <div key={c.name} className="overflow-hidden rounded-2xl border border-slate-100">
            <div
              className="flex h-24 items-end p-3"
              style={{ background: `linear-gradient(135deg, ${PURPLE}, ${NAVY})` }}
            >
              <span className="rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-slate-700">{c.brand}</span>
            </div>
            <div className="p-4">
              <div className="mb-1 flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-slate-800">{c.name}</h4>
                <StatusBadge status={c.status} />
              </div>
              <p className="mb-3 text-xs text-slate-400">{c.platform} · {c.budget} · {c.duration}</p>
              <div className="grid grid-cols-3 gap-y-1.5 text-xs text-slate-500">
                <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {c.likes}</span>
                <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {c.comments}</span>
                <span className="flex items-center gap-1"><Share2 className="h-3 w-3" /> {c.shares}</span>
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {c.views}</span>
                <span className="flex items-center gap-1"><MousePointerClick className="h-3 w-3" /> {c.ctr}</span>
                <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {c.roi}</span>
              </div>
              <button className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-600 transition hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)]">
                Open Campaign <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function CampaignComparison() {
  return (
    <Card>
      <SectionHeader title="Campaign Success Comparison" subtitle="What separated a flat launch from a breakout one" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4">
          <div className="mb-2 flex items-center gap-2 text-rose-600">
            <XCircle className="h-4 w-4" />
            <span className="text-sm font-semibold">Poor Campaign — "Winter Sale Promo"</span>
          </div>
          <div className="mb-3 grid grid-cols-3 gap-2 text-center">
            <div><div className="text-lg font-semibold text-slate-800">18K</div><div className="text-[11px] text-slate-400">Views</div></div>
            <div><div className="text-lg font-semibold text-slate-800">1.1%</div><div className="text-[11px] text-slate-400">Engagement</div></div>
            <div><div className="text-lg font-semibold text-slate-800">0.4%</div><div className="text-[11px] text-slate-400">CTR</div></div>
          </div>
          <ul className="space-y-1 text-xs text-slate-600">
            <li>• Posted outside peak audience hours</li>
            <li>• Generic script with no clear hook</li>
            <li>• No trackable link or CTA</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
          <div className="mb-2 flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-semibold">Successful Campaign — "Run Addis 2026"</span>
          </div>
          <div className="mb-3 grid grid-cols-3 gap-2 text-center">
            <div><div className="text-lg font-semibold text-slate-800">620K</div><div className="text-[11px] text-slate-400">Views</div></div>
            <div><div className="text-lg font-semibold text-slate-800">9.4%</div><div className="text-[11px] text-slate-400">Engagement</div></div>
            <div><div className="text-lg font-semibold text-slate-800">4.8%</div><div className="text-[11px] text-slate-400">CTR</div></div>
          </div>
          <ul className="space-y-1 text-xs text-slate-600">
            <li>• Posted during peak local engagement window</li>
            <li>• Authentic story format tied to a real event</li>
            <li>• Clear CTA with a trackable swipe-up link</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}

function RecentEarningsTimeline() {
  return (
    <Card>
      <SectionHeader title="Recent Earnings" />
      <ul className="space-y-3">
        {RECENT_EARNINGS.map((e) => (
          <li key={e.brand + e.when} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-700">{e.brand}</div>
                <div className="text-xs text-slate-400">{e.when}</div>
              </div>
            </div>
            <span className="text-sm font-semibold text-emerald-600">{e.amount}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function TopBrands() {
  return (
    <Card>
      <SectionHeader title="Top business partners" />
      <div className="grid grid-cols-4 gap-3">
        {TOP_BRANDS.map((b) => (
          <div
            key={b}
            className="flex h-16 items-center justify-center rounded-xl border border-slate-100 text-xs font-semibold text-slate-500 transition hover:-translate-y-0.5 hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)] hover:shadow-sm"
          >
            {b}
          </div>
        ))}
      </div>
    </Card>
  );
}

function Reviews() {
  return (
    <Card>
      <SectionHeader
        title="Reviews"
        right={
          <span className="flex items-center gap-1 text-sm font-semibold text-slate-700">
            <Star className="h-4 w-4 fill-[var(--color-tertiary)] text-[var(--color-tertiary)]" /> 4.9/5
          </span>
        }
      />
      <div className="space-y-3">
        {REVIEWS.map((r) => (
          <div key={r.name} className="rounded-2xl border border-slate-100 p-4">
            <div className="mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-secondary)]/10 text-[11px] font-semibold text-[var(--color-secondary)]">
                  {r.name.split(" ").map((p) => p[0]).join("")}
                </div>
                <span className="text-sm font-medium text-slate-700">{r.name}</span>
              </div>
              <span className="text-xs text-slate-400">{r.date}</span>
            </div>
            <p className="text-sm text-slate-600">{r.text}</p>
            <p className="mt-1 text-xs text-slate-400">Campaign: {r.campaign}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Sidebar() {
  return (
    <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
      

      <Card>
        <SectionHeader title="Recent Activity" />
        <ul className="space-y-3">
          {ACTIVITY.map((a, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <a.icon className={`mt-0.5 h-4 w-4 shrink-0 ${a.color}`} />
              <div>
                <p className="text-xs text-slate-600">{a.text}</p>
                <p className="text-[11px] text-slate-400">{a.when}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------
   Page
--------------------------------------------------------- */

export default function InfluencerDetail() {
  return (
    <div style={BRAND} className="min-h-full ">
      {/* soft brand-tinted gradient backdrop */}
      <div
        className="fixed inset-0 -z-10"
        style={{ background: "linear-gradient(180deg, #F8FAFC 0%, #F1F0FB 100%)" }}
      />
      <div className="mx-auto max-w-[1440px] space-y-4">
        <ProfileHeader />
        <StatsRow />
        <SocialPlatforms />
        <AudienceAnalytics />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <PerformanceOverview />
            <Earnings />
            <ActiveCampaignsTable />
            <RecentCampaignCards />
            <CampaignComparison />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <RecentEarningsTimeline />
              <TopBrands />
            </div>
            <Reviews />
          </div>
          <Sidebar />
        </div>
      </div>
    </div>
  );
}