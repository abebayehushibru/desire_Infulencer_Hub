import { ChevronLeft, ChevronRight } from "lucide-react";


export default function Pagination({
  page = 1,
  totalPages = 1,
  limit = 10,
  total = 0,
  onPageChange,
  onLimitChange,
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-3 mt-3">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">

        {/* Left */}
        <div className="flex items-center gap-3">

          <span className="text-xs text-gray-500">
            Show
          </span>

          <select
            value={limit}
            onChange={(e) =>
              onLimitChange?.(
                Number(e.target.value)
              )
            }
            className="border border-gray-200 text-xs rounded-lg px-3 py-1.5"
          >
            {[10, 20, 50, 100].map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>

          <span className="text-xs text-gray-500">
            of {total} records
          </span>
        </div>

        {/* Right */}
        <div className="flex text-xs items-center gap-2">

          <button
            disabled={page <= 1}
            onClick={() =>
              onPageChange?.(page - 1)
            }
            className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-50"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="font-medium">
            {page} / {totalPages}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() =>
              onPageChange?.(page + 1)
            }
            className="h-10 w-10 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-50"
          >
            <ChevronRight size={18}/>
          </button>

        </div>
      </div>
    </div>
  );
}