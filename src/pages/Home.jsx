import {
    Users,
    GraduationCap,
    BookOpen,
    DollarSign,
    Calendar,
    UserPlus,
    BookPlus,
    CreditCard,
    Plus,
} from "lucide-react";
import StatsCard from "../components/commen/StatsCard.";
import Table, { ActionMenu } from "../components/commen/Table";
import { useState } from "react";
import Button from "../components/commen/Button";

export default function Home() {
    const hour = new Date().getHours();
    const [active, setActive] = useState(false);

    const greeting =
        hour < 12
            ? "Good Morning ☀️"
            : hour < 17
                ? "Good Afternoon 🌤️"
                : hour < 21
                    ? "Good Evening 🌇"
                    : "Good Night 🌙";


    const students = [
        {
            name: "John Doe",
            course: "English",
            status: "Active",
        },
        {
            name: "Sara Ali",
            course: "Mathematics",
            status: "Pending",
        },
        {
            name: "Ahmed Hassan",
            course: "Physics",
            status: "Active",
        },
    ];

    const columns = [
        {
            key: "campaign",
            label: "Campaign",

            render: (value, row) => (
                <div className="flex flex-col">
                    <span className=" py-1 rounded-full text-primary font-medium text-sm">
                        {value}

                    </span>
                    <span className=" rounded-full text-gray-400 text-xs">
                        {row?.type} Campiagn

                    </span>
                </div>)

        },
        {
            key: "type",
            label: "Type",
            render: (value, row) => (
                <span className="px-3 py-1 rounded-full bg-primary/5 text-primary text-xs">
                    {value}
                </span>
            ),
        },
        {
            key: "target",
            label: "Target",
        },
        {
            key: "status",
            label: "Status",
            render: (value) => (
                <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${value === "Active"
                        ? "bg-green-100 text-green-600"
                        : value === "Draft"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                >
                    {value}
                </span>
            ),
        },
        {
            key: "conversion",
            label: "Conversions",
            render: (value) => (
                <span className=" text-center block w-full  py-1 rounded-full  text-primary text-lg font-medium">
                    {value}
                </span>
            ),
        },
        {
            key: "spend",
            label: "Spends",
            render: (value) => (
                <span className=" py-1 rounded-full  text-primary text-lg font-medium">
                    {value} <span className=" text-sm uppercase text-gray-400">Etb</span>
                </span>
            ),
        },
        {
            key: "actions",
            label: "",
            render: (_, row, index) => (
                <ActionMenu
                    onEdit={() => console.log("Edit", row)}
                    onDelete={() => console.log("Delete", row)

                    }
                    index={index}
                    active={active}
                    setActive={setActive}
                />
            ),
        },
    ];

    const data = [
        {
            campaign: "Online English Course",
            type: "Sales",
            target: "Students",
            status: "Active",
            conversion: 320,
            spend: "30,000",
        },
        {
            campaign: "Addis Tech Event",
            type: "Awareness",
            target: "Developers",
            status: "Draft",
            conversion: 120,
            spend: "10,000",
        },
        {
            campaign: "Summer Promotion",
            type: "Growth",
            target: "Parents",
            status: "Completed",
            conversion: 540,
            spend: "15,000",
        },
    ];


    return (
        <div className=" bg-gray-50 min-h-full text-primary">

            {/* Greeting */}

            <div className="mb-4">
                <h1 className="text-xl font-bold">
                    {greeting}, Desire!
                </h1>

                <p className="text-gray-500 mt-1">
                    Here's what's happening in your campiagn.
                </p>
            </div>

            {/* Stats */}

            <div className="grid grid-cols-2  xl:grid-cols-4 gap-4">

                <StatsCard
                    title="Active Campiagns"
                    number={1250}
                    compare={12}

                    color="bg-blue-100 text-blue-600"
                />

                <StatsCard
                    title="Total Conversion"
                    number={85}
                    compare={3}

                    color="bg-green-100 text-green-600"
                />

                <StatsCard
                    title="Total spent"
                    number="250,000"
                    currency="ETB"
                    compare={-7}
                    color="bg-violet-100 text-violet-600"
                />

                <StatsCard
                    title="Total Earnings"
                    number="150,000"
                    compare={5}
                    currency="ETB"
                    color="bg-orange-100 text-orange-600"
                />
            </div>

            {/* Content */}

            <div className="">

                {/* Recent Students */}

                <div className="xl:col-span-2 bg-white rounded-lg border border-gray-200 mt-4 shadow-sm p-6">
                    <div className="flex items-start justify-between mb-4">
                        <h2 className="font-semibold text-primary text-lg mb-0">
                            Recent Campaigns
                        </h2>
                        <div className="hidden md:flex">
                            <Button
                                className="rounded-lg "
                                type=""
                                leftIcon={<Plus size={20} />}

                            >
                                Create Campiagn
                            </Button>

                        </div>

                    </div>

                    <Table columns={columns} data={data} />

                </div>




            </div>

        </div>
    );
}