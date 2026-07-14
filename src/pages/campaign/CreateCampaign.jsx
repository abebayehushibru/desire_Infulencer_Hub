import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  Megaphone,
  TrendingUp,
  UserRound,
  Users,
  CheckCircle2,
  Link2,
  BarChart2,
  Tag,
  Globe,
} from "lucide-react";
import Button from "../../components/common/Button";
import Select from "../../components/common/Select";
import Input from "../../components/common/Input";
import RadioGroup from "../../components/common/RadioGroup";
import DatePicker from "../../components/common/DatePicker";
import FileUpload from "../../components/common/FileUpload";
import Textarea from "../../components/common/Textarea";
import Checkbox from "../../components/common/Checkbox";
import Title from "../../components/common/Titel";

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

// ─── Review Row Helper ────────────────────────────────────────────────────────
function ReviewRow({ label, value }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 w-40 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-800 text-right">{value || "—"}</span>
    </div>
  );
}

// ─── Review Section Helper ────────────────────────────────────────────────────
function ReviewSection({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="font-semibold text-base text-gray-700 mb-2">{title}</h3>
      <div>{children}</div>
    </div>
  );
}

export default function CreateCampaign() {
  // ── Form state ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    type: "",
    title: "",
    video: null,
    description: "",
    start_date: "",
    end_date: "",
    locations: [],
    EthiopiaLc: [],
    platforms: {
      tiktok: true,
      facebook: false,
      instagram: false,
    }
  });

  const toggleLocation = (location) => {
    setForm((prev) => {
      // Check if location already exists
      const isIncluded = prev.locations?.includes(location);

      if (isIncluded) {

        // Remove it if it exists
        return {
          ...prev,
          locations: prev.locations.filter((item) => item !== location)
        };
      } else {
        // Add it if it doesn't exist (ensuring locations is an array)
        return {
          ...prev,
          locations: [...(prev.locations || []), location]
        };
      }
    });
  };
  const ethiopianLocation = (location) => {
    setForm((prev) => {
      // Check if location already exists
      const isIncluded = prev.EthiopiaLc?.includes(location);

      if (isIncluded) {

        // Remove it if it exists
        return {
          ...prev,
          EthiopiaLc: prev.EthiopiaLc.filter((item) => item !== location)
        };
      } else {
        // Add it if it doesn't exist (ensuring locations is an array)
        return {
          ...prev,
          EthiopiaLc: [...(prev.EthiopiaLc || []), location]
        };
      }
    });
  };
  // ── Tracking state ─────────────────────────────────────────────────────────
  const [tracking, setTracking] = useState({
    tracking_url: "",
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_term: "",
    utm_content: "",
    conversion_event: "purchase",
    pixel_id: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTrackingChange = (e) => {
    setTracking({ ...tracking, [e.target.name]: e.target.value });
  };

  // ── Step / goal / target state ─────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState("sales");
  const [targetType, setTargetType] = useState("influencer");
  const [target, setTarget] = useState("");
  const [fundType, setFundType] = useState("commission");
  const [runType, setRunType] = useState("manual");
  const [perConversion, setPerConversion] = useState("");
  const [totalBudget, setTotalBudget] = useState("");

  const goNext = () => setCurrentStep((p) => Math.min(p + 1, steps.length));
  const goBack = () => setCurrentStep((p) => Math.max(p - 1, 1));

  // ── Derived labels for Review ──────────────────────────────────────────────
  const goalLabel = goals.find((g) => g.id === selectedGoal)?.title ?? "";

  const builtUtm = (() => {
    const base = tracking.tracking_url;
    if (!base) return "—";
    const params = new URLSearchParams();
    if (tracking.utm_source) params.set("utm_source", tracking.utm_source);
    if (tracking.utm_medium) params.set("utm_medium", tracking.utm_medium);
    if (tracking.utm_campaign) params.set("utm_campaign", tracking.utm_campaign);
    if (tracking.utm_term) params.set("utm_term", tracking.utm_term);
    if (tracking.utm_content) params.set("utm_content", tracking.utm_content);
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  })();
  const locations = [
    "Ethiopia",
    "Bahrain",
    "Brazil",
    "Canada",
    "Djibouti",
    "Egypt",
    "Europe",
    "Iran",
    "Iraq",
    "Israel",
    "Jordan",
    "Kuwait",
    "Lebanon",
    "Oman",
    "Palestine",
    "Qatar",
    "Saudi Arabia",
    "South Africa",
    "Sudan",
    "Turkey",
    "United Arab Emirates (UAE)",
    "USA",
    "Yemen",
    "Others",
  ];
  const EthiopiaLc = [
    "Addis Ababa",
    "Adama",
    "Bahir Dar",
    "Hawassa",
    "Mekelle",
    "Dire Dawa",
    "Jimma",
    "Harar",
    "Arba Minch",
    "Debre Birhan",
    "Dessie",
    "Gondar",
    "Shashemene",
    "Nekemte",
    "Jigjiga",
    "Assosa",
    "Semera",
  ]
  return (
    <div className="min-h-full bg-gray-50 flex flex-col  text-primary">
      {/* ── Header ─────────────────────────────────────────────────────────── */}

      <Title titel={"Create Campaign"} disc={"Create a new marketing campaign."} />

      <div className="w-full max-w-full bg-white rounded-xl shadow-sm border border-gray-200 p-4 mt-4">


        {/* ── Stepper ────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-14 ">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const active = stepNumber === currentStep;
            const completed = stepNumber < currentStep;

            return (
              <div key={step} className="flex-1 flex items-center cursor-pointer" onClick={() => setCurrentStep(stepNumber)}>
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
                    className={`mt-2 w-full flex-1 text-xs absolute top-full font-medium ${active ? "text-violet-600" : "text-gray-500"
                      }`}
                  >
                    {step}
                  </span>
                </div>

                {index !== steps.length - 1 && (
                  <div
                    className={`flex-1 h-[2px] ${completed ? "bg-violet-600" : "bg-gray-200"
                      }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            STEP 1 — TYPE
        ══════════════════════════════════════════════════════════════════════ */}
        {currentStep === 1 && (
          <div>
            <div className="mb-6">
              <h2 className="text-sm text-primary font-bold">
                What is your main goal?
              </h2>
              <p className="text-gray-500 text-xs mt-1">
                Choose the objective for this campaign.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mt-5">
              {goals.map((goal) => {
                const Icon = goal.icon;
                const selected = selectedGoal === goal.id;


                return (
                  <button
                    key={goal.id}
                    onClick={() => {
                      setForm(prev => ({ ...prev, type: goal.title }))
                      setSelectedGoal(goal.id)
                    }}
                    className={`text-left rounded-lg border p-4 transition-all duration-200 hover:shadow-lg
                      ${selected
                        ? "border-primary bg-gradient-to-br from-primary via-secondary to-primary"
                        : "border-gray-200 hover:border-violet-300"
                      }`}
                  >
                    <div className="flex gap-4 items-center justify-start ">
                      <div
                        className={`w-16 h-16 min-w-16 rounded-full  flex items-center justify-center border
                        ${selected
                            ? "bg-gradient-to-br from-primary via-secondary to-primary border-white text-white"
                            : "bg-gray-50 border-gray-200"
                          }`}
                      >
                        <Icon size={25} />
                      </div>
                      <div>


                        <h3 className={`${selected ? "text-white" : ""} text-lg font-semibold text-left `}>
                          {goal.title}

                        </h3>
                        <p className="text-gray-400 text-start text-xs leading-4">
                          {goal.description}
                        </p>
                      </div>
                    </div>

                    <div className=" text-xs text-gray-400 text-center mt-2 leading-6">
                      {goal.example}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            STEP 2 — TARGET
        ══════════════════════════════════════════════════════════════════════ */}
        {currentStep === 2 && <div className="bg-white rounded-lg border border-gray-200 p-4">

          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Target Audience
            </h2>

            <p className="text-gray-500 text-xs ">
              Choose where your campaign will run and which social media
              platforms creators should use.
            </p>
          </div>

          {/* Locations */}

          <div className="p-4 border border-gray-200 rounded-lg">

            <h3 className="font-semibold text-sm mb-1">
              Target Locations
            </h3>

            <p className="text-gray-500 text-xs  mb-4">
              Select one or more countries.
            </p>

            {/* checkbox grid */}
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

            {form?.locations?.includes("Ethiopia") && <div className="mt-6 border border-gray-200 p-4 rounded-lg">
              <h3 className="mb-4 text-sm font-semibold ">Ethiopian Cities</h3>

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
            </div>}

          </div>

          {/* Platforms */}

          <div className="mt-6">

            <h3 className="font-semibold text-sm ">
              Platforms
            </h3>

            <p className="text-gray-500 mb-0 text-xs">
              TikTok is required for every campaign.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-2">

              {/* TikTok */}

              <div className="rounded-lg border-1 border-gray-200 bg-primary/5 p-5">

                <Checkbox
                  label="TikTok"
                  checked={true}
                  disabled
                />
              </div>

              {/* Facebook */}

              <div className="rounded-lg border border-gray-200 p-5">

                <Checkbox
                  label="Facebook"
                  name="facebook"
                  checked={form.platforms.facebook}
                  onChange={(e) => {
                    const { name, checked } = e.target; // Correct destructuring 
                    setForm((prev) => ({
                      ...prev,
                      platforms: {
                        ...(prev?.platforms || {}), // Keeps other platforms intact
                        [name]: checked,
                      },
                    }));
                  }}
                />

              </div>

              {/* Instagram */}

              <div className="rounded-lg border border-gray-200 p-5">

                <Checkbox
                  label="Instagram"
                  name="instagram"
                  checked={form.platforms.instagram}
                  onChange={(e) => {
                    const { name, checked } = e.target; // Correct destructuring 
                    setForm((prev) => ({
                      ...prev,
                      platforms: {
                        ...(prev?.platforms || {}), // Keeps other platforms intact
                        [name]: checked,
                      },
                    }));
                  }}

                />

              </div>

            </div>

          </div>

        </div>}


        {/* ══════════════════════════════════════════════════════════════════════
            STEP 3 — DETAILS
        ══════════════════════════════════════════════════════════════════════ */}
        {currentStep === 3 && (
          <div className="space-y-8 ">
            {/* Campaign Information */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="font-semibold  text-sm mb-4">
                Campaign Information
              </h3>
              <div className=" grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col flex-1 gap-3">
                  <Input
                    label="Campaign Title"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                  />
                  <Textarea
                    label="Description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>
                <div className="flex-1 h-full">
                  <FileUpload
                    label="Campaign Video"
                    name="video"
                    value={form.video}
                    onChange={handleChange}
                    accept="video/*"
                  />
                </div>




              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">

              {/* Campaign Configuration */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">

                <h3 className="text-lg font-semibold mb-6">
                  Campaign Configuration
                </h3>

                {/* Run Type */}

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

                {/* SALES */}

                {form.type.toLowerCase() === "sales" && (
                  <>

                    <div className="mt-8">

                      <RadioGroup
                        label="Payment Type"
                        name="fund_type"
                        value={form.fund_type}
                        onChange={handleChange}
                        options={[
                          {
                            value: "conversion",
                            label: "Per Conversion",
                          },
                          {
                            value: "fixed",
                            label: "Fixed Amount",
                          },
                        ]}
                      />

                    </div>

                    <div className="grid md:grid-cols-3 gap-5 mt-6">

                      {form.fund_type === "conversion" && (
                        <Input
                          label="Conversion Rate (%)"
                          name="conversion_rate"
                          type="number"
                          value={form.conversion_rate}
                          onChange={handleChange}
                        />
                      )}

                      <Input
                        label={
                          form.fund_type === "conversion"
                            ? "Amount Per Conversion"
                            : "Fixed Amount"
                        }
                        name="amount"
                        type="number"
                        value={form.amount}
                        onChange={handleChange}
                      />

                      <Input
                        label="Total Budget"
                        name="total_budget"
                        type="number"
                        value={form.total_budget}
                        onChange={handleChange}
                      />

                    </div>

                  </>
                )}

                {/* AWARENESS */}

                {form.type.toLowerCase() === "awareness" && (
                  <div className="grid md:grid-cols-2 gap-5 mt-8">

                    <Input
                      label="Target Views"
                      name="total_views"
                      type="number"
                      value={form.total_views}
                      onChange={handleChange}
                    />

                    <Input
                      label="Total Budget"
                      name="total_budget"
                      type="number"
                      value={form.total_budget}
                      onChange={handleChange}
                    />

                  </div>
                )}

                {/* GROWTH */}

                {form.campaign_type === "growth" && (
                  <div className="mt-8 space-y-5">

                    <Input
                      label="Platform"
                      value="TikTok"
                      disabled
                    />

                    <div className="grid md:grid-cols-2 gap-5">

                      <Input
                        label="Followers to Gain"
                        name="followers"
                        type="number"
                        value={form.followers}
                        onChange={handleChange}
                      />

                      <Input
                        label="Price"
                        name="follower_price"
                        type="number"
                        value={form.follower_price}
                        onChange={handleChange}
                      />

                    </div>

                  </div>
                )}

              </div>
              {/* Campaign Duration */}
              <div className="bg-white rounded-2xl border border-gray-200  p-4">
                <h3 className="font-semibold text-lg mb-6">Campaign Duration</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <DatePicker
                    label="Start Date"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleChange}
                  />
                  <DatePicker
                    label="End Date"
                    name="end_date"
                    value={form.end_date}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            STEP 4 — TRACKING
        ══════════════════════════════════════════════════════════════════════ */}
        {currentStep === 4 && (
          <div className="space-y-8 max-w-4xl">

            {/* Conversion Tracking */}
            <div className="bg-white rounded-2xl border  border-gray-200 p-4">
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

        {/* ══════════════════════════════════════════════════════════════════════
            STEP 5 — Choose community or infulecer
        ══════════════════════════════════════════════════════════════════════ */}

        {currentStep === 5 && (
          <div className="">
            <h2 className="text-sm font-bold">With whom do you want to target?</h2>
            <p className="text-gray-500 mt-1 text-xs  ">
              Choose whether this campaign will be promoted by an influencer or
              a community.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
                <label
                className={`cursor-pointer flex  gap-4  items-center rounded-lg border p-6 transition
                ${targetType === "influencer"
                    ? "border-violet-600 bg-violet-50"
                    : "border-gray-200 hover:border-violet-300"
                  }`}
              >
                <input
                  type="radio"
                  className="hidden"
                  value="influencer"
                  checked={targetType === "influencer"}
                  onChange={(e) => {
                    setTarget("");
                    setTargetType(e.target.value);
                  }}
                />
                <UserRound size={40} className="text-violet-600" />
                <div className="flex flex-col items-start ">
                  <h3 className="text-sm font-semibold ">Influencer</h3>
                  <p className="text-gray-500 text-xs  ">
                    Select one influencer to promote your campaign.
                  </p>
                </div>
              </label>

              <label
                className={`cursor-pointer flex  gap-4  items-center rounded-lg border p-6 transition
                  ${targetType === "community"
                    ? "border-violet-600 bg-violet-50"
                    : "border-gray-200 hover:border-violet-300"
                  }`}
              >
                <input
                  type="radio"
                  className="hidden"
                  value="community"
                  checked={targetType === "community"}
                  onChange={(e) => {
                    setTarget("");
                    setTargetType(e.target.value);
                  }}
                />
                <Users size={40} className="text-violet-600" />
                <div className="flex flex-col items-start ">
                  <h3 className="text-sm font-semibold ">Community</h3>
                  <p className="text-gray-500 text-xs  ">
                    Select one community to promote your campaign.
                  </p>
                </div>
              </label>
            </div>

            <div className="mt-10">
              {targetType === "influencer" ? (
                <Select
                  label="Select Influencer"
                  options={[]} // You can provide options here if needed
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  api="/api/influencers"
                  labelKey="name"
                  valueKey="id"
                  placeholder="Choose an influencer"
                />
              ) : (
                <Select
                  label="Select Community"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  api="/api/communities"
                  labelKey="name"
                  valueKey="id"
                  placeholder="Choose a community"
                />
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            STEP 6 — REVIEW
        ══════════════════════════════════════════════════════════════════════ */}


        {currentStep === 6 && (
          <div className="space-y-4">
            <div className="mb-2">
              <h2 className="text-xl font-bold text-primary">
                Review your campaign
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Check all details before submitting. Go back to edit any section.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">

              <ReviewSection title="Campaign Type">
                <ReviewRow label="Goal" value={goalLabel} />
              </ReviewSection>

              <ReviewSection title="Target">
                <ReviewRow
                  label="Target Type"
                  value={targetType.charAt(0).toUpperCase() + targetType.slice(1)}
                />
                <ReviewRow label="Selected" value={target || "Not selected"} />
              </ReviewSection>

              <ReviewSection title="Campaign Details">
                <ReviewRow label="Title" value={form.title} />
                <ReviewRow
                  label="Video"
                  value={
                    form.video
                      ? typeof form.video === "string"
                        ? form.video
                        : form.video.name
                      : "No file uploaded"
                  }
                />
                <ReviewRow label="Description" value={form.description} />
                <ReviewRow label="Run Type" value={runType} />
                <ReviewRow
                  label="Fund Type"
                  value={fundType === "commission" ? "Commission Based" : "Fixed Budget"}
                />
                {fundType === "commission" && (
                  <ReviewRow
                    label="Per Conversion"
                    value={perConversion ? `$${perConversion}` : "—"}
                  />
                )}
                <ReviewRow
                  label="Total Budget"
                  value={totalBudget ? `$${totalBudget}` : "—"}
                />
                <ReviewRow label="Start Date" value={form.start_date} />
                <ReviewRow label="End Date" value={form.end_date} />
              </ReviewSection>

              <ReviewSection title="Tracking">

                <ReviewRow label="Conversion Event" value={tracking.conversion_event} />

              </ReviewSection>
            </div>

            {/* Submit banner */}
            <div className="rounded-2xl bg-violet-50 border border-violet-200 p-5 flex items-center gap-4">
              <CheckCircle2 size={28} className="text-violet-600 shrink-0" />
              <div>
                <p className="font-semibold text-violet-800">
                  Everything looks good!
                </p>
                <p className="text-sm text-violet-600 mt-0.5">
                  Click <strong>Launch Campaign</strong> to submit. You can
                  pause or edit the campaign at any time from your dashboard.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Footer ─────────────────────────────────────────────────────────── */}
        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <Button
              onClick={goBack}
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
              <Button
                onClick={() => console.log("Submit!", { form, tracking, selectedGoal, targetType, target, fundType, runType })}
                className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-10 py-4 flex items-center gap-3 transition"
              >
                <CheckCircle2 size={18} />
                Launch Campaign
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}