import {
  ArrowUpRight,
  ArrowDownRight,
  CircleDollarSign,
  Users,
  Wallet,
  TrendingUp,
  Megaphone,
  BarChart3,
} from "lucide-react";

const defaultIcons = [
  CircleDollarSign,
  Users,
  Wallet,
  TrendingUp,
  Megaphone,
  BarChart3,
];

const defaultColors = [
  "from-indigo-500 to-violet-600",
  "from-emerald-500 to-green-600",
  "from-yellow-500 to-orange-500",
  "from-sky-500 to-cyan-600",
  "from-pink-500 to-rose-600",
  "from-purple-500 to-fuchsia-600",
];

export default function StatsCard({
  title,
  number,
  currency,
  compare,
  compareLabel = "vs last week",
  icon,
  color,
}) {
  const isPositive = compare >= 0;

  // Pick a consistent icon & color based on title
  const index =
    color?.split("").reduce((sum, c) => sum + c.charCodeAt(0), 0) %
    defaultIcons.length;

  const Icon = icon ||BarChart3;

  return (
    <div className="group relative overflow-hidden rounded-lg border border-slate-700/60 bg-gradient-to-br from-primary to-secondary p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl">

      {/* Glow */}
      <div
        className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-primary to-secondary opacity-10 blur-3xl`}
      />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>

          <div className="mt-3 flex items-end gap-2">
            <h2 className="text-3xl font-bold text-white">
              {number}
            </h2>

            {currency && (
              <span className="mb-1 text-xs font-medium uppercase text-slate-400">
                {currency}
              </span>
            )}
          </div>

          {typeof compare === "number" && (
            <div className="mt-4 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  isPositive
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-rose-500/15 text-rose-400"
                }`}
              >
                {isPositive ? (
                  <ArrowUpRight size={14} />
                ) : (
                  <ArrowDownRight size={14} />
                )}

                {isPositive ? "+" : ""}
                {compare}%
              </span>

              <span className="text-xs text-slate-400">
                {compareLabel}
              </span>
            </div>
          )}
        </div>

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}
        >
          <Icon size={26} strokeWidth={2.2} />
        </div>
      </div>

      <div
        className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-tr `}
      />
    </div>
  );
}