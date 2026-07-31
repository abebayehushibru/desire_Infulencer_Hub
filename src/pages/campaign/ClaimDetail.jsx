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
    BadgeDollarSign,
} from "lucide-react";
import Contents from "./Contents";
import Chat from "./Chat";
import Earnings from "./Earnings";
import { NavLink, Outlet, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";



export default function ClaimDetail() {
    const loc = useLocation()
    const { id } = useParams();
    
    const tabs = [
        {
            id: "overview",
            label: "Overview",
            path: `/campaigns/${id}`,
            icon: <PlayCircle size={18} />,
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
       
    
    ];
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

                <div className="flex items-center justify-between px-1 gap-4 py-1">

                    <button onClick={handleBack}>
                        <ArrowLeft size={22} />
                    </button>

                    <h2 className="font-semibold flex-1 text-sm">
                       Chat Room 
                    </h2>

                    <button>
                        <Share2 size={20} />
                    </button>

                </div>

                {/* Tabs */}

                <div className="flex overflow-x-auto">

                    {tabs.map((tab) => (
                        <NavLink
                            key={tab.id}
                            to={tab.path}
                            end={tab.id === "overview"}
                            className={({ isActive }) =>
                                `flex items-center gap-2 p-2 py-3 border-b-2 font-semibold whitespace-nowrap transition ${isActive
                                    ? "border-primary text-primary "
                                    : "border-transparent text-gray-500 hover:text-primary hover:border-gray-300"
                                }`
                            }
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </NavLink>
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


