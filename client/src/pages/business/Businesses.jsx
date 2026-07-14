import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useState } from "react";

import Table, { ActionMenu } from "../../components/common/Table";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";

export default function Businesses() {
  const navigate = useNavigate();
  const [active, setActive] = useState(null);

  const columns = [
    {
      key: "name",
      label: "Business",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-primary">{value}</span>
          <span className="text-xs text-gray-400">{row.location}</span>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (value) => <span className="capitalize">{value}</span>,
    },
    {
      key: "campaigns",
      label: "Campaigns",
    },
    {
      key: "tier",
      label: "Tier",
      render: (value) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            value === "Diamond"
              ? "bg-purple-100 text-purple-700"
              : value === "Gold"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            value === "Active"
              ? "bg-green-100 text-green-700"
              : value === "Pending"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }`}
        >
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
          onEdit={() => navigate(`/businesses/edit/${row.id}`)}
          onDelete={() => console.log("Delete", row)}
        />
      ),
    },
  ];

  const businesses = [
    {
      id: 1,
      name: "Desire Online School",
      location: "Addis Ababa",
      category: "Education",
      campaigns: 12,
      tier: "Diamond",
      status: "Active",
    },
    {
      id: 2,
      name: "Tech Addis",
      location: "Adama",
      category: "Technology",
      campaigns: 5,
      tier: "Gold",
      status: "Active",
    },
    {
      id: 3,
      name: "Shoe Store ET",
      location: "Hawassa",
      category: "Fashion",
      campaigns: 3,
      tier: "Silver",
      status: "Pending",
    },
    {
      id: 4,
      name: "Trendy Shop",
      location: "Bahir Dar",
      category: "Retail",
      campaigns: 1,
      tier: "Silver",
      status: "Suspended",
    },
  ];

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Businesses</h1>
          <p className="text-gray-500 mt-1">Manage all registered businesses.</p>
        </div>
        <Button
          leftIcon={<Plus size={18} />}
          onClick={() => navigate("/businesses/create")}
        >
          Add Business
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between mb-5">
          <Input
            name="search"
            placeholder="Search business..."
            className="w-full md:w-80"
          />
          <div className="w-sm">
            <Select
              name="category"
              data={[
                { label: "All Categories", value: "" },
                { label: "Education", value: "education" },
                { label: "Technology", value: "technology" },
                { label: "Fashion", value: "fashion" },
                { label: "Retail", value: "retail" },
                { label: "Food", value: "food" },
                { label: "Health", value: "health" },
              ]}
            />
          </div>
          <div className="w-sm">
            <Select
              name="status"
              data={[
                { label: "All Statuses", value: "" },
                { label: "Active", value: "active" },
                { label: "Pending", value: "pending" },
                { label: "Suspended", value: "suspended" },
              ]}
            />
          </div>
        </div>

        <Table columns={columns} data={businesses} />
      </div>
    </div>
  );
}
