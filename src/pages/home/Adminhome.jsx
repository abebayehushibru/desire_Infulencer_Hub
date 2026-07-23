import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserCheck, Users, Briefcase, Wallet } from "lucide-react";

import Table, { ActionMenu } from "../../components/common/Table";

import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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
          className={`rounded-full px-3 py-1 text-xs font-medium ${value === "Approved"
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

const revenueData = [
  { month: "Jan", revenue: 180 },
  { month: "Feb", revenue: 260 },
  { month: "Mar", revenue: 320 },
  { month: "Apr", revenue: 290 },
  { month: "May", revenue: 410 },
  { month: "Jun", revenue: 520 },
  { month: "Jul", revenue: 480 },
  { month: "Aug", revenue: 560 },
  { month: "Sep", revenue: 630 },
  { month: "Oct", revenue: 600 },
  { month: "Nov", revenue: 720 },
  { month: "Dec", revenue: 810 },
];
  const usersData = [
    { name: "Influencers", value: 3248 },
    { name: "Businesses", value: 412 },
    { name: "Communities", value: 186 },
  ];

  const COLORS = [
    "var(--color-primary)",
    "var(--color-secondary)",
    "var(--color-tertiary)",
  ];

  return (
    <div className="min-h-full bg-gray-50/10 text-primary">
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
          color="bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
        />

        <StatsCard
          title="Total Communities"
          number={186}
          compare={4}
          icon={Users}
          color="bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]"
        />

        <StatsCard
          title="Total Businesses"
          number={412}
          compare={6}
          icon={Briefcase}
          color="bg-[var(--color-tertiary)]/10 text-[var(--color-tertiary)]"
        />

        <StatsCard
          title="Platform Revenue"
          number="1,240,000"
          currency="ETB"
          compare={9}
          icon={Wallet}
          color="bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
        />
      </div>

      {/* Content */}
      <div className="mt-4 grid gap-4 max-w-full ">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-primary">
              Pending Approvals
            </h2>

            <p className="text-sm text-gray-400">
              New influencers, communities and businesses awaiting review
            </p>
          </div>

          <Table columns={columns} data={data} />
        </div>
        <div className="grid gap-4 lg:grid-cols-12">
          <div className=" space-y-3 lg:col-span-8 rounded-lg border border-gray-200 bg-white pt-5 shadow-sm">
            <h3 className="mb-4 ml-4 font-semibold">
              Yearly Revenue
            </h3>

            <ResponsiveContainer width="100%" className={"max-w-full"} height={220}>
              <BarChart data={revenueData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="revenue"
                  fill="var(--color-tertiary)"
                  radius={[5, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 lg:col-span-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-semibold">
              User Distribution
            </h3>

            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={usersData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={85}
                >
                  {usersData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              {usersData.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ background: COLORS[index] }}
                    />

                    {item.name}
                  </div>

                  <span className="font-medium">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}