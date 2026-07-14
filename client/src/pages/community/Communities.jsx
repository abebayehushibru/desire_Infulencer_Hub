import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useState } from "react";

import Table, { ActionMenu } from "../../components/common/Table";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";

export default function Communities() {
  const navigate = useNavigate();
  const [active, setActive] = useState(false);

  const columns = [
    {
      key: "name",
      label: "Community",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-primary">{value}</span>
          <span className="text-xs text-gray-400">
            {row.location}
          </span>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (value) => (
        <span className="capitalize">{value}</span>
      ),
    },
    {
      key: "members",
      label: "Members",
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
          onEdit={() => navigate(`/communities/edit/${row.id}`)}
          onDelete={() => console.log(row)}
        />
      ),
    },
  ];

  const communities = [
    {
      id: 1,
      name: "Sara Beauty Community",
      location: "Addis Ababa",
      category: "Beauty",
      members: "12,548",
      tier: "Diamond",
      status: "Active",
    },
    {
      id: 2,
      name: "Fit Ethiopia",
      location: "Adama",
      category: "Fitness",
      members: "6,204",
      tier: "Gold",
      status: "Active",
    },
    {
      id: 3,
      name: "Tech Talk ET",
      location: "Hawassa",
      category: "Technology",
      members: "3,910",
      tier: "Silver",
      status: "Pending",
    },
    {
      id: 4,
      name: "Foodies Addis",
      location: "Bahir Dar",
      category: "Food",
      members: "1,742",
      tier: "Silver",
      status: "Suspended",
    },
  ];

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            Communities
          </h1>
          <p className="text-gray-500 mt-1">
            Manage all registered communities.
          </p>
        </div>

        <Button
          leftIcon={<Plus size={18} />}
          onClick={() => navigate("/communities/create")}
        >
          Add Community
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between mb-5">
          <Input
            name="search"
            placeholder="Search community..."
            className="w-full md:w-80"
          />

          <div className="w-sm">
            <Select
              name="category"
              data={[
                { label: "All Categories", value: "" },
                { label: "Beauty", value: "beauty" },
                { label: "Lifestyle", value: "lifestyle" },
                { label: "Fashion", value: "fashion" },
                { label: "Travel", value: "travel" },
                { label: "Food", value: "food" },
                { label: "Technology", value: "technology" },
                { label: "Fitness", value: "fitness" },
              ]}
            />
          </div>

          <div className="w-sm">
            <Select
              name="tier"
              data={[
                { label: "All Tiers", value: "" },
                { label: "Diamond", value: "diamond" },
                { label: "Gold", value: "gold" },
                { label: "Silver", value: "silver" },
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

        <Table columns={columns} data={communities} />
      </div>
    </div>
  );
}