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
import { formatNumber } from "../../services/helpers";

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
  compareLabel = "",
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
          <p className="sm:text-xs text-[8px] font-semibold uppercase tracking-wider text-slate-300">
            {title}
          </p>

          <div className="mt-3 flex items-end gap-2">
            <h2 className="sm:text-3xl text-xl font-bold text-white">
              {formatNumber(number)}
            </h2>

            {currency && (
              <span className="mb-1 text-xs font-medium uppercase text-slate-400">
                {currency}
              </span>
            )}
          </div>

          {typeof compare === "number" && (
            <div className="mt-4  hidden sm:flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  isPositive
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-rose-500/15 text-rose-400"
                }`}
              >
                {isPositive ? (
                  <ArrowUpRight size={12} />
                ) : (
                  <ArrowDownRight size={12} />
                )}

                {isPositive ? "+" : ""}
                {compare}%
              </span>

              <span className="hidden sm:block sm:text-xs text-slate-400">
                {compareLabel}
              </span>
            </div>
          )}
        </div>

        <div
          className={`flex p-2 sm:h-12 sm:w-12 aspect-square items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-primary shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}
        >
          <Icon  className ={ "hidden sm:block "} strokeWidth={2.2} />
          <Icon  className ={ "sm:hidden "} strokeWidth={2.2} size={20} />
        </div>
      </div>

      <div
        className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-tr `}
      />
    </div>
  );
}