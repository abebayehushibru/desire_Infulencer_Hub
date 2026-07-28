import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";

import Table, { ActionMenu } from "../../components/common/Table";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Title from "../../components/common/Titel";
import Pagination from "../../components/Pagination";
import useApi from "../../hooks/useApi";

export default function Communities() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: "",
    platform: "",
    level: ""
  });
  const [active, setActive] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1
  });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [tier, setTier] = useState("");
  const [status, setStatus] = useState("");
  const communitiesApi = useApi({
    request: (payload) => ({
      method: "GET",
      path: "/communities",
      query: payload,
      manual: true
    }),
  });
  const fetchCommunities = async (page = 1, filters) => {
    const res = await communitiesApi.execute(
      {
        page: pagination?.page || page,
        ...filters

      }
    )
    if (res.success) {
      // setPagination(res?.data?.data?.pagination)
    }
  }

  useEffect(() => {
    fetchCommunities(1)
  }, [])
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
      key: "categories",
      label: "Category",
      render: (value) => <span className="capitalize">{JSON.parse(value)}</span>,
    },
    {
      key: "platforms",
      label: "Platform",
      render: (value) => (
        <span className="capitalize">{JSON.parse(value)}</span>
      ),
    }, {
      key: "managed",
      label: "Managed By",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-primary capitalize">{row?.manager?.name_or_company_name}</span>
          <span className="text-xs text-gray-400">{row?.manager?.email}</span>
        </div>

      ),
    },
    {
      key: "is_verified",
      label: "Verified",
      render: (value) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm border ${value
            ? "bg-green-100 text-green-800 border-green-200"
            : "bg-red-100 text-red-800 border-red-200"
            }`}
        >
          {value ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "total_members",
      label: "Members",
    },

    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${value === "active"
            ? "bg-green-100 text-green-700"
            : value === "pending"
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
          onView={() => navigate(`/communities/view/${row.id}`)}
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
    <div className="min-h-full bg-gray-50/10">
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
            <Button className="py-1" loading={communitiesApi.api} onClick={() => {
              fetchCommunities(1, {
                search,
                status,
                category
              })
            }}>
              Search
            </Button>
          </div>
        </div>

        <Table columns={columns} loading={communitiesApi.loading} data={communitiesApi.data?.data?.communities || []} />
        <Pagination onPageChange={(pg) => {
          setPagination(prev => ({
            ...prev, page: pg
          }))
          fetchCommunities(pg, { ...filters, category, search, status })

        }}
          page={pagination.page}
          total={pagination.total}
          totalPages={pagination.totalPages}

        />
      </div>
    </div>
  );
}