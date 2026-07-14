import { Megaphone, Target, DollarSign, Wallet, Plus } from "lucide-react";
import Table, { ActionMenu } from "../../components/common/Table";
import StatsCard from "../../components/common/StatsCard.";

import { useState } from "react";
import Button from "../../components/common/Button";
import { useNavigate } from "react-router-dom";

export default function BusinessHome() {
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
    {
      key: "target",
      label: "Target",
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            value === "Active"
              ? "bg-green-100 text-green-600"
              : value === "Draft"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
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
          {value} <span className="text-xs uppercase text-gray-400">Etb</span>
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (_, row, index) => (
        <ActionMenu
          onEdit={() => navigate(`/campaigns/edit/${row.id}`)}
          onDelete={() => console.log("Delete", row)}
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
      campaign: "Online English Course",
      type: "Sales",
      target: "Students",
      status: "Active",
      conversion: 320,
      spend: "30,000",
    },
    {
      id: 2,
      campaign: "Addis Tech Event",
      type: "Awareness",
      target: "Developers",
      status: "Draft",
      conversion: 120,
      spend: "10,000",
    },
    {
      id: 3,
      campaign: "Summer Promotion",
      type: "Growth",
      target: "Parents",
      status: "Completed",
      conversion: 540,
      spend: "15,000",
    },
  ];

  return (
    <div className="min-h-full bg-gray-50 text-primary">
      {/* Greeting */}
      <div className="mb-5">
        <h1 className="text-xl font-bold">{greeting}, Desire!</h1>
        <p className="mt-1 text-gray-500">Here's what's happening in your campaigns.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatsCard
          title="Active Campaigns"
          number={1250}
          compare={12}
          icon={Megaphone}
          color="bg-blue-100 text-blue-600"
        />

        <StatsCard
          title="Total Conversions"
          number={85}
          compare={3}
          icon={Target}
          color="bg-emerald-100 text-emerald-600"
        />

        <StatsCard
          title="Total Spent"
          number="250,000"
          currency="ETB"
          compare={-7}
          icon={DollarSign}
          color="bg-violet-100 text-violet-600"
        />

        <StatsCard
          title="Total Earnings"
          number="150,000"
          currency="ETB"
          compare={5}
          icon={Wallet}
          color="bg-orange-100 text-orange-600"
        />
      </div>

      {/* Content */}
      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-primary">Recent Campaigns</h2>
            <p className="text-sm text-gray-400">Your latest campaign activity</p>
          </div>

          <div className="hidden md:flex">
            <Button
              className="rounded-lg"
              leftIcon={<Plus size={20} />}
              onClick={() => navigate("/campaigns/create")}
            >
              Create Campaign
            </Button>
          </div>
        </div>

        <Table columns={columns} data={data} />
      </div>
    </div>
  );
}