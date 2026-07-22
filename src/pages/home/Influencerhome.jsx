import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Heart, Trophy, Wallet } from "lucide-react";
import Table, { ActionMenu } from "../../components/common/Table";
import StatsCard from "../../components/common/StatsCard.";

export default function InfluencerHome() {
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const [active, setActive] = useState(false);

  const greeting =
    hour < 12
      ? "Good Morning ☀️"
      : hour < 17
      ? "Good Afternoon 🌤️"
      : hour < 21
      ? "Good Evening 🌇"
      : "Good Night 🌙";

  const columns = [
    {
      key: "campaign",
      label: "Campaign",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-primary">{value}</span>
          <span className="text-xs text-gray-400">{row.brand}</span>
        </div>
      ),
    },
    {
      key: "platform",
      label: "Platform",
      render: (value) => (
        <span className="rounded-full bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
          {value}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            value === "Active"
              ? "bg-green-100 text-green-600"
              : value === "Completed"
              ? "bg-blue-100 text-blue-600"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "budget",
      label: "Budget",
      render: (value) => (
        <span className="font-semibold tabular-nums text-primary">
          {value} <span className="text-xs uppercase text-gray-400">Etb</span>
        </span>
      ),
    },
    {
      key: "deadline",
      label: "Deadline",
    },
    {
      key: "actions",
      label: "",
      render: (_, row, index) => (
        <ActionMenu
          onEdit={() => navigate(`/campaigns/${row.id}`)}
          index={index}
          active={active}
          setActive={setActive}
        />
      ),
    },
  ];

  const data = [
    {
      id: 1,
      campaign: "Run Addis 2026",
      brand: "Nike",
      platform: "TikTok",
      status: "Completed",
      budget: "2,200",
      deadline: "Jun 21, 2026",
    },
    {
      id: 2,
      campaign: "Shot on iPhone — Addis",
      brand: "Apple",
      platform: "Instagram",
      status: "Completed",
      budget: "3,000",
      deadline: "May 30, 2026",
    },
    {
      id: 3,
      campaign: "Unfold Your Story",
      brand: "Samsung",
      platform: "YouTube",
      status: "Active",
      budget: "1,600",
      deadline: "Jul 17, 2026",
    },
  ];

  return (
    <div className="min-h-full bg-gray-50/10 text-primary">
      {/* Greeting */}
      <div className="mb-5">
        <h1 className="text-xl font-bold">{greeting}, Abebe!</h1>
        <p className="mt-1 text-gray-500">Here's how your campaigns are performing.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatsCard
          title="Followers"
          number="245K"
          compare={3.2}
          icon={Users}
          color="bg-blue-100 text-blue-600"
        />

        <StatsCard
          title="Engagement Rate"
          number="8.7%"
          compare={0.6}
          icon={Heart}
          color="bg-emerald-100 text-emerald-600"
        />

        <StatsCard
          title="Completed Campaigns"
          number={86}
          compare={5}
          icon={Trophy}
          color="bg-violet-100 text-violet-600"
        />

        <StatsCard
          title="Total Earnings"
          number="34,850"
          currency="ETB"
          compare={7}
          icon={Wallet}
          color="bg-orange-100 text-orange-600"
        />
      </div>

      {/* Content */}
      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-primary">My Campaigns</h2>
            <p className="text-sm text-gray-400">Campaigns you're currently part of</p>
          </div>
        </div>

        <Table columns={columns} data={data} />
      </div>
    </div>
  );
}