import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";

import Table, { ActionMenu } from "../../components/common/Table";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Title from "../../components/common/Title";

export default function Communities() {
  const navigate = useNavigate();
  const [active, setActive] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [tier, setTier] = useState("");
  const [status, setStatus] = useState("");

  const columns = [
    {
      key: "name",
      label: "Community",
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
      key: "members",
      label: "Members",
    },
    {
      key: "tier",
      label: "Tier",
      render: (value) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
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
          className={`rounded-full px-3 py-1 text-xs font-medium ${
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

  const filteredCommunities = useMemo(() => {
    const q = search.trim().toLowerCase();
    return communities.filter((c) => {
      const matchesSearch =
        !q || c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q);
      const matchesCategory = !category || c.category.toLowerCase() === category;
      const matchesTier = !tier || c.tier.toLowerCase() === tier;
      const matchesStatus = !status || c.status.toLowerCase() === status;
      return matchesSearch && matchesCategory && matchesTier && matchesStatus;
    });
  }, [search, category, tier, status]);

  return (
    <div className="min-h-full bg-gray-50">
      <div className="mb-4 flex items-center justify-between">
        <Title titel={"Communities"} disc={"Manage all registered communities."}>

        <Button leftIcon={<Plus size={18} />} onClick={() => navigate("/communities/create")}>
          Add Community
        </Button>
        </Title>
      

      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        {/* Search & Filters */}
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-xs">
            <Input
              name="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search community..."
              leftIcon={<Search size={18} />}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <div className="w-full sm:w-44">
              <Select
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="All Categories"
                data={[
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

            <div className="w-full sm:w-40">
              <Select
                name="tier"
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                placeholder="All Tiers"
                data={[
                  { label: "Diamond", value: "diamond" },
                  { label: "Gold", value: "gold" },
                  { label: "Silver", value: "silver" },
                ]}
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
                  { label: "Suspended", value: "suspended" },
                ]}
              />
            </div>
          </div>
        </div>

        <Table columns={columns} data={filteredCommunities} />
      </div>
    </div>
  );
}
