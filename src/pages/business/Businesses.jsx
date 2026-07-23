import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";

import Table, { ActionMenu } from "../../components/common/Table";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Titel from "../../components/common/Titel";
import Pagination from "../../components/Pagination";

const STATUS_STYLE = {
  Active: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Inactive: "bg-gray-100 text-gray-600",
  Suspended: "bg-red-100 text-red-600",
};

export default function Businesses() {
  const navigate = useNavigate();
  const [active, setActive] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

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

  const businesses = [
    {
      id: "b1f0c2b2-2f3a-4a5b-9e2a-6d1f2c3a4b5c",
      name_or_company_name: "Desire Online School",
      email: "info@desire.et",
      phone_1: "0911223344",
      status: "Active",
      login_attempts: 0,
      created_at: "2025-11-02T09:14:00Z",
    },
    {
      id: "c2a1d3e4-3f4b-4b5c-8f3b-7e2f3d4b5c6d",
      name_or_company_name: "Addis Tech Hub",
      email: "contact@addistech.et",
      phone_1: "0922334455",
      status: "Pending",
      login_attempts: 1,
      created_at: "2026-06-18T11:20:00Z",
    },
    {
      id: "d3b2e4f5-4a5c-4c6d-9a4c-8f3a4e5c6d7e",
      name_or_company_name: "Nile Retail Group",
      email: "hello@nileretail.com",
      phone_1: "0933445566",
      status: "Suspended",
      login_attempts: 5,
      created_at: "2026-02-27T08:05:00Z",
    },
    {
      id: "e4c3f5a6-5b6d-4d7e-8b5d-9a4b5f6d7e8f",
      name_or_company_name: "Habesha Foods PLC",
      email: "admin@habeshafoods.com",
      phone_1: "0944556677",
      status: "Inactive",
      login_attempts: 0,
      created_at: "2025-08-14T16:40:00Z",
    },
  ];

  const filteredBusinesses = useMemo(() => {
    const q = search.trim().toLowerCase();
    return businesses.filter((b) => {
      const matchesSearch =
        !q ||
        b.name_or_company_name.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q);
      const matchesStatus = !status || b.status.toLowerCase() === status;
      return matchesSearch && matchesStatus;
    });
  }, [search, status]);

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

        <Table columns={columns} data={filteredBusinesses} />
           <Pagination/>
      </div>
    </div>
  );
}