import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, CheckCircle2, Clock, XCircle, Layers, Plus } from "lucide-react";

import Table, { ActionMenu } from "../../components/common/Table";
import StatsCard from "../../components/common/StatsCard.";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Title from "../../components/common/Titel";

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
  Confirmed: { icon: <CheckCircle2 size={13} />, classes: "bg-green-50 text-green-700" },
  Pending: { icon: <Clock size={13} />, classes: "bg-amber-50 text-amber-700" },
  Rejected: { icon: <XCircle size={13} />, classes: "bg-red-50 text-red-700" },
};

const filters = ["All", "Confirmed", "Pending", "Rejected"];

export default function Conversions() {
  const navigate = useNavigate();
  const [active, setActive] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [query, setQuery] = useState("");

  const counts = useMemo(
    () =>
      conversions.reduce((acc, c) => ({ ...acc, [c.status]: (acc[c.status] || 0) + 1 }), {}),
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return conversions.filter((c) => {
      const matchesFilter = activeFilter === "All" || c.status === activeFilter;
      const matchesQuery = !q || c.customer.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, query]);

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (value) => <span className="font-medium text-gray-400">{value}</span>,
    },
    {
      key: "customer",
      label: "Customer",
      render: (value) => <span className="font-medium text-gray-900">{value}</span>,
    },
    {
      key: "date",
      label: "Date",
      render: (value) => <span className="text-gray-500">{value}</span>,
    },
    {
      key: "source",
      label: "Source",
      render: (value) => (
        <span className="rounded-full bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">
          {value}
        </span>
      ),
    },
    {
      key: "amount",
      label: "Payout",
      render: (value) => <span className="font-semibold tabular-nums text-gray-900">{value}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig[value].classes}`}
        >
          {statusConfig[value].icon}
          {value}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (_, row, index) => (
        <ActionMenu
          index={index}
          active={active}
          setActive={setActive}
          onEdit={() => navigate(`/conversions/edit/${row.id}`)}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between mx-4">
        <Title titel={"Conversions"} disc={"Track and review all recorded conversions."}>
        
        

        <Button leftIcon={<Plus size={18} />} onClick={() => navigate("/campaigns/123/conversions/add")}>
          Add Conversion
        </Button>
        </Title>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatsCard title="Total Conversions" number={conversions.length} icon={Layers} color="bg-primary/10 text-primary" />
        <StatsCard title="Confirmed" number={counts.Confirmed || 0} icon={CheckCircle2} color="bg-green-100 text-green-600" />
        <StatsCard title="Pending" number={counts.Pending || 0} icon={Clock} color="bg-amber-100 text-amber-600" />
        <StatsCard title="Rejected" number={counts.Rejected || 0} icon={XCircle} color="bg-red-100 text-red-600" />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  activeFilter === f
                    ? "bg-primary text-white"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {f}
                {f !== "All" && (
                  <span className={`ml-1.5 ${activeFilter === f ? "text-white/70" : "text-gray-400"}`}>
                    {counts[f] || 0}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-64">
            <Input
              name="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search customer or ID..."
              leftIcon={<Search size={16} />}
            />
          </div>
        </div>

        <Table columns={columns} data={filtered} />
      </div>
    </div>
  );
}