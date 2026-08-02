// src/pages/campaign/Overview.jsx

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Calendar,
  Globe,
  Wallet,
  Target,
  Link2,
  Copy,
  Check,
  Users,
  Eye,
  MousePointerClick,
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  PauseCircle,
  Loader2,
} from "lucide-react";
import useApi from "../../hooks/useApi";

const STATUS_META = {
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    color: "text-green-600",
    desc: "Campaign is currently running.",
  },
  active: {
    label: "Active",
    icon: CheckCircle2,
    color: "text-green-600",
    desc: "Campaign is currently running.",
  },
  pending: {
    label: "Pending",
    icon: PauseCircle,
    color: "text-yellow-500",
    desc: "Awaiting approval.",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    color: "text-red-500",
    desc: "This campaign was rejected.",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    color: "text-blue-600",
    desc: "This campaign has ended.",
  },
};

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatNumber = (value) => {
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

const daysRemaining = (endDate) => {
  if (!endDate) return null;
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export default function Overview() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [copied, setCopied] = useState(false);

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

  if (getCampaignApi.loading || !campaign) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white py-24 text-gray-400">
        <Loader2 size={24} className="animate-spin text-primary" />
        <span className="text-sm">Loading campaign…</span>
      </div>
    );
  }

  const {
    title,
    type,
    status,
    conversion_rate,
    commission_value,
    amount,
    commission_rule_type,
    start_date,
    end_date,
    total_budget,
    total_budget_used,
    total_views,
    platforms,
    locations,
    ethiopia_locations,
    business,
  } = campaign;

  const activePlatforms = Object.entries(parseJsonSafe(platforms, {}))
    .filter(([, enabled]) => enabled)
    .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1));

  const allLocations = [
    ...parseJsonSafe(locations, []),
    ...parseJsonSafe(ethiopia_locations, []),
  ];

  const budgetTotal = Number(total_budget) || 0;
  const budgetUsed = Number(total_budget_used) || 0;
  const budgetRemaining = Math.max(0, budgetTotal - budgetUsed);
  const budgetPct = budgetTotal > 0 ? Math.min(100, Math.round((budgetUsed / budgetTotal) * 100)) : 0;

  const remaining = daysRemaining(end_date);
  const statusKey = status?.toLowerCase();
  const statusMeta = STATUS_META[statusKey] || {
    label: status || "Unknown",
    icon: Clock,
    color: "text-gray-500",
    desc: "Status information unavailable.",
  };
  const StatusIcon = statusMeta.icon;

  const earnAmount = amount ? amount : conversion_rate;
  const earnUnit = conversion_rate ? "%" : "ETB";

  const trackingLink = `https://desire.com/ref/${id?.slice(0, 8) || "CAMPAIGN"}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(trackingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const stats = [
    {
      title: "Views",
      value: formatNumber(total_views || 0),
      icon: Eye,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Clicks",
      value: "—",
      icon: MousePointerClick,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Conversions",
      value: "—",
      icon: ShoppingCart,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Est. Earnings",
      value: `${formatNumber(earnAmount)} ${earnUnit}`,
      icon: DollarSign,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div className="space-y-4 text-primary">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes growBar {
          from { width: 0%; }
        }
        .animate-in { animation: fadeSlideUp 0.45s ease-out both; }
      `}</style>

      {/* Title */}
      {title && (
        <div className="animate-in">
          <h1 className="text-xl font-bold">{title}</h1>
          {business?.name_or_company_name && (
            <p className="text-sm text-gray-400">{business.name_or_company_name}</p>
          )}
        </div>
      )}

      {/* ====================== */}
      {/* Statistics */}
      {/* ====================== */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((item, i) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="
                animate-in rounded-lg border border-gray-200 bg-white p-4
                transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md
              "
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{item.title}</p>
                  <h2 className="mt-2 text-xl font-bold text-primary">{item.value}</h2>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-200 hover:scale-105 ${item.color}`}
                >
                  <Icon size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ====================== */}
      {/* Campaign Information */}
      {/* ====================== */}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left */}
        <div
          className="
            animate-in rounded-lg border border-gray-200 bg-white p-6
            transition-shadow duration-300 hover:shadow-md
            lg:col-span-2
          "
          style={{ animationDelay: "150ms" }}
        >
          <h2 className="mb-4 text-lg font-semibold">Campaign Information</h2>

          <div className="grid gap-3 md:grid-cols-4">
            <Info icon={Target} title="Campaign Type" value={type ? type[0].toUpperCase() + type.slice(1) : "—"} />
            <Info icon={Globe} title="Platforms" value={activePlatforms.length ? activePlatforms.join(", ") : "—"} />
            <Info icon={Calendar} title="Start Date" value={formatDate(start_date)} />
            <Info icon={Calendar} title="End Date" value={formatDate(end_date)} />
            <Info icon={Wallet} title="Budget" value={`${formatNumber(budgetTotal)} ETB`} />
            <Info
              icon={Users}
              title="Locations"
              value={allLocations.length ? allLocations.join(", ") : "—"}
            />
          </div>

          {/* Progress */}
          {budgetTotal > 0 && (
            <div className="mt-6">
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-semibold">Budget Used</span>
                <span className="font-medium tabular-nums">{budgetPct}%</span>
              </div>

              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                  style={{ width: `${budgetPct}%`, animation: "growBar 1s ease-out" }}
                />
              </div>

              <div className="mt-3 flex justify-between text-sm text-gray-500">
                <span>{formatNumber(budgetUsed)} ETB Used</span>
                <span>{formatNumber(budgetRemaining)} ETB Remaining</span>
              </div>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="space-y-4">
          {/* Status */}
          <div
            className="animate-in rounded-lg border border-gray-200 bg-white p-4 transition-shadow duration-300 hover:shadow-md"
            style={{ animationDelay: "220ms" }}
          >
            <h2 className="mb-4 text-lg font-semibold">Campaign Status</h2>

            <div className="flex items-center gap-2">
              <StatusIcon className={statusMeta.color} size={20} />
              <div>
                <h4 className="text-sm font-semibold">{statusMeta.label}</h4>
                <p className="text-xs text-gray-500">{statusMeta.desc}</p>
              </div>
            </div>

            {remaining !== null && (statusKey === "approved" || statusKey === "active") && (
              <div className="mt-3 flex items-center gap-3">
                <Clock className="text-yellow-500" size={20} />
                <div>
                  <h4 className="text-sm font-medium">
                    {remaining} {remaining === 1 ? "Day" : "Days"} Remaining
                  </h4>
                  <p className="text-xs text-gray-500">Ends on {formatDate(end_date)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Tracking */}
          <div
            className="animate-in rounded-lg border border-gray-200 bg-white p-4 transition-shadow duration-300 hover:shadow-md"
            style={{ animationDelay: "280ms" }}
          >
            <h2 className="mb-4 text-sm font-semibold">Tracking Link</h2>

            <div className="flex items-center justify-between rounded-xl border border-gray-200 p-3 transition-colors duration-200 hover:border-primary/30">
              <div className="flex items-center gap-3 overflow-hidden">
                <Link2 className="shrink-0 text-primary" size={16} />
                <p className="truncate text-sm">{trackingLink}</p>
              </div>

              <button
                onClick={handleCopy}
                className="relative shrink-0 cursor-pointer text-primary transition-colors hover:text-primary/80"
                aria-label="Copy tracking link"
              >
                <span
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
                    copied ? "scale-100 opacity-100" : "scale-50 opacity-0"
                  }`}
                >
                  <Check size={16} className="text-green-600" />
                </span>
                <span
                  className={`transition-all duration-200 ${
                    copied ? "scale-50 opacity-0" : "scale-100 opacity-100"
                  }`}
                >
                  <Copy size={16} />
                </span>
              </button>
            </div>

            {copied && (
              <p className="mt-2 text-xs text-green-600 animate-in">Link copied to clipboard</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======================================== */

function Info({ icon: Icon, title, value }) {
  return (
    <div className="flex gap-3 rounded-lg p-1 transition-colors duration-200 hover:bg-gray-50">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon size={16} className="text-primary" />
      </div>

      <div className="min-w-0">
        <p className="truncate text-xs text-gray-500">{title}</p>
        <h4 className="mt-1 truncate text-sm font-semibold">{value}</h4>
      </div>
    </div>
  );
}