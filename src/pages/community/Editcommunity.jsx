import React, { useState, useEffect } from "react";
import {
  Users,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Upload,
  AlertCircle,
  Check,
  X,
  FileText,
  Video,
  Send,
  MessageCircleReply,
  Camera,
  Music2,
  Save,
  Wallet,
  Percent,
  BadgeCheck,
  Loader2,
} from "lucide-react";
import useApi from "../../hooks/useApi";
import { useParams } from "react-router-dom";
import SearchSelect from "../../components/common/SearchSelect";

/* ---------------------------------------------------------
   Brand tokens
--------------------------------------------------------- */
const BRAND = {
  "--color-primary": "#16115A",
  "--color-secondary": "#2E1C8D",
  "--color-tertiary": "#FEB209",
};

/* ---------------------------------------------------------
   Static data
--------------------------------------------------------- */
const STATUSES = [
  { value: "active", label: "Active", color: "bg-emerald-500" },
  { value: "pending", label: "Pending", color: "bg-[var(--color-tertiary)]" },
  { value: "suspended", label: "Suspended", color: "bg-rose-500" },
];

const CATEGORIES = ["Beauty", "Lifestyle", "Fashion", "Travel", "Food", "Technology", "Fitness", "Comedy"];

const PLATFORMS = [
  { value: "Instagram", icon: Camera },
  { value: "TikTok", icon: Music2 },
  { value: "Telegram", icon: Send },
  { value: "YouTube", icon: Video },
  { value: "Facebook", icon: MessageCircleReply },
];

const STEPS = [
  { label: "Community Info" },
  { label: "About & Categories" },
  { label: "Settings" },
  { label: "Review & Submit" },
];

const EMPTY_FORM = {
  name: "",
  location: "",
  status: "active",
  visibility: "private",
  isVerified: false,
  coverImage: null,
  avatarImage: null,
  existingCoverImage: null,
  existingAvatarImage: null,

  about: "",
  goals: "",
  rules: "",
  categories: [],
  platforms: [],

  commissionType: "Fixed",
  commissionValue: "",
  manager: "",
};

/* ---------------------------------------------------------
   Helpers
--------------------------------------------------------- */
function safeParseArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try {
    const parsed = JSON.parse(val);
    if (typeof parsed === "string") {
      return parsed.split(",").map((s) => s.trim());
    }
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return val.split(",").map((s) => s.trim());
  }
}

/* ---------------------------------------------------------
   Reusable Primitives
--------------------------------------------------------- */
function Field({ label, required, error, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-1 text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-rose-500">*</span>}
        {hint && <span className="ml-1 text-xs font-normal text-slate-400">{hint}</span>}
      </span>
      {children}
      {error && (
        <span className="mt-1 flex items-center gap-1 text-xs font-medium text-rose-500">
          <AlertCircle className="h-3.5 w-3.5" /> {error}
        </span>
      )}
    </label>
  );
}

function TextInput({ icon: Icon, error, ...props }) {
  return (
    <div className="relative">
      {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />}
      <input
        {...props}
        className={`w-full rounded-lg border bg-white py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-[var(--color-secondary)]/30 ${Icon ? "pl-9 pr-3" : "px-3"
          } ${error ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-[var(--color-secondary)]"}`}
      />
    </div>
  );
}

function TextArea({ error, ...props }) {
  return (
    <textarea
      {...props}
      className={`w-full resize-none rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-[var(--color-secondary)]/30 ${error ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-[var(--color-secondary)]"
        }`}
    />
  );
}

function FileDrop({ label, value, onChange, optional, hint, existingName }) {
  const hasExisting = !!existingName && !value;
  return (
    <label className="block cursor-pointer">
      <span className="mb-1.5 flex items-baseline gap-1 text-sm font-medium text-slate-700">
        {label} {!optional && !existingName && <span className="text-rose-500">*</span>}
        {optional && <span className="ml-1 text-xs font-normal text-slate-400">(Optional)</span>}
        {hint && <span className="ml-1 text-xs font-normal text-slate-400">{hint}</span>}
      </span>
      <div
        className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition hover:border-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/10 ${hasExisting ? "border-slate-200 bg-white" : "border-dashed border-slate-300 bg-slate-50"
          }`}
      >
        <span className={`flex items-center gap-2 truncate ${value || hasExisting ? "text-slate-700" : "text-slate-400"}`}>
          {hasExisting ? <FileText className="h-4 w-4 shrink-0 text-[var(--color-secondary)]" /> : <Upload className="h-4 w-4 shrink-0" />}
          {value ? value.name : hasExisting ? existingName : "Click to upload"}
        </span>
        {value ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onChange(null);
            }}
            className="text-slate-400 hover:text-rose-500"
          >
            <X className="h-4 w-4" />
          </button>
        ) : hasExisting ? (
          <span className="shrink-0 text-xs font-medium text-[var(--color-secondary)]">Replace</span>
        ) : null}
      </div>
      <input type="file" accept="image/*" className="hidden" onChange={(e) => onChange(e.target.files?.[0] || null)} />
    </label>
  );
}

function Stepper({ step }) {
  return (
    <div className="mb-8 flex items-center">
      {STEPS.map((s, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <React.Fragment key={s.label}>
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${done
                    ? "border-[var(--color-tertiary)] bg-[var(--color-tertiary)] text-[var(--color-primary)]"
                    : active
                      ? "border-[var(--color-secondary)] bg-white text-[var(--color-secondary)]"
                      : "border-slate-200 bg-white text-slate-400"
                  }`}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`hidden text-xs font-medium sm:block ${active ? "text-[var(--color-secondary)]" : done ? "text-slate-600" : "text-slate-400"}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mx-2 mb-6 h-0.5 flex-1 rounded transition-colors sm:mb-6 ${i < step ? "bg-[var(--color-tertiary)]" : "bg-slate-200"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------
   Main Component
--------------------------------------------------------- */
export default function EditCommunity() {
  const { id } = useParams();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [userOptions, setUserOptions] = useState([]);

  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const influencerApi = useApi({
    request: (payload) => ({
      method: "GET",
      path: "/influencers",
      query: payload,
      manual: true
    }),
  });
  // GET Community details API
  const getCommunityApi = useApi({
    request: () => ({
      method: "GET",
      path: `/communities/${id}`,
    }),
  });

  // PUT Community update API
  const updateCommunityApi = useApi({
    request: (payload) => ({
      method: "PUT",
      path: `/communities/${id}`,
      data: payload,
    }),
  });

  // Fetch initial response and map data
  useEffect(() => {
    if (id) {
      getCommunityApi.execute().then((res) => {
        if (res?.success && res.data) {
          const data = res.data?.data;

          const parsedCategories = safeParseArray(data.categories);
          const parsedPlatforms = safeParseArray(data.platforms);

          const isRate = data.commission_type === "Rate";
          const commVal = isRate ? data.commission_rate : data.commission_amount;

          setForm({
            name: data.name || "",
            location: data.location || "",
            status: data.status || "active",
            visibility: data.visibility || "private",
            isVerified: data.is_verified ?? false,

            existingAvatarImage: data.profile_photo?.url || data.profile_photo_document_id || null,
            existingCoverImage: data.cover_photo?.url || data.cover_photo_document_id || null,
            avatarImage: null,
            coverImage: null,

            about: data.about || "",
            goals: data.goals || "",
            rules: data.rules || "",
            categories: parsedCategories,
            platforms: parsedPlatforms,

            commissionType: data.commission_type || "Fixed",
            commissionValue: commVal ?? "",
            commission_rate: data.commission_rate,
            manager_user_id: data.manager_user_id || "",
            manager: data.manager?.name_or_company_name || data.manager_user_id || "",
          });
          const option={
          
          label: `${data?.manager?.name_or_company_name} (${data?.manager?.email})`,
          value: data?.manager?.id // or user.id
        
          }
          setUserOptions([option])
        }
      });
    }
  }, [id]);
  useEffect(() => {
    if (!searchTerm.trim()) {
      setUserOptions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      // setLoading(true);

      const result = await influencerApi.execute({ search: searchTerm, limit: 10 });
      // Format results for your MySelect component (e.g., label/value pairs)
      if (result.success) {
        const formatted = result?.data?.data?.data?.data?.map(inf => ({
          label: `${inf.user?.name_or_company_name} (${inf?.user?.email})`,
          value: inf?.user?.id // or user.id
        }));
        setUserOptions(formatted);
      }


      // setLoading(false);

    }, 1000); // 300ms debounce to prevent spamming APIs

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);


  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const toggleInList = (key, item) => {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(item) ? f[key].filter((x) => x !== item) : [...f[key], item],
    }));
  };

  const validateStep = (s) => {
    const e = {};
    if (s === 0) {
      if (!form.name.trim()) e.name = "Community name is required.";
      if (!form.location.trim()) e.location = "Location is required.";
    }
    if (s === 1) {
      if (!form.about.trim()) e.about = "A short description is required.";
      if (form.categories.length === 0) e.categories = "Select at least one category.";
      if (form.platforms.length === 0) e.platforms = "Select at least one platform.";
    }
    if (s === 2) {
      if (!form.commissionValue.toString().trim()) e.commissionValue = "Commission value is required.";
      if (!form.commission_rate.toString().trim()) e.commission_rate = "Commission Rate is required.";
      if (!form.manager_user_id.toString().trim()) e.manager_user_id = "Manger of Community is required.";

    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  };

  const submit = async () => {
    setSubmitError(null);

    const isRate = form.commissionType === "Rate";

    // Construct payload matching backend expectations
    const payload = {
      name: form.name,
      about: form.about,
      goals: form.goals || null,
      rules: form.rules || null,
      location: form.location,
      status: form.status,
      visibility: form.visibility,
      is_verified: form.isVerified,
      categories: form.categories.join(","),
      platforms: form.platforms.join(","),
      commission_type: form.commissionType,
      manager_user_id: form.manager_user_id,
      commission_rate:  Number(form.commission_rate),
      commission_amount:  Number(form.commissionValue),
      successMsg: "Community details updated successfully.",
    };

    try {
      const res = await updateCommunityApi.execute(payload);
      if (res?.success) {
        setSubmitted(true);
      } else {
        setSubmitError(res?.error || "Failed to update community details.");
      }
    } catch (err) {
      setSubmitError("An unexpected error occurred.");
    }
  };

  const isSubmitting = updateCommunityApi.loading;

  if (getCommunityApi.loading) {
    return (
      <div style={BRAND} className="mx-auto flex min-h-[400px] w-full max-w-2xl flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-secondary)]" />
        <p className="text-sm font-medium text-slate-500">Loading community details...</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={BRAND} className="mx-auto flex min-h-[480px] w-full max-w-2xl flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-secondary)]/10">
          <Check className="h-7 w-7 text-[var(--color-secondary)]" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800">Changes saved</h2>
        <p className="max-w-sm text-sm text-slate-500">
          {form.name || "This community"}'s details have been updated successfully.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-4 rounded-lg bg-[var(--color-secondary)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--color-primary)]"
        >
          Back to community
        </button>
      </div>
    );
  }

  return (
    <div style={BRAND} className="mx-auto w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-slate-800">Edit Community</h1>
            {form.isVerified && <BadgeCheck className="h-5 w-5 text-sky-500" title="Verified Community" />}
          </div>
          <p className="text-sm text-slate-500">Update {form.name || "this community"}'s details and settings.</p>
        </div>
      </div>

      <Stepper step={step} />

      {submitError && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
          {submitError}
        </div>
      )}

      {/* STEP 1 */}
      {step === 0 && (
        <div className="space-y-6">
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Community Details</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Community Name" required error={errors.name}>
                <TextInput
                  icon={Users}
                  placeholder="e.g. Fasika Community"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  error={errors.name}
                />
              </Field>
              <Field label="Location" required error={errors.location}>
                <TextInput
                  icon={MapPin}
                  placeholder="e.g. Saudi"
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  error={errors.location}
                />
              </Field>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Branding</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FileDrop
                label="Community Avatar"
                optional
                value={form.avatarImage}
                existingName={form.existingAvatarImage}
                onChange={(f) => set("avatarImage", f)}
              />
              <FileDrop
                label="Cover Image"
                optional
                value={form.coverImage}
                existingName={form.existingCoverImage}
                onChange={(f) => set("coverImage", f)}
              />
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Account Status & Verification</h3>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => set("status", s.value)}
                    className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium capitalize transition ${form.status === s.value ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]" : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${s.color}`} />
                    {s.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => set("isVerified", !form.isVerified)}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${form.isVerified ? "border-sky-300 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
              >
                <BadgeCheck className={`h-4 w-4 ${form.isVerified ? "text-sky-600" : "text-slate-400"}`} />
                {form.isVerified ? "Verified" : "Unverified"}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* STEP 2 */}
      {step === 1 && (
        <div className="space-y-6">
          <section>
            <Field label="About Community" required error={errors.about}>
              <TextArea
                rows={3}
                placeholder="What is this community about, and who is it for?"
                value={form.about}
                onChange={(e) => set("about", e.target.value)}
                error={errors.about}
              />
            </Field>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Community Goals" hint="(Optional)">
              <TextArea
                rows={3}
                placeholder="e.g. Grow to 20K members..."
                value={form.goals}
                onChange={(e) => set("goals", e.target.value)}
              />
            </Field>
            <Field label="Community Rules" hint="(Optional)">
              <TextArea
                rows={3}
                placeholder="e.g. Be respectful, disclose sponsored content..."
                value={form.rules}
                onChange={(e) => set("rules", e.target.value)}
              />
            </Field>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Categories <span className="text-rose-500">*</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CATEGORIES.map((c) => (
                <label
                  key={c}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${form.categories.includes(c) ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]" : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                >
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 accent-[var(--color-secondary)]"
                    checked={form.categories.includes(c)}
                    onChange={() => toggleInList("categories", c)}
                  />
                  {c}
                </label>
              ))}
            </div>
            {errors.categories && (
              <span className="mt-2 flex items-center gap-1 text-xs font-medium text-rose-500">
                <AlertCircle className="h-3.5 w-3.5" /> {errors.categories}
              </span>
            )}
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Platforms <span className="text-rose-500">*</span>
            </h3>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {PLATFORMS.map(({ value, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleInList("platforms", value)}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-medium transition ${form.platforms.includes(value) ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]" : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  {value}
                </button>
              ))}
            </div>
            {errors.platforms && (
              <span className="mt-2 flex items-center gap-1 text-xs font-medium text-rose-500">
                <AlertCircle className="h-3.5 w-3.5" /> {errors.platforms}
              </span>
            )}
          </section>
        </div>
      )}

      {/* STEP 3 */}
      {step === 2 && (
        <div className="space-y-6">
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Commission Rule <span className="text-rose-500">*</span>
            </h3>
            <div className="flex gap-2">
              {["Fixed", "Rate"].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    set("commissionType", v);
                    // set("commissionValue", "");
                  }}
                  className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition ${form.commissionType === v
                      ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                >
                  {v === "Fixed" ? <Wallet className="h-4 w-4" /> : <Percent className="h-4 w-4" />}
                  {v}
                </button>
              ))}
            </div>

            <div className="mt-4 flex gap-4 max-w-md">

              <Field label="Commission Rate" required error={errors.commissionValue}>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="e.g. 10"
                    value={form.commission_rate}
                    onChange={(e) => set("commission_rate", e.target.value)}
                    className={`w-full rounded-lg border bg-white py-2.5 pl-3 pr-9 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-[var(--color-secondary)]/30 ${errors.commission_rate ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-[var(--color-secondary)]"
                      }`}
                  />
                  <Percent className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </Field>

              <Field label="Commission Amount" required error={errors.commissionValue}>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">ETB</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 100"
                    value={form.commissionValue}
                    onChange={(e) => set("commissionValue", e.target.value)}
                    className={`w-full rounded-lg border bg-white py-2.5 pl-11 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-[var(--color-secondary)]/30 ${errors.commissionValue ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-[var(--color-secondary)]"
                      }`}
                  />
                </div>
              </Field>

            </div>
          </section>

          <section>
            <Field label="Community Manager" required={true}>
              <SearchSelect
                icon={Users}
                placeholder="Search manager by name or email"
                options={userOptions}
                isLoading={influencerApi?.loading}
                value={form.manager_user_id}
                onInputChange={(inputValue) => setSearchTerm(inputValue)}
                onChange={(selectedOption) => {
                  console.log(selectedOption);

                  set("manager_user_id", selectedOption.value);
                  set("managerLabel", selectedOption.label);
                }}
              />
            </Field>
          </section>
        </div>
      )}

      {/* STEP 4: REVIEW */}
      {step === 3 && (
        <div className="space-y-5">
          <ReviewSection title="Community Details">
            <ReviewRow label="Name" value={form.name} />
            <ReviewRow label="Location" value={form.location} />
            <ReviewRow label="Status" value={form.status} />
            <ReviewRow label="Visibility" value={form.visibility} />
            <ReviewRow label="Verified" value={form.isVerified ? "Yes" : "No"} />
            <ReviewRow
              label="Avatar"
              value={form.avatarImage ? `${form.avatarImage.name} (new)` : form.existingAvatarImage || "Not provided"}
            />
            <ReviewRow
              label="Cover Image"
              value={form.coverImage ? `${form.coverImage.name} (new)` : form.existingCoverImage || "Not provided"}
            />
          </ReviewSection>

          <ReviewSection title="About & Categories">
            <ReviewRow label="About" value={form.about} />
            {form.goals && <ReviewRow label="Goals" value={form.goals} />}
            {form.rules && <ReviewRow label="Rules" value={form.rules} />}
            <div className="mb-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Categories</span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {form.categories.map((c) => (
                  <span key={c} className="rounded-full border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--color-secondary)]">
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Platforms</span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {form.platforms.map((p) => (
                  <span key={p} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </ReviewSection>

          <ReviewSection title="Settings">
            <ReviewRow label="Commission Type" value={form.commissionType} />
            <ReviewRow
              label="Commission Value"
              value={
                form.commissionValue
                  ? form.commissionType === "Rate"
                    ? `${form.commissionValue}%`
                    : `ETB ${Number(form.commissionValue).toFixed(2)}`
                  : "—"
              }
            />
            {form.manager && <ReviewRow label="Manager" value={form.manager} />}
          </ReviewSection>
        </div>
      )}

      {/* NAVIGATION */}
      <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
        <button
          type="button"
          onClick={back}
          disabled={step === 0 || isSubmitting}
          className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50 disabled:opacity-0"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={next}
            className="flex items-center gap-1 rounded-lg bg-[var(--color-secondary)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--color-primary)]"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--color-secondary)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--color-primary)] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Changes
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Review Helpers
--------------------------------------------------------- */
function ReviewSection({ title, children }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <FileText className="h-4 w-4 text-[var(--color-secondary)]" />
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-dashed border-slate-100 pb-2 text-sm last:border-none last:pb-0">
      <span className="shrink-0 text-slate-400">{label}</span>
      <span className="max-w-[65%] text-right font-medium text-slate-700 capitalize">{value || "—"}</span>
    </div>
  );
}