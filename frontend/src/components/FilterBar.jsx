import { Search } from "lucide-react";


export default function FilterBar({
  search = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  children,
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">

        {/* Left */}
        <div className="flex flex-wrap gap-3 flex-1">

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-3.5 text-gray-400" />

            <input
              type="text"
              value={search}
              placeholder={searchPlaceholder}
              onChange={(e) =>
                onSearchChange?.(e.target.value)
              }
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          {filters.map((filter) => (
            <select
              key={filter.name}
              value={filter.value}
              onChange={(e) =>
                filter.onChange(e.target.value)
              }
              className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white"
            >
              {filter.options.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          ))}
        </div>

        {/* Right */}
        {children}
      </div>
    </div>
  );
}