import {
  Calendar,Globe,Wallet,Target,Link2,Copy,Users,Eye,MousePointerClick,ShoppingCart,DollarSign,Clock,CheckCircle2,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";

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
    month: "long",
    day: "numeric",
  });
};

const missingValue = "Not available";

export default function Overview() {
  const { campaign, loading, error } = useOutletContext() || {};

  const metrics = campaign?.overview?.summary || {};
  const details = campaign?.overview?.details || {};
  const status = (details.status || campaign?.status || "").toLowerCase();

  const stats = [
    {
      title: "Views",
      value: formatNumber(metrics.views),
      icon: Eye,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Clicks",
      value: formatNumber(metrics.clicks),
      icon: MousePointerClick,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Conversions",
      value: formatNumber(metrics.conversions),
      icon: ShoppingCart,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Revenue",
      value: `${formatNumber(metrics.revenue)} ETB`,
      icon: DollarSign,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  if (loading && !campaign) {
    return <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-500">Loading campaign overview...</div>;
  }

  if (error && !campaign) {
    return <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>;
  }

  const trackingLink = campaign?.overview?.details?.trackingLink || campaign?.tracking_link || campaign?.tracking_url || campaign?.overview?.trackingLink || missingValue;

  return (
    <div className="space-y-4 text-primary">
      {/* ====================== */}
      {/* Statistics */}
      {/* ====================== */}

      <div className="grid lg:grid-cols-4 grid-cols-2 gap-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-sm">{item.title}</p>

                  <h2 className="text-xl text-primary font-bold mt-2">
                    {item.value}
                  </h2>

                  <p className="text-green-600 text-xs mt-1">
                    +12.5% this week
                  </p>
                </div>

                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}
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

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Left */}

        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h2 className="font-semibold text-lg">Campaign Information</h2>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary capitalize">
              {status || "unknown"}
            </span>
          </div>

          <div className="grid  md:grid-cols-4 gap-3">
            <Info
              icon={Target}
              title="Campaign Type"
              value={campaign?.type ? `${campaign.type.charAt(0).toUpperCase()}${campaign.type.slice(1)}` : missingValue}
            />

            <Info
              icon={Globe}
              title="Platform"
              value={details.platform || missingValue}
            />

            <Info
              icon={Calendar}
              title="Start Date"
              value={formatDate(campaign?.start_date)}
            />

            <Info
              icon={Calendar}
              title="End Date"
              value={formatDate(campaign?.end_date)}
            />

            <Info
              icon={Wallet}
              title="Budget"
              value={campaign?.total_budget ? `${formatNumber(campaign.total_budget)} ETB` : missingValue}
            />

            <Info
              icon={Users}
              title="Creators"
              value={details.creators != null ? `${formatNumber(details.creators)} Joined` : missingValue}
            />
          </div>
          

          {/* Progress */}

          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold ">
                Budget Used
              </span>

              <span>{details.budgetUsedPercent != null ? `${Math.round(details.budgetUsedPercent)}%` : missingValue}</span>
            </div>

            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${Math.min(details.budgetUsedPercent || 0, 100)}%` }}
              />
            </div>

            <div className="flex justify-between mt-3 text-sm text-gray-500">
              <span>{details.budgetUsed != null ? `${formatNumber(details.budgetUsed)} ETB Used` : missingValue}</span>

              <span>{details.budgetRemaining != null ? `${formatNumber(details.budgetRemaining)} ETB Remaining` : missingValue}</span>
            </div>
          </div>
        </div>

        {/* Right */}

        <div className="space-y-4">
          {/* Status */}

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="font-semibold text-lg mb-4">
              Campaign Status
            </h2>

            <div className="flex items-center gap-2">
              <CheckCircle2
                className="text-green-600"
                size={20}
              />

              <div>
                <h4 className="font-semibold text-sm">
                  {campaign?.status || "Unknown"}
                </h4>

                <p className="text-xs text-gray-500">
                  {campaign?.status === "active" ? "Campaign is currently running." : "Campaign is currently not running."}
                </p>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-3">
              <Clock
                className="text-yellow-500"
                size={20}
              />

              <div>
                <h4 className="font-medium text-sm">
                  {details.daysRemaining != null ? `${details.daysRemaining} Days Remaining` : "Not available"}
                </h4>

                <p className="text-xs text-gray-500">
                  Ends on {formatDate(campaign?.end_date)}
                </p>
              </div>
            </div>
          </div>

          {/* Tracking */}

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="font-semibold text-sm mb-4">
              Tracking Link
            </h2>

            <div className="flex items-center justify-between border border-gray-200 rounded-xl p-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <Link2
                  className="text-primary"
                  size={16}
                />

                <p className="truncate text-sm">
                  {trackingLink}
                </p>
              </div>

              <button className="text-primary hover:text-primary/80 cursor-pointer ">
                <Copy size={16} />
              </button>
            </div>

    
          </div>
        </div>
      </div>

    
    </div>
  );
}

/* ======================================== */

function Info({ icon: Icon, title, value }) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon
          size={16}
          className="text-primary"
        />
      </div>

      <div>
        <p className="text-gray-500  text-xs truncate">
          {title}
        </p>

        <h4 className="font-semibold  text-sm mt-1">
          {value}
        </h4>
      </div>
    </div>
  );
}

/* ======================================== */

function Summary({ title, value }) {
  return (
    <div className="rounded-lg bg-gray-50 p-5 text-center">
      <p className="text-gray-500 text-sm">
        {title}
      </p>

      <h3 className=" text-sm md:text-sm font-bold mt-2">
        {value}
      </h3>
    </div>
  );
}