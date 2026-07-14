import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  Pencil,
  MoreHorizontal,
  Mail,
  Phone,
  Globe,
  MapPin,
  Megaphone,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Eye,
  MousePointerClick,
  ShoppingCart,
} from "lucide-react";

const BUSINESS = {
  name: "Desire Online School",
  category: "Education",
  tier: "Diamond",
  status: "Active",
  email: "contact@desire.com",
  phone: "0911223344",
  website: "https://desire.com",
  location: "Addis Ababa",
  address: "Bole Road, Building 4, Floor 2",
  description: "Leading online education platform in Ethiopia connecting students with quality courses.",
  joined: "Jan 2024",
};

const STATS = [
  { label: "Total Campaigns", value: "12", icon: Megaphone, color: "bg-blue-50 text-blue-600" },
  { label: "Total Influencers", value: "45", icon: Users, color: "bg-purple-50 text-purple-600" },
  { label: "Total Spent", value: "480K ETB", icon: DollarSign, color: "bg-green-50 text-green-600" },
  { label: "Conversions", value: "2,340", icon: ShoppingCart, color: "bg-orange-50 text-orange-600" },
];

const CAMPAIGNS = [
  { name: "Online English Course", type: "Sales", status: "Active", budget: "120,000 ETB", conversions: 320 },
  { name: "Summer Promotion", type: "Growth", status: "Completed", budget: "80,000 ETB", conversions: 540 },
  { name: "Addis Tech Event", type: "Awareness", status: "Draft", budget: "60,000 ETB", conversions: 0 },
];

const TABS = ["Overview", "Campaigns", "Influencers", "Payments"];

export default function Businessdetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div className="bg-gray-50 min-h-full space-y-4 text-primary">

      {/* Header Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-secondary to-primary text-white flex items-center justify-center text-2xl font-bold">
              {BUSINESS.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{BUSINESS.name}</h1>
                <BadgeCheck className="text-secondary" size={20} />
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  BUSINESS.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                }`}>{BUSINESS.status}</span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{BUSINESS.category} · {BUSINESS.tier}</p>
              <p className="text-xs text-gray-400 mt-1">Member since {BUSINESS.joined}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/businesses/edit/${id}`)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:border-gray-300"
            >
              <Pencil size={14} /> Edit
            </button>
            <button className="rounded-lg border border-gray-200 p-2 text-gray-400 hover:border-gray-300">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>

        {/* Contact row */}
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Mail size={12} /> {BUSINESS.email}</span>
          <span className="flex items-center gap-1"><Phone size={12} /> {BUSINESS.phone}</span>
          <span className="flex items-center gap-1"><Globe size={12} /> {BUSINESS.website}</span>
          <span className="flex items-center gap-1"><MapPin size={12} /> {BUSINESS.location}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-gray-500 text-sm mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-4 text-sm border-b-2 whitespace-nowrap transition ${
                activeTab === tab
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-gray-500 hover:text-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "Overview" && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="font-semibold text-lg mb-4">About</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{BUSINESS.description}</p>
            <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Full Address</p>
                <p className="font-medium mt-0.5">{BUSINESS.address}</p>
              </div>
              <div>
                <p className="text-gray-400">Category</p>
                <p className="font-medium mt-0.5">{BUSINESS.category}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="font-semibold text-lg mb-4">Quick Stats</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Active Campaigns</span><span className="font-semibold">3</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Total Influencers</span><span className="font-semibold">45</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Avg. Conversion Rate</span><span className="font-semibold">4.8%</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Total ROI</span><span className="font-semibold text-green-600">3.2x</span></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Campaigns" && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="font-semibold text-lg mb-4">Campaigns</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-3 font-medium">Campaign</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Budget</th>
                  <th className="pb-3 font-medium">Conversions</th>
                </tr>
              </thead>
              <tbody>
                {CAMPAIGNS.map((c) => (
                  <tr key={c.name} className="border-b border-gray-50 last:border-none">
                    <td className="py-3 font-medium">{c.name}</td>
                    <td className="py-3 text-gray-500">{c.type}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        c.status === "Active" ? "bg-green-100 text-green-700"
                        : c.status === "Completed" ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                      }`}>{c.status}</span>
                    </td>
                    <td className="py-3 text-gray-500">{c.budget}</td>
                    <td className="py-3 font-medium">{c.conversions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(activeTab === "Influencers" || activeTab === "Payments") && (
        <div className="bg-white rounded-lg border border-gray-200 p-10 text-center">
          <p className="text-gray-400">Coming soon</p>
        </div>
      )}
    </div>
  );
}
