import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  Megaphone,
  TrendingUp,
  UserRound,
  Users,
  CheckCircle2,
  BarChart2,
  MapPin,
  Calendar,
  Wallet,
  Video,
  Loader2,
  AlertCircle,
  Smartphone,
  User,
  Users2,
  Lock,
} from "lucide-react";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import RadioGroup from "../../components/common/RadioGroup";
import DatePicker from "../../components/common/DatePicker";
import FileUpload from "../../components/common/FileUpload";
import Textarea from "../../components/common/Textarea";
import Checkbox from "../../components/common/Checkbox";
import Title from "../../components/common/Titel";
import useApi from "../../hooks/useApi";
import SearchSelect from "../../components/common/SearchSelect";

const goals = [
  {
    id: "sales",
    title: "Sales",
    icon: ShoppingBag,
    description: "Sell a product or service and get conversions.",
    example: "Example: Online course, E-commerce product",
  },
  {
    id: "awareness",
    title: "Awareness",
    icon: Megaphone,
    description: "Promote an event, brand or important information.",
    example: "Example: Event, webinar, brand launch",
  },
  {
    id: "growth",
    title: "Growth",
    icon: TrendingUp,
    description: "Grow followers, subscribers or get more traffic.",
    example: "Example: Get followers, Telegram members",
  },
];

const steps = ["Type", "Target", "Details", "Tracking", "Target_By", "Review"];

const locations = [
  "Ethiopia", "Bahrain", "Brazil", "Canada", "Djibouti", "Egypt", "Europe",
  "Iran", "Iraq", "Israel", "Jordan", "Kuwait", "Lebanon", "Oman",
  "Palestine", "Qatar", "Saudi Arabia", "South Africa", "Sudan", "Turkey",
  "United Arab Emirates (UAE)", "USA", "Yemen", "Others",
];

const EthiopiaLc = [
  "Addis Ababa", "Adama", "Bahir Dar", "Hawassa", "Mekelle", "Dire Dawa",
  "Jimma", "Harar", "Arba Minch", "Debre Birhan", "Dessie", "Gondar",
  "Shashemene", "Nekemte", "Jigjiga", "Assosa", "Semera",
];

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const formatCurrency = (value) => {
  if (value === undefined || value === null || value === "") return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return "—";
  return `${num.toLocaleString()} ETB`;
};

const daysBetween = (start, end) => {
  if (!start || !end) return null;
  const ms = new Date(end) - new Date(start);
  if (Number.isNaN(ms) || ms <= 0) return null;
  return Math.round(ms / (1000 * 60 * 60 * 24));
};

const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const parseJsonField = (val, fallback = []) => {
  if (!val) return fallback;
  if (typeof val !== "string") return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
};

function ReviewRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-800 text-right">{value || "—"}</span>
    </div>
  );
}

function ReviewSection({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-3">
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon size={16} />
          </span>
        )}
        <h3 className="font-semibold text-sm text-gray-800">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Chip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
      {children}
    </span>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
      <AlertCircle size={12} /> {message}
    </p>
  );
}

export default function CreateCampaign() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [isEditable, setIsEditable] = useState(true);

  const initialForm = {
    type: "",
    title: "",
    video: null,
    photo: null,
    description: "",
    start_date: "",
    end_date: "",
    locations: [],
    EthiopiaLc: [],
    platforms: { tiktok: true, facebook: false, instagram: false },
    run_type: "manual",
    fund_type: "conversion",
    conversion_rate: "",
    amount: "",
    total_budget: "",
    total_views: "",
    followers: "",
    follower_price: "",
    target_id: "",
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [tracking, setTracking] = useState({ conversion_event: "purchase" });
  const [searchTerm, setSearchTerm] = useState("");
  const [target, setTarget] = useState("");
  const [userOptions, setUserOptions] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState("sales");
  const [targetType, setTargetType] = useState("influencer");

  const skipTargetReset = useRef(false);

  const getInfulencerApi = useApi({
    request: (payload) => ({ method: "GET", path: "/influencers", query: payload, manual: true }),
  });

  const communitiesApi = useApi({
    request: (payload) => ({ method: "GET", path: "/communities", query: payload, manual: true }),
  });

  const getCampaignApi = useApi({
    request: () => ({ method: "GET", path: `/campaigns/${id}`, manual: true }),
  });

  const populateFromCampaign = (campaign) => {
    if (!campaign) return;

    // Reject edit if campaign status is not draft or pending[cite: 1]
    const allowedStatuses = ["draft", "rejected"];
    if (campaign.status && !allowedStatuses.includes(campaign.status.toLowerCase())) {
      setIsEditable(false);
      return;
    }

    skipTargetReset.current = true;
    setSelectedGoal(campaign.type || "sales");
    setTargetType(campaign.target_type || "influencer");

    const targetLabel = campaign.influencer?.name_or_company_name || campaign.community?.name || "";
    setTarget(targetLabel);

    if (campaign.target_id) {
      setUserOptions([{ label: targetLabel, value: campaign.target_id }]);
    }

    setForm({
      type: campaign.type || "",
      title: campaign.title || "",
      video: campaign.video?.file_path || campaign.video_url || null,
      photo: campaign.photo?.file_path || campaign.photo_url || null,
      description: campaign.description || "",
      start_date: toDateInputValue(campaign.start_date),
      end_date: toDateInputValue(campaign.end_date),
      locations: parseJsonField(campaign.locations),
      EthiopiaLc: parseJsonField(campaign.ethiopia_locations),
      platforms: parseJsonField(campaign.platforms, { tiktok: true, facebook: false, instagram: false }),
      run_type: campaign.run_type || "manual",
      fund_type: campaign.fund_type || "conversion",
      conversion_rate: campaign.conversion_rate ?? "",
      amount: campaign.amount ?? "",
      total_budget: campaign.total_budget ?? "",
      total_views: campaign.total_views ?? "",
      followers: campaign.followers ?? "",
      follower_price: campaign.follower_price ?? "",
      target_id: campaign.target_id || "",
      status: campaign.status || "",
      new_status: campaign.status || "",
      rejected_by: campaign.rejected_by,
      rejection_reason: campaign.rejection_reason,
      rejected_at: campaign.rejected_at


    });

    setTracking({ conversion_event: campaign.conversion_event || "purchase" });
  };

  useEffect(() => {
    if (!isEditMode) return;

    (async () => {
      const res = await getCampaignApi.execute();
      if (res?.success) {
        populateFromCampaign(res?.data?.data || res?.data);
      }
    })();
  }, [id]);

  const campaignApi = useApi({
    request: (payload) => ({
      method: isEditMode ? "PUT" : "POST",
      path: isEditMode ? `/campaigns/${id}` : "/campaigns",
      data: payload,
      manual: true,
    }),
  });

  const clearError = (name) => {
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    clearError(name);
  };

  const handleTrackingChange = (e) => {
    setTracking({ ...tracking, [e.target.name]: e.target.value });
  };

  const toggleLocation = (location) => {
    setForm((prev) => {
      const isIncluded = prev.locations?.includes(location);
      return {
        ...prev,
        locations: isIncluded
          ? prev.locations.filter((item) => item !== location)
          : [...(prev.locations || []), location],
      };
    });
    clearError("locations");
  };

  const ethiopianLocation = (location) => {
    setForm((prev) => {
      const isIncluded = prev.EthiopiaLc?.includes(location);
      return {
        ...prev,
        EthiopiaLc: isIncluded
          ? prev.EthiopiaLc.filter((item) => item !== location)
          : [...(prev.EthiopiaLc || []), location],
      };
    });
  };

  useEffect(() => {
    if (skipTargetReset.current) {
      skipTargetReset.current = false;
      return;
    }
    set("target_id", "");
    setTarget("");
    setUserOptions([]);
  }, [targetType]);

  const fetchInfulencers = async (page = 1, filters) => {
    const res = await getInfulencerApi.execute({ page, ...filters });
    if (res?.success) {
      const formatted = res?.data?.data?.data?.data?.map((inf) => ({
        label: `${inf.user?.name_or_company_name} (${inf?.user?.email})`,
        value: inf?.user?.id,
      }));
      setUserOptions(formatted || []);
    } else {
      setUserOptions([]);
    }
  };

  const fetchCommunities = async (page = 1, filters) => {
    const res = await communitiesApi.execute({ page, ...filters });
    const formatted = res?.data?.data?.communities?.map((cm) => ({
      label: `${cm?.name}`,
      value: cm?.id,
    }));
    setUserOptions(formatted || []);
  };

  useEffect(() => {
    if (!searchTerm.trim()) return;

    const delayDebounceFn = setTimeout(() => {
      if (targetType === "influencer") {
        fetchInfulencers(1, { search: searchTerm });
      } else if (targetType === "community") {
        fetchCommunities(1, { search: searchTerm });
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [targetType, searchTerm]);

  const getStepErrors = (step) => {
    const stepErrors = {};

    if (step === 2) {
      if (!form.locations || form.locations.length === 0) {
        stepErrors.locations = "Select at least one target location.";
      }
    }

    if (step === 3) {
      if (!form.title?.trim()) stepErrors.title = "Campaign title is required.";
      if (!form.start_date) stepErrors.start_date = "Start date is required.";
      if (!form.end_date) stepErrors.end_date = "End date is required.";
      if (form.start_date && form.end_date && new Date(form.end_date) <= new Date(form.start_date)) {
        stepErrors.end_date = "End date must be after the start date.";
      }

      if (selectedGoal === "sales") {
        if (form.fund_type === "conversion") {
          if (!form.conversion_rate && !form.amount) {
            stepErrors.conversion_rate = "Either Conversion rate or Amount is required.";
            stepErrors.amount = "Either Conversion rate or Amount is required.";
          }
        }
        if (!form.total_budget) {
          stepErrors.total_budget = "Total budget is required.";
        }
      }

      if (selectedGoal === "awareness") {
        if (!form.total_views) stepErrors.total_views = "Target views is required.";
        if (!form.total_budget) stepErrors.total_budget = "Total budget is required.";
      }

      if (selectedGoal === "growth") {
        if (!form.followers) stepErrors.followers = "Follower goal is required.";
        if (!form.follower_price) stepErrors.follower_price = "Price per follower is required.";
      }
    }

    if (step === 5) {
      if (!form.target_id) {
        stepErrors.target = `Select ${targetType === "influencer" ? "an influencer" : "a community"} to continue.`;
      }
    }

    return stepErrors;
  };

  const validateStep = (step) => {
    const stepErrors = getStepErrors(step);
    setErrors((prev) => ({ ...prev, ...stepErrors }));
    return Object.keys(stepErrors).length === 0;
  };

  const validateAllSteps = () => {
    const step2Errors = getStepErrors(2);
    const step3Errors = getStepErrors(3);
    const step5Errors = getStepErrors(5);
    const combined = { ...step2Errors, ...step3Errors, ...step5Errors };

    setErrors(combined);

    if (Object.keys(step2Errors).length) {
      setCurrentStep(2);
      return false;
    }
    if (Object.keys(step3Errors).length) {
      setCurrentStep(3);
      return false;
    }
    if (Object.keys(step5Errors).length) {
      setCurrentStep(5);
      return false;
    }

    return true;
  };

  const goNext = () => {
    setErrors({});
    if (!validateStep(currentStep)) return;
    setCurrentStep((p) => Math.min(p + 1, steps.length));
  };

  const goBack = () => setCurrentStep((p) => Math.max(p - 1, 1));
  const goToStep = (stepNumber) => {
    if (stepNumber <= currentStep) setCurrentStep(stepNumber);
  };

  const buildPayload = (isPublish = false) => {
    const payload = new FormData();

    payload.append("type", selectedGoal);
    payload.append("title", form.title.trim());
    payload.append("description", form.description || "");
    payload.append("start_date", form.start_date);
    payload.append("end_date", form.end_date);
    payload.append("locations", JSON.stringify(form.locations || []));
    payload.append("ethiopia_locations", JSON.stringify(form.EthiopiaLc || []));
    payload.append("platforms", JSON.stringify(form.platforms));
    payload.append("run_type", form.run_type);
    payload.append("target_type", targetType);
    payload.append("target_id", form.target_id);
    payload.append("conversion_event", tracking.conversion_event);
    payload.append("status", isPublish ? "pending" : "draft");

    if (selectedGoal === "sales") {
      if (form.fund_type === "conversion") {
        if (!form.conversion_rate && !form.amount) {
          stepErrors.conversion_rate = "Either Conversion rate or Amount is required.";
          // stepErrors.amount = "Either Conversion rate or Amount is required.";
        }
      }
      if (!form.total_budget) {
        stepErrors.total_budget = "Total budget is required.";
      }
    }

    if (selectedGoal === "awareness") {
      payload.append("total_views", form.total_views);
      payload.append("total_budget", form.total_budget);
    }

    if (selectedGoal === "growth") {
      payload.append("followers", form.followers);
      payload.append("follower_price", form.follower_price);
    }

    if (form.video instanceof File) {
      payload.append("video", form.video);
    }
    if (form.photo instanceof File) {
      payload.append("photo", form.photo);
    }

    payload.append("successMsg", isEditMode ? "Campaign updated successfully!" : "Campaign launched successfully!")
    return payload;
  };

  const handleSubmit = async () => {
    if (!validateAllSteps()) return;

    const payload = buildPayload();
   const res = await campaignApi.execute(
      payload

    );

    if (res.success) {
      
    }
  };
  const handlePublish = async () => {
    if (!validateAllSteps()) return;

    const payload = buildPayload(true);
    await campaignApi.execute(
      payload

    );
  };

  const goalLabel = goals.find((g) => g.id === selectedGoal)?.title ?? "";
  const campaignDuration = daysBetween(form.start_date, form.end_date);
  const activePlatforms = Object.entries(form.platforms || {})
    .filter(([, enabled]) => enabled)
    .map(([platform]) => platform);

  if (isEditMode && getCampaignApi.loading) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center gap-3 py-24">
        <Loader2 className="animate-spin text-violet-600" size={32} />
        <p className="text-sm text-gray-500">Loading campaign…</p>
      </div>
    );
  }

  if (isEditMode && !isEditable) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center gap-3 py-24 text-center">
        <Lock className="text-amber-500" size={36} />
        <h3 className="text-lg font-semibold text-gray-800">Campaign Cannot Be Edited</h3>
        <p className="text-sm text-gray-500 max-w-md">
          Editing is only allowed for campaigns in <strong>draft</strong>  status.
        </p>
      </div>
    );
  }

  if (isEditMode && getCampaignApi.error) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center gap-2 py-24 text-center">
        <AlertCircle className="text-red-500" size={32} />
        <p className="text-sm text-gray-600">
          {getCampaignApi.error?.message || "Couldn't load this campaign."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-full z-50 bg-gray-50/10 flex flex-col text-primary">
      <Title
        titel={isEditMode ? "Edit Campaign" : "Create Campaign"}
        disc={isEditMode ? "Update your campaign's details." : "Create a new marketing campaign."}
      />

      <div className="w-full max-w-full bg-white rounded-xl shadow-sm border border-gray-200 p-4 mt-4">
        <div className="flex items-center justify-between mb-14">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const active = stepNumber === currentStep;
            const completed = stepNumber < currentStep;
            const reachable = stepNumber <= currentStep;

            return (
              <div
                key={step}
                className={`flex-1 flex items-center ${reachable ? "cursor-pointer" : "cursor-not-allowed"}`}
                onClick={() => goToStep(stepNumber)}
              >
                <div className="flex flex-col items-center relative">
                  <div
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition
                      ${active
                        ? "bg-secondary border-violet-600 text-white"
                        : completed
                          ? "bg-violet-100 border-violet-600 text-violet-600"
                          : "bg-white border-gray-300 text-gray-500"
                      }`}
                  >
                    {stepNumber}
                  </div>
                  <span
                    className={`mt-2 w-full flex-1 text-xs absolute top-full font-medium ${active ? "text-violet-600" : "text-gray-500"}`}
                  >
                    {step}
                  </span>
                </div>

                {index !== steps.length - 1 && (
                  <div className={`flex-1 h-[2px] ${completed ? "bg-violet-600" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* STEP 1 — TYPE */}
        {currentStep === 1 && (
          <div>
            <div className="mb-6">
              <h2 className="text-sm text-primary font-bold">What is your main goal?</h2>
              <p className="text-gray-500 text-xs mt-1">Choose the objective for this campaign.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mt-5">
              {goals.map((goal) => {
                const Icon = goal.icon;
                const selected = selectedGoal === goal.id;

                return (
                  <button
                    key={goal.id}
                    onClick={() => {
                      setForm((prev) => ({ ...prev, type: goal.title }));
                      setSelectedGoal(goal.id);
                    }}
                    className={`text-left rounded-lg border p-4 transition-all duration-200 hover:shadow-lg
                      ${selected
                        ? "border-primary bg-gradient-to-br from-primary via-secondary to-primary"
                        : "border-gray-200 hover:border-violet-300"
                      }`}
                  >
                    <div className="flex gap-4 items-center justify-start">
                      <div
                        className={`w-16 h-16 min-w-16 rounded-full flex items-center justify-center border
                        ${selected
                            ? "bg-gradient-to-br from-primary via-secondary to-primary border-white text-white"
                            : "bg-gray-50 border-gray-200"
                          }`}
                      >
                        <Icon size={25} />
                      </div>
                      <div>
                        <h3 className={`${selected ? "text-white" : ""} text-lg font-semibold text-left`}>
                          {goal.title}
                        </h3>
                        <p className="text-gray-400 text-start text-xs leading-4">{goal.description}</p>
                      </div>
                    </div>

                    <div className="text-xs text-gray-400 text-center mt-2 leading-6">{goal.example}</div>
                  </button>
                );
              })}
            </div>

            {(isEditMode && form.status == "rejected") && <div className="mt-6 w-full rounded-lg border border-red-200 bg-gradient-to-r from-red-50 via-white to-red-50 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-red-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100">
                    <span className="text-xl">❌</span>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-red-700">
                      Campaign Rejected
                    </h3>
                    <p className="text-xs text-red-500">
                      This campaign requires your attention.
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                  Rejected
                </span>
              </div>

              {/* Body */}
              <div className="px-5 py-4">
                <div className="rounded-lg border border-red-100 bg-white p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Rejection Reason
                  </p>

                  <p className="text-sm leading-6 text-gray-600">
                    {form.rejection_reason}
                  </p>
                </div>

                {/* Footer */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-red-100 pt-4 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">Reviewed By:</span>
                    <span>{form.rejected_by?.name_or_company_name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">Reviewed At:</span>
                    <span>{form.rejected_at}</span>
                  </div>
                </div>
              </div>
            </div>}

          </div>
        )}

        {/* STEP 2 — TARGET */}
        {currentStep === 2 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Target Audience</h2>
              <p className="text-gray-500 text-xs">
                Choose where your campaign will run and which social media platforms creators should use.
              </p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-sm mb-1">Target Locations</h3>
              <p className="text-gray-500 text-xs mb-4">Select one or more countries.</p>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {locations.map((location) => (
                  <Checkbox
                    key={location}
                    label={location}
                    checked={form?.locations?.includes(location)}
                    onChange={() => toggleLocation(location)}
                  />
                ))}
              </div>
              <FieldError message={errors.locations} />

              {form?.locations?.includes("Ethiopia") && (
                <div className="mt-6 border border-gray-200 p-4 rounded-lg">
                  <h3 className="mb-4 text-sm font-semibold">Ethiopian Cities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {EthiopiaLc?.map((location) => (
                      <Checkbox
                        key={location}
                        label={location}
                        checked={form.EthiopiaLc?.includes(location)}
                        onChange={() => ethiopianLocation(location)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-sm">Platforms</h3>
              <p className="text-gray-500 mb-0 text-xs">TikTok is required for every campaign.</p>
              <div className="grid md:grid-cols-3 gap-4 mt-2">
                <div className="rounded-lg border-1 border-gray-200 bg-primary/5 p-5">
                  <Checkbox label="TikTok" checked={true} disabled />
                </div>

                <div className="rounded-lg border border-gray-200 p-5">
                  <Checkbox
                    label="Facebook"
                    name="facebook"
                    checked={form.platforms.facebook}
                    onChange={(e) => {
                      const { name, checked } = e.target;
                      setForm((prev) => ({
                        ...prev,
                        platforms: { ...(prev?.platforms || {}), [name]: checked },
                      }));
                    }}
                  />
                </div>

                <div className="rounded-lg border border-gray-200 p-5">
                  <Checkbox
                    label="Instagram"
                    name="instagram"
                    checked={form.platforms.instagram}
                    onChange={(e) => {
                      const { name, checked } = e.target;
                      setForm((prev) => ({
                        ...prev,
                        platforms: { ...(prev?.platforms || {}), [name]: checked },
                      }));
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 — DETAILS */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="font-semibold text-sm mb-4">Campaign Information 77</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col flex-1 gap-3">
                  <div>
                    <Input label="Campaign Title" name="title" value={form.title} onChange={handleChange} required />
                    <FieldError message={errors.title} />
                  </div>
                  <Textarea
                    label="Description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>
                <div className="flex-1 grid grid-cols-2 gap-3 h-full">
                  <FileUpload label="Campaign Video" name="video" value={form.video} maxSizeMB={20} type="video" onChange={handleChange} />
                  <FileUpload label="Campaign Photo" name="photo" value={form.photo} type="image" onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-6">Campaign Configuration</h3>

                <RadioGroup
                  label="Run Type"
                  name="run_type"
                  value={form.run_type}
                  onChange={handleChange}
                  options={[
                    { value: "manual", label: "Manual" },
                    { value: "automatic", label: "Automatic" },
                    { value: "both", label: "Both" },
                  ]}
                />

                {selectedGoal === "sales" && (
                  <>
                    <div className="mt-8">
                      <RadioGroup
                        label="Payment Type"
                        name="fund_type"
                        value={form.fund_type}
                        onChange={handleChange}
                        options={[
                          { value: "conversion", label: "Per Conversion" },
                          { value: "fixed", label: "Fixed Amount" },
                        ]}
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-3 mt-4">
                      {form.fund_type === "conversion" && (
                        <div>
                          <Input
                            label="Conversion Rate (%)"
                            name="conversion_rate"
                            type="number"
                            value={form.conversion_rate}
                            onChange={handleChange}
                          />
                          <FieldError message={errors.conversion_rate} />
                        </div>
                      )}

                      <div>
                        <Input
                          label={form.fund_type === "conversion" ? "Amount Per Conversion" : "Fixed Amount"}
                          name="amount"
                          type="number"
                          value={form.amount}
                          onChange={handleChange}
                        />
                        <FieldError message={errors.amount} />
                      </div>

                      <div>
                        <Input
                          label="Total Budget"
                          name="total_budget"
                          type="number"
                          value={form.total_budget}
                          onChange={handleChange}
                        />
                        <FieldError message={errors.total_budget} />
                      </div>
                    </div>
                  </>
                )}

                {selectedGoal === "awareness" && (
                  <div className="grid md:grid-cols-2 gap-5 mt-6">
                    <div>
                      <Input
                        label="Target Views"
                        name="total_views"
                        type="number"
                        value={form.total_views}
                        onChange={handleChange}
                      />
                      <FieldError message={errors.total_views} />
                    </div>
                    <div>
                      <Input
                        label="Total Budget"
                        name="total_budget"
                        type="number"
                        value={form.total_budget}
                        onChange={handleChange}
                      />
                      <FieldError message={errors.total_budget} />
                    </div>
                  </div>
                )}

                {selectedGoal === "growth" && (
                  <div className="mt-8 space-y-5">
                    <Input label="Platform" value="TikTok" disabled />
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Input
                          label="Followers to Gain"
                          name="followers"
                          type="number"
                          value={form.followers}
                          onChange={handleChange}
                        />
                        <FieldError message={errors.followers} />
                      </div>
                      <div>
                        <Input
                          label="Price"
                          name="follower_price"
                          type="number"
                          value={form.follower_price}
                          onChange={handleChange}
                        />
                        <FieldError message={errors.follower_price} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <h3 className="font-semibold text-sm mb-3">Campaign Duration</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <DatePicker label="Start Date" name="start_date" value={form.start_date} onChange={handleChange} />
                    <FieldError message={errors.start_date} />
                  </div>
                  <div>
                    <DatePicker label="End Date" name="end_date" value={form.end_date} onChange={handleChange} />
                    <FieldError message={errors.end_date} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 — TRACKING */}
        {currentStep === 4 && (
          <div className="space-y-8 max-w-4xl">
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <BarChart2 size={18} className="text-violet-600" />
                <h3 className="font-semibold text-lg">Conversion Tracking</h3>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                Define what counts as a successful conversion for this campaign.
              </p>

              <RadioGroup
                label="Conversion Event"
                name="conversion_event"
                value={tracking.conversion_event}
                onChange={handleTrackingChange}
                options={[
                  { value: "purchase", label: "Purchase" },
                  { value: "signup", label: "Sign Up" },
                  { value: "lead", label: "Lead Form" },
                  { value: "pageview", label: "Page View" },
                ]}
              />
            </div>
          </div>
        )}

        {/* STEP 5 — TARGET BY */}
        {currentStep === 5 && (
          <div>
            <h2 className="text-sm font-bold">With whom do you want to target?</h2>
            <p className="text-gray-500 mt-1 text-xs">
              Choose whether this campaign will be promoted by an influencer or a community.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <label
                className={`cursor-pointer flex gap-4 items-center rounded-lg border p-6 transition
                ${targetType === "influencer" ? "border-violet-600 bg-violet-50" : "border-gray-200 hover:border-violet-300"}`}
              >
                <input
                  type="radio"
                  className="hidden"
                  value="influencer"
                  checked={targetType === "influencer"}
                  onChange={(e) => setTargetType(e.target.value)}
                />
                <UserRound size={40} className="text-violet-600" />
                <div className="flex flex-col items-start">
                  <h3 className="text-sm font-semibold">Influencer</h3>
                  <p className="text-gray-500 text-xs">Select one influencer to promote your campaign.</p>
                </div>
              </label>

              <label
                className={`cursor-pointer flex gap-4 items-center rounded-lg border p-6 transition
                  ${targetType === "community" ? "border-violet-600 bg-violet-50" : "border-gray-200 hover:border-violet-300"}`}
              >
                <input
                  type="radio"
                  className="hidden"
                  value="community"
                  checked={targetType === "community"}
                  onChange={(e) => setTargetType(e.target.value)}
                />
                <Users size={40} className="text-violet-600" />
                <div className="flex flex-col items-start">
                  <h3 className="text-sm font-semibold">Community</h3>
                  <p className="text-gray-500 text-xs">Select one community to promote your campaign.</p>
                </div>
              </label>
            </div>

            <div className="mt-10">
              <SearchSelect
                icon={targetType === "influencer" ? User : Users2}
                placeholder={`Search ${targetType === "influencer" ? "influencer" : "community"} by name or email`}
                options={userOptions}
                isLoading={getInfulencerApi?.loading || communitiesApi.loading}
                value={form.target_id}
                onInputChange={(inputValue) => setSearchTerm(inputValue)}
                onChange={(selectedOption) => {
                  set("target_id", selectedOption.value);
                  setTarget(selectedOption.label);
                }}
              />
              <FieldError message={errors.target} />
            </div>
          </div>
        )}

        {/* STEP 6 — REVIEW */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <div className="mb-2">
              <h2 className="text-xl font-bold text-primary">Review your campaign</h2>
              <p className="text-gray-500 text-sm mt-1">
                Check all details before submitting. Go back to edit any section.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <ReviewSection title="Campaign Type" icon={ShoppingBag}>
                <ReviewRow label="Goal" value={goalLabel} />
                <ReviewRow label="Run Type" value={form.run_type} />
              </ReviewSection>

              <ReviewSection title="Target" icon={UserRound}>
                <ReviewRow label="Target Type" value={targetType.charAt(0).toUpperCase() + targetType.slice(1)} />
                <ReviewRow label="Selected" value={target || "Not selected"} />
              </ReviewSection>

              <ReviewSection title="Audience & Platforms" icon={MapPin}>
                <div className="py-2">
                  <p className="text-sm text-gray-500 mb-2">Locations</p>
                  <div className="flex flex-wrap gap-1.5">
                    {form.locations?.length ? (
                      form.locations.map((l) => <Chip key={l}>{l}</Chip>)
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </div>
                </div>

                {form.EthiopiaLc?.length > 0 && (
                  <div className="py-2 border-t border-gray-100">
                    <p className="text-sm text-gray-500 mb-2">Ethiopian Cities</p>
                    <div className="flex flex-wrap gap-1.5">
                      {form.EthiopiaLc.map((l) => (
                        <Chip key={l}>{l}</Chip>
                      ))}
                    </div>
                  </div>
                )}

                <div className="py-2 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-2">Platforms</p>
                  <div className="flex flex-wrap gap-1.5">
                    {activePlatforms.map((p) => (
                      <Chip key={p}>
                        <Smartphone size={11} className="mr-1 inline" />
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </Chip>
                    ))}
                  </div>
                </div>
              </ReviewSection>

              <ReviewSection title="Campaign Details" icon={Video}>
                <ReviewRow label="Title" value={form.title} />
                <ReviewRow
                  label="Video"
                  value={form.video ? (typeof form.video === "string" ? form.video : form.video.name) : "No file uploaded"}
                />
                <ReviewRow
                  label="Photo"
                  value={form.photo ? (typeof form.photo === "string" ? form.photo : form.photo.name) : "No file uploaded"}
                />
                <ReviewRow label="Description" value={form.description || "—"} />
              </ReviewSection>

              <ReviewSection title="Schedule" icon={Calendar}>
                <ReviewRow label="Start Date" value={formatDate(form.start_date)} />
                <ReviewRow label="End Date" value={formatDate(form.end_date)} />
                <ReviewRow label="Duration" value={campaignDuration ? `${campaignDuration} days` : "—"} />
              </ReviewSection>

              <ReviewSection title="Budget & Configuration" icon={Wallet}>
                {selectedGoal === "sales" && (
                  <>
                    <ReviewRow
                      label="Payment Type"
                      value={form.fund_type === "conversion" ? "Per Conversion" : "Fixed Amount"}
                    />
                    {form.fund_type === "conversion" && (
                      <ReviewRow label="Conversion Rate" value={form.conversion_rate ? `${form.conversion_rate}%` : "—"} />
                    )}
                    <ReviewRow label="Amount" value={formatCurrency(form.amount)} />
                    <ReviewRow label="Total Budget" value={formatCurrency(form.total_budget)} />
                  </>
                )}

                {selectedGoal === "awareness" && (
                  <>
                    <ReviewRow label="Target Views" value={form.total_views ? Number(form.total_views).toLocaleString() : "—"} />
                    <ReviewRow label="Total Budget" value={formatCurrency(form.total_budget)} />
                  </>
                )}

                {selectedGoal === "growth" && (
                  <>
                    <ReviewRow label="Followers to Gain" value={form.followers ? Number(form.followers).toLocaleString() : "—"} />
                    <ReviewRow label="Price per Follower" value={formatCurrency(form.follower_price)} />
                  </>
                )}

                <ReviewRow label="Conversion Event" value={tracking.conversion_event} />
              </ReviewSection>
            </div>

            <div className="rounded-lg bg-violet-50 border border-violet-200 p-5 flex items-center gap-4">
              <CheckCircle2 size={28} className="text-violet-600 shrink-0" />
              <div>
                <p className="font-semibold text-violet-800">Everything looks good!</p>
                <p className="text-sm text-violet-600 mt-0.5">
                  Click <strong>{isEditMode ? "Save Changes" : "Launch Campaign"}</strong> to submit.
                </p>
              </div>
            </div>

            {campaignApi.error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-center gap-3 text-sm text-red-700">
                <AlertCircle size={18} className="shrink-0" />
                {campaignApi.error?.message ||
                  `Something went wrong while ${isEditMode ? "saving" : "launching"} your campaign. Please try again.`}
              </div>
            )}
          </div>
        )}

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <Button
              onClick={goBack}
              disabled={campaignApi.loading}
              className="border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-xl px-8 py-4 flex items-center gap-2 transition"
            >
              <ArrowLeft size={18} />
              Back
            </Button>
          )}

          <div className="ml-auto">
            {currentStep < steps.length ? (
              <Button
                onClick={goNext}
                className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-10 py-4 flex items-center gap-3 transition"
              >
                Next
                <ArrowRight size={18} />
              </Button>
            ) : (
              < div>
                <Button
                  onClick={handleSubmit}
                  disabled={campaignApi.loading}
                  variant="outline"
                // className="text-primary bg-white rounded-xl px-10 py-4 flex items-center gap-3 transition disabled:opacity-60"
                >
                  {campaignApi.loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      {isEditMode ? "Save Changes" : "Create Campaign"}
                    </>
                  )}
                </Button>
                {!campaignApi.loading && <Button
                  onClick={handlePublish}
                  disabled={campaignApi.loading}
                // className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-10 py-4 flex items-center gap-3 transition disabled:opacity-60"
                >
                  {campaignApi.loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      {isEditMode ? "Save Changes" : "Publish Campaign"}
                    </>
                  )}
                </Button>}
              </div>

            )}
          </div>
        </div>
      </div>
    </div>
  );
}