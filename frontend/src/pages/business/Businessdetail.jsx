import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  MessageCircleReply,
  Camera,
  Send,
  Music2,
  Pencil,
  Ban,
  CheckCircle2,
  BadgeCheck,
  Calendar,
  Clock,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  Megaphone,
  Wallet,
  TrendingUp,
  FileText,
  Upload,
} from "lucide-react";

import Button from "../../components/common/Button";
import Table, { ActionMenu } from "../../components/common/Table";
import StatsCard from "../../components/common/StatsCard.";
import PageLoader from "../../components/PageLoader";
import useApi from "../../hooks/useApi";

// Stand-in for a record loaded from the API — swap for a real fetch by :id.
const SAMPLE_BUSINESS = {
  id: "b1f0c2b2-2f3a-4a5b-9e2a-6d1f2c3a4b5c",
  name_or_company_name: "Desire Online School",
  email: "info@desire.et",
  phone_1: "0985444411",
  phone_2: "0985444433",
  role: "business",
  status: "active",
  login_attempts: 0,
  created_at: "2025-11-02T09:14:00Z",
  updated_at: "2026-07-10T14:02:00Z",

  // business_profiles
  company_address: "New bus station, Hawasa, Ethiopia",
  business_category: "Education",
  company_description:
    "Desire Online School offers accredited English, math, and test-prep courses to students across Ethiopia, blending live instruction with self-paced content.",
  website_url: "https://desireonline.et",
  facebook_url: "https://facebook.com/desireonline",
  instagram_url: "https://instagram.com/desireonline",
  telegram_url: "https://t.me/desireonline",
  tiktok_url: "",
  logo_name: "desire-logo.png",
  license_name: "desire-business-license.pdf",
  subscription_type: "Premium",
  subscription_status: "Active",
  subscription_start_date: "2026-01-01",
  subscription_end_date: "2026-12-31",
  is_verified: true,
  verified_at: "2026-01-05T10:00:00Z",
  verified_by: "Admin — Kalkidan M.",
};

const CAMPAIGNS = [
  { id: "cmp1", name: "Online English Course", status: "Active", budget: "30,000 ETB", conversions: 320, created_at: "2026-05-02" },
  { id: "cmp2", name: "Summer Promotion", status: "Completed", budget: "15,000 ETB", conversions: 540, created_at: "2026-03-14" },
  { id: "cmp3", name: "New Term Enrollment", status: "Draft", budget: "10,000 ETB", conversions: 0, created_at: "2026-07-01" },
];

const STATUS_STYLE = {
  active: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  inactive: "bg-gray-100 text-gray-600",
  suspended: "bg-red-100 text-red-600",
};

const CAMPAIGN_STATUS_STYLE = {
  Active: "bg-green-100 text-green-700",
  Draft: "bg-gray-100 text-gray-600",
  Completed: "bg-sky-100 text-sky-700",
  Cancelled: "bg-red-100 text-red-600",
};

const SUBSCRIPTION_STYLE = {
  Free: "bg-gray-100 text-gray-600",
  Basic: "bg-sky-100 text-sky-700",
  Premium: "bg-primary/10 text-primary",
  Enterprise: "bg-yellow-100 text-yellow-700",
};

const SOCIALS = [
  { key: "website_url", label: "Website", icon: Globe },
  { key: "facebook_url", label: "Facebook", icon: MessageCircleReply },
  { key: "instagram_url", label: "Instagram", icon: Camera },
  { key: "telegram_url", label: "Telegram", icon: Send },
  { key: "tiktok_url", label: "TikTok", icon: Music2 },
];

const TABS = ["Detail", "Campaigns", "Files"];

export default function BusinessDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const business = SAMPLE_BUSINESS; // TODO: fetch by id
  const [tab, setTab] = useState("Detail");
  const [active, setActive] = useState(false);
 const businessApi = useApi({
        request: () => ({
            method: "GET",
            path: "/business/id",
           
        }),
    });
  const isSuspended = business.status === "suspended";

  return (
    
    <div className="min-h-full bg-gray-50/20 flex flex-col">
 {true?<PageLoader label="Loading Businesses Detail..." />:

      <div className="max-w-full space-y-4">
        {/* ---------------- SUMMARY ---------------- */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-secondary to-primary text-white shadow-sm">
                <Building2 size={28} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg font-bold text-primary">{business.name_or_company_name}</h1>
                  {business.is_verified && (
                    <span title="Verified business">
                      <BadgeCheck size={18} className="text-primary" />
                    </span>
                  )}
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[business.status]}`}>
                    {business.status}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${SUBSCRIPTION_STYLE[business.subscription_type]}`}>
                    {business.subscription_type}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-400">{business.business_category} · Business Account</p>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Mail size={14} className="text-gray-400" /> {business.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone size={14} className="text-gray-400" /> {business.phone_1}
                  </span>
                    <span className="flex items-center gap-1.5">
                    <Phone size={14} className="text-gray-400" /> {business.phone_2}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-gray-400" /> {business.company_address}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link to={`/businesses/edit/${id ?? business.id}`} className="flex  cursor-pointer items-center gap-1.5 rounded-lg bg-[var(--color-secondary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary)]">
                <Building2 className="h-4 w-4" /> Edit Business
              </Link>

              <Button
                variant={isSuspended ? "primary" : "outline"}
                leftIcon={isSuspended ? <CheckCircle2 size={16} /> : <Ban size={16} />}
                onClick={() => console.log(isSuspended ? "Activate" : "Suspend", business.id)}
                className={!isSuspended ? "border-red-200 text-red-600 hover:bg-red-50" : ""}
              >
                {isSuspended ? "Activate" : "Suspend"}
              </Button>
            </div>
          </div>

          {SOCIALS.some((s) => business[s.key]) && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
              {SOCIALS.filter((s) => business[s.key]).map((s) => (
                <a
                  key={s.key}
                  href={business[s.key]}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-primary hover:text-primary"
                >
                  <s.icon size={13} /> {s.label} <ExternalLink size={11} className="text-gray-300" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* ---------------- TABS ---------------- */}
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1.5">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg cursor-pointer px-4 py-2 text-sm font-medium transition ${tab === t ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-50"
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ---------------- DETAIL TAB ---------------- */}
        {tab === "Detail" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
                Company Description
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                {business.company_description || "No description provided."}
              </p>
              {business.phone_2 && (
                <div className="mt-4 flex items-center gap-1.5 text-sm text-gray-500">
                  <Phone size={14} className="text-gray-400" /> Alt. Phone: {business.phone_2}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Subscription */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
                  Subscription
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Plan</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${SUBSCRIPTION_STYLE[business.subscription_type]}`}>
                      {business.subscription_type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Status</span>
                    <span className="font-medium text-gray-700">{business.subscription_status}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Start Date</span>
                    <span className="font-medium text-gray-700">
                      {new Date(business.subscription_start_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">End Date</span>
                    <span className="font-medium text-gray-700">
                      {new Date(business.subscription_end_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Verification & meta */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
                  Verification &amp; Account
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-400">
                      <ShieldCheck size={13} /> Verified
                    </span>
                    <span className={`font-medium ${business.is_verified ? "text-green-600" : "text-gray-400"}`}>
                      {business.is_verified ? "Yes" : "Not verified"}
                    </span>
                  </div>
                  {business.is_verified && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Verified At</span>
                        <span className="font-medium text-gray-700">
                          {new Date(business.verified_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Verified By</span>
                        <span className="font-medium text-gray-700">{business.verified_by}</span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-400">
                      <ShieldAlert size={13} /> Login Attempts
                    </span>
                    <span className="font-medium text-gray-700">{business.login_attempts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-400">
                      <Calendar size={13} /> Created
                    </span>
                    <span className="font-medium text-gray-700">
                      {new Date(business.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-400">
                      <Clock size={13} /> Last Updated
                    </span>
                    <span className="font-medium text-gray-700">
                      {new Date(business.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- CAMPAIGNS TAB ---------------- */}
        {tab === "Campaigns" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatsCard title="Total Campaigns" number={CAMPAIGNS.length} icon={Megaphone} color="bg-gray-50 text-primary" />
              <StatsCard
                title="Active"
                number={CAMPAIGNS.filter((c) => c.status === "Active").length}
                icon={TrendingUp}
                color="bg-green-100 text-green-600"
              />
              <StatsCard title="Total Budget" number="55,000 ETB" icon={Wallet} color="bg-yellow-100 text-yellow-700" />
              <StatsCard
                title="Total Conversions"
                number={CAMPAIGNS.reduce((sum, c) => sum + c.conversions, 0)}
                icon={CheckCircle2}
                color="bg-sky-100 text-sky-700"
              />
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Campaigns</h3>
                <Button size="sm" onClick={() => navigate("/campaigns/create")}>
                  New Campaign
                </Button>
              </div>

              <Table
                columns={[
                  {
                    key: "name",
                    label: "Campaign",
                    render: (value) => <span className="font-medium text-gray-900">{value}</span>,
                  },
                  {
                    key: "status",
                    label: "Status",
                    render: (value) => (
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${CAMPAIGN_STATUS_STYLE[value]}`}>
                        {value}
                      </span>
                    ),
                  },
                  {
                    key: "budget",
                    label: "Budget",
                    render: (value) => <span className="font-medium tabular-nums text-gray-700">{value}</span>,
                  },
                  {
                    key: "conversions",
                    label: "Conversions",
                    render: (value) => <span className="tabular-nums text-gray-700">{value}</span>,
                  },
                  {
                    key: "created_at",
                    label: "Created",
                    render: (value) => <span className="text-gray-500">{new Date(value).toLocaleDateString()}</span>,
                  },
                  {
                    key: "actions",
                    label: "",
                    render: (_, row, index) => (
                      <ActionMenu
                        index={index}
                        active={active}
                        setActive={setActive}
                        onEdit={() => navigate(`/campaigns/${row.id}`)}
                      />
                    ),
                  },
                ]}
                data={CAMPAIGNS}
              />
            </div>
          </div>
        )}

        {/* ---------------- FILES TAB ---------------- */}
        {tab === "Files" && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">Documents</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Company Logo</p>
                    <p className="text-xs text-gray-400">{business.logo_name || "Not uploaded"}</p>
                  </div>
                </div>
                <button className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                  <Upload size={13} /> Replace
                </button>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Business License</p>
                    <p className="text-xs text-gray-400">{business.license_name || "Not uploaded"}</p>
                  </div>
                </div>
                <button className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                  <Upload size={13} /> Replace
                </button>
              </div>
            </div>
          </div>
        )}
      </div>}
    </div>
  );
}