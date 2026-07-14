import { useState } from "react";
import { ShoppingBag, Megaphone, TrendingUp, SlidersHorizontal, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CATEGORY_META = {
  Sales: {
    icon: ShoppingBag,
    bg: "bg-[#F5E3DC]",
    text: "text-[#8A3A1E]",
    chip: "bg-[#F5E3DC]/30 text-[#8A3A1E]",
  },
  Awareness: {
    icon: Megaphone,
    bg: "bg-[#DDEBEA]/50",
    text: "text-[#1F5C59]",
    chip: "bg-[#DDEBEA]/30 text-[#1F5C59]",
  },
  Growth: {
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
  const meta = CATEGORY_META[campaign.category];
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
          <p className="text-xs font-medium truncate">{campaign.name}</p>

          <span className="absolute -left-2.5 -top-2.5 w-5 h-5 rounded-full bg-[#FAF7F2]" />
          <span className="absolute -right-2.5 -top-2.5 w-5 h-5 rounded-full bg-[#FAF7F2]" />

          <div>
            <p className="text-[11px] mt-0.5">Earn per conversion</p>
            <p className="font-mono text-xl mt-0.5">
              {campaign.payout.toLocaleString()}
              <span className="text-xs text-gray-400 ml-1">ETB</span>
            </p>
            <p className="text-xs text-primary">by {campaign.brand}</p>
          </div>
        </div>

        <div className="relative flex flex-col flex-1 h-full items-end justify-between min-h-[80px]">
          <span className={`text-[10px] font-medium px-2 py-1 rounded-lg flex-shrink-0 ${meta.chip}`}>
            {campaign.category}
          </span>

          <button
            onClick={handleButtonClick}
            disabled={claimed}
            className={`text-sm font-medium px-5 py-2 rounded-lg transition-colors mt-auto ${
              claimed
                ? "text-primary cursor-default"
                : "bg-green-500 text-white hover:bg-[#163829] cursor-pointer"
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
  const [activeFilter, setActiveFilter] = useState("All");
  const [claimedIds, setClaimedIds] = useState([]);

  const visible = CAMPAIGNS.filter(
    (c) => activeFilter === "All" || c.category === activeFilter
  );

  const handleClaim = (id) => {
    setClaimedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return (
    <div className="min-h-full bg-white flex justify-center ">
      <div className="w-full ">
        <div className="flex items-center justify-between mb-1 border-b border-gray-200 pb-3">
          <div>
            <h1 className="text-2xl text-[#2B2620]">Campaigns</h1>
            <p className="text-xs text-[#8B8577] mt-0.5">
              {visible.length} open right now
            </p>
          </div>
          <button
            aria-label="Filter campaigns"
            className="w-9 h-9 rounded-full border border-[#E7E1D4] flex items-center justify-center bg-[#FFFDF9]"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#2B2620]" strokeWidth={1.75} />
          </button>
        </div>

        <div className="flex gap-2 my-5 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`text-sm px-4 py-1.5 rounded-full whitespace-nowrap transition-colors ${activeFilter === f
                ? "bg-primary text-white"
                : "bg-primary/10 text-[#5C574C] border border-[#E7E1D4]"
                }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {visible.map((c) => (
            <TicketCard
              key={c.id}
              campaign={c}
              claimed={claimedIds.includes(c.id)}
              onClaim={handleClaim}
            />
          ))}
          {visible.length === 0 && (
            <p className="text-sm text-[#8B8577] text-center py-8">
              No campaigns in this category yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}