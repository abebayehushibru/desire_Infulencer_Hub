import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Phone,
  Send,
  Megaphone,
  Users,
  UserCheck,
  Wallet,
  FileText,
  Share2,
  Loader2,
  CheckCircle2,
  Lock,
  Calendar,
  Clock,
  Save,
} from "lucide-react";

import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import Title from "../../components/common/Titel";

/* ---------------------------------------------------------
   Mock data — swap for a real fetch by :id / real API calls
--------------------------------------------------------- */

// Stand-in for a record loaded from the API.
const SAMPLE_CONVERSION = {
  id: "conv_8231",
  customer_name: "Selam Tesfaye",
  customer_phone: "0911998877",
  customer_telegram: "@selamt",
  campaign_id: "c1",
  campaign_label: "Summer Refresh — Coca-Cola",
  target_type: "community",
  community_id: "comm1",
  community_label: "Sara Beauty Community",
  influencer_id: "inf2",
  influencer_label: "Hana T.",
  platform: "instagram",
  paid_amount: "650",
  description: "Customer ordered via the Instagram bio link during the launch week.",
  status: "pending",
  current: "pending",
  created_at: "2026-07-10T09:14:00Z",
  updated_at: "2026-07-12T16:40:00Z",
};

const PLATFORMS = [
  { label: "TikTok", value: "tiktok" },
  { label: "Instagram", value: "instagram" },
  { label: "Facebook", value: "facebook" },
  { label: "YouTube", value: "youtube" },
  { label: "Telegram", value: "telegram" },
  { label: "Other", value: "other" },
];

const STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Deleted", value: "deleted" },
];

const STATUS_STYLE = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  deleted: "bg-red-100 text-red-600",
};

// Simulated async load — replace with a real fetch by :id.
const fetchConversion = (id) =>
  new Promise((resolve) => setTimeout(() => resolve({ ...SAMPLE_CONVERSION, id }), 600));

function ReadOnlyField({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
        {label}
        <Lock size={12} className="text-gray-300" />
      </label>
      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-600">
        {Icon && <Icon size={16} className="shrink-0 text-gray-400" />}
        <span className="truncate">{children}</span>
      </div>
    </div>
  );
}

export default function EditConversion() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchConversion(id).then((data) => {
      if (mounted) {
        setForm(data);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading || !form) {
    return (
      <div className="flex min-h-[420px] items-center justify-center text-gray-400">
        <Loader2 size={22} className="animate-spin" />
        <span className="ml-2 text-sm font-medium">Loading conversion...</span>
      </div>
    );
  }

  const isApproved = form.current === "approved";

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.customer_name.trim()) e.customer_name = "Customer name is required.";
    if (!form.customer_phone.trim()) e.customer_phone = "Customer phone is required.";

    // Only validate the rest of the form when it's still editable.
    if (!isApproved) {
      if (!form.campaign_id) e.campaign_id = "Select a campaign.";
      if (!form.platform) e.platform = "Select a platform.";
      if (!form.paid_amount) e.paid_amount = "Enter the paid amount.";
      else if (Number(form.paid_amount) <= 0) e.paid_amount = "Amount must be greater than 0.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = isApproved
        ? {
            // Approved conversions only allow customer-info edits + status changes.
            customer_name: form.customer_name,
            customer_phone: form.customer_phone,
            customer_telegram: form.customer_telegram || null,
            status: form.status,
          }
        : {
            customer_name: form.customer_name,
            customer_phone: form.customer_phone,
            customer_telegram: form.customer_telegram || null,
            campaign_id: form.campaign_id,
            community_id: form.community_id || null,
            influencer_id: form.influencer_id || null,
            platform: form.platform,
            paid_amount: Number(form.paid_amount),
            description: form.description || null,
            status: form.status,
          };

      console.log("Update conversion payload:", payload);
      // await api.patch(`/conversions/${id}`, payload);
      await new Promise((r) => setTimeout(r, 700));

      setSubmitted(true);
    } catch (err) {
      setSubmitError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto flex min-h-[420px] max-w-2xl flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 size={28} className="text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">Changes saved</h2>
        <p className="max-w-sm text-sm text-gray-500">
          {form.customer_name}'s conversion has been updated.
        </p>
        <Button onClick={() => navigate(-1)}>Back to Conversions</Button>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
     
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Title titel={"Edit Conversion"} disc={`Update conversion #${form.id}.`}>
         <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-700"
      >
        <ArrowLeft size={16} /> Back
      </button>
    </Title>

       
      </div>

      {isApproved && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          <Lock size={16} className="mt-0.5 shrink-0" />
          <span>
            This conversion is <b>Approved</b>. Campaign, platform, amount, and description are locked —
            only customer info and status can still be changed.
          </span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="max-w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        {/* Status */}
  
        {/* Customer Info — always editable */}
        <h3 className="mb-4 mt-6 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Customer Information  <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLE[form.current]}`}>
          {form.current}
        </span>
        </h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="Customer Name"
              name="customer_name"
              required
              leftIcon={<User size={18} />}
              value={form.customer_name}
              onChange={set("customer_name")}
              error={errors.customer_name}
            />
          </div>
          <Input
            label="Phone Number"
            name="customer_phone"
            required
            leftIcon={<Phone size={18} />}
            value={form.customer_phone}
            onChange={set("customer_phone")}
            error={errors.customer_phone}
          />
          <Input
            label="Telegram Username"
            name="customer_telegram"
            leftIcon={<Send size={18} />}
            value={form.customer_telegram}
            onChange={set("customer_telegram")}
          />
        </div>
       

        {/* Campaign & Conversion Details — locked once approved */}
        <h3 className="mb-4 mt-6 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Campaign &amp; Conversion Details
        </h3>

        {isApproved ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <ReadOnlyField label="Campaign" icon={Megaphone}>
                {form.campaign_label}
              </ReadOnlyField>
            </div>
            {form.community_label && (
              <ReadOnlyField label="Community" icon={Users}>
                {form.community_label}
              </ReadOnlyField>
            )}
            {form.influencer_label && (
              <ReadOnlyField label="Influencer" icon={UserCheck}>
                {form.influencer_label}
              </ReadOnlyField>
            )}
            <ReadOnlyField label="Platform" icon={Share2}>
              {PLATFORMS.find((p) => p.value === form.platform)?.label || form.platform}
            </ReadOnlyField>
            <ReadOnlyField label="Paid Amount" icon={Wallet}>
              {form.paid_amount} ETB
            </ReadOnlyField>
            {form.description && (
              <div className="sm:col-span-2">
                <ReadOnlyField label="Description" icon={FileText}>
                  {form.description}
                </ReadOnlyField>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="Campaign"
                name="campaign_label"
                required
                disabled
                leftIcon={<Megaphone size={18} />}
                value={form.campaign_label}
                error={errors.campaign_id}
              />
            </div>

            {form.community_label && (
              <Input
                label="Community"
                name="community_label"
                disabled
                leftIcon={<Users size={18} />}
                value={form.community_label}
              />
            )}
            {form.influencer_label && (
              <Input
                label="Influencer"
                name="influencer_label"
                disabled
                leftIcon={<UserCheck size={18} />}
                value={form.influencer_label}
              />
            )}

            <Select
              label="Platform"
              name="platform"
              required
              leftIcon={<Share2 size={18} />}
              value={form.platform}
              onChange={set("platform")}
              data={PLATFORMS}
              error={errors.platform}
            />

            <Input
              label="Paid Amount"
              name="paid_amount"
              type="number"
              min="0"
              required
              leftIcon={<Wallet size={18} />}
              value={form.paid_amount}
              onChange={set("paid_amount")}
              error={errors.paid_amount}
            />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Select
            label="Status"
            name="status"
            value={form.status}
            onChange={set("status")}
            data={STATUS_OPTIONS}
          />
        </div>


            <div className="sm:col-span-2">
              <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-gray-700">
                <FileText size={14} /> Description / Other Details
                <span className="text-xs font-normal text-gray-400">(Optional)</span>
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={set("description")}
                className="w-full resize-none rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        )}

        {/* Read-only audit info */}
        <div className="mt-6 grid grid-cols-1 gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm sm:grid-cols-2">
          <div>
            <p className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar size={12} /> Created At
            </p>
            <p className="font-medium text-gray-700">{new Date(form.created_at).toLocaleString()}</p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-xs text-gray-400">
              <Clock size={12} /> Last Updated
            </p>
            <p className="font-medium text-gray-700">{new Date(form.updated_at).toLocaleString()}</p>
          </div>
        </div>

        {submitError && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
            {submitError}
          </p>
        )}

        <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-6">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" leftIcon={!submitting && <Save size={16} />} disabled={submitting}>
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" /> Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}