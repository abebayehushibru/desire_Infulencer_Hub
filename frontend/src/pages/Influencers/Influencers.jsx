import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useState } from "react";

import Table, { ActionMenu } from "../../components/common/Table";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Title from "../../components/common/Titel";
import Pagination from "../../components/Pagination";
import useApi from "../../hooks/useApi";
import { useEffect } from "react";

export default function Influencers() {
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
  const influencerApi = useApi({
    request: (payload) => ({
      method: "GET",
      path: "/influencers",
      query: payload,
      manual: true
    }),
  });
  const columns = [
    {
      key: "name",
      label: "Influencer",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-primary capitalize">{row.user?.name_or_company_name}</span>
          <span className="text-xs text-gray-400 capitalize ">
            {row.address}
          </span>
        </div>
      ),
    },
    {
      key: "main_platform",
      label: "Platform",
      render: (value) => (
        <span className="capitalize">{value}</span>
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
      key: "profile_link",
      label: "Profile Link",
      render: (value) => {
        // Return null or placeholder if there is no URL provided
        if (!value) return <span className="text-gray-400 text-xs">-</span>;

        // Normalize URL to lowercase for easier string matching
        const url = value.toLowerCase();

        // Set dynamic badge styles based on the social media platform
        let badgeClass = "bg-gray-100 text-gray-700 hover:bg-gray-200";
        let platformName = "Link";

        if (url.includes("tiktok.com")) {
          badgeClass = "bg-black text-white hover:bg-gray-900";
          platformName = "TikTok";
        } else if (url.includes("facebook.com") || url.includes("fb.com")) {
          badgeClass = "bg-blue-100 text-blue-700 hover:bg-blue-200";
          platformName = "Facebook";
        } else if (url.includes("instagram.com")) {
          badgeClass = "bg-pink-100 text-pink-700 hover:bg-pink-200";
          platformName = "Instagram";
        } else if (url.includes("youtube.com") || url.includes("youtu.be")) {
          badgeClass = "bg-red-100 text-red-700 hover:bg-red-200";
          platformName = "YouTube";
        } else if (url.includes("x.com") || url.includes("twitter.com")) {
          badgeClass = "bg-slate-100 text-slate-950 hover:bg-slate-200";
          platformName = "X / Twitter";
        }

        return (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium transition-colors ${badgeClass}`}
          >
            {platformName}
          </a>
        );
      },
    },
    {
      key: "followers_count",
      label: "Followers",
    },
    {
      key: "level",
      label: "Level",
      render: (value) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${value === "Diamond"
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
      render: (_, row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${row?.user?.status === "active"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
            }`}
        >
          {row.user?.status}
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
          onEdit={() => navigate(`/influencers/edit/${row.id}`)}
          onView={() => navigate(`/influencers/view/${row.id}`)}
          onDelete={() => console.log(row)}
        />
      ),
    },
  ];

  const influencers = [
    {
      id: 1,
      name: "Abebe Kebede",
      location: "Addis Ababa",
      platform: "TikTok",
      followers: "145K",
      level: "Diamond",
      status: "Active",
    },
    {
      id: 2,
      name: "Helen Media",
      location: "Adama",
      platform: "Instagram",
      followers: "82K",
      level: "Gold",
      status: "Active",
    },
    {
      id: 3,
      name: "Tech Ethiopia",
      location: "Hawassa",
      platform: "YouTube",
      followers: "32K",
      level: "Silver",
      status: "Inactive",
    },
  ];



  const fetchInfluencers = async (page = 1, filters) => {
    const res = await influencerApi.execute(
      {
        page: pagination?.page || page,
        ...filters

      }
    )
    if (res.success) {
     setPagination(res?.data?.data?.data?.pagination)
    }
  }

  useEffect(() => {
    fetchInfluencers(1
    )
  }, [])

  return (
    <div className="bg-gray-50/10 min-h-full">
      <div className="flex justify-between items-center mb-4">
        <Title titel={"Influencers"} disc={"Manage all registered influencers."}>
          <Button
            leftIcon={<Plus size={18} />}
            onClick={() => navigate("/influencers/create")}
          >
            Add Influencer
          </Button>
        </Title>


      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-5">
          <Input
            name="search"
            value={filters.search}
            placeholder="Search influencer..."
            className="w-full md:w-80"
            onChange={(e) => {
              setFilters(prev => ({ ...prev, search: e?.target?.value }))
            }}
          />

          <div className="w-sm">
            <Select
              name="platform"
              value={filters.platform}
              data={[
                { label: "All Platforms", value: "" },
                { label: "TikTok", value: "tiktok" },
                { label: "Facebook", value: "facebook" },
                { label: "Instagram", value: "instagram" },
                { label: "YouTube", value: "youtube" },
                { label: "Telegram", value: "telegram" },
              ]}

              onChange={(e) => {
                setFilters(prev => ({ ...prev, platform: e?.target?.value }))
              }}
            />
          </div>

          <div className="w-sm">
            <Select
              name="level"
              value={filters.level}
              data={[
                { label: "All Levels", value: "" },
                { label: "Diamond", value: "diamond" },
                { label: "Gold", value: "gold" },
                { label: "Silver", value: "silver" },
              ]}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, level: e?.target?.value }))
              }}
            />
          </div>
          <Button className="py-1" loading={influencerApi.api} onClick={() => {
            fetchInfluencers(1, filters)
          }}>
            Search
          </Button>
        </div>

        <Table columns={columns} data={influencerApi?.data?.data?.data?.data || []} loading={influencerApi.loading} />
     <Pagination  onPageChange={(pg)=>{
                 setPagination(prev=>({
                   ...prev,page:pg
                 }))
                 fetchInfluencers(pg,filters)
     
                }}
                page={pagination.page}
                total={pagination.total}
                totalPages={pagination.totalPages}
                
                />
      </div>
    </div>
  );
}