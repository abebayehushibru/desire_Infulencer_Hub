import { useOutletContext } from "react-router-dom";
import { DollarSign, Building2, Calendar, Link2 } from 'lucide-react';

const MobileOverview = () => {
  const { campaign } = useOutletContext() || {};
  const details = campaign?.overview?.details || {};
  const metrics = campaign?.overview?.summary || {};

  const formatNumber = (value) => {
    const numericValue = Number(value || 0);
    if (Number.isNaN(numericValue)) return "0";
    return numericValue.toLocaleString();
  };

  const formatDate = (value) => {
    if (!value) return "Not set";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not set";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const missingValue = "Not available";

  return (
    <div className="p-4 w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        
        {/* Price & Icon Header */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
              Revenue
            </p>
            <h1 className="text-4xl font-black  mt-1 flex items-baseline">
              {formatNumber(metrics.revenue || campaign?.total_budget)}
              <span className="text-lg font-bold text-gray-500 ml-1">
                ETB
              </span>
            </h1>
            <p className="text-gray-500 text-xs mt-0.5">
              from this campaign
            </p>
          </div>

          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <DollarSign className="text-primary" size={24} />
          </div>
        </div>

        {/* Badges - Side-by-side or stacked on tiny screens */}
        <div className="flex flex-wrap w-full justify-between gap-2 mt-5">
          <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
            {campaign?.type ? `${campaign.type.charAt(0).toUpperCase()}${campaign.type.slice(1)} Campaign` : missingValue}
          </span>
          <span className="bg-emerald-50 text-emerald-600 text-xs font-semibold px-3 py-1.5 rounded-full">
            {campaign?.status || "Loading"}
          </span>
        </div>

        {/* Description - Fixed width for mobile sizing */}
        <p className="my-5 text-gray-600 text-sm leading-relaxed w-3/4">
          {campaign?.description || "Campaign details will appear here once loaded from the backend."}
        </p>

        <div className="border-b border-gray-100 w-full" />

        {/* Information List */}
        <div className="py-5 space-y-4">
          <InfoItem
            icon={<Building2 size={18} className="text-gray-400" />}
            title="Business"
            value={campaign?.business?.name_or_company_name || missingValue}
          />
          <InfoItem
            icon={<Building2 size={18} className="text-gray-400" />}
            title="Target"
            value={details.targetLabel || missingValue}
          />
          <InfoItem
            icon={<Calendar size={18} className="text-gray-400" />}
            title="Duration"
            value={`${formatDate(campaign?.start_date)} - ${formatDate(campaign?.end_date)}`}
          />
          <InfoItem
            icon={<Link2 size={18} className="text-gray-400" />}
            title="Tracking"
            value={campaign?.overview?.details?.trackingLink || campaign?.tracking_link || campaign?.tracking_url || campaign?.overview?.trackingLink || missingValue}
          />
        </div>

        {/* Action Buttons - Tall, tappable touch zones */}
        <div className="pt-2 space-y-2.5">
          <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm shadow-md active:scale-[0.99] transition-transform">
            {campaign?.status === "active" ? "Open Campaign" : "View Campaign"}
          </button>
          <button className="w-full py-3.5 rounded-xl border border-red-200 text-red-500 font-semibold text-sm active:bg-red-50/50 transition-colors">
            Reject Campaign
          </button>
        </div>

      </div>
    </div>
  );
};

// Extracted InfoItem component for cleaner mobile structure
const InfoItem = ({ icon, title, value }) => (
  <div className="flex flex-col items-start  gap-1 text-sm">
    <div className="flex items-center gap-2.5 text-gray-500 min-w-0">
      {icon}
      <span className="font-medium truncate">{title}</span>
    </div>
    <span className="text-gray-900 font-semibold text-right truncate pl-2">
      {value}
    </span>
  </div>
);

export default MobileOverview;
