import { useState } from "react";
import { Search, CheckCircle2, Clock, XCircle } from "lucide-react";

const conversions = [
  {
    id: "CNV-1042",
    customer: "Hewan T.",
    date: "30 Jun 2024, 14:22",
    source: "TikTok Feed",
    amount: "500 ETB",
    status: "Confirmed",
  },
  {
    id: "CNV-1041",
    customer: "Yonas A.",
    date: "30 Jun 2024, 11:05",
    source: "Profile Link",
    amount: "500 ETB",
    status: "Confirmed",
  },
  {
    id: "CNV-1040",
    customer: "Mihret K.",
    date: "29 Jun 2024, 19:40",
    source: "Community Chat",
    amount: "500 ETB",
    status: "Pending",
  },
  {
    id: "CNV-1039",
    customer: "Dawit M.",
    date: "29 Jun 2024, 09:12",
    source: "TikTok Feed",
    amount: "500 ETB",
    status: "Confirmed",
  },
  {
    id: "CNV-1038",
    customer: "Selam G.",
    date: "28 Jun 2024, 16:50",
    source: "Stories",
    amount: "500 ETB",
    status: "Rejected",
  },
  {
    id: "CNV-1037",
    customer: "Bereket F.",
    date: "27 Jun 2024, 08:33",
    source: "Profile Link",
    amount: "500 ETB",
    status: "Confirmed",
  },
];

const statusConfig = {
  Confirmed: {
    icon: <CheckCircle2 size={14} />,
    classes: "bg-green-50 text-green-700",
  },
  Pending: {
    icon: <Clock size={14} />,
    classes: "bg-amber-50 text-amber-700",
  },
  Rejected: {
    icon: <XCircle size={14} />,
    classes: "bg-red-50 text-red-700",
  },
};

const filters = ["All", "Confirmed", "Pending", "Rejected"];

export default function Conversions  () {
  const [activeFilter, setActiveFilter] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = conversions.filter((c) => {
    const matchesFilter = activeFilter === "All" || c.status === activeFilter;
    const matchesQuery =
      c.customer.toLowerCase().includes(query.toLowerCase()) ||
      c.id.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const counts = conversions.reduce(
    (acc, c) => ({ ...acc, [c.status]: (acc[c.status] || 0) + 1 }),
    {}
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-2xl font-bold">{conversions.length}</p>
          <p className="text-gray-500 text-sm mt-0.5">Total Conversions</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-2xl font-bold text-green-600">
            {counts.Confirmed || 0}
          </p>
          <p className="text-gray-500 text-sm mt-0.5">Confirmed</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-2xl font-bold text-amber-600">
            {counts.Pending || 0}
          </p>
          <p className="text-gray-500 text-sm mt-0.5">Pending</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-2xl font-bold text-red-600">
            {counts.Rejected || 0}
          </p>
          <p className="text-gray-500 text-sm mt-0.5">Rejected</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 pb-4">
          <div className="flex gap-2 flex-wrap">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition ${
                  activeFilter === f
                    ? "bg-primary text-white"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search customer or ID..."
              className="pl-9 pr-4 py-2 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 w-full sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-t border-gray-100">
                <th className="font-medium px-6 py-3">ID</th>
                <th className="font-medium px-6 py-3">Customer</th>
                <th className="font-medium px-6 py-3">Date</th>
                <th className="font-medium px-6 py-3">Source</th>
                <th className="font-medium px-6 py-3">Payout</th>
                <th className="font-medium px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t border-gray-100">
                  <td className="px-6 py-3.5 text-gray-500">{c.id}</td>
                  <td className="px-6 py-3.5 font-medium text-gray-900">
                    {c.customer}
                  </td>
                  <td className="px-6 py-3.5 text-gray-500">{c.date}</td>
                  <td className="px-6 py-3.5 text-gray-500">{c.source}</td>
                  <td className="px-6 py-3.5 font-medium">{c.amount}</td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[c.status].classes}`}
                    >
                      {statusConfig[c.status].icon}
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    No conversions match this search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}