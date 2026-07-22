import { Megaphone, Target, DollarSign, Wallet, Plus } from "lucide-react";
import StatsCard from "../components/common/StatsCard.";
import Table, { ActionMenu } from "../components/common/Table";
import { useState } from "react";
import Button from "../components/common/Button";
import AdminHome from "./home/Adminhome";
import InfluencerHome from "./home/Influencerhome";
import BusinessHome from "./home/Businesshome";

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

  const columns = [
    {
      key: "campaign",
      label: "Campaign",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-primary">{value}</span>
          <span className="text-xs text-gray-400">{row?.type} Campaign</span>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (value) => (
        <span className="rounded-full bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
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
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            value === "Active"
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
        <span className="block w-full text-center text-base font-semibold tabular-nums text-primary">
          {value}
        </span>
      ),
    },
    {
      key: "spend",
      label: "Spends",
      render: (value) => (
        <span className="font-semibold tabular-nums text-primary">
          {value} <span className="text-xs uppercase text-gray-400">Etb</span>
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (_, row, index) => (
        <ActionMenu
          onEdit={() => console.log("Edit", row)}
          onDelete={() => console.log("Delete", row)}
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
    <div className="flex flex-col gap-4">
     <AdminHome/>
     <InfluencerHome/>
     <BusinessHome/>
    </div>

  );
}