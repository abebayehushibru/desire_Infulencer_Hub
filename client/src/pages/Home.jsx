import {
  DollarSign,
  Plus,
  Users,
  Megaphone,
  TrendingUp,
  ShoppingCart,
} from "lucide-react";
import StatsCard from "../components/common/StatsCard";
import Table, { ActionMenu } from "../components/common/Table";
import { useState } from "react";
import Button from "../components/common/Button";

// ─── Admin / Business Dashboard ──────────────────────────────────────────────
function AdminHome({ greeting, columns, data, active, setActive }) {
  return (
    <div className="bg-gray-50 min-h-full text-primary">
      {/* Greeting */}
      <div className="mb-4">
        <h1 className="text-xl font-bold">{greeting}, Desire!</h1>
        <p className="mt-1 text-gray-500">Here's what's happening in your campaigns.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatsCard title="Active Campaigns" number={1250} compare={12} color="bg-blue-100 text-blue-600" />
        <StatsCard title="Total Conversions" number={85} compare={3} color="bg-green-100 text-green-600" />
        <StatsCard title="Total Spent" number="250,000" currency="ETB" compare={-7} color="bg-violet-100 text-violet-600" />
        <StatsCard title="Total Earnings" number="150,000" compare={5} currency="ETB" color="bg-orange-100 text-orange-600" />
      </div>

      {/* Recent Campaigns Table */}
      <div className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-lg font-semibold text-primary">Recent Campaigns</h2>
          <div className="hidden md:flex">
            <Button leftIcon={<Plus size={18} />}>Create Campaign</Button>
          </div>
        </div>
        <Table columns={columns} data={data} />
      </div>
    </div>
  );
}

// ─── Influencer Dashboard ─────────────────────────────────────────────────────
function InfluencerHome({ greeting }) {
  const stats = [
    { title: "Active Campaigns", number: 4, compare: 2, color: "bg-blue-100 text-blue-600" },
    { title: "Total Earnings", number: "32,500", currency: "ETB", compare: 8, color: "bg-green-100 text-green-600" },
    { title: "Conversions", number: 142, compare: 5, color: "bg-violet-100 text-violet-600" },
    { title: "Pending Payout", number: "8,000", currency: "ETB", compare: 0, color: "bg-orange-100 text-orange-600" },
  ];

  return (
    <div className="bg-gray-50 min-h-full text-primary">
      <div className="mb-4">
        <h1 className="text-xl font-bold">{greeting}!</h1>
        <p className="mt-1 text-gray-500">Here's your influencer dashboard overview.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s) => <StatsCard key={s.title} {...s} />)}
      </div>
      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm text-center text-gray-400 py-12">
        Influencer campaign feed coming soon
      </div>
    </div>
  );
}

// ─── Business Dashboard ───────────────────────────────────────────────────────
function BusinessHome({ greeting }) {
  const stats = [
    { title: "Active Campaigns", number: 6, compare: 1, color: "bg-blue-100 text-blue-600" },
    { title: "Total Spent", number: "480,000", currency: "ETB", compare: -3, color: "bg-violet-100 text-violet-600" },
    { title: "Total Conversions", number: 2340, compare: 12, color: "bg-green-100 text-green-600" },
    { title: "ROI", number: "3.2x", compare: 6, color: "bg-orange-100 text-orange-600" },
  ];

  return (
    <div className="bg-gray-50 min-h-full text-primary">
      <div className="mb-4">
        <h1 className="text-xl font-bold">{greeting}!</h1>
        <p className="mt-1 text-gray-500">Here's your business performance overview.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s) => <StatsCard key={s.title} {...s} />)}
      </div>
      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm text-center text-gray-400 py-12">
        Business analytics coming soon
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function Home() {
  const hour = new Date().getHours();
  const [active, setActive] = useState(null);

  const greeting =
    hour < 12 ? "Good Morning ☀️"
    : hour < 17 ? "Good Afternoon 🌤️"
    : hour < 21 ? "Good Evening 🌇"
    : "Good Night 🌙";

  const columns = [
    {
      key: "campaign",
      label: "Campaign",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-primary">{value}</span>
          <span className="text-xs text-gray-400">{row?.type} Campaign</span>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (value) => (
        <span className="rounded-full bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
          {value}
        </span>
      ),
    },
    { key: "target", label: "Target" },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
          value === "Active" ? "bg-green-100 text-green-600"
          : value === "Draft" ? "bg-yellow-100 text-yellow-700"
          : "bg-gray-100 text-gray-600"
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: "conversion",
      label: "Conversions",
      render: (value) => (
        <span className="block w-full text-center text-base font-semibold tabular-nums text-primary">
          {value}
        </span>
      ),
    },
    {
      key: "spend",
      label: "Spends",
      render: (value) => (
        <span className="font-semibold tabular-nums text-primary">
          {value} <span className="text-xs uppercase text-gray-400">ETB</span>
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (_, row, index) => (
        <ActionMenu
          onEdit={() => console.log("Edit", row)}
          onDelete={() => console.log("Delete", row)}
          index={index}
          active={active}
          setActive={setActive}
        />
      ),
    },
  ];

  const data = [
    { campaign: "Online English Course", type: "Sales", target: "Students", status: "Active", conversion: 320, spend: "30,000" },
    { campaign: "Addis Tech Event", type: "Awareness", target: "Developers", status: "Draft", conversion: 120, spend: "10,000" },
    { campaign: "Summer Promotion", type: "Growth", target: "Parents", status: "Completed", conversion: 540, spend: "15,000" },
  ];

  // TODO: replace with role from authStore once auth is wired up
  // const { user } = useAuthStore();
  // if (user?.role === 'influencer') return <InfluencerHome greeting={greeting} />;
  // if (user?.role === 'business')   return <BusinessHome greeting={greeting} />;

  return (
    <AdminHome
      greeting={greeting}
      columns={columns}
      data={data}
      active={active}
      setActive={setActive}
    />
  );
}
