// src/pages/mobile/ClaimDetail.jsx

import { useState } from "react";
import {
    ArrowLeft,
    Share2,
    PlayCircle,
    MessageCircle,
    DollarSign,
    FileText,
    Building2,
    Calendar,
    Link2,
} from "lucide-react";
import Contents from "./Contents";
import Chat from "./Chat";
import Earnings from "./Earnings";
import { Outlet, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";

const tabs = [
    { id: "overview", label: "Overview" },
    { id: "contents", label: "Content" },
    { id: "chat", label: "Chat" },
    { id: "earnings", label: "Earnings" },
];

export default function ClaimDetail() {
    const [searchParam] = useSearchParams()
    const [activeTab, setActiveTab] = useState(
        tabs.find((tab) => tab?.id?.includes(searchParam))?.id || "overview"
    );

    const navigate = useNavigate();
    
    const handleNavigate = () => {

    }
    const handleBack = () => {
        navigate(-1);
    }
    return (
        <div className="min-h-full flex-1 flex flex-col text-primary ">

            {/* Header */}

            <div className=" bg-white border-b sticky border-gray-200 top-0 z-20">

                <div className="flex items-center justify-between px-4 gap-4 py-4">

                    <button>
                        <ArrowLeft size={22} />
                    </button>

                    <h2 className="font-semibold flex-1 text-sm">
                        Online English Course
                    </h2>

                    <button>
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
                                    navigate("/campaigns/123/chat");
                                }
                                else if (tab.id === "contents") {
                                    navigate("/campaigns/123/contents");
                                }
                                else if (tab.id === "earnings") {
                                    navigate("/campaigns/123/earnings");
                                }
                                else {
                                    navigate("/campaigns/123/overview");
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
                <Outlet />

            </div>
        </div>
    );
}

function InfoItem({ icon, title, value }) {
    return (
        <div className="flex gap-3">

            <div className="text-primary mt-1">
                {icon}
            </div>

            <div>

                <p className="text-gray-500 text-sm">
                    {title}
                </p>

                <h4 className="font-semibold">
                    {value}
                </h4>

            </div>

        </div>
    );
}


