


export default function StatsCard({
  title,
  number,
  currency,
  compare,
  compareLabel = "this week",

  color,
}) {
  const isPositive = compare >= 0;

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-xs hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500">{title}</p>

          <div className="flex items-end gap-1 mt-2">
            <h2 className="text-xl font-bold text-gray-900">
              {number}
            </h2>

            {currency && (
              <span className="text-lg text-gray-400">
                {currency}
              </span>
            )}
          </div>

          <p
            className={`mt-2 text-xs font-medium ${
              isPositive
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {isPositive ? "+" : ""}
            {compare}% {compareLabel}
          </p>
        </div>

    
      </div>
    </div>
  );
}