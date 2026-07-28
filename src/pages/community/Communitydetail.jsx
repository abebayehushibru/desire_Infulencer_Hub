import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  UserPlus,
  Mail,
  Pencil,
  Share2,
  MoreHorizontal,
  Users,
  Activity,
  Megaphone,
  Heart,
  FileText,
  Wallet,
  TrendingUp,
  TrendingDown,
  Search,
  ChevronDown,
  MessageSquare,
  ThumbsUp,
  Pin,
  Flag,
  Calendar,
  Clock,
  Video,
  Download,
  Upload,
  File,
  FileArchive,
  X,
  CheckCircle2,
  Crown,
  Shield,
  MoreVertical,
  Bell,
  Sparkles,
  Music2,
  Camera,
  Send,
  AlertCircle,
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
import useApi from "../../hooks/useApi";
import { Link, useParams } from "react-router-dom";
import PageLoader from "../../components/PageLoader";
import AddMemberModal from "./AddCommunityMember";
import Table from "../../components/common/Table";
import Pagination from "../../components/Pagination";
import { formatFollowers } from "../../services/helpers";

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
const SKY = "#0EA5E9";

/* ---------------------------------------------------------
   Mock data
--------------------------------------------------------- */

const COMMUNITY = {
  name: "Sara Beauty Community",
  tier: "Diamond Community",
  tags: "Beauty • Lifestyle • Makeup",
  created: "Jan 2025",
  location: "Ethiopia",
  members: "10",
  activeToday: "10.2M",
};

const STATS = [
  { label: "Total Members", value: "12,548", trend: "+342 this month", up: true, icon: Users, data: [4, 5, 6, 6, 7, 8, 9, 10, 11] },
  { label: "Active Members", value: "8,246", trend: "+5.1%", up: true, icon: Activity, data: [5, 6, 5, 7, 8, 7, 9, 9, 10] },
  { label: "Campaigns", value: "34", trend: "+3 new", up: true, icon: Megaphone, data: [2, 3, 3, 4, 4, 5, 5, 6, 7] },
  { label: "Total Engagement", value: "8.7%", trend: "+0.6%", up: true, icon: Heart, data: [6, 7, 6, 8, 8, 9, 8, 9, 10] },
  { label: "Posts", value: "1,284", trend: "+64 this week", up: true, icon: FileText, data: [8, 9, 9, 10, 11, 10, 12, 13, 14] },
  { label: "Monthly Earnings", value: "480,000 ETB", trend: "-2.1%", up: false, icon: Wallet, data: [10, 11, 10, 9, 10, 9, 8, 9, 8] },
];

const TABS = ["Overview", "Members", "Campaigns", "Analytics", "Files", "Settings"];

const CATEGORIES = ["Beauty", "Lifestyle", "Fashion", "Travel"];
const PLATFORM_TAGS = [
  { name: "Instagram", icon: Camera },
  { name: "TikTok", icon: Music2 },
  { name: "Telegram", icon: Send },
  { name: "YouTube", icon: Video },
];

const QUICK_NUMBERS = [
  { label: "Daily Posts", value: "34" },
  { label: "New Members", value: "28" },
  { label: "Campaign Participation", value: "84%" },
  { label: "Average Engagement", value: "8.7%" },
];

const MEMBERS = [
  { name: "Sara Beauty", role: "Owner", platform: "Instagram", followers: "2.4M", joined: "Jan 2025", status: "Active", campaigns: 15 },
  { name: "Hana T.", role: "Moderator", platform: "TikTok", followers: "820K", joined: "Mar 2025", status: "Active", campaigns: 9 },
  { name: "John K.", role: "Member", platform: "YouTube", followers: "240K", joined: "Apr 2025", status: "Pending", campaigns: 3 },
  { name: "Liya A.", role: "Member", platform: "Instagram", followers: "110K", joined: "May 2025", status: "Active", campaigns: 6 },
  { name: "Marcus O.", role: "Member", platform: "Telegram", followers: "58K", joined: "Jun 2025", status: "Suspended", campaigns: 1 },
];

const MEMBER_STATUS_STYLE = {
  Active: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Pending: "bg-[var(--color-tertiary)]/15 text-[#8a5a00] border-[var(--color-tertiary)]",
  Suspended: "bg-rose-50 text-rose-600 border-rose-200",
};

const CAMPAIGNS = [
  { name: "Glow Summer Launch", brand: "Nivea", budget: "120,000 ETB", joined: 42, status: "Active", progress: 68 },
  { name: "Matte Lip Challenge", brand: "Maybelline", budget: "85,000 ETB", joined: 27, status: "Active", progress: 41 },
  { name: "Skincare Routine Week", brand: "L'Oréal", budget: "150,000 ETB", joined: 61, status: "Completed", progress: 100 },
  { name: "New Palette Reveal", brand: "Huda Beauty", budget: "96,000 ETB", joined: 18, status: "Draft", progress: 0 },
];

const CAMPAIGN_STATUS_STYLE = {
  Active: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Completed: "bg-sky-50 text-sky-600 border-sky-200",
  Draft: "bg-slate-100 text-slate-500 border-slate-200",
};

const POSTS = [
  { name: "Sara Beauty", time: "2h ago", content: "New tutorial dropping tomorrow — get ready for the glow! ✨", likes: 482, comments: 61, shares: 24, pinned: true },
  { name: "Hana T.", time: "5h ago", content: "Loved shooting today's UGC batch for the Glow Summer Launch campaign.", likes: 216, comments: 18, shares: 6, pinned: false },
  { name: "Liya A.", time: "1d ago", content: "Question for the group: matte or dewy finish for the summer heat?", likes: 133, comments: 47, shares: 3, pinned: false },
];

const EVENTS = [
  { title: "Weekly Live", when: "Saturday · 7 PM", participants: 342, type: "recurring" },
  { title: "Product Launch", when: "July 22", participants: null, type: "upcoming" },
  { title: "Q&A with Sara", when: "July 30 · 6 PM", participants: 158, type: "recurring" },
];

const FILES = [
  { name: "Community Rules.pdf", size: "220 KB", icon: FileText },
  { name: "Media Kit.pdf", size: "4.1 MB", icon: FileText },
  { name: "Brand Assets.zip", size: "18.6 MB", icon: FileArchive },
  { name: "Guidelines.docx", size: "180 KB", icon: FileText },
];

const GROWTH_DATA = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((m, i) => ({
  month: m, members: [4200, 5600, 6800, 8100, 9600, 11000, 12548][i],
}));

const PLATFORM_DIST = [
  { name: "Instagram", value: 46, color: PURPLE },
  { name: "TikTok", value: 28, color: SKY },
  { name: "Telegram", value: 16, color: GOLD },
  { name: "YouTube", value: 10, color: GREEN },
];

const ACTIVITY_BY_TIME = [
  { hour: "6a", value: 8 }, { hour: "9a", value: 22 }, { hour: "12p", value: 34 },
  { hour: "3p", value: 40 }, { hour: "6p", value: 58 }, { hour: "9p", value: 46 }, { hour: "12a", value: 14 },
];

const MANAGERS = [
  { name: "Sara Beauty", role: "Owner", icon: Crown },
  { name: "Hana T.", role: "Agent", icon: Shield },
  { name: "Liya A.", role: "Admin", icon: Shield },
];

const SIDEBAR_ACTIVITY = [
  { text: "Sara approved a new member", when: "12m ago" },
  { text: "John created a post", when: "1h ago" },
  { text: "Glow Summer Launch campaign started", when: "3h ago" },
  { text: "Payment completed for Hana T.", when: "1d ago" },
];

const FOOTER_TIMELINE = [
  { icon: UserPlus, text: "New member joined", when: "18m ago", color: "text-[var(--color-secondary)]" },
  { icon: Megaphone, text: "Campaign \"Matte Lip Challenge\" created", when: "2h ago", color: "text-sky-500" },
  { icon: Users, text: "Community reached 12K members", when: "1d ago", color: "text-emerald-500" },
  { icon: Video, text: "Weekly live completed", when: "2d ago", color: "text-[var(--color-tertiary)]" },
  { icon: Wallet, text: "Brand collaboration started with L'Oréal", when: "4d ago", color: "text-slate-400" },
];

/* ---------------------------------------------------------
   Primitives
--------------------------------------------------------- */

function Card({ className = "", children }) {
  return (
    <div className={`rounded-lg border border-slate-200 bg-white/90 p-5 shadow-[0_2px_16px_-6px_rgba(22,17,90,0.08)] sm:p-6 ${className}`}>
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
  const id = `spark-${color.replace("#", "")}`;
  return (
    <ResponsiveContainer width="100%" height={32}>
      <AreaChart data={points} margin={{ top: 2, left: 0, right: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#${id})`} />
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

function Avatar({ name, size = 36 }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.36, background: `linear-gradient(135deg, ${PURPLE}, ${NAVY})` }}
    >
      {initials}
    </div>
  );
}

function StatusPill({ status, styles }) {
  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status] || "bg-slate-100 text-slate-500 border-slate-200"}`}>
      {status}
    </span>
  );
}

function Select({ label }) {
  return (
    <button className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 hover:border-slate-300">
      {label} <ChevronDown className="h-3.5 w-3.5" />
    </button>
  );
}

/* ---------------------------------------------------------
   Header + Stats + Tabs
--------------------------------------------------------- */

function CommunityHeader({ COMMUNITY }) {
  return (
    <Card className="!p-0 overflow-hidden">

      <div className="h-32 sm:h-40" style={{ background: `linear-gradient(120deg, ${PURPLE}, ${NAVY} 70%)` }} />
      <div className="p-5 pt-0 sm:p-6 sm:pt-0">
        <div className="-mt-10 flex flex-col justify-between gap-4 sm:-mt-12 sm:flex-row sm:items-end">
          <div className="flex items-end gap-4">
            <div className="h-20 w-20 rounded-2xl border-4 border-white sm:h-24 sm:w-24">
              <Avatar name={COMMUNITY?.name} size={88} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <h1 className="text-lg font-semibold text-slate-800 sm:text-xl">{COMMUNITY?.name}</h1>
                {COMMUNITY?.is_verified && <BadgeCheck className="h-5 w-5 text-[var(--color-secondary)]" />}

              </div>
              <p className="text-sm text-slate-400">{JSON.parse(COMMUNITY?.categories)?.split(",").join("-")}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">

            <Link to={`/communities/edit/${COMMUNITY?.id}`} t className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:border-slate-300">
              <Pencil className="h-4 w-4" /> Edit Community
            </Link>

            <button className="rounded-lg border border-slate-200 p-2.5 text-slate-400 hover:border-slate-300 hover:text-slate-600">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400">
          <span>Created <b className="font-semibold text-slate-600">{COMMUNITY?.created_at.split("T")?.[0]}</b></span>
          <span>Location <b className="font-semibold text-slate-600">{COMMUNITY?.location}</b></span>
          <span>Members <b className="font-semibold text-slate-600">{COMMUNITY?.total_members}</b></span>
          <span>Followers <b className="font-semibold text-slate-600">{COMMUNITY?.total_followers || 0}</b></span>
        </div>
      </div>
    </Card>
  );
}

function StatsGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6 opacity-25">
      {STATS.map((s) => (
        <Card key={s.label} className="!p-4">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-secondary)]/10">
              <s.icon className="h-4 w-4 text-[var(--color-secondary)]" />
            </div>
            <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${s.up ? "text-emerald-500" : "text-rose-500"}`}>
              {s.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            </span>
          </div>
          <div className="mt-2 text-lg font-semibold text-slate-800">{s.value}</div>
          <div className="text-[11px] text-slate-400">{s.label}</div>
          <div className="mt-1.5">
            <Sparkline data={s.data} color={s.up ? GREEN : "#EF4444"} />
          </div>
          <div className={`text-[10px] font-medium ${s.up ? "text-emerald-500" : "text-rose-500"}`}>{s.trend}</div>
        </Card>
      ))}
    </div>
  );
}

function TabBar({ active, onChange }) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-white p-1.5">
      {TABS.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition ${active === t ? "bg-[var(--color-secondary)] text-white" : "text-slate-500 hover:bg-slate-50"
            }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------
   Tab: Overview
--------------------------------------------------------- */

function OverviewTab({ community }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card className="col-span-2">
        <SectionHeader title="About Community" />
        <p className="text-sm text-slate-600">
          {community?.about}
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Community Goals</h4>
            <ul className="space-y-1 text-sm text-slate-600">
              {
                community?.goals?.split(".")?.map((l) => (<li>• {l}</li>))
              }
              {/* <li>• Grow to 20K members by year end</li>
              <li>• Run 50 brand campaigns in 2026</li>
              <li>• Keep engagement above 8%</li> */}
            </ul>
          </div>
          <div>
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Community Rules</h4>
            <ul className="space-y-1 text-sm text-slate-600">
              {
                community?.rules?.split(".")?.map((l) => (<li>• {l}</li>))
              }
            </ul>
          </div>
        </div>
        <div className="mt-4">
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Categories</h4>
          <div className="flex flex-wrap gap-1.5">

            {JSON.parse(community?.categories)?.split(",").map((c) => (
              <span key={c} className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-500">{c}</span>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Platforms</h4>
          <div className="flex flex-wrap gap-1.5">
            {JSON.parse(community?.platforms || '').split(",")
              .map((name) => PLATFORM_TAGS.find((p) => p.name === name))
              .filter(Boolean)
              .map((p) => (
                <span key={p.name} className="flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-500">
                  <p.icon className="h-3.5 w-3.5" />
                  {p.name}
                </span>
              ))}
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <Card>
          <SectionHeader title="Community Health" />
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={96} height={96}>
              <PieChart>
                <Pie
                  data={[{ value: 99 }, { value: 1 }]}
                  dataKey="value"
                  innerRadius={34}
                  outerRadius={46}
                  startAngle={90}
                  endAngle={-270}
                >
                  <Cell fill={PURPLE} />
                  <Cell fill="#EEF2FF" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div>
              <div className="text-2xl font-semibold text-slate-800">99%</div>
              <div className="text-xs font-medium text-emerald-500">Excellent Growth</div>
            </div>
          </div>
        </Card>
        <Card>
          <SectionHeader title="Quick Numbers" />
          <div className="grid grid-cols-2 gap-2 opacity-25">
            {QUICK_NUMBERS.map((q) => (
              <div key={q.label} className="rounded-xl border border-slate-100 p-3">
                <div className="text-lg font-semibold text-slate-800">{q.value}</div>
                <div className="text-[11px] text-slate-400">{q.label}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Tab: Members
--------------------------------------------------------- */

function MembersTab({ onAddMember, id }) {

  // GET Community details API
    const getApi = useApi({
      request: () => ({
        method: "GET",
        path: `/communities/${id}/members`,
      }),
    });
  
    // PUT Community update API
    const removeApi = useApi({
      request: (payload) => ({
        method: "PUT",
        path: `/communities/${id}`,
        data: payload,
      }),
    });

    
  const columns = [
  {
    key: "member",
    label: "Member",
    render: (value, row) => (
      <div className="flex items-center gap-2">
        <Avatar name={row?.user?.name_or_company_name} size={28} />
        <span className="flex flex-col">
<span className="font-medium text-slate-700">{row?.user?.name_or_company_name}</span>
<span className=" text-slate-600 text-[10px]">{row?.user?.email}</span>

        </span>
        
      </div>
    ),
  },
  {
    key: "role",
    label: "Role",
    render: (value) => <span className="text-slate-500">{value}</span>,
  },
  {
    key: "platform",
    label: "Platform",
    render: (value,row) => <span className="text-slate-500">{row?.user?.influencer_profile?.main_platform}</span>,
  },
  {
    key: "followers",
    label: "Followers",
    render: (value,row) => <span className="text-slate-500">{formatFollowers(row?.user?.influencer_profile?.followers_count)}</span>,
  },
  {
    key: "joined_at",
    label: "Joined",
    render: (value) => <span className="text-slate-500">{value.split("T")?.[0]}</span>,
  },
  {
    key: "status",
    label: "Status",
    render: (value) => <StatusPill status={value} styles={MEMBER_STATUS_STYLE} />,
  },
  {
    key: "campaigns",
    label: "Campaigns",
    render: (value) => <span className="text-slate-500">{0}</span>,
  },
  {
    key: "actions",
    label: "Action",
    render: (_, row) => (
      <div className="text-right">
        <button className="text-slate-400 hover:text-slate-600">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    ),
  },
];
 const fetchMembers = async (page = 1) => {
    const res = await getApi.execute(
      {
        page: page,

      }
    )
  
  }

  useEffect(() => {
    if (id) {
       fetchMembers()
    }
   
  }, [id])
  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-800">Members </h2>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onAddMember}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--color-secondary)] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[var(--color-primary)]"
          >
            <UserPlus className="h-3.5 w-3.5" /> Add Member
          </button>
        </div>
      </div>
     
      <div className="overflow-x-auto">
      <Table data={getApi.data?.data||[]} columns={columns}/>
      
      </div>
    </Card>
  );
}



/* ---------------------------------------------------------
   Tab: Campaigns
--------------------------------------------------------- */

function CampaignsTab() {
  return (
    <Card>
      <SectionHeader title="Campaigns" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {CAMPAIGNS.map((c) => (
          <div key={c.name} className="overflow-hidden rounded-2xl border border-slate-100">
            <div className="h-20" style={{ background: `linear-gradient(135deg, ${PURPLE}, ${NAVY})` }} />
            <div className="p-4">
              <div className="mb-1 flex items-start justify-between gap-2">
                <h4 className="text-sm font-semibold text-slate-800">{c.name}</h4>
                <StatusPill status={c.status} styles={CAMPAIGN_STATUS_STYLE} />
              </div>
              <p className="mb-2 text-xs text-slate-400">{c.brand} · {c.budget}</p>
              <p className="mb-2 text-xs text-slate-500">{c.joined} members joined</p>
              <div className="mb-1 flex justify-between text-xs text-slate-400">
                <span>Progress</span><span className="font-semibold text-slate-600">{c.progress}%</span>
              </div>
              <ProgressBar value={c.progress} />
              <div className="mt-3 flex gap-2">
                <button className="flex-1 rounded-lg bg-[var(--color-secondary)] py-2 text-xs font-semibold text-white hover:bg-[var(--color-primary)]">Open</button>
                <button className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:border-slate-300">Manage</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------------------------------------------------------
   Tab: Posts
--------------------------------------------------------- */

function PostsTab() {
  return (
    <Card>
      <SectionHeader title="Community Posts" />
      <div className="space-y-4">
        {POSTS.map((p) => (
          <div key={p.name + p.time} className="rounded-2xl border border-slate-100 p-4">
            <div className="mb-2 flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <Avatar name={p.name} size={34} />
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    {p.name}
                    {p.pinned && (
                      <span className="flex items-center gap-1 rounded-full bg-[var(--color-tertiary)]/15 px-2 py-0.5 text-[10px] font-semibold text-[#8a5a00]">
                        <Pin className="h-2.5 w-2.5" /> Pinned
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">{p.time}</div>
                </div>
              </div>
              <button className="text-slate-300 hover:text-rose-500"><Flag className="h-4 w-4" /></button>
            </div>
            <p className="mb-3 text-sm text-slate-600">{p.content}</p>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" /> {p.likes}</span>
              <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {p.comments}</span>
              <span className="flex items-center gap-1"><Share2 className="h-3.5 w-3.5" /> {p.shares}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------------------------------------------------------
   Tab: Events
--------------------------------------------------------- */

function EventsTab() {
  return (
    <Card>
      <SectionHeader title="Events" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {EVENTS.map((e) => (
          <div key={e.title} className="rounded-2xl border border-slate-100 p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-secondary)]/10">
              <Calendar className="h-4.5 w-4.5 text-[var(--color-secondary)]" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800">{e.title}</h4>
            <p className="mb-3 flex items-center gap-1 text-xs text-slate-400"><Clock className="h-3.5 w-3.5" /> {e.when}</p>
            {e.participants && <p className="mb-3 text-xs text-slate-500">{e.participants} participants</p>}
            <button className="w-full rounded-lg bg-[var(--color-secondary)] py-2 text-xs font-semibold text-white hover:bg-[var(--color-primary)]">
              {e.type === "upcoming" ? "Invite Members" : "Join"}
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------------------------------------------------------
   Tab: Analytics
--------------------------------------------------------- */

function AnalyticsTab() {
  const cards = [
    { label: "Reach", value: "1.2M" },
    { label: "Posts", value: "1,284" },
    { label: "Comments", value: "18.4K" },
    { label: "Shares", value: "6.1K" },
  ];
  return (
    <div className="space-y-4">
      <Card>
        <SectionHeader title="Community Growth" subtitle="Members over time" />
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={GROWTH_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
            <Line type="monotone" dataKey="members" stroke={PURPLE} strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="!p-4">
            <div className="text-lg font-semibold text-slate-800">{c.value}</div>
            <div className="text-xs text-slate-400">{c.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <SectionHeader title="Member Growth" />
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={GROWTH_DATA} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
              <defs>
                <linearGradient id="commGrowth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PURPLE} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={PURPLE} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Area type="monotone" dataKey="members" stroke={PURPLE} strokeWidth={2} fill="url(#commGrowth)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionHeader title="Platform Distribution" />
          <div className="flex items-center gap-3">
            <ResponsiveContainer width={100} height={100}>
              <PieChart>
                <Pie data={PLATFORM_DIST} dataKey="value" innerRadius={30} outerRadius={46} paddingAngle={3}>
                  {PLATFORM_DIST.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1">
              {PLATFORM_DIST.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-[11px]">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-500">{d.name}</span>
                  <span className="font-semibold text-slate-700">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card>
          <SectionHeader title="Activity by Time" />
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={ACTIVITY_BY_TIME} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Bar dataKey="value" fill={GOLD} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Tab: Files
--------------------------------------------------------- */

function FilesTab() {
  return (
    <Card>
      <SectionHeader
        title="Files"
        right={
          <button className="flex items-center gap-1.5 rounded-lg bg-[var(--color-secondary)] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[var(--color-primary)]">
            <Upload className="h-3.5 w-3.5" /> Upload File
          </button>
        }
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {FILES.map((f) => (
          <div key={f.name} className="rounded-2xl border border-slate-100 p-4 text-center transition hover:border-[var(--color-secondary)]">
            <f.icon className="mx-auto mb-2 h-6 w-6 text-[var(--color-secondary)]" />
            <div className="truncate text-xs font-medium text-slate-700">{f.name}</div>
            <div className="text-[11px] text-slate-400">{f.size}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------------------------------------------------------
   Tab: Settings
--------------------------------------------------------- */

function SettingsTab() {
  const rows = [
    { label: "Community Visibility", value: "Public — anyone can find and request to join" },
    { label: "Post Approval", value: "Moderators must approve posts before they're visible" },
    { label: "Member Approval", value: "Manual approval required for new members" },
    { label: "Notifications", value: "Email + push for campaign updates and announcements" },
  ];
  return (
    <Card>
      <SectionHeader title="Settings" subtitle="Community-wide preferences" />
      <div className="divide-y divide-slate-100">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-4 py-3">
            <div>
              <div className="text-sm font-medium text-slate-700">{r.label}</div>
              <div className="text-xs text-slate-400">{r.value}</div>
            </div>
            <button className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-300">
              Change
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------------------------------------------------------
   Sidebar + Footer
--------------------------------------------------------- */

function Sidebar({ managers }) {
  return (
    <div className=" lg:sticky lg:top-6 lg:self-start grid lg:grid-cols-4  gap-4">
      <Card>
        <SectionHeader title="Community Managers" />
        <ul className="space-y-2.5">
          {[...(managers || [])].map((m, index) => {
            const displayName = m?.name || m?.name_or_company_name;
            if (!displayName) return null;

            return (
              <li key={`${displayName}-${index}`} className="flex items-center gap-2.5">
                <Avatar name={displayName} size={30} />
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-700">{displayName}</div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    {m?.role?.toLowerCase()!="leader" && m?.role? <Shield className="h-3 w-3" /> : <Crown className="h-3 w-3" /> }
                    {m?.role || "Leader"}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card>
        <SectionHeader title="Recent Activity" />
        <ul className="space-y-2.5 opacity-25">
          {SIDEBAR_ACTIVITY.map((a) => (
            <li key={a.text} className="text-xs">
              <p className="text-slate-600">{a.text}</p>
              <p className="text-[11px] text-slate-400">{a.when}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <SectionHeader title="Upcoming Events" />
        <ul className="space-y-2 opacity-25">
          {EVENTS.slice(0, 2).map((e) => (
            <li key={e.title} className="flex items-center gap-2 text-xs">
              <Calendar className="h-3.5 w-3.5 text-[var(--color-secondary)]" />
              <span className="text-slate-600">{e.title}</span>
              <span className="ml-auto text-slate-400">{e.when}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <SectionHeader title="Quick Actions" />
        <div className="grid grid-cols-2 gap-2 opacity-25">
          {[
            { label: "Add Member", icon: UserPlus },
            { label: "Create Campaign", icon: Megaphone },
            { label: "Create Event", icon: Calendar },
            { label: "Send Announcement", icon: Bell },
          ].map((a) => (
            <button key={a.label} className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-100 py-3 text-center text-[11px] font-medium text-slate-600 transition hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)]">
              <a.icon className="h-4 w-4" /> {a.label}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

function FooterTimeline() {
  return (
    <Card>
      <SectionHeader title="Recent Activity Timeline" />
      <ul className="space-y-3 opacity-25">
        {FOOTER_TIMELINE.map((a, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-50">
              <a.icon className={`h-3.5 w-3.5 ${a.color}`} />
            </div>
            <div>
              <p className="text-sm text-slate-600">{a.text}</p>
              <p className="text-xs text-slate-400">{a.when}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ---------------------------------------------------------
   Page
--------------------------------------------------------- */

export default function CommunityDetail() {
  const { id } = useParams();
  const [community, setCommunity] = useState(null);
  const [tab, setTab] = useState("Overview");
  const [showAddMember, setShowAddMember] = useState(false);

  // GET Community details API
  const getCommunityApi = useApi({
    request: () => ({
      method: "GET",
      path: `/communities/${id}/details`,
    }),
  });

  // Fetch initial response and map data
  useEffect(() => {
    if (id) {
      getCommunityApi.execute().then((res) => {
        if (res?.success && res.data) {
          const rawData = res.data?.data || res.data;

          const parsedCategories = JSON.parse(rawData.categories);
          const parsedPlatforms = JSON.parse(rawData.platforms);

          const isRate = rawData.commission_type === "Rate";
          const commVal = isRate ? rawData.commission_rate : rawData.commission_amount;

          setCommunity({
            ...rawData,
            categoriesList: parsedCategories,
            platformsList: parsedPlatforms,
            displayCommission: isRate ? `${commVal}%` : `ETB ${commVal}`,
          });
        }
      });
    }
  }, [id]);
  if (getCommunityApi.loading) {
    return (
      <PageLoader label="Loading community details..." />
    );
  }

  if (getCommunityApi.error || !community) {
    return (
      <div style={BRAND} className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="flex max-w-md flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="h-10 w-10 text-rose-500" />
          <h2 className="text-lg font-semibold text-slate-800">Community Not Found</h2>
          <p className="text-sm text-slate-500">
            {getCommunityApi.error || "Unable to fetch details for this community."}
          </p>
        </div>
      </div>
    );
  }

  const renderTab = () => {
    switch (tab) {
      case "Overview": return <OverviewTab community={community} />;
      case "Members": return <MembersTab onAddMember={() => setShowAddMember(true)} id={id} />;
      case "Campaigns": return <CampaignsTab />;
      case "Analytics": return <AnalyticsTab />;
      case "Files": return <FilesTab />;
      case "Settings": return <SettingsTab />;
      default: return null;
    }
  };

  return (
    <div style={BRAND} className="min-h-screen ">
      <div className="fixed inset-0 -z-10" style={{ background: "linear-gradient(180deg, #F8FAFC 0%, #F1F0FB 100%)" }} />
      <div className="mx-auto max-w-[1440px] space-y-4">
        <CommunityHeader COMMUNITY={community} />
        <StatsGrid />
        <TabBar active={tab} onChange={setTab} />
        <div>{renderTab()}</div>


        <Sidebar managers={[community?.manager]} />

        <FooterTimeline />
      </div>

      {showAddMember && <AddMemberModal onClose={() => setShowAddMember(false)} id={id} />}
    </div>
  );
}