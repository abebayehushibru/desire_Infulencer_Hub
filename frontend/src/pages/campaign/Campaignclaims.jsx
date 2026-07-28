import { useEffect, useMemo, useState } from "react";
import { ShoppingBag, Megaphone, TrendingUp, SlidersHorizontal, Check ,User, Users} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useApi from "../../hooks/useApi";

const CATEGORY_META = {
  sales: {
    icon: ShoppingBag,
    bg: "bg-[#F5E3DC]",
    text: "text-[#8A3A1E]",
    chip: "bg-[#F5E3DC]/30 text-[#8A3A1E]",
  },
  awareness: {
    icon: Megaphone,
    bg: "bg-[#DDEBEA]/50",
    text: "text-[#1F5C59]",
    chip: "bg-[#DDEBEA]/30 text-[#1F5C59]",
  },
  growth: {
    icon: TrendingUp,
    bg: "bg-tertiary/5",
    text: "text-[#4A3679]",
    chip: "bg-[#E7E1F0]/30 text-[#4A3679]",
  },
};

const CAMPAIGNS = [
  { id: 1, name: "Online English Course", brand: "Dasire Online School", category: "Sales", payout: 500 },
  { id: 2, name: "Addis Tech Event 2024", brand: "Tech Addi", category: "Awareness", payout: 300 },
  { id: 3, name: "New Shoes Collection", brand: "Shoe Store", category: "Sales", payout: 450 },
  { id: 4, name: "TikTok Followers Boost", brand: "Trendy Shop", category: "Growth", payout: 200 },
];

const FILTERS = ["All", "Sales", "Awareness", "Growth"];

function TicketCard({ campaign, claimed, onClaim }) {
  const meta = CATEGORY_META[campaign?.type];
  const navigate = useNavigate();
  const Icon = meta.icon;

  const handleNavigate = () => {
    navigate(`/campaigns/${campaign.id}`);
  };

  const handleButtonClick = (e) => {
    e.stopPropagation(); // Prevents navigation from triggering
    if (!claimed) {
      onClaim(campaign.id);
    }
  };
  const isCommunity = campaign.target_type === "community";
  const targetBadge = {
    icon: isCommunity ? Users : User,
    label: isCommunity ? "Community" : "Influencer",
    bg: isCommunity ? "bg-blue-50" : "bg-amber-50",
    text: isCommunity ? "text-blue-600" : "text-amber-600",
  };
  const TargetIcon = targetBadge.icon;

  return (
    <div
      onClick={handleNavigate}
      className="relative bg-white shadow-md border border-gray-200 rounded-lg overflow-hidden cursor-pointer"
    >
      <div className="flex h-full items-start gap-3 px-4 pt-4 pb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
          <Icon className={`w-5 h-5 ${meta.text}`} strokeWidth={1.75} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-medium truncate">{campaign.title}</p>
            <span
              className={`flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${targetBadge.bg} ${targetBadge.text}`}
            >
              <TargetIcon className="w-2.5 h-2.5" strokeWidth={2} />
              {targetBadge.label}
            </span>
          </div>

          <span className="absolute -left-2.5 -top-2.5 w-5 h-5 rounded-full bg-[#FAF7F2]" />
          <span className="absolute -right-2.5 -top-2.5 w-5 h-5 rounded-full bg-[#FAF7F2]" />

          <div>
            <p className="text-[10px] ">Earn per conversion</p>
            <p className="font-semibold text-lg mt-0.5">
              {campaign.amount?.toLocaleString()}
              <span className="text-xs text-gray-400 ml-1">ETB</span>
            </p>
            <p className="text-[10px] text-primary">by {campaign.business?.name_or_company_name}</p>
          </div>
        </div>

        <div className="relative flex flex-col flex-1 h-full items-end justify-between min-h-[80px]">
          <span className={`text-[10px] font-medium px-2 py-1 rounded-lg flex-shrink-0 ${meta.chip}`}>
            {campaign.category}
          </span>

          <button
            onClick={handleButtonClick}
            disabled={claimed}
            className={`text-sm font-medium px-5 py-2 rounded-lg transition-colors mt-auto ${claimed
              ? "text-primary cursor-default"
              : "bg-tertiary text-white hover:bg-primary cursor-pointer"
              }`}
          >
            {claimed ? (
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4" strokeWidth={2} />
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
  const [pagination, setPagination] = useState({
    hasNext: false,
    hasPrev: false,
    limit: 10,
    page: 1,
    total: 0,
    totalPages: 0
  });
  const fetchCampaigns = async () => {
    const params = {};

    if (activeFilter !== "All") {
      params.type = activeFilter.toLowerCase();
    }

    const res = await campaignsApi.execute(params);
    if (res?.success) {
      setCampaigns(res.data?.data?.items || []);
      setPagination(res.data?.data?.pagination || []);

    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [activeFilter]);

  const handleClaim = async (campaignId) => {
    const res = await claimApi.execute(campaignId);

    if (res?.success) {
      setCampaigns((prev) =>
        prev.map((item) =>
          item.id === campaignId
            ? {
              ...item,
              is_claimed: true,
              claim_status: "pending",
            }
            : item
        )
      );
    }
  };

  const visible = useMemo(() => {
    if (activeFilter === "All") return campaigns;

    return campaigns?.filter(
      (c) => c.type?.toLowerCase() === activeFilter.toLowerCase()
    );
  }, [campaigns, activeFilter]);

  return (
    <div className="min-h-full bg-white flex justify-center sm:p-4 sm:rounded-lg">
      <div className="w-full">
        <div className="flex items-center justify-between mb-1 border-b border-gray-200 pb-3">
          <div>
            <h1 className="text-xl font-semibold text-primary">
              Campaigns
            </h1>

            <p className="text-xs text-gray-400">
              {visible.length} campaign(s)
            </p>
          </div>

          <button
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 my-3 overflow-x-auto">
          {FILTERS.map((item) => (
            <button
              key={item}
              onClick={() => setActiveFilter(item)}
              className={`px-4 py-1.5 rounded-full text-sm transition ${activeFilter === item
                ? "bg-primary text-white"
                : "bg-primary/10 border border-gray-200"
                }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Loading */}
        {campaignsApi.loading && (
          <div className="py-16 text-center text-gray-500">
            Loading campaigns...
          </div>
        )}

        {/* Campaign List */}
        {!campaignsApi.loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns?.map((campaign) => (
              <TicketCard
                key={campaign.id}
                campaign={campaign}
                claimed={campaign.is_claimed}
                loading={
                  claimApi.loading &&
                  claimApi.requestData === campaign.id
                }
                onClaim={() => handleClaim(campaign.id)}
              />
            ))}

            {campaigns.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500">
                No campaigns found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

