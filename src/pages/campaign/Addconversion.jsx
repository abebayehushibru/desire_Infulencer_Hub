import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Phone,
  Send,
  Users,
  UserCheck,
  Wallet,
  FileText,
  Share2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Camera,
  Video,
  Music2,
  Globe,
  MessageCircleReply,
  Percent,
} from "lucide-react";

import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import Title from "../../components/common/Title";
import useApi from "../../hooks/useApi";

const PLATFORMS = [
  { label: "TikTok", value: "tiktok", icon: Music2 },
  { label: "Instagram", value: "instagram", icon: Camera },
  { label: "Facebook", value: "facebook", icon: MessageCircleReply },
  { label: "YouTube", value: "youtube", icon: Video },
  { label: "Telegram", value: "telegram", icon: Send },
  { label: "Other", value: "other", icon: Globe },
];
function calculateCampaignSplit(campaign, paidAmount, returnRole = null) {
  // 1. Setup unified decimal percentage rate & variables
  const ruleType = campaign?.commission_rule_type || ""; // 'Rate' or 'Fixed'
  const commValue = parseFloat(campaign?.commission_value || 0);
  
  const campaignRate = parseFloat(campaign?.commission_rate || 0) / 100;
  const campaignAmount = parseFloat(campaign?.amount || 0);
  const actualPaid = parseFloat(paidAmount || 0);

  // 3. Initialize pools
  let totalPool = 0;
  let leaderCommission = 0;
  let influencerCommission = 0;

  // 4. Determine the Total Pool base
  if (campaignAmount > 0) {
    totalPool = campaignAmount;
  } else {
    totalPool = actualPaid;
  }

  // 4b. Calculate Leader Share based on community rule
  if (ruleType === 'Fixed') {
    leaderCommission = commValue;
  } else if (ruleType === 'Rate') {
    const ratePercentage = commValue / 100;
    leaderCommission = totalPool * ratePercentage;
  }

  // Influencer gets the remainder of the pool
  influencerCommission = totalPool - leaderCommission;

  // Prevent negative balances if Fixed fee exceeds total pool
  if (influencerCommission < 0) {
    influencerCommission = 0;
    leaderCommission = totalPool;
  }

  // 5. Build output object
  const results = {
    leader: Number(leaderCommission.toFixed(2)) || 0,
    influencer: Number(influencerCommission.toFixed(2)) || 0,
    totalPool: Number(totalPool.toFixed(2)) || 0
  };

  // 6. Return specific role value or entire calculation payload
  if (returnRole === 'leader') return results.leader;
  if (returnRole === 'influencer') return results.influencer;

  return results.totalPool; // Returning full object allows access to all calculated pieces
}

export default function AddConversion() {
  const navigate = useNavigate();
  const { id } = useParams(); // campaign id — this page is scoped to one specific campaign

  // Customer info
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerTelegram, setCustomerTelegram] = useState("");

  // The campaign itself — fetched once by id, already carries its fixed
  // target (either one community or one influencer, per the Campaign model).
  const [campaign, setCampaign] = useState(null);
  const targetType = campaign?.target_type; // "community" | "influencer"
  const targetedCommunity = campaign?.community || null;
  const targetedInfluencer = campaign?.influencer || null;

  // Only relevant when target_type === "community" — which member of that
  // community actually gets credit for this conversion.
  const [influencers, setInfluencers] = useState([]);
  const [influencerId, setInfluencerId] = useState("");

  // Conversion details
  const [platform, setPlatform] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [description, setDescription] = useState("");

  // Commission division (for community leader) — total rate entered by
  // the user, split evenly between the community leader and the
  // referring influencer.
  const [commissionRate, setCommissionRate] = useState("");
  const leaderCommission = commissionRate ? Number(commissionRate) / 2 : 0;
  const influencerCommission = commissionRate ? Number(commissionRate) / 2 : 0;

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // ── Real API calls ───────────────────────────────────────────────────
  const campaignApi = useApi({
    request: () => ({
      method: "GET",
      path: `/campaigns/${id}`,
      manual: true,
    }),
  });

  const getInfulencerApi = useApi({
    request: (payload) => ({
      method: "GET",
      path: `/communities/${payload.community_id}/members`,
      // query: payload,
      manual: true,
    }),
  });

  const conversionApi = useApi({
    request: (payload) => ({
      method: "POST",
      path: "/conversions",
      data: payload,
      manual: true,
    }),
  });

  // ── Fetchers ──────────────────────────────────────────────────────────
  const fetchCampaign = async () => {
    const res = await campaignApi.execute();
    if (res?.success) {
      setCampaign(res?.data?.data?.campaign || res?.data?.data || null);
    } else {
      setCampaign(null);
    }
  };

  const fetchInfulencers = async (page = 1, filters) => {
    const res = await getInfulencerApi.execute({
      page: page,
      ...filters,
    });
    if (res.success) {
      console.log(res.data?.data);

      const formatted = res?.data?.data?.map((inf) => ({
        label: `${inf.user?.name_or_company_name} (${inf?.user?.email})`,
        value: inf?.user?.id, // or user.id
      }));
      setInfluencers(formatted);
    } else setInfluencers([]);
  };

  // Fetch the campaign once, by route id
  useEffect(() => {
    if (!id) return;
    fetchCampaign();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Once we know it's a community campaign, load that community's influencers
  useEffect(() => {
    if (targetType !== "community" || !targetedCommunity?.id) return;
    fetchInfulencers(1, { community_id: targetedCommunity.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetType, targetedCommunity?.id]);

  const validate = () => {
    const e = {};
    if (!customerName.trim()) e.customerName = "Customer name is required.";
    if (!customerPhone.trim()) e.customerPhone = "Customer phone is required.";

    if (targetType === "community") {
      if (!influencerId) e.influencerId = "Select the influencer who gets credit.";

    }

    if (!platform) e.platform = "Select a platform.";
    if (!paidAmount) e.paidAmount = "Enter the paid amount.";
    else if (Number(paidAmount) <= 0) e.paidAmount = "Amount must be greater than 0.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setCustomerName("");
    setCustomerPhone("");
    setCustomerTelegram("");
    setInfluencerId("");
    setPlatform("");
    setPaidAmount("");
    setDescription("");
    setCommissionRate("");
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const isCommunityFlow = targetType === "community";

    const payload = {

      customer_name: customerName,
      phone_number: customerPhone,
      customer_telegram: customerTelegram || null,

      campaign_id: id,
      target_type: targetType,
      community_id: isCommunityFlow ? targetedCommunity?.id : null,
      influencer_id: isCommunityFlow ? influencerId : targetedInfluencer?.id ?? null,
      platform,
      paid_amount: Number(paidAmount),
      description: description || null,
      ...(isCommunityFlow && commissionRate
        ? {
          commission_rate: Number(commissionRate),
          leader_commission_rate: leaderCommission,
          influencer_commission_rate: influencerCommission,
        }
        : {}),
    };

    const res = await conversionApi.execute(payload, "Conversion recorded successfully!");
    if (res?.success) {
      setSubmitted(true);
    }
  };

  // ── Loading / not-found states for the campaign fetch ──────────────────
  if (campaignApi.loading) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white">
        <Loader2 className="animate-spin text-primary" size={28} />
        <p className="text-sm text-gray-500">Loading campaign…</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white text-center">
        <AlertCircle className="text-red-500" size={28} />
        <p className="text-sm text-gray-600">
          {campaignApi.error?.message || "Couldn't load this campaign."}
        </p>
        <Button variant="outline" onClick={() => navigate(-1)} className="mt-2">
          Back
        </Button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto flex min-h-[420px] max-w-2xl flex-col items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white p-10 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 size={28} className="text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">Conversion recorded</h2>
        <p className="max-w-sm text-sm text-gray-500">
          {customerName}'s conversion has been logged for {campaign.title}.
        </p>

        <p className="mt-1 text-sm font-medium text-gray-600">
          Would you like to add another conversion?
        </p>

        <div className="mt-2 flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            No, go back
          </Button>
          <Button
            onClick={() => {
              setSubmitted(false);
              resetForm();
            }}
          >
            Yes, add another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50/10">


      <Title titel={"Add Conversion"} disc={`Log a new conversion for "${campaign.title}".`} />

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

        {/* Campaign & Targeting — campaign itself is fixed by the route */}
        <h3 className="mb-4 mt-6 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Campaign Target
        </h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {targetType === "community" && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Community</label>
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm">
                  <Users size={16} className="text-primary" />
                  <span className="font-medium text-gray-700">{targetedCommunity?.name || "—"}</span>
                </div>
              </div>

              <Select
                label="Influencer (who gets credit)"
                name="influencer_id"
                required
                leftIcon={<UserCheck size={18} />}
                placeholder={getInfulencerApi.loading ? "Loading influencers..." : "Select an influencer"}
                disabled={getInfulencerApi.loading}
                value={influencerId}
                onChange={(e) => setInfluencerId(e.target.value)}
                data={influencers}

                error={errors.influencerId}
              />

              {/* Commission Division — split with the community leader */}
              {influencerId && (
                <div className="sm:col-span-2 rounded-xl border border-primary/15 bg-primary/5 p-4">
             
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                       <div className="rounded-lg bg-white px-3 py-2 shadow-sm">
                        <p className="text-xs text-gray-400">Campaign Commission</p>
                        <p className="font-semibold text-primary">{campaign.commission_rule_type}-{campaign.commission_value} {campaign.commission_rule_type=="Fixed"?"ETB":"%"}</p>
                      </div>
                       <div className="rounded-lg bg-white px-3 py-2 shadow-sm">
                        <p className="text-xs text-gray-400">Total Commission</p>
                        <p className="font-semibold text-primary">{calculateCampaignSplit(campaign, paidAmount, "total")}ETB</p>
                      </div>
                      <div className="rounded-lg bg-white px-3 py-2 shadow-sm">
                        <p className="text-xs text-gray-400">Leader receives</p>
                        <p className="font-semibold text-primary">{calculateCampaignSplit(campaign, paidAmount, "leader")}ETB</p>
                      </div>
                      <div className="rounded-lg bg-white px-3 py-2 shadow-sm">
                        <p className="text-xs text-gray-400">Influencer receives</p>
                        <p className="font-semibold text-primary">{calculateCampaignSplit(campaign, paidAmount, "influencer")} ETB</p>
                      </div>
                    </div>
                
                </div>
              )}
            </>
          )}

          {targetType === "influencer" && (
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Influencer</label>
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm">
                <UserCheck size={16} className="text-primary" />
                <span className="font-medium text-gray-700">
                  {targetedInfluencer?.name_or_company_name || "—"}{calculateCampaignSplit(campaign, commissionRate, paidAmount, "leader")}
                </span>
              </div>
            </div>
          )}
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

        {conversionApi.error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
            {conversionApi.error?.message || "Something went wrong. Please try again."}
          </p>
        )}

        {JSON.stringify(errors)}

        <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-6">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={conversionApi.loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={conversionApi.loading}>
            {conversionApi.loading ? (
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