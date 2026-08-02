import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Heart, Trophy, Wallet, ArrowUpRight } from "lucide-react";
import Table, { ActionMenu } from "../../components/common/Table";
import StatsCard from "../../components/common/StatsCard.";
import { Megaphone, Music2, Inbox, Play, ChevronRight } from "lucide-react";

import useApi from "../../hooks/useApi";

const PLATFORM_ICONS = {
  tiktok: Music2,
  instagram: Inbox,
  youtube: Play,
};
export default function InfluencerHome({ user }) {
  
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
      key: "title",
      label: "Campaign",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-primary">{value}</span>
          <span className="text-xs text-gray-400">{row.brand}</span>
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
      key: "status",
      label: "Status",
      render: (value) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${value === "Active"
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
      key: "total_budget",
      label: "Budget",
      render: (value) => (
        <span className="font-semibold tabular-nums text-primary">
          {value} <span className="text-xs uppercase text-gray-400">Etb</span>
        </span>
      ),
    },
    {
      key: "end_date",
      label: "Deadline",
       render: (value) => (
        <span className="">
          {value?.split("T")?.[0]}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
       render: (_, row, index) => (
        <ActionMenu
          onView={() =>{if ( ["active", "accepted", "completed"].includes(row.status) ) navigate(`/campaigns/${row.id}`)}}
        
          index={index}
          active={active}
          setActive={setActive}
        />
      ),
    },
  ];

  const data = dashboardApi.data?.data

  const stats = [
    {
      title: "Followers",
      number: data?.stats?.followers ||0,
      compare: 3.2,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Engagement",
      number: data?.stats?.engagement||0,
      compare: 0.6,
      icon: Heart,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "Campaigns",
        number: data?.stats?.campaigns||0,
      compare: 5,
      icon: Trophy,
      color: "bg-violet-100 text-violet-600",
    },
    {
      title: "Total Earnings",
          number: data?.stats?.totalEarnings,
      currency: "ETB",
      compare: 7,
      icon: Wallet,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="min-h-full bg-gradient-to-b from-primary/90 to-secondary/10   -m-4 -mt-4 p-4 text-primary">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
          animation: fadeSlideUp 0.5s ease-out both;
        }
      `}</style>

      {/* Greeting */}
      <div
        className="
          mb-4 flex flex-col gap-4 rounded-lg
          bg-gradient-to-br from-primary to-primary/80
          p-5 text-white shadow-md shadow-primary/20
          sm:flex-row sm:items-center sm:justify-between
          animate-in
        "
      >
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">
            {greeting}, {user?.name?.split(" ")?.[0] || "Influencer"}! <span className="align-middle">{greetingEmoji}</span>
          </h1>
          <p className="mt-1 text-xs text-white/80">
            Here's how your campaigns are performing today.
          </p>
        </div>

        <button
          onClick={() => navigate("/campaigns")}
          className="
            group flex w-fit items-center gap-1.5 self-start
            rounded-xl bg-white/15 px-4 py-2 text-sm font-medium
            backdrop-blur-sm transition-all duration-200
            hover:bg-white/25 active:scale-95
            sm:self-auto
          "
        >
          View campaigns
          <ArrowUpRight
            size={16}
            className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </button>
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
          mt-4 rounded-lg bg-white/80 p-4 shadow-md shadow-primary/20
          transition-all
          hover:shadow-lg hover:shadow-primary/30
          active:scale-[0.98] active:shadow-md active:shadow-primary/20
            duration-300
          sm:p-6
          animate-in
        "
        style={{ animationDelay: "320ms" }}
      >
        <div className="mb-4 flex items-start justify-between gap-3 -2 sm:p-0">
          <div>
            <h2 className="text-lg font-semibold text-primary">My Campaigns</h2>
            <p className="text-xs -mt-1 text-gray-400">Campaigns you're currently part of</p>
          </div>
          <button
            onClick={() => navigate("/campaigns")}
            className="hidden shrink-0 text-sm font-medium text-primary hover:underline sm:block"
          >
            See all
          </button>
        </div>

        {/* Desktop / tablet table */}
        <div className="hidden overflow-x-auto  sm:block">
          <Table columns={columns} data={data?.recentCampaigns||[]} />
        </div>

        {/* Mobile card list */}
        <div className="flex flex-col  gap-2 sm:hidden">
          <style>{`
    @keyframes cardIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `}</style>

          {data?.recentCampaigns?.map((row, index) => {
            const statusStyle =
              row.status === "active"|| row.status === "accepted"
                ? { dot: "bg-green-500", chip: "bg-green-50 text-green-600", bar: "bg-green-500" }
                : row.status === "completed"
                  ? { dot: "bg-blue-500", chip: "bg-blue-50 text-blue-600", bar: "bg-blue-500" }
                  : { dot: "bg-secondary", chip: "bg-secondary/10 text-gray-500", bar: "bg-secondary" };

            const PlatformIcon = PLATFORM_ICONS[row.platform?.toLowerCase()] || Megaphone;

            return (
              <div
                onClick={() => {
                  if ( ["active", "accepted", "completed"].includes(row.status) ) navigate(`/campaigns/${row.id}`)
                }}
                key={row.id}
                className="
          group relative overflow-hidden rounded-sm border border-gray-100 bg-white
          p-4 shadow-sm transition-all duration-200
          active:scale-[0.98] active:shadow-none
        "
                style={{ animation: `cardIn 0.4s ease-out ${380 + index * 80}ms both` }}
              >
                {/* Status accent bar */}
                <span className={`absolute left-0 top-0 h-full w-1 ${statusStyle.bar}`} />

                <div className="flex items-start justify-between gap-3 pl-1">
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className="
                flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
                bg-primary/5 text-primary transition-transform duration-200
                group-active:scale-95
              "
                    >
                      <PlatformIcon size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-primary">
                        {row.title}
                      </p>
                      <p className="truncate text-xs text-gray-400">{row.type}</p>
                    </div>
                  </div>


                  <span
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyle.chip}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full  ${statusStyle.dot}`} />
                    {row.status}
                  </span>

                </div>



                <div className="mt-1 flex items-center justify-between border-t border-gray-100 pl-2 pt-2">
                  <span className="text-xs text-gray-400">{row.end_date?.split('T')?.[0]}</span>
                  <span className="text-sm font-bold tabular-nums text-primary">
                    {row.total_budget} 
                    <span className="ml-1 text-[10px] font-medium uppercase text-gray-400">Etb</span>
                  </span>
                </div>
              </div>
            );
          })}

          <button
            onClick={() => navigate("/campaigns")}
            className="
      mt-1 flex items-center justify-center gap-1 rounded-xl py-1
      text-sm font-medium text-primary transition-colors duration-200
      hover:bg-primary/5 active:bg-primary/10
    "
          >
            See all campaigns
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}