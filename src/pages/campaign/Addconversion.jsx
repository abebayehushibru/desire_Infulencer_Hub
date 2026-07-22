import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Camera,
  Video,
  Music2,
  Globe,
  MessageCircleReply,
} from "lucide-react";

import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import Title from "../../components/common/Titel";

/* ---------------------------------------------------------
   Mock data — swap for real API calls (see fetch* functions below)
--------------------------------------------------------- */

const MOCK_CAMPAIGNS = [
  { value: "c1", label: "Summer Refresh — Coca-Cola", target_type: "community" },
  { value: "c2", label: "Run Addis 2026 — Nike", target_type: "influencer", targeted_influencer: { id: "inf5", name: "Abebe Kebede" } },
  { value: "c3", label: "Glow Summer Launch — Nivea", target_type: "community" },
  { value: "c4", label: "Unfold Your Story — Samsung", target_type: "influencer", targeted_influencer: { id: "inf6", name: "Liya Alemu" } },
];

const MOCK_COMMUNITIES_BY_CAMPAIGN = {
  c1: [
    { label: "Sara Beauty Community", value: "comm1" },
    { label: "Fit Ethiopia", value: "comm2" },
  ],
  c3: [
    { label: "Sara Beauty Community", value: "comm1" },
    { label: "Foodies Addis", value: "comm3" },
  ],
};

const MOCK_INFLUENCERS_BY_COMMUNITY = {
  comm1: [
    { label: "Sara Beauty", value: "inf1" },
    { label: "Hana T.", value: "inf2" },
  ],
  comm2: [{ label: "Fit Coach Dawit", value: "inf3" }],
  comm3: [{ label: "Foodie Meron", value: "inf4" }],
};

const PLATFORMS = [
  { label: "TikTok", value: "tiktok", icon: Music2 },
  { label: "Instagram", value: "instagram", icon: Camera },
  { label: "Facebook", value: "facebook", icon: MessageCircleReply },
  { label: "YouTube", value: "youtube", icon: Video },
  { label: "Telegram", value: "telegram", icon: Send },
  { label: "Other", value: "other", icon: Globe },
];

// Simulated async lookups — replace bodies with real axios/api calls.
const fetchCampaigns = () => new Promise((resolve) => setTimeout(() => resolve(MOCK_CAMPAIGNS), 500));
const fetchCommunities = (campaignId) =>
  new Promise((resolve) => setTimeout(() => resolve(MOCK_COMMUNITIES_BY_CAMPAIGN[campaignId] || []), 500));
const fetchInfluencers = (communityId) =>
  new Promise((resolve) => setTimeout(() => resolve(MOCK_INFLUENCERS_BY_COMMUNITY[communityId] || []), 500));
const fetchTargetedInfluencer = (campaign) =>
  new Promise((resolve) => setTimeout(() => resolve(campaign?.targeted_influencer || null), 400));

export default function AddConversion() {
  const navigate = useNavigate();

  // Customer info
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerTelegram, setCustomerTelegram] = useState("");

  // Campaign / targeting
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [campaignId, setCampaignId] = useState("");
  const selectedCampaign = campaigns.find((c) => c.value === campaignId) || null;

  const [communities, setCommunities] = useState([]);
  const [communitiesLoading, setCommunitiesLoading] = useState(false);
  const [communityId, setCommunityId] = useState("");

  const [influencers, setInfluencers] = useState([]);
  const [influencersLoading, setInfluencersLoading] = useState(false);
  const [influencerId, setInfluencerId] = useState("");

  const [targetedInfluencer, setTargetedInfluencer] = useState(null);
  const [targetedInfluencerLoading, setTargetedInfluencerLoading] = useState(false);

  // Conversion details
  const [platform, setPlatform] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [description, setDescription] = useState("");

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Load campaigns on mount
  useEffect(() => {
    let mounted = true;
    setCampaignsLoading(true);
    fetchCampaigns().then((data) => {
      if (mounted) {
        setCampaigns(data);
        setCampaignsLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // When campaign changes, reset downstream selections and load what's needed
  useEffect(() => {
    setCommunityId("");
    setInfluencerId("");
    setCommunities([]);
    setInfluencers([]);
    setTargetedInfluencer(null);

    if (!selectedCampaign) return;

    if (selectedCampaign.target_type === "community") {
      let mounted = true;
      setCommunitiesLoading(true);
      fetchCommunities(selectedCampaign.value).then((data) => {
        if (mounted) {
          setCommunities(data);
          setCommunitiesLoading(false);
        }
      });
      return () => {
        mounted = false;
      };
    }

    if (selectedCampaign.target_type === "influencer") {
      let mounted = true;
      setTargetedInfluencerLoading(true);
      fetchTargetedInfluencer(selectedCampaign).then((data) => {
        if (mounted) {
          setTargetedInfluencer(data);
          setTargetedInfluencerLoading(false);
        }
      });
      return () => {
        mounted = false;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  // When community changes, load its influencers
  useEffect(() => {
    setInfluencerId("");
    setInfluencers([]);
    if (!communityId) return;

    let mounted = true;
    setInfluencersLoading(true);
    fetchInfluencers(communityId).then((data) => {
      if (mounted) {
        setInfluencers(data);
        setInfluencersLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [communityId]);

  const validate = () => {
    const e = {};
    if (!customerName.trim()) e.customerName = "Customer name is required.";
    if (!customerPhone.trim()) e.customerPhone = "Customer phone is required.";

    if (!campaignId) e.campaignId = "Select a campaign.";
    if (selectedCampaign?.target_type === "community") {
      if (!communityId) e.communityId = "Select a community.";
      if (communityId && !influencerId) e.influencerId = "Select an influencer.";
    }

    if (!platform) e.platform = "Select a platform.";
    if (!paidAmount) e.paidAmount = "Enter the paid amount.";
    else if (Number(paidAmount) <= 0) e.paidAmount = "Amount must be greater than 0.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        customer: {
          name: customerName,
          phone: customerPhone,
          telegram: customerTelegram || null,
        },
        campaign_id: campaignId,
        target_type: selectedCampaign?.target_type,
        community_id: selectedCampaign?.target_type === "community" ? communityId : null,
        influencer_id:
          selectedCampaign?.target_type === "community"
            ? influencerId
            : targetedInfluencer?.id ?? null,
        platform,
        paid_amount: Number(paidAmount),
        description: description || null,
      };

      console.log("Add conversion payload:", payload);
      // await api.post("/conversions", payload);
      await new Promise((r) => setTimeout(r, 700)); // simulate network latency

      setSubmitted(true);
    } catch (err) {
      setSubmitError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto flex min-h-[420px] max-w-2xl flex-col items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white p-10 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 size={28} className="text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">Conversion recorded</h2>
        <p className="max-w-sm text-sm text-gray-500">
          {customerName}'s conversion has been logged for {selectedCampaign?.label}.
        </p>
        <div className="mt-2 flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back to Campaign
          </Button>
          <Button
            onClick={() => {
              setSubmitted(false);
              setCustomerName("");
              setCustomerPhone("");
              setCustomerTelegram("");
              setCampaignId("");
              setPlatform("");
              setPaidAmount("");
              setDescription("");
            }}
          >
            Add Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50/10">
                <Title titel={"Add Conversion"} disc={"Log a new conversion for a campaign."}>

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-700"
      >
        <ArrowLeft size={16} /> Back
      </button>
      

   </Title>

      <form
        onSubmit={handleSubmit}
        className="max-w-full mt-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        {/* Customer Info */}
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Customer Information
        </h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="Customer Name"
              name="customer_name"
              required
              leftIcon={<User size={18} />}
              placeholder="Full name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              error={errors.customerName}
            />
          </div>
          <Input
            label="Phone Number"
            name="customer_phone"
            required
            leftIcon={<Phone size={18} />}
            placeholder="0911223344"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            error={errors.customerPhone}
          />
          <Input
            label="Telegram Username"
            name="customer_telegram"
            leftIcon={<Send size={18} />}
            placeholder="@username"
            value={customerTelegram}
            onChange={(e) => setCustomerTelegram(e.target.value)}
          />
        </div>

        {/* Campaign & Targeting */}
        <h3 className="mb-4 mt-6 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Campaign
        </h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2 grid grid-cols-2">

            <Select
              label="Campaign"
              name="campaign_id"
              required
              leftIcon={<Megaphone size={18} />}
              placeholder={campaignsLoading ? "Loading campaigns..." : "Select a campaign"}
              disabled={campaignsLoading}
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              data={campaigns}
              error={errors.campaignId}
              api={null}
            />
            
          {selectedCampaign?.target_type === "community" && (
            <>
              <Select
                label="Community"
                name="community_id"
                required
                leftIcon={<Users size={18} />}
                placeholder={communitiesLoading ? "Loading communities..." : "Select a community"}
                disabled={communitiesLoading}
                value={communityId}
                onChange={(e) => setCommunityId(e.target.value)}
                data={communities}
                error={errors.communityId}
              />

              <Select
                label="Influencer"
                name="influencer_id"
                required
                leftIcon={<UserCheck size={18} />}
                placeholder={
                  !communityId
                    ? "Select a community first"
                    : influencersLoading
                    ? "Loading influencers..."
                    : "Select an influencer"
                }
                disabled={!communityId || influencersLoading}
                value={influencerId}
                onChange={(e) => setInfluencerId(e.target.value)}
                data={influencers}
                error={errors.influencerId}
              />
            </>
          )}

          {selectedCampaign?.target_type === "influencer" && (
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Targeted Influencer</label>
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm">
                {targetedInfluencerLoading ? (
                  <span className="flex items-center gap-2 text-gray-400">
                    <Loader2 size={16} className="animate-spin" /> Loading influencer...
                  </span>
                ) : (
                  <span className="flex items-center gap-2 font-medium text-gray-700">
                    <UserCheck size={16} className="text-primary" />
                    {targetedInfluencer?.name || "—"}
                  </span>
                )}
              </div>
            </div>
          )}
          </div>

        </div>

        {/* Conversion Details */}
        <h3 className="mb-4 mt-6 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Conversion Details
        </h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Select
            label="Platform"
            name="platform"
            required
            leftIcon={<Share2 size={18} />}
            placeholder="Select a platform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
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
            placeholder="e.g. 500"
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
            error={errors.paidAmount}
          />
        </div>

        <div className="mt-5">
          <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-gray-700">
            <FileText size={14} /> Description / Other Details
            <span className="text-xs font-normal text-gray-400">(Optional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="Any additional notes about this conversion..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full resize-none rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
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
          <Button type="submit" disabled={submitting || campaignsLoading}>
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" /> Saving...
              </span>
            ) : (
              "Add Conversion"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}