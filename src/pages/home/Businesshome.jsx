import { Megaphone, Target, DollarSign, Wallet, Plus, ArrowUpRight } from "lucide-react";
import Table, { ActionMenu } from "../../components/common/Table";
import StatsCard from "../../components/common/StatsCard.";

import { useEffect, useState } from "react";
import Button from "../../components/common/Button";
import { useNavigate } from "react-router-dom";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../contexts/AuthContext";

export default function BusinessHome() {
  const {user} = useAuth();
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const [active, setActive] = useState(false);
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
      label: "Per / Conversions",
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
          onView={() =>{if ( ["Active", "Accepted", "Completed"].includes(row.status) ) navigate(`/campaigns/${row.id}`)}}
        
          index={index}
          active={active}
          setActive={setActive}
        />
      ),
    },
  ];


  const stats = [
    {
      title: "Active Campaigns",
      number: dashboardApi.data?.data?.stats?.activeCampaigns || 0,
      compare: 12,
      icon: Megaphone,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total Conversions",
      number: dashboardApi.data?.data?.stats?.totalConversions || 0,
      compare: 3,
      icon: Target,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "Total Earnings",
      number: dashboardApi.data?.data?.stats?.totalEarnings || 0,
      currency: "ETB",
      compare: 5,
      icon: Wallet,
      color: "bg-violet-100 text-violet-600",
    },
    {
      title: "Total Spent",
      number: dashboardApi.data?.data?.stats?.totalSpend || 0,
      currency: "ETB",
      compare: 5,
      icon: Wallet,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  const data = dashboardApi.data?.data?.recentCampaigns?.map((item) => ({
  id: item.id,
  campaign: item.title,
  type: item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : "N/A",
  status: item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : "N/A",
  target: item.target_type || "N/A",
  conversion: item.conversion_rate ? `${item.conversion_rate}%` : `${item.amount} ETB`,
  spend: item.total_budget_used ? parseFloat(item.total_budget_used).toFixed(2) : "0.00"
}));

  return (
    <div className="min-h-full bg-gray-50/10 text-primary pb-20 md:pb-0">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popScale {
          0% { transform: scale(0.85); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-in {
          animation: fadeSlideUp 0.5s ease-out both;
        }
      `}</style>

      {/* Greeting */}
      <div
        className="
          mb-6 flex flex-col gap-4 rounded-2xl
          bg-gradient-to-br from-primary to-primary/80
          p-5 text-white shadow-md shadow-primary/20
          sm:flex-row sm:items-center sm:justify-between
          animate-in
        "
      >
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">
            {greeting}, Desire! <span className="align-middle">{greetingEmoji}</span>
          </h1>
          <p className="mt-1 text-sm text-white/80">
            Here's what's happening in your campaigns.
          </p>
        </div>

        <Button
          className="
            hidden w-fit items-center gap-1.5 rounded-xl
            !bg-white/15 px-4 py-2 text-sm font-medium text-white
            backdrop-blur-sm transition-all duration-200
            hover:!bg-white/25 active:scale-95
            sm:flex
          "
          leftIcon={<Plus size={18} />}
          onClick={() => navigate("/campaigns/create")}
        >
          Create Campaign
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.title}
            className="animate-in transition-transform duration-200 hover:-translate-y-1"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <StatsCard
              title={stat.title}
              number={stat.number}
              currency={stat.currency}
              compare={stat.compare}
              icon={stat.icon}
              color={stat.color}
            />
          </div>
        ))}
      </div>

      {/* Content */}
      <div
        className="
          mt-4 rounded-2xl border border-gray-200 bg-white
          p-4 shadow-sm transition-shadow duration-300 hover:shadow-md
          sm:p-6
          animate-in
        "
        style={{ animationDelay: "320ms" }}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-primary">Recent Campaigns</h2>
            <p className="text-sm text-gray-400">Your latest campaign activity</p>
          </div>

          <button
            onClick={() => navigate("/campaigns")}
            className="hidden shrink-0 text-sm font-medium text-primary hover:underline sm:block"
          >
            See all
          </button>
        </div>

        {/* Desktop / tablet table */}
        <div className="hidden overflow-x-auto sm:block">
          <Table columns={columns} data={data} />
        </div>

        {/* Mobile card list */}
        <div className="flex flex-col gap-3 sm:hidden">
          {data?.map((row, index) => (
            <div

            onClick={() => {
              if ( ["Active", "Accepted", "Completed"].includes(row.status) ) navigate(`/campaigns/${row.id}`)
            }}
              key={row.id}
              className="
                rounded-xl border cursor-pointer border-gray-100 bg-gray-50/60 p-4
                transition-colors duration-200 active:bg-gray-100
              "
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">{row.campaign}</p>
                  <p className="text-xs text-gray-400">{row.type} Campaign</p>
                </div>
               
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">
                  {row.type}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    row.status === "Active"
                      ? "bg-green-100 text-green-600"
                      : row.status === "Draft"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {row.status}
                </span>
                <span className="text-xs text-gray-400">Target: {row.target}</span>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-sm font-semibold tabular-nums text-primary">
                  {row.conversion} <span className="text-xs font-normal text-gray-400">conv.</span>
                </span>
                <span className="text-sm font-semibold tabular-nums text-primary">
                  {row.spend} <span className="text-xs uppercase text-gray-400">Etb</span>
                </span>
              </div>
            </div>
          ))}

          <button
            onClick={() => navigate("/campaigns")}
            className="mt-1 text-center text-sm font-medium text-primary hover:underline"
          >
            See all campaigns
          </button>
        </div>
      </div>

      {/* Mobile floating action button */}
      <button
        onClick={() => navigate("/campaigns/create")}
        className="
          fixed bottom-20 right-5 z-40
          flex h-14 w-14 items-center justify-center
          rounded-full bg-primary text-white shadow-lg shadow-primary/30
          transition-transform duration-200
          hover:scale-105 active:scale-90
          sm:hidden
        "
        style={{ animation: "popScale 0.4s ease-out 0.5s both" }}
        aria-label="Create campaign"
      >
        <ArrowUpRight size={0} className="hidden" />
        <Plus size={24} />
      </button>
    </div>
  );
}