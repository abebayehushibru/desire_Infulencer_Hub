// src/pages/mobile/ClaimDetail.jsx

import { useEffect, useState } from "react";
import {
    ArrowLeft,
    Share2,
} from "lucide-react";
import { Outlet, useNavigate, useParams, useSearchParams } from "react-router-dom";
import useApi from "../../hooks/useApi";

const tabs = [
    { id: "overview", label: "Overview" },
    { id: "contents", label: "Content" },
    { id: "chat", label: "Chat" },
    { id: "earnings", label: "Earnings" },
];

export default function ClaimDetail() {
    const { id } = useParams();
    const [searchParam] = useSearchParams()
    const [activeTab, setActiveTab] = useState(
        tabs.find((tab) => tab?.id?.includes(searchParam))?.id || "overview"
    );
    const [campaign, setCampaign] = useState(null);

    const {
        execute: executeCampaign,
        loading,
        error,
    } = useApi({
        request: () => ({
            method: "GET",
            path: `/campaigns/${id}`,
            manual: true,
        }),
    });

    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1);
    }
    

    useEffect(() => {
        if (!id) return;

        (async () => {
            const res = await executeCampaign();
            if (res?.success) {
                setCampaign(res?.data?.data || res?.data || null);
            }
        })();
    }, [id, executeCampaign]);

    const campaignTitle = campaign?.title || "Campaign details";
    const campaignStatus = campaign?.status ? campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1) : "Loading";

    return (
        <div className="min-h-full flex-1 flex flex-col text-primary ">

            {/* Header */}

            <div className=" bg-white border-b sticky border-gray-200 top-0 z-20">

                <div className="flex items-center justify-between px-4 gap-4 py-4">

                    <button type="button" onClick={handleBack} aria-label="Go back">
                        <ArrowLeft size={22} />
                    </button>

                    <h2 className="font-semibold flex-1 text-sm">
                        {campaignTitle}
                    </h2>

                    <span className="hidden sm:inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {campaignStatus}
                    </span>

                    <button type="button" aria-label="Share campaign">
                        <Share2 size={20} />
                    </button>

                </div>

                {/* Tabs */}

                <div className="flex overflow-x-auto">

                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id)
                                if (tab.id === "chat") {
                                    navigate(`/campaigns/${id}/chat`);
                                }
                                else if (tab.id === "contents") {
                                    navigate(`/campaigns/${id}/contents`);
                                }
                                else if (tab.id === "earnings") {
                                    navigate(`/campaigns/${id}/earnings`);
                                }
                                else {
                                    navigate(`/campaigns/${id}/overview`);
                                }
                            }}
                            className={`px-5 py-3 text-sm whitespace-nowrap border-b-2 transition

              ${activeTab === tab.id
                                    ? "border-primary text-primary font-semibold"
                                    : "border-transparent text-gray-500"
                                }
              `}
                        >
                            {tab.label}
                        </button>
                    ))}

                </div>

            </div>

            {/* Body */}
            <div className="flex-1 flex flex-col min-h-full  overflow-y-auto">
                <Outlet
                    context={{
                        campaign,
                        loading,
                        error,
                    }}
                />

            </div>
        </div>
    );
}


