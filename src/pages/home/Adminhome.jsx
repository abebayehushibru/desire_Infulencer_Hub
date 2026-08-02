import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserCheck, Users, Briefcase, Wallet } from "lucide-react";

import Table, { ActionMenu } from "../../components/common/Table";

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import StatsCard from "../../components/common/StatsCard.";
import { useAuth } from "../../contexts/AuthContext";
import useApi from "../../hooks/useApi";
import PageLoader from "../../components/PageLoader";
export default function AdminHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const [active, setActive] = useState(false);

  // Load the dashboard data.
  const dashboardApi = useApi({
    request: () => ({
      method: "GET",
      path: `/dashboard`,
    }),
  });


  useEffect(() => {
    dashboardApi.execute();
  }, [user.id]);

  console.log("dashboardApi", dashboardApi.data);
  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 17
        ? "Good Afternoon"
        : hour < 21
          ? "Good Evening"
          : "Good Night";

  const greetingEmoji = hour < 12 ? "☀️" : hour < 17 ? "🌤️" : hour < 21 ? "🌇" : "🌙";

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
  const dashboard = dashboardApi?.data?.data;
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


  if (dashboardApi.loading) {
    return <PageLoader label="Loading dashboard..." />;
  }

  if (!dashboard) {
    return null;
  }

  const { role, stats, recentCampaigns } = dashboard;
  return (
    <div className="min-h-full bg-gray-50/10 text-primary">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
          animation: fadeSlideUp 0.5s ease-out both;
        }
      `}</style>

     
      <div
        className="
          mb-6 flex flex-col gap-4 rounded-2xl
          bg-gradient-to-br from-primary to-primary/80
          p-5 text-white shadow-md shadow-primary/20
          sm:flex-row sm:items-center sm:justify-between
          animate-in
        "
      >
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">
            Good Morning, {user?.name_or_company_name}! ☀️
          </h1>

          <p className="text-gray-300 mt-1">
            Welcome back. Here's what's happening today.
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-xl bg-white/10 px-4 py-2 text-sm backdrop-blur-sm">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-300" />
            {data.filter((d) => d.status === "Pending").length} pending review
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Businesses"
          number={stats.totalBusinesses}
        />

        <StatsCard
          title="Influencers"
          number={stats.totalInfluencers}
        />

        <StatsCard
          title="Agents"
          number={stats.totalAgents}
        />

        <StatsCard
          title="Campaigns"
          number={stats.totalCampaigns}
        />

        <StatsCard
          title="Active Campaigns"
          number={stats.activeCampaigns}
        />

        <StatsCard
          title="Pending Campaigns"
          number={stats.pendingCampaigns}
        />

        <StatsCard
          title="Communities"
          number={stats.totalCommunities}
        />

       

        <StatsCard
          title="Conversions"
          number={stats.totalConversions}
        />
      </div>

      {/* Content */}
      <div className="mt-4 grid w-full gap-4">
        {/* Pending approvals */}
        <div
          className="
            rounded-2xl border border-gray-200 bg-white
            p-4 shadow-sm transition-shadow duration-300 hover:shadow-md
            sm:p-6
            animate-in
          "
          style={{ animationDelay: "320ms" }}
        >
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-primary">Pending Approvals</h2>
            <p className="text-sm text-gray-400">
              New influencers, communities and businesses awaiting review
            </p>
          </div>

          {/* Desktop / tablet table */}
          <div className="hidden overflow-x-auto sm:block">
            <Table columns={columns} data={data} />
          </div>

          {/* Mobile card list */}
          <div className="flex flex-col gap-3 sm:hidden">
            {data.map((row, index) => (
              <div
                key={row.id}
                className="
                  rounded-xl border border-gray-100 bg-gray-50/60 p-4
                  transition-colors duration-200 active:bg-gray-100
                "
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary">{row.name}</p>
                    <p className="text-xs text-gray-400">{row.email}</p>
                  </div>
                  <ActionMenu
                    onEdit={() => navigate(`/admin/review/${row.id}`)}
                    onDelete={() => console.log("Reject", row)}
                    index={index}
                    active={active}
                    setActive={setActive}
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">
                    {row.type}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${row.status === "Approved"
                        ? "bg-green-100 text-green-600"
                        : row.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-600"
                      }`}
                  >
                    {row.status}
                  </span>
                </div>

                <div className="mt-3 border-t border-gray-100 pt-3 text-xs text-gray-400">
                  Submitted {row.submitted}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts — desktop/tablet: side by side */}
        <div
          className="hidden gap-4 lg:grid lg:grid-cols-12 animate-in"
          style={{ animationDelay: "400ms" }}
        >
          <div className="space-y-3 rounded-lg border border-gray-200 bg-white pt-4 shadow-sm transition-shadow duration-300 hover:shadow-md lg:col-span-8">
            <h3 className="mb-4 ml-4 font-semibold">Yearly Revenue</h3>

            <ResponsiveContainer width="100%" className="max-w-full" height={220}>
              <BarChart data={revenueData}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #eee",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
                <Bar
                  dataKey="revenue"
                  fill="var(--color-tertiary)"
                  radius={[6, 6, 0, 0]}
                  animationDuration={900}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md lg:col-span-4">
            <h3 className="mb-4 font-semibold">User Distribution</h3>

            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={usersData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={85}
                  animationDuration={900}
                  animationEasing="ease-out"
                >
                  {usersData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #eee",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              {usersData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ background: COLORS[index] }}
                    />
                    {item.name}
                  </div>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts — mobile: stacked, compact */}
        <div className="flex flex-col gap-4 lg:hidden">
          <div
            className="animate-in rounded-lg border border-gray-200 bg-white p-4 pt-4 shadow-sm"
            style={{ animationDelay: "400ms" }}
          >
            <h3 className="mb-3 font-semibold">Yearly Revenue</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={revenueData}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} interval={1} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, fontSize: 12 }}
                />
                <Bar
                  dataKey="revenue"
                  fill="var(--color-tertiary)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div
            className="animate-in rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            style={{ animationDelay: "480ms" }}
          >
            <h3 className="mb-3 font-semibold">User Distribution</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={usersData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={70}
                >
                  {usersData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-3 space-y-2">
              {usersData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ background: COLORS[index] }}
                    />
                    {item.name}
                  </div>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}