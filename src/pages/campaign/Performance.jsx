import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Eye, MousePointerClick, Percent, TrendingUp } from "lucide-react";

const dailyData = [
  { day: "Jun 24", impressions: 14200, clicks: 680 },
  { day: "Jun 25", impressions: 15800, clicks: 740 },
  { day: "Jun 26", impressions: 13900, clicks: 610 },
  { day: "Jun 27", impressions: 17200, clicks: 820 },
  { day: "Jun 28", impressions: 19600, clicks: 990 },
  { day: "Jun 29", impressions: 21100, clicks: 1080 },
  { day: "Jun 30", impressions: 22400, clicks: 1190 },
];

const sourceData = [
  { source: "TikTok", clicks: 3920 },
  { source: "Facebook", clicks: 1340 },
  { source: "Instagram", clicks: 610 },
];

const stats = [
  {
    label: "Total Impressions",
    value: "128,400",
    change: "+12.4%",
    icon: <Eye size={18} />,
  },
  {
    label: "Total Clicks",
    value: "6,210",
    change: "+8.1%",
    icon: <MousePointerClick size={18} />,
  },
  {
    label: "Click-through Rate",
    value: "4.83%",
    change: "+0.6pt",
    icon: <Percent size={18} />,
  },
  {
    label: "Conversion Rate",
    value: "2.96%",
    change: "+0.3pt",
    icon: <TrendingUp size={18} />,
  },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 text-xs">
      <p className="font-medium text-gray-900 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export default function Performance () {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-lg border border-gray-200 p-5"
          >
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-lg bg-purple-50 text-primary flex items-center justify-center">
                {s.icon}
              </span>
              <span className="text-xs font-medium text-green-600">
                {s.change}
              </span>
            </div>
            <p className="text-2xl font-bold mt-3">{s.value}</p>
            <p className="text-gray-500 text-sm mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Conversions (last 7 days)
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData} margin={{ left: -16, right: 8 }}>
              <defs>
                <linearGradient id="impressionsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor=" #16115A" stopOpacity={0.25} />
                  <stop offset="100%" stopColor=" #16115A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="clicksFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FEB209" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#FEB209" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f4" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="impressions"
                name="Impressions"
                stroke=" #16115A"
                fill="url(#impressionsFill)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="clicks"
                name="Clicks"
                stroke="#FEB209"
                fill="url(#clicksFill)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-5 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Impressions
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Clicks
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Converstion from platforms</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sourceData}
              layout="vertical"
              margin={{ left: 16, right: 16 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f1f4" />
              <XAxis
                type="number"
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="source"
                width={120}
                tick={{ fontSize: 12, fill: "#374151" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="clicks" name="Clicks" fill=" #16115A" radius={[0, 6, 6, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}