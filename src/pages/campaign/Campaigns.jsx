import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import Table, { ActionMenu } from "../../components/common/Table";
import Button from "../../components/common/Button";
import { useState } from "react";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Title from "../../components/common/Titel";
import Pagination from "../../components/Pagination";

export default function Campaigns() {
  const navigate = useNavigate();
  const [active, setActive] = useState(false);

  const columns = [
    {
      key: "campaign",
      label: "Campaign",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-primary">{value}</span>
          <span className="text-xs text-gray-400">
            {row.type} Campaign
          </span>
        </div>
      ),
    },
    {
      key: "target",
      label: "Target",
    },
    {
      key: "budget",
      label: "Budget",
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${value === "Active"
              ? "bg-green-100 text-green-700"
              : value === "Draft"
                ? "bg-yellow-100 text-yellow-700"
                : value === "Completed"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700"
            }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "conversion",
      label: "Conversions",
    },
    {
      key: "spend",
      label: "Spent",
      render: (value) => `${value} ETB`,
    },
    {
      key: "actions",
      label: "",
      render: (_, row, index) => (
        <ActionMenu
          index={index}
          active={active}
          setActive={setActive}
          onEdit={() => navigate(`/campaigns/${row.id}/overview`)}
          onDelete={() => console.log("Delete", row)}
        />
      ),
    },
  ];

  const campaigns = [
    {
      id: 1,
      campaign: "Online English Course",
      type: "Sales",
      target: "Students",
      status: "Active",
      conversion: 320,
      spend: "30,000",
    },
    {
      id: 2,
      campaign: "Summer Promotion",
      type: "Growth",
      target: "Parents",
      status: "Completed",
      conversion: 540,
      spend: "15,000",
    },
    {
      id: 3,
      campaign: "Addis Tech Event",
      type: "Awareness",
      target: "Developers",
      status: "Draft",
      conversion: 120,
      spend: "10,000",
    },
  ];

  return (
    <div className="bg-gray-50/10 min-h-full">

      <div className="flex justify-between items-center mb-4">
        <Title titel={"Campaigns"} disc={"Manage all your marketing campaigns."}>
        
        <Button
          leftIcon={<Plus size={18} />}
          onClick={() => navigate("/campaigns/create")}
        >
          Create Campaign
        </Button>
        </Title>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between mb-5">
          <Input
            placeholder="Search campaigns..."
            name={"search"}
            className="border rounded-lg px-4 py-2 w-full md:w-80"
          />
          <div className="w-sm">

            <Select
            name="status"
            data={[
              {
                label: "Active",
                value: "active"
              },
              {
                label: "Inactive",
                value: "inactive"
              },
              {
                label: "Draft",
                value: "draft"
              },

            ]}

          />
            
          </div>
          
        </div>

        <Table columns={columns} data={campaigns} />
        <Pagination/>
      </div>
    </div>
  );
}