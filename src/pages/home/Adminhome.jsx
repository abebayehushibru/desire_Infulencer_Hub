import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserCheck, Users, Briefcase, Wallet } from "lucide-react";

import Table, { ActionMenu } from "../../components/common/Table";
import StatsCard from "../../components/common/StatsCard.";

export default function AdminHome() {
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
      key: "name",
      label: "Name",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-primary">{value}</span>
          <span className="text-xs text-gray-400">{row.email}</span>
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
      key: "submitted",
      label: "Submitted",
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            value === "Approved"
              ? "bg-green-100 text-green-600"
              : value === "Pending"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (_, row, index) => (
        <ActionMenu
          onEdit={() => navigate(`/admin/review/${row.id}`)}
          onDelete={() => console.log("Reject", row)}
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
      name: "Liya Alemu",
      email: "liya@example.com",
      type: "Influencer",
      submitted: "Jul 12, 2026",
      status: "Pending",
    },
    {
      id: 2,
      name: "Desire Online School",
      email: "info@desire.et",
      type: "Business",
      submitted: "Jul 11, 2026",
      status: "Approved",
    },
    {
      id: 3,
      name: "Fit Ethiopia",
      email: "hello@fitet.com",
      type: "Community",
      submitted: "Jul 10, 2026",
      status: "Pending",
    },
    {
      id: 4,
      name: "Marcus Otieno",
      email: "marcus@example.com",
      type: "Influencer",
      submitted: "Jul 9, 2026",
      status: "Rejected",
    },
  ];

  return (
    <div className="min-h-full bg-gray-50 text-primary">
      {/* Greeting */}
      <div className="mb-5">
        <h1 className="text-xl font-bold">{greeting}, Admin!</h1>
        <p className="mt-1 text-gray-500">Here's your platform overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatsCard
          title="Total Influencers"
          number={3248}
          compare={8}
          icon={UserCheck}
          color="bg-blue-100 text-blue-600"
        />

        <StatsCard
          title="Total Communities"
          number={186}
          compare={4}
          icon={Users}
          color="bg-emerald-100 text-emerald-600"
        />

        <StatsCard
          title="Total Businesses"
          number={412}
          compare={6}
          icon={Briefcase}
          color="bg-violet-100 text-violet-600"
        />

        <StatsCard
          title="Platform Revenue"
          number="1,240,000"
          currency="ETB"
          compare={9}
          icon={Wallet}
          color="bg-orange-100 text-orange-600"
        />
      </div>

      {/* Content */}
      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-primary">Pending Approvals</h2>
            <p className="text-sm text-gray-400">New influencers, communities, and businesses awaiting review</p>
          </div>
        </div>

        <Table columns={columns} data={data} />
      </div>
    </div>
  );
}