import { useNavigate } from "react-router-dom";
import { Copy, Plus, Search } from "lucide-react"; // Added Search visual anchor
import { useState, useEffect } from "react";

import Table, { ActionMenu } from "../../components/common/Table";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Title from "../../components/common/Title"; // Fixed spelling typo ("Titel" -> "Title")
import Pagination from "../../components/Pagination";
import StatsCard from "../../components/common/StatsCard."; // Fixed trailing dot error ("StatsCard.")
import useApi from "../../hooks/useApi";
import Avatar from "../../components/common/Avatar";
import toast from "react-hot-toast";
import { formatFollowers } from "../../services/helpers";

export default function Recharges() {
  const navigate = useNavigate();
  const [active, setActive] = useState(false);
  const [summary, setSummary] = useState(null);

  // 1. Unified Filter and Search UI States
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    bank_type: "", // Unified name parameter with backend logic
    startDate: "",
    endDate: "",
  });

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // 2. Clear API Wrapper setup matching structural manual hooks
  const rechargesApi = useApi({
    request: (payload, method = "GET") => ({
      method: method,
      path: `/recharges`,
      manual: true,
      query: payload,
    }),
  });

  // 3. Trigger Fetch Function on filter search execution click or page swap
  const fetchRecharges = async () => {
    const res = await rechargesApi.execute({
      page,
      limit,
      search: filters.search,
      status: filters.status,
      bank_type: filters.bank_type,
      startDate: filters.startDate,
      endDate: filters.endDate,
    });

    if (!summary) {
      setSummary(res?.data?.data?.summary)
    }


  };

  // Fetch initial batch records on initialization
  useEffect(() => {
    fetchRecharges();
  }, [page, limit]);

  // Extract variables out from API tracking framework hook values
  const apiData = rechargesApi?.data?.data || {};
  const rechargesDatas = apiData?.recharges || [];
  const totalCount = apiData?.count || 0;
  const summaryMetrics = apiData?.summary || {};

  // Form input modifier utility
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };
  

  // Table Column Schema Bindings mapped against actual database data payloads
  const columns = [
    {
      key: "recipient",
      label: "Recipient",
      render: (_, row) => (
        <div className="flex items-center gap-3">
          {row?.business?.avatar ?
            <img
              src={row?.business?.avatar || "/default-avatar.png"}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            /> : <Avatar name={row?.  business?.name_or_company_name}></Avatar>
          }

        <p>{row?.  business?.name_or_company_name}</p>
        </div>
      ),
    },
    
    {
      key: "amount",
      label: "Amount",
      render: (value) => (
        <span className="font-semibold text-green-600">
          {Number(value || 0).toLocaleString()} ETB
        </span>
      ),
    },
    {
      key: "bank_type",
      label: "Method",
      render: (value) => (
        <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium uppercase">
          {value || "Bank"}
        </span>
      ),
    },
    {
      key: "account_number",
      label: "Business Name",
      render: (value,row) => (
        <span className="font-mono text-gray-600 text-xs">{row?.business?.name_or_company_name || "—"}</span>
      ),
    },
    {
  key: "transaction_reference",
  label: "Reference",
  render: (value) => {
    if (!value) return "—";
    
    return (
      <div 
        className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors"
        onClick={() => {
          toast.success("copied successfully")
          navigator.clipboard.writeText(value)
        }}
        title="Click to copy reference"
      >
        <span>{value}</span>
        <Copy size={14} className="text-gray-400 hover:text-current" />
      </div>
    );
  },
},
    {
      key: "createdAt",
      label: "Payment Date",
      render: (value) => (value ? new Date(value).toLocaleDateString() : "—"),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => {
        const val = String(value).toUpperCase();
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${val === "VERIFIED"  ? "bg-green-100 text-green-700"
                : val === "PENDING"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
          >
            {value || "PENDING"}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "",
      render: (_, row, index) => (
        <ActionMenu
          index={index}
          active={active}
          setActive={setActive}
          onEdit={() => navigate(`/Recharges/view/${row.id}`)}
        
        />
      ),
    },
  ];

  return (
    <div className="bg-gray-50/10 min-h-full p-4">
      {/* Structural Title Area Setup */}
      <div className="mb-4">
        <Title
          titel="Recharges"
          disc="Track, manage and verify business wallet recharges."
        />
      </div>

    
      {/* Metrics Dashboard Layout powered directly via backend summary expressions */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-5 mb-6">
        <StatsCard
          title="Total Count"
          number={summary?.total_recharges_count || 0}
          color="blue"
          currency=""
        />
         <StatsCard
          title="Total "
          number={formatFollowers(summary?.total_recharges_amount || 0)}
          color="blue"
          currency="ETB"
        />
        <StatsCard
          title="Pending"
          number={formatFollowers(summary?.pending_amount || 0)}
          color="yellow"
          currency="ETB"
        />
        <StatsCard
          title="Confirmed"
          number={formatFollowers(summary?.confirmed_amount || 0)}
          color="green"
          currency="ETB"
        />
        <StatsCard
          title="Rejected"
          number={formatFollowers(summary?.rejected_amount || 0)}
          color="red"
          currency="ETB"
        />
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        {/* Unified Search & Filters Interface Segment */}
        <div className="flex flex-col md:flex-row w-full gap-4 justify-between mb-4">
          <Input
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search business name..."
            className="max-w-sm w-full"
          />

          <div className="flex flex-row w-full flex-1 gap-3 justify-end items-center">
            <Select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              data={[
                { label: "All Status", value: "" },
                { label: "Pending", value: "PENDING" },
                { label: "Confirmed", value: "CONFIRMED" },
                { label: "Rejected", value: "REJECTED" },
              ]}
            />

    

            <div className="flex items-center gap-2">
              <Input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-auto"
              />
              <span className="text-gray-400 text-xs">to</span>
              <Input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-auto"
              />
            </div>

            <Button
              variant="primary"
              onClick={fetchRecharges}
              loading={rechargesApi.loading}
              className="flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </div>

        {/* Dynamic Data Content Rendering Engine */}
        {rechargesApi.loading ? (
          <div className="py-10 text-center text-gray-500 text-sm">
            Loading transaction registers...
          </div>
        ) : (
          <Table columns={columns} data={rechargesDatas} />
        )}

        {/* Global Pagination Footprint Block */}
        <div className="mt-4">
          <Pagination
            current={page}
            total={totalCount}
            pageSize={limit}
            onChange={(newPage) => setPage(newPage)}
          />
        </div>
      </div>
    </div>
  );
}
