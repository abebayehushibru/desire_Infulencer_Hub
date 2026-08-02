import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  DollarSign,
  Building2,
  Calendar,
  Link2,
  MapPin,
  Users,
  Loader2,
} from "lucide-react";
import useApi from "../../hooks/useApi";

const STATUS_STYLES = {
  approved: "bg-emerald-50 text-emerald-600",
  active: "bg-emerald-50 text-emerald-600",
  pending: "bg-yellow-50 text-yellow-700",
  draft: "bg-gray-100 text-gray-600",
  rejected: "bg-red-50 text-red-500",
  completed: "bg-blue-50 text-blue-600",
};

const TYPE_LABELS = {
  sales: "Sales Campaign",
  awareness: "Awareness Campaign",
  growth: "Growth Campaign",
};

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "0";
  return Number(value).toLocaleString("en-US");
};

const parseJsonSafe = (str, fallback = []) => {
  if (!str) return fallback;
  try {
    const parsed = JSON.parse(str);
    return typeof parsed === "string" ? JSON.parse(parsed) : parsed;
  } catch {
    return fallback;
  }
};

const MobileOverview = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const claimApi = useApi({
    request: (id) => ({
      method: "POST",
      path: `/campaigns/claim/${id}`,
      data: {},
      successMsg: "Campaign claimed successfully",
    }),
    manual: true,
  });
  const getCampaignApi = useApi({
    request: () => ({ method: "GET", path: `/campaigns/${id}`, manual: true }),
  });

  useEffect(() => {
    if (!id) return;

    (async () => {
      const res = await getCampaignApi.execute();
      const payload = res?.data?.data || res?.data;
      if (res?.success && payload) {
        setCampaign(payload);
      }
    })();
  }, [id]);
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
  if (getCampaignApi.loading || !campaign) {
    return (
      <div className="flex w-full max-w-md mx-auto p-4">
        <div className="w-full rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
            <Loader2 size={28} className="animate-spin text-primary" />
            <span className="text-sm">Loading campaign…</span>
          </div>
        </div>
      </div>
    );
  }

  const {
    title,
    description,
    type,
    status,
    conversion_rate,
    amount,
    commission_rule_type,
    commission_value,
    business,
    influencer,
    community,
    target_type,
    start_date,
    end_date,
    run_type,
    platforms,
    locations,
    ethiopia_locations,
    total_budget,
  } = campaign;

  const activePlatforms = Object.entries(parseJsonSafe(platforms, {}))
    .filter(([, enabled]) => enabled)
    .map(([name]) => name);

  const targetName =
    target_type === "influencer"
      ? influencer?.name_or_company_name
      : community?.name_or_company_name || community?.name;



  const isCommissionBased = conversion_rate?true:false;
  const earnAmount =amount||conversion_rate;
  const earnUnit = isCommissionBased ? "%"
      : "ETB"
  const earnLabel = !isCommissionBased ? "commission" : "per conversion";

  const statusStyle = STATUS_STYLES[status?.toLowerCase()] || "bg-gray-100 text-gray-600";
  const canDecide = status === "pending";

  return (
    <div className="w-full max-w-md mx-auto md:p-4 pt-4 sm:max-w-lg">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes countUp {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-in { animation: fadeSlideUp 0.45s ease-out both; }
        .animate-in-delay-1 { animation: fadeSlideUp 0.45s ease-out 0.08s both; }
        .animate-in-delay-2 { animation: fadeSlideUp 0.45s ease-out 0.16s both; }
        .animate-in-delay-3 { animation: fadeSlideUp 0.45s ease-out 0.24s both; }
        .animate-amount { animation: countUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
      `}</style>

      <div
        className="
          animate-in bg-white rounded-2xl border border-gray-100 p-5 shadow-sm
          transition-shadow duration-300 hover:shadow-md
          sm:p-7
        "
      >
        {/* Title */}
        {title && (
          <h2 className="text-sm font-semibold text-gray-500 mb-4 truncate">
            {title}
          </h2>
        )}

        {/* Price & Icon Header */}
        <div className="flex justify-between items-start">
          <div className="animate-amount">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
              Earn
            </p>
            <h1 className="text-4xl font-black mt-1 flex items-baseline sm:text-5xl">
              {formatCurrency(earnAmount)}
              <span className="text-lg font-bold text-gray-500 ml-1">
                {earnUnit}
              </span>
            </h1>
            <p className="text-gray-500 text-xs mt-0.5">{earnLabel}</p>
          </div>

          <div
            className="
              w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center
              shrink-0 transition-transform duration-300 hover:scale-105
              sm:w-14 sm:h-14
            "
          >
            <DollarSign className="text-primary" size={24} />
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap w-full gap-2 mt-5 animate-in-delay-1">
          <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
            {TYPE_LABELS[type] || (type ? `${type} Campaign` : "Campaign")}
          </span>
          <span
            className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize ${statusStyle}`}
          >
            {status || "Unknown"}
          </span>
          {run_type && (
            <span className="bg-gray-50 text-gray-500 text-xs font-semibold px-3 py-1.5 rounded-full capitalize">
              {run_type}
            </span>
          )}
        </div>

        {/* Description */}
        {description ? (
          <p className="my-5 text-gray-600 text-sm leading-relaxed animate-in-delay-1">
            {description}
          </p>
        ) : (
          <p className="my-5 text-gray-400 text-sm italic animate-in-delay-1">
            No description provided.
          </p>
        )}

        <div className="border-b border-gray-100 w-full" />

        {/* Information List */}
        <div className="py-5 space-y-4 animate-in-delay-2">
          <InfoItem
            icon={<Building2 size={18} className="text-gray-400" />}
            title="Business"
            value={business?.name_or_company_name || "—"}
          />

          {targetName && (
            <InfoItem
              icon={<Users size={18} className="text-gray-400" />}
              title={target_type === "influencer" ? "Influencer" : "Target Community"}
              value={targetName}
            />
          )}

          <InfoItem
            icon={<Calendar size={18} className="text-gray-400" />}
            title="Duration"
            value={`${formatDate(start_date)} - ${formatDate(end_date)}`}
          />

          {activePlatforms.length > 0 && (
            <InfoItem
              icon={<Link2 size={18} className="text-gray-400" />}
              title="Platforms"
              value={activePlatforms
                .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
                .join(", ")}
            />
          )}

          {locations && (
            <InfoItem
              icon={<MapPin size={18} className="text-gray-400" />}
              title="Locations"
              value={locations}
            />
          )}

          {total_budget && (
            <InfoItem
              icon={<DollarSign size={18} className="text-gray-400" />}
              title="Total Budget"
              value={`${formatCurrency(total_budget)} ETB`}
            />
          )}
        </div>

        {/* Action Buttons */}
        {canDecide && (
          <div className="pt-2 space-y-2.5 animate-in-delay-3">
            <button
              onClick={() => handleClaim(id)}
              disabled={claimApi.loading}
              className="
                w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary
                text-white font-bold text-sm shadow-md
                transition-transform duration-200
                hover:shadow-lg active:scale-[0.98]
              "
            >
              Claim Campaign
            </button>
            <button
            disabled={claimApi.loading}
              className="
                w-full py-3.5 rounded-xl border border-red-200 text-red-500
                font-semibold text-sm transition-colors duration-200
                hover:bg-red-50/70 active:bg-red-100/60
              "
            >
              Reject Campaign
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const InfoItem = ({ icon, title, value }) => (
  <div className="flex items-start justify-between gap-3 text-sm transition-colors duration-200 hover:bg-gray-50/60 -mx-2 px-2 py-1 rounded-lg">
    <div className="flex items-center gap-2.5 text-gray-500 min-w-0 shrink-0">
      {icon}
      <span className="font-medium truncate">{title}</span>
    </div>
    <span className="text-gray-900 font-semibold text-right truncate">{value}</span>
  </div>
);

export default MobileOverview;