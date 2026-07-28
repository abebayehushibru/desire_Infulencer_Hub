import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import Table, { ActionMenu } from "../../components/common/Table";
import Button from "../../components/common/Button";
import { useEffect, useState } from "react";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Title from "../../components/common/Titel";
import Pagination from "../../components/Pagination";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../contexts/AuthContext";
import { RejectionModal } from "../../components/RejectionModal";

export default function Campaigns() {

  const { user } = useAuth()
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1
  });
  const campaignsApi = useApi({
    request: (payload) => ({
      method: "GET",
      path: "/campaigns",
      query: payload,
      manual: true
    }),
  });
  const updateApi = useApi({
    request: (payload) => ({
      method: "PUT",
      path: `/campaigns/${payload?.id}/status`,
      data: payload,
      manual: true
    }),
  });
  const [activeMenuIndex, setActiveMenuIndex] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const columns = [
    {
      key: "title",
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
      key: "target_type",
      label: "Target By",
    },
    {
      key: "total_budget",
      label: "Budget",
    },
    {
      key: "locations",
      label: "Locations",
      render: (value) => `${JSON.parse(JSON.parse(value)).join(",")}`,
    },

    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span
          className={`px-3 py-1 capitalize rounded-full text-xs font-medium ${value === "active"
            ? "bg-green-100 text-green-700"
            : value === "draft"
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
      key: "start_date",
      label: "Start Date",
      render: (value) => `${value?.split("T")?.[0]}`,
    },
    {
      key: "end_date",
      label: "End Date",
      render: (value) => `${value?.split("T")?.[0]}`,
    },

    {
      key: "actions",
      label: "",
      render: (_, row, index) => {
        const actions = {};
        const status = row.status?.toLowerCase();
        const role = user?.role?.toLowerCase();

        // 1. Default Baseline Status Actions
        if (status === "draft" || status === "rejected") {
          actions.onEdit = () => navigate(`/campaigns/${row.id}/edit`);
          actions.onDelete = () => handleDelete(row.id);
        } else if (status !== "pending") {
          actions.onView = () => navigate(`/campaigns/${row.id}/overview`);
        } else {
          actions.onDelete = () => handleDelete(row.id);
        }

        // 2. Role-Based Permissions Overrides
        const isAdminOrSuper = role === "admin" || role === "superadmin";

        // Admin/SuperAdmin: Pending -> Approve
        if (isAdminOrSuper && status === "pending") {

          actions.onApprove = () => handleAction(row.id, "approved");
          actions.onReject = () => {
            setSelectedCampaign({id:row?.id,name:row?.name})
            setIsRejectModalOpen(true)
          };
        }

        // Influencer: Approved -> Accept or Reject
        if (role === "influencer" && status === "approved") {
          actions.onAccept = () => handleAction(row.id, "accepted");
          actions.onReject = () => {
             setSelectedCampaign({id:row?.id,name:row?.name})
            setIsRejectModalOpen(true)
          };
        }

        // Admin/SuperAdmin: Accepted -> Make Active / Add Budget
        if (isAdminOrSuper && status === "accepted") {
          actions.onMakeActive = () => handleAction(row.id, "active");
          actions.onAddBudget = () => handleAddBudget(row.id);
        }

        return (
          <ActionMenu
            index={index}
            active={active}
            setActive={setActive}
            {...actions}
          />
        );
      },
    }

    ,
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
  const fetchData = async (page = 1, filters) => {
    const res = await campaignsApi.execute(
      {
        page: pagination?.page || page,
        ...filters

      }
    )
    if (res.success) {
      setPagination(res?.data?.data?.data?.pagination)
    }
  }
  const handleAction = async (id, status, reason="") => {
  
    // Fire the stripped-down endpoint we built earlier
    const res = await updateApi.execute({
      id,
      status,
      rejection_reason: reason,
      successMsg:"Updated Successfully."
    })
    if (res.success) {
      // Refresh the table view rows data from your database backend
      fetchData(pagination?.page || 1);
    }


  };


  useEffect(() => {
    fetchData(1
    )
  }, [])
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
          <div className="w-sm flex gap-3 items-center">

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
            <Button className="py-1" loading={campaignsApi.api} disabled={campaigns.api} onClick={() => {
              fetchData(1, {
                status: active,
                search
              })
            }}>
              Search
            </Button>

          </div>

        </div>

        <Table columns={columns} data={campaignsApi.data?.data?.data || []} loading={campaignsApi.loading} />
        <Pagination />


      </div>

      <RejectionModal
        isOpen={isRejectModalOpen}
        campaignName={selectedCampaign?.name}
        onClose={() => {
          setIsRejectModalOpen(false);
          setSelectedCampaign(null);
        }}
        onSubmit={(reason)=>{
          handleAction(selectedCampaign?.id,"rejected",reason)
        }}
      />

    </div>
  );
}