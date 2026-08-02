import { useEffect, useMemo, useState } from "react";
import {
  ShoppingBag,
  Megaphone,
  TrendingUp,
  SlidersHorizontal,
  Check,
  User,
  Users,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useApi from "../../hooks/useApi";

const CATEGORY_META = {
  sales: {
    label: "Sales",
    icon: ShoppingBag,
    bg: "bg-[#F5E3DC]",
    text: "text-[#8A3A1E]",
    chip: "bg-[#F5E3DC]/60 text-[#8A3A1E]",
  },
  awareness: {
    label: "Awareness",
    icon: Megaphone,
    bg: "bg-[#DDEBEA]/50",
    text: "text-[#1F5C59]",
    chip: "bg-[#DDEBEA]/60 text-[#1F5C59]",
  },
  growth: {
    label: "Growth",
    icon: TrendingUp,
    bg: "bg-tertiary/5",
    text: "text-[#4A3679]",
    chip: "bg-[#E7E1F0]/60 text-[#4A3679]",
  },
};

const DEFAULT_META = {
  label: "Campaign",
  icon: Megaphone,
  bg: "bg-gray-100",
  text: "text-gray-500",
  chip: "bg-gray-100 text-gray-500",
};

const FILTERS = ["All", "Sales", "Awareness", "Growth"];

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-100" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-2/3 rounded bg-gray-100" />
          <div className="h-2 w-1/3 rounded bg-gray-100" />
          <div className="mt-3 h-5 w-1/2 rounded bg-gray-100" />
          <div className="h-2 w-1/3 rounded bg-gray-100" />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="h-5 w-16 rounded-full bg-gray-100" />
        <div className="h-8 w-20 rounded-lg bg-gray-100" />
      </div>
    </div>
  );
}

function TicketCard({ campaign, claimed, claiming, onClaim }) {
  const navigate = useNavigate();
  const meta = CATEGORY_META[campaign?.type?.toLowerCase()] || DEFAULT_META;
  const Icon = meta.icon;

  const handleNavigate = () => navigate(`/campaigns/${campaign.id}`);

  const handleButtonClick = (e) => {
    e.stopPropagation();
    if (!claimed && !claiming) onClaim(campaign.id);
  };

  const isCommunity = campaign.target_type === "community";
  const targetBadge = {
    icon: isCommunity ? Users : User,
    label: isCommunity ? "Community" : "Influencer",
    bg: isCommunity ? "bg-blue-50" : "bg-amber-50",
    text: isCommunity ? "text-blue-600" : "text-amber-600",
  };
  const TargetIcon = targetBadge.icon;

  const amount = campaign.amount ?? 0;
  const conversionRate = campaign.conversion_rate ?? 0;
  return (
    <div
      onClick={handleNavigate}
      className="
        group relative cursor-pointer overflow-hidden rounded-lg border border-gray-200
        bg-white shadow-md transition-all duration-200
        hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg
      "
    >
      <div className="flex h-full items-start gap-3 px-4 pb-3 pt-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${meta.bg}`}
        >
          <Icon className={`h-5 w-5 ${meta.text}`} strokeWidth={1.75} />
        </div>

        <div className="relative min-w-0 flex-1">

          <div className="flex items-center gap-1.5 z-10">
            <span className="absolute -left-2.5 -top-2.5 h-5 w-10 rounded-full bg-[#FAF7F2]" />
            <p className="truncate z-50 text-xs font-medium">{campaign.title}</p>

          </div>


          <span className="absolute -right-2.5 -top-2.5 h-5 w-5 rounded-full bg-[#FAF7F2]" />

          <div>
            <p className="text-[10px] text-gray-400">Earn per conversion</p>
            <p className="mt-0.5 text-lg font-semibold">
              {conversionRate ? (
                <>
                  {conversionRate}
                  <span className="ml-1 text-xs text-gray-400">%</span>
                </>
              ) : null}

              {amount ? (
                <>
                  {" "}
                  {amount}
                  <span className="ml-1 text-xs text-gray-400">ETB</span>
                </>
              ) : null}
            </p>

            <p className="truncate text-[10px] text-primary">
              by {campaign.business?.name_or_company_name || "Unknown business"} <span
                className={`flex flex-shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${targetBadge.bg} ${targetBadge.text}`}
              >
                <TargetIcon className="h-2.5 w-2.5" strokeWidth={2} />
                {targetBadge.label}
              </span>
            </p>
          </div>
        </div>

        <div className="relative flex h-full min-h-[80px] flex-1 flex-col items-end justify-between">
          <span className={`flex-shrink-0 rounded-lg px-2 py-1 text-[10px] font-medium ${meta.chip}`}>
            {meta.label}
          </span>

          <button
            onClick={handleButtonClick}
            disabled={claimed || claiming}
            className={`
              mt-auto flex min-w-[84px] items-center justify-center rounded-lg
              px-5 py-2 text-sm font-medium transition-all duration-200
              ${claimed
                ? "cursor-default text-primary"
                : claiming
                  ? "cursor-wait bg-tertiary/60 text-white"
                  : "bg-tertiary text-white hover:bg-primary active:scale-95"
              }
            `}
          >
            {claiming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : claimed ? (
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4" strokeWidth={2} />
                Claimed
              </span>
            ) : (
              "Claim"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CampaignClaim() {
  const campaignsApi = useApi({
    request: (query) => ({
      method: "GET",
      path: "/campaigns/claims",
      query,
    }),
    manual: true,
  });

  const claimApi = useApi({
    request: (id) => ({
      method: "POST",
      path: `/campaigns/claim/${id}`,
      data: {},
      successMsg: "Campaign claimed successfully",
    }),
    manual: true,
  });

  const [campaigns, setCampaigns] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [claimingId, setClaimingId] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    hasNext: false,
    hasPrev: false,
    limit: 10,
    page: 1,
    total: 0,
    totalPages: 0,
  });

  const fetchCampaigns = async () => {
    const params = { page };

    if (activeFilter !== "All") {
      params.type = activeFilter.toLowerCase();
    }

    const res = await campaignsApi.execute(params);
    if (res?.success) {
      setCampaigns(res.data?.data?.items || []);
      setPagination(
        res.data?.data?.pagination || {
          hasNext: false,
          hasPrev: false,
          limit: 10,
          page: 1,
          total: 0,
          totalPages: 0,
        }
      );
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [activeFilter, page]);

  useEffect(() => {
    setPage(1);
  }, [activeFilter]);

  const handleClaim = async (campaignId) => {
    setClaimingId(campaignId);
    const res = await claimApi.execute(campaignId);

    if (res?.success) {
      setCampaigns((prev) =>
        prev.map((item) =>
          item.id === campaignId
            ? { ...item, is_claimed: true, claim_status: "pending" }
            : item
        )
      );
    }
    setClaimingId(null);
  };

  // Server already filters by type via query param; this is a client-side
  // safety net in case the API returns unfiltered results.
  const visible = useMemo(() => {
    if (activeFilter === "All") return campaigns;
    return campaigns?.filter(
      (c) => c.type?.toLowerCase() === activeFilter.toLowerCase()
    );
  }, [campaigns, activeFilter]);

  const isLoading = campaignsApi.loading;
  const isEmpty = !isLoading && visible.length === 0;

  return (
    <div className="min-h-full bg-white flex justify-center sm:rounded-lg sm:p-4">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in { animation: fadeSlideUp 0.4s ease-out both; }
      `}</style>

      <div className="w-full">
        {/* Header */}
        <div className="mb-1 flex items-center justify-between border-b border-gray-200 pb-3">
          <div>
            <h1 className="text-xl font-semibold text-primary">Campaigns</h1>
            <p className="text-xs text-gray-400">
              {isLoading ? "Loading…" : `${pagination.total ?? visible.length} campaign(s)`}
            </p>
          </div>

          <button
            className="
              flex h-9 w-9 items-center justify-center rounded-full
              border border-gray-200 transition-colors duration-200
              hover:bg-gray-50 active:scale-95
            "
            aria-label="Filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="my-3 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((item) => (
            <button
              key={item}
              onClick={() => setActiveFilter(item)}
              className={`
                shrink-0 rounded-full px-4 py-1.5 text-sm font-medium
                transition-all duration-200 active:scale-95
                ${activeFilter === item
                  ? "bg-primary text-white shadow-sm"
                  : "border border-gray-200 bg-primary/5 text-gray-600 hover:bg-primary/10"
                }
              `}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Loading skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div className="animate-in flex flex-col items-center justify-center rounded-lg  border-gray-200 py-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
              <Search size={20} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">No campaigns found</p>
            <p className="mt-1 text-xs text-gray-400">
              {activeFilter === "All"
                ? "Check back soon for new campaigns."
                : `No ${activeFilter.toLowerCase()} campaigns right now — try another filter.`}
            </p>
          </div>
        )}

        {/* Campaign List */}
        {!isLoading && !isEmpty && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {visible.map((campaign, i) => (
                <div
                  key={campaign.id}
                  className="animate-in"
                  style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
                >
                  <TicketCard
                    campaign={campaign}
                    claimed={campaign.is_claimed}
                    claiming={claimingId === campaign.id}
                    onClaim={handleClaim}
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrev}
                  className="
                    flex h-9 w-9 items-center justify-center rounded-full border
                    border-gray-200 transition-colors duration-200
                    hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40
                  "
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                <span className="text-sm text-gray-500">
                  Page <span className="font-medium text-primary">{pagination.page}</span> of{" "}
                  {pagination.totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pagination.hasNext}
                  className="
                    flex h-9 w-9 items-center justify-center rounded-full border
                    border-gray-200 transition-colors duration-200
                    hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40
                  "
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}