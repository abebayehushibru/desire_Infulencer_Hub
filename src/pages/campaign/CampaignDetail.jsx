import { useEffect, useState } from "react";
import {
    ChevronRight,
    MoreVertical,
    PlayCircle,
    MessageCircle,
    BarChart3,
    DollarSign,
    BadgeDollarSign,
} from "lucide-react";

// import Overview from "./Overview";
// import Content from "./Content";
import Chat from "./Chat";
import ActionDropdown from "../../components/commen/Action";
import Contents from "./Contents";
import Overview from "./Overview";
import Performance from "./Performance";
import Conversions from "./Conversions";
import Earnings from "./Earnings";
import { Outlet, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";

const tabs = [
    {
        id: "overview",
        label: "Overview",
        icon: <PlayCircle size={18} />,
    },
    {
        id: "contents",
        label: "Content",
        icon: <PlayCircle size={18} />,
    },
    {
        id: "chat",
        label: "Chat",
        icon: <MessageCircle size={18} />,
    },
    {
        id: "performance",
        label: "Performance",
        icon: <BarChart3 size={18} />,
    },
    {
        id: "conversions",
        label: "Conversions",
        icon: <BadgeDollarSign size={18} />,
    },
    {
        id: "earnings",
        label: "Earnings",
        icon: <DollarSign size={18} />,
    },
];

export default function CampaignDetail() {
    const loc = useLocation()


    const [activeTab, setActiveTab] = useState("overview");


    const navigate = useNavigate();
    const handleNavigate = (tab) => {
        let current = ""
        switch (tab) {
            case "overview":
                current = "/overview";
                break;
            case "contents":
                current = "/contents";
                break;

            case "chat":
                current = "/chat";
                break;

            case "performance":
                current = "/performance";
                break;

            case "conversions":
                current = "/conversions";
                break;

            case "earnings":
                current = "/earnings";
                break;

            default:
                current = "/overview";
        }
        setActiveTab(tab);
        navigate(`/campaigns/123${current}`);
    };

    return (
        <div className="space-y-4">
            {/* Breadcrumb */}

            <div className="flex items-center text-sm text-gray-500 gap-2">

                <span>Campaigns</span>

                <ChevronRight size={16} />

                <span className="text-gray-900 font-medium">
                    Online English Course 
                </span>

            </div>

            {/* Header */}

            <div className="bg-white rounded-lg border border-gray-200 p-6">

                <div className="flex justify-between items-start">

                    <div className="w-full ">

                        <div className="flex items-center gap-3 mb-3">

                            <h1 className="text-2xl font-bold">
                                Online English Course
                            </h1>

                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                                Active
                            </span>

                        </div>
                        <div className="hidden md:flex items-center justify-between w-full ">
                            <div className="flex gap-4 text-sm ">
                                <p className="text-primary  bg-primary/10 rounded-full px-4 py-1">
                                    Sales Campaign
                                </p>


                                <div className="text-primary bg-primary/10 rounded-full px-4 py-1">

                                    <span className="text-primary">
                                        Payout / Conversion
                                    </span> {"  : "}

                                    <span className="font-semibold">
                                        500 ETB
                                    </span>

                                </div>

                            </div>
                            <ActionDropdown />

                        </div>


                    </div>



                </div>

            </div>

            {/* Tabs */}

            <div className="bg-white rounded-lg border border-gray-200">

                <div className="flex overflow-x-auto">

                    {tabs.map((tab) => (

                        <button
                            key={tab.id}
                            onClick={() => handleNavigate(tab.id)}
                            className={`flex items-center cursor-pointer gap-2 px-5 py-4 border-b-2 whitespace-nowrap transition
${activeTab === tab.id
                                    ? "border-primary text-primary font-semibold"
                                    : "border-transparent text-gray-500 hover:text-primary"
                                }

              `}
                        >

                            {tab.icon}

                            {tab.label}

                        </button>

                    ))}

                </div>

            </div>

            {/* Page */}

            <div>
                <Outlet />

            </div>

        </div>
    );
}