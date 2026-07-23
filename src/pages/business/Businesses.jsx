import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";

import Table, { ActionMenu } from "../../components/common/Table";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Titel from "../../components/common/Titel";
import Pagination from "../../components/Pagination";
import useApi from "../../hooks/useApi";

const STATUS_STYLE = {
  Active: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Inactive: "bg-gray-100 text-gray-600",
  Suspended: "bg-red-100 text-red-600",
};

export default function Businesses() {
  const navigate = useNavigate();
  const [active, setActive] = useState(false);
 const [pagination, setPagination] = useState({
  page:1,
  total:0,
  totalPages:1
 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
 const businessApi = useApi({
        request: (payload) => ({
            method: "GET",
            path: "/business",
            query: payload,
        }),
    });

  const columns = [
    {
      key: "name_or_company_name",
      label: "Business",
      render: (value, row) => (
        <Link to={`/businesses/view/${row.id}`} className="flex flex-col hover:underline">
          <span className="font-medium text-primary">{value}</span>
          <span className="text-xs text-gray-400">{row.email}</span>
        </Link>
      ),
    },
    {
      key: "phone_1",
      label: "Phone",
    },
    {
      key: "login_attempts",
      label: "Login Attempts",
      render: (value) => (
        <span className={`font-medium ${value > 3 ? "text-red-500" : "text-gray-600"}`}>{value}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLE[value]}`}>
          {value}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Joined",
      render: (value) => (
        <span className="text-gray-500">{new Date(value).toLocaleDateString()}</span>
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
          onEdit={() => navigate(`/businesses/edit/${row.id}`)}
           onView={() => navigate(`/businesses/view/${row.id}`)}
         
          onDelete={() => console.log("Delete", row)}
        />
      ),
    },
  ];

  

  const filteredBusinesses = () => {
    const q = search.trim().toLowerCase();
    const result=businessApi.execute({
      search,status,page:pagination
    })
  }

  return (
    <div className="min-h-full bg-gray-50/10">
      <div className="mb-4 flex items-center justify-between">
        <Titel titel={"Add Businesses"} disc={"Manage all registered business accounts."}>
                <Button leftIcon={<Plus size={18} />} onClick={() => navigate("/businesses/create")}>
          Add Business
        </Button>
        </Titel>
       

    
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        {/* Search & Filters */}
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:max-w-xs">
            <Input
              name="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search business..."
              leftIcon={<Search size={18} />}
            />
          </div>

          <div className="w-full sm:w-44">
            <Select
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="All Statuses"
              data={[
                { label: "Active", value: "active" },
                { label: "Pending", value: "pending" },
                { label: "Inactive", value: "inactive" },
                { label: "Suspended", value: "suspended" },
              ]}
            />
          </div>
        </div>

        <Table columns={columns} data={businessApi?.data?.data} loading={true} />
           <Pagination  onPageChange={(pg)=>{
            setPagination(prev=>({
              ...prev,page:pg
            }))
           }}
           total={pagination.total}
           totalPages={pagination.totalPages}
           
           />
      </div>
    </div>
  );
}