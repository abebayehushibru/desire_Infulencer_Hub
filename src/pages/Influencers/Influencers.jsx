import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useState } from "react";

import Table, { ActionMenu } from "../../components/common/Table";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Title from "../../components/common/Titel";
import Pagination from "../../components/Pagination";

export default function Influencers() {
  const navigate = useNavigate();
  const [active, setActive] = useState(false);

  const columns = [
    {
      key: "name",
      label: "Influencer",
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
      key: "platform",
      label: "Platform",
      render: (value) => (
        <span className="capitalize">{value}</span>
      ),
    },
    {
      key: "followers",
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
      render: (value) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${value === "Active"
              ? "bg-green-100 text-green-700"
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
        <div className="flex flex-col md:flex-row gap-4 justify-between mb-5">
          <Input
            name="search"
            placeholder="Search influencer..."
            className="w-full md:w-80"
          />

          <div className="w-sm">
            <Select
              name="platform"
              data={[
                { label: "All Platforms", value: "" },
                { label: "TikTok", value: "tiktok" },
                { label: "Facebook", value: "facebook" },
                { label: "Instagram", value: "instagram" },
                { label: "YouTube", value: "youtube" },
                { label: "Telegram", value: "telegram" },
              ]}
            />
          </div>

          <div className="w-sm">
            <Select
              name="level"
              data={[
                { label: "All Levels", value: "" },
                { label: "Diamond", value: "diamond" },
                { label: "Gold", value: "gold" },
                { label: "Silver", value: "silver" },
              ]}
            />
          </div>
        </div>

        <Table columns={columns} data={influencers} />
           <Pagination/>
      </div>
    </div>
  );
}