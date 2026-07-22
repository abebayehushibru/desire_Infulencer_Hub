import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import Table, { ActionMenu } from "../../components/common/Table";
import Button from "../../components/common/Button";
import { useState } from "react";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Title from "../../components/common/Titel";
import Pagination from "../../components/Pagination";
import StatsCard from "../../components/common/StatsCard.";

export default function Payments() {
  const navigate = useNavigate();
  const [active, setActive] = useState(false);

 const columns = [
  {
    key: "recipient",
    label: "Recipient",
    render: (value, row) => (
      <div className="flex items-center gap-3">
        <img
          src={row.avatar}
          alt=""
          className="w-10 h-10 rounded-full object-cover"
        />

        <div>
          <p className="font-semibold text-primary">{value}</p>
          <p className="text-xs text-gray-500">{row.role}</p>
        </div>
      </div>
    ),
  },

  {
    key: "campaign",
    label: "Campaign",
  },

  {
    key: "amount",
    label: "Amount",
    render: (value) => (
      <span className="font-semibold text-green-600">
        {value} ETB
      </span>
    ),
  },

  {
    key: "method",
    label: "Method",
    render: (value) => (
      <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium">
        {value}
      </span>
    ),
  },

  {
    key: "transaction",
    label: "Transaction ID",
    render: (value) => (
      <span className="font-mono text-gray-600">
        {value}
      </span>
    ),
  },

  {
    key: "date",
    label: "Payment Date",
  },

  {
    key: "status",
    label: "Status",
    render: (value) => (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold
        ${
          value === "Paid"
            ? "bg-green-100 text-green-700"
            : value === "Pending"
            ? "bg-yellow-100 text-yellow-700"
            : value === "Rejected"
            ? "bg-red-100 text-red-700"
            : "bg-blue-100 text-blue-700"
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
        onEdit={() => navigate(`/payments/${row.id}`)}
        onDelete={() => console.log(row)}
      />
    ),
  },
];

 const payments = [
  {
    id: 1,
    recipient: "Sara Beauty",
    role: "Diamond Influencer",
    avatar: "/avatar1.jpg",
    campaign: "Summer Beauty Campaign",
    amount: "18,500",
    method: "CBE",
    transaction: "TRX784512",
    date: "12 Jul 2026",
    status: "Paid",
  },
  {
    id: 2,
    recipient: "John Tech",
    role: "Gold Influencer",
    avatar: "/avatar2.jpg",
    campaign: "Tech Week",
    amount: "9,200",
    method: "Telebirr",
    transaction: "TRX215487",
    date: "10 Jul 2026",
    status: "Pending",
  },
  {
    id: 3,
    recipient: "Hana Food",
    role: "Silver Influencer",
    avatar: "/avatar3.jpg",
    campaign: "Food Festival",
    amount: "13,000",
    method: "Bank",
    transaction: "TRX987452",
    date: "08 Jul 2026",
    status: "Rejected",
  },
];
  return (
    <div className="bg-gray-50/10 min-h-full">

      <div className="flex justify-between items-center mb-4">
        <Title
    titel="Payments"
    disc="Track, manage and verify influencer payments."
>
    <div className="flex gap-3">

        <Button variant="secondary">
            Export
        </Button>

      

    </div>

</Title>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-4">

    <StatsCard
        title="Total Payments"
        number="1,284,000"
        color="green"
        currency={"ETB"}
    />

    <StatsCard
        title="Pending"
        number="146,000 "
        color="yellow"
        currency={"ETB"}
    />

    <StatsCard
        title="Completed"
        number="1,118,000 "
        color="blue"
         currency={"ETB"}
    />

    <StatsCard
        title="Rejected"
        number="20,000 "
        color="red"
         currency={"ETB"}
    />

</div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">

        {/* Search & Filters */}
      <div className="flex w-full  gap-4 justify-between mb-4">

    <Input
        name="search"
        placeholder="Search influencer..."
        className="max-w-sm"
    />

    <div className="flex flex-1 justify-between gap-3">

        <Select
            name="status"
            data={[
                {label:"All Status",value:""},
                {label:"Pending",value:"pending"},
                 {label:"Approved",value:"approved"},
                {label:"Paid",value:"paid"},
                
                {label:"Rejected",value:"rejected"},
            ]}
        />

        <Select
            name="method"
            data={[
                {label:"All Methods",value:""},
                {label:"CBE",value:"cbe"},
                {label:"Telebirr",value:"telebirr"},
                {label:"Bank",value:"bank"},
            ]}
        />

        <Input
            type="date"
            name="date"
        />

    </div>

</div>

        <Table columns={columns} data={payments} />
        <Pagination/>
      </div>
    </div>
  );
}