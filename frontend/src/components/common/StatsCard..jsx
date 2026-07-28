import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatsCard({
  title,
  number,
  currency,
  compare,
  compareLabel = "this week",
  icon: Icon,
  color = "bg-primary/10 text-primary",
}) {
  const isPositive = compare >= 0;

  return (
    <div className="group rounded-lg border border-gray-200 bg-gradient-to-br from-primary to-secondary p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-300">{title}</p>

          <div className="mt-2 flex items-baseline gap-1">
            <h2 className="text-xl font-bold tracking-tight text-gray-50 tabular-nums">
              {number}
            </h2>
            {currency && (
              <span className="text-[10px] font-medium uppercase text-gray-400">{currency}</span>
            )}
          </div>

          {typeof compare === "number" && (
            <div className="mt-3 flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                  isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                }`}
              >
                {isPositive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                {isPositive ? "+" : ""}
                {compare}%
              </span>
              <span className="text-xs text-gray-400">{compareLabel}</span>
            </div>
          )}
        </div>

        {Icon && (
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${color}`}
          >
            <Icon size={20} />
          </span>
        )}
      </div>
    </div>
  );
}