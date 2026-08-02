import {
  ChevronRight,
  PlayCircle,
  MessageCircle,
  BarChart3,
  DollarSign,
  BadgeDollarSign,
} from "lucide-react";

import { NavLink, Outlet, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import ActionDropdown from "../../components/common/Action";
import useApi from "../../hooks/useApi";

export default function CampaignDetail() {
  const { id } = useParams();

  const [campaign, setCampaign] = useState(null);

  const campaignApi = useApi({
    request: () => ({
      method: "GET",
      path: `/campaigns/${id}`,
    }),
    manual: true,
  });


  useEffect(() => {
    if (!id) return;

    const loadCampaign = async () => {
      const res = await campaignApi.execute();

      if (res?.success) {
        setCampaign(res?.data?.data || res?.data);
      }
    };

    loadCampaign();

  }, [id]);


  const tabs = [
    {
      id: "overview",
      label: "Overview",
      path: `/campaigns/${id}`,
      icon: <BarChart3 size={18} />,
    },
    {
      id: "contents",
      label: "Contents",
      path: `/campaigns/${id}/contents`,
      icon: <PlayCircle size={18} />,
    },
    {
      id: "chat",
      label: "Chat",
      path: `/campaigns/${id}/chat`,
      icon: <MessageCircle size={18} />,
    },
    // {
    //   id: "performance",
    //   label: "Performance",
    //   path: `/campaigns/${id}/performance`,
    //   icon: <BarChart3 size={18} />,
    // },
    {
      id: "conversions",
      label: "Conversions",
      path: `/campaigns/${id}/conversions`,
      icon: <DollarSign size={18} />,
    },
    // {
    //   id: "earnings",
    //   label: "Earnings",
    //   path: `/campaigns/${id}/earnings`,
    //   icon: <BadgeDollarSign size={18} />,
    // },
  ];


  return (
    <div className="space-y-5 ">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Campaigns</span>

        <ChevronRight size={14} />

        <span className="font-semibold text-gray-900">
          {campaign?.title || "Campaign Detail"}
        </span>
      </div>


      {/* Header */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

          <div>

            <div className="flex flex-wrap items-center gap-3">

              <h1 className="text-2xl font-bold text-gray-900">
                {campaign?.title || "Loading..."}
              </h1>


              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                {campaign?.status || "Active"}
              </span>

            </div>


            <div className="mt-4 flex flex-wrap gap-3">

              <span className="rounded-full capitalize bg-primary/10 px-4 py-1 text-xs font-medium text-primary">
                {campaign?.type || "Sales "} Campaign
              </span>


              <span className="rounded-full bg-primary/10 px-4 py-1 text-xs">

                Payout / Conversion :

                <strong className="ml-1">
                  {`${campaign?.amount? `${campaign?.amount|| 0} ETB`:`${campaign?.conversion_rate|| 0}  %` } `}                </strong>

              </span>

            </div>

          </div>


          <ActionDropdown />

        </div>

      </div>



      {/* Tabs */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">

        <div className="flex min-w-max">

          {tabs.map((tab) => (

            <NavLink
              key={tab.id}
              to={tab.path}
              end={tab.id === "overview"}

              className={({ isActive }) =>
                `flex items-center gap-2 border-b-2 px-5 py-4 text-sm font-semibold transition ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-primary"
                }`
              }
            >

              {tab.icon}

              {tab.label}

            </NavLink>

          ))}

        </div>

      </div>



      {/* Content */}
      <div className="min-h-[500px] rounded-xl">
        <Outlet />
      </div>

    </div>
  );
}