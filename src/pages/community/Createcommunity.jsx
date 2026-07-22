import React, { useState } from "react";
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
  Camera,
  Music2,
  Video,
  Send,
  MessageCircleReply,
  Gem,
  Percent,
  Wallet,
DollarSign
} from "lucide-react";
import Title from "../../components/common/Titel";
import Input from "../../components/common/Input";

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

const TIERS = [
  { value: "Diamond", color: "text-sky-600 bg-sky-50 border-sky-200" },
  { value: "Gold", color: "text-[#8a5a00] bg-[var(--color-tertiary)]/15 border-[var(--color-tertiary)]" },
  { value: "Silver", color: "text-slate-600 bg-slate-100 border-slate-300" },
];

const STATUSES = [
  { value: "Active", color: "bg-emerald-500" },
  { value: "Pending", color: "bg-[var(--color-tertiary)]" },
  { value: "Suspended", color: "bg-rose-500" },
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

const initialForm = {
  name: "",
  tier: "",
  location: "",
  status: "Active",
  coverImage: null,
  avatarImage: null,

  about: "",
  goals: "",
  rules: "",
  categories: [],
  platforms: [],

  commissionType: "Rate",
  commissionValue: "",
  manager: "",
};

/* ---------------------------------------------------------
   Reusable primitives
--------------------------------------------------------- */

function Field({ label, required, error, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 text-xs flex items-baseline gap-1 text-xs font-medium text-slate-700">
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
        className={`w-full rounded-lg border bg-white py-2.5 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-[var(--color-secondary)]/30 ${
          Icon ? "pl-9 pr-3" : "px-3"
        } ${error ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-[var(--color-secondary)]"}`}
      />
    </div>
  );
}

function TextArea({ error, ...props }) {
  return (
    <textarea
      {...props}
      className={`w-full resize-none rounded-lg border bg-white px-3 py-2.5 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-[var(--color-secondary)]/30 ${
        error ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-[var(--color-secondary)]"
      }`}
    />
  );
}

function FileDrop({ label, value, onChange, optional, hint }) {
  return (
    <label className="block cursor-pointer">
      <span className="mb-1.5 flex items-baseline gap-1 text-xs font-medium text-slate-700">
        {label} {!optional && <span className="text-rose-500">*</span>}
        {optional && <span className="ml-1 text-xs font-normal text-slate-400">(Optional)</span>}
        {hint && <span className="ml-1 text-xs font-normal text-slate-400">{hint}</span>}
      </span>
      <div className="flex items-center justify-between rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm transition hover:border-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/10">
        <span className={`flex items-center gap-2 truncate ${value ? "text-slate-700" : "text-slate-400"}`}>
          <Upload className="h-4 w-4 shrink-0" />
          {value ? value.name : "Click to upload"}
        </span>
        {value && (
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
        )}
      </div>
      <input type="file" accept="image/*" className="hidden" onChange={(e) => onChange(e.target.files?.[0] || null)} />
    </label>
  );
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 px-4 py-3">
      <div>
        <div className="text-xs font-medium text-slate-700">{label}</div>
        {description && <div className="text-[10px] text-slate-400">{description}</div>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-[var(--color-secondary)]" : "bg-slate-200"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

/* ---------------------------------------------------------
   Stepper header
--------------------------------------------------------- */

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
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                  done
                    ? "border-[var(--color-tertiary)] bg-[var(--color-tertiary)] text-[var(--color-primary)]"
                    : active
                    ? "border-[var(--color-secondary)] bg-white text-[var(--color-secondary)]"
                    : "border-slate-200 bg-white text-slate-400"
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`hidden text-[10px] font-medium sm:block ${active ? "text-[var(--color-secondary)]" : done ? "text-slate-600" : "text-slate-400"}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={` mb-4 h-0.5 flex-1 rounded transition-colors sm:mb-6 ${i < step ? "bg-[var(--color-tertiary)]" : "bg-slate-200"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------
   Main component
--------------------------------------------------------- */

export default function CreateCommunity() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const toggleInList = (key, item) => {
    setForm((f) => ({ ...f, [key]: f[key].includes(item) ? f[key].filter((x) => x !== item) : [...f[key], item] }));
  };

  const validateStep = (s) => {
    const e = {};
    if (s === 0) {
      if (!form.name.trim()) e.name = "Community name is required.";
      if (!form.location.trim()) e.location = "Location is required.";
      if (!form.avatarImage) e.avatarImage = "Community avatar is required.";
    }
    if (s === 1) {
      if (!form.about.trim()) e.about = "A short description is required.";
      if (form.categories.length === 0) e.categories = "Select at least one category.";
      if (form.platforms.length === 0) e.platforms = "Select at least one platform.";
    }
    if (s === 2) {
      if (form.commissionValue === "" || form.commissionValue === null) {
        e.commissionValue = form.commissionType === "Rate" ? "Enter a commission rate." : "Enter a commission amount.";
      } else if (form.commissionType === "Rate" && (Number(form.commissionValue) < 0 || Number(form.commissionValue) > 100)) {
        e.commissionValue = "Rate must be between 0 and 100.";
      } else if (form.commissionType === "Fixed" && Number(form.commissionValue) < 0) {
        e.commissionValue = "Amount cannot be negative.";
      }
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

  const submit = () => {
    const payload = {
      community: {
        name: form.name,
        tier: form.tier || null,
        location: form.location,
        status: form.status,
      },
      profile: {
        about: form.about,
        goals: form.goals || null,
        rules: form.rules || null,
        categories: form.categories,
        platforms: form.platforms,
        manager: form.manager || null,
      },
      settings: {
        commission_type: form.commissionType,
        commission_rate: form.commissionType === "Rate" ? Number(form.commissionValue) : null,
        commission_amount: form.commissionType === "Fixed" ? Number(form.commissionValue) : null,
      },
    };
    console.log("Create Community payload:", payload);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={BRAND} className="mx-auto flex min-h-[480px] w-full max-w-2xl flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-secondary)]/10">
          <Check className="h-7 w-7 text-[var(--color-secondary)]" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800">Community created</h2>
        <p className="max-w-sm text-sm text-slate-500">
          {form.name || "The new community"} has been created and is now {form.status.toLowerCase()}.
        </p>
        <button
          onClick={() => {
            setForm(initialForm);
            setStep(0);
            setSubmitted(false);
          }}
          className="mt-4 rounded-lg bg-[var(--color-secondary)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--color-primary)]"
        >
          Add another community
        </button>
      </div>
    );
  }

  return (
    <div style={BRAND} className="mx-auto w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-4">
        <Title titel={"Create Community"} disc={"Set up a new community in three quick steps."}/>
      
      </div>

      <Stepper step={step} />

      {/* ---------------- STEP 1 ---------------- */}
      {step === 0 && (
        <div className="space-y-6">
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Community Details</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Community Name" required error={errors.name}>
                <TextInput
                  icon={Users}
                  placeholder="Sara Beauty Community"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  error={errors.name}
                />
              </Field>
              <Field label="Location" required error={errors.location}>
                <TextInput
                  icon={MapPin}
                  placeholder="Ethiopia"
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
              <FileDrop label="Community Avatar" value={form.avatarImage} onChange={(f) => set("avatarImage", f)} />
              <FileDrop label="Cover Image" optional value={form.coverImage} onChange={(f) => set("coverImage", f)} />
            </div>
            {errors.avatarImage && (
              <span className="mt-2 flex items-center gap-1 text-xs font-medium text-rose-500">
                <AlertCircle className="h-3.5 w-3.5" /> {errors.avatarImage}
              </span>
            )}
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Account Status</h3>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => set("status", s.value)}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                    form.status === s.value ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]" : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${s.color}`} />
                  {s.value}
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ---------------- STEP 2 ---------------- */}
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
                placeholder="e.g. Grow to 20K members, run 50 campaigns this year..."
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
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Categories <span className="text-rose-500">*</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CATEGORIES.map((c) => (
                <label
                  key={c}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                    form.categories.includes(c) ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]" : "border-slate-200 text-slate-600 hover:border-slate-300"
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
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Platforms <span className="text-rose-500">*</span>
            </h3>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {PLATFORMS.map(({ value, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleInList("platforms", value)}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-medium transition ${
                    form.platforms.includes(value) ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]" : "border-slate-200 text-slate-600 hover:border-slate-300"
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

      {/* ---------------- STEP 3 ---------------- */}
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
                    set("commissionValue", "");
                  }}
                  className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                    form.commissionType === v
                      ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {v === "Fixed" ? <Wallet className="h-4 w-4" /> : <Percent className="h-4 w-4" />}
                  {v}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              {form.commissionType === "Rate"
                ? "Commission is charged as a percentage of each campaign payout."
                : "Commission is charged as a flat amount per campaign."}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-4 max-w-md">
              
                  <div className="relative">
                    <Input
                    label="Commission Rate" 
                    required 
                    error={errors.commission_rate}
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="e.g. 10%"
                      value={form.commission_rate}
                      onChange={(e) => set("commissionValue", e.target.value)}
                      className={`w-full rounded-lg border bg-white py-2.5 pl-3 pr-9 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-[var(--color-secondary)]/30 ${
                        errors.commission_rate ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-[var(--color-secondary)]"
                      }`}
                    />
                    <Percent className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
               
              
                 <div className="relative">
                    
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">ETB</span>
                    <Input
                    label="Commission Amount"
                      type="number"
                      min="0"
                      step="1"
                      required
                      leftIcon={<DollarSign size={18}/>}
                      placeholder="e.g. 500"
                      value={form.commissionValue}
                      onChange={(e) => set("commissionValue", e.target.value)}
                      className={`w-full rounded-lg border bg-white py-2.5 pl-11 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-[var(--color-secondary)]/30 ${
                        errors.commissionValue ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-[var(--color-secondary)]"
                      }`}
                    error={errors.commissionValue}
                    />
                  </div>
            
            </div>
          </section>

          <section>
            <Field label="Community Manager" hint="(Optional)">
              <TextInput
                icon={Users}
                placeholder="Assign an owner or manager by name/email"
                value={form.manager}
                onChange={(e) => set("manager", e.target.value)}
              />
            </Field>
          </section>
        </div>
      )}

      {/* ---------------- STEP 4 : REVIEW ---------------- */}
      {step === 3 && (
        <div className="space-y-5">
          <ReviewSection title="Community Details">
            <ReviewRow label="Name" value={form.name} />
            <ReviewRow label="Location" value={form.location} />
            {form.tier && <ReviewRow label="Tier" value={form.tier} />}
            <ReviewRow label="Status" value={form.status} />
            <ReviewRow label="Avatar" value={form.avatarImage ? form.avatarImage.name : "—"} />
            <ReviewRow label="Cover Image" value={form.coverImage ? form.coverImage.name : "Not provided"} />
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
            <ReviewRow label="Visibility" value={form.visibility} />
            <ReviewRow label="Member Approval" value={form.memberApproval} />
            <ReviewRow label="Post Approval" value={form.postApproval ? "Required" : "Not required"} />
            <ReviewRow label="Notifications" value={form.notifications ? "Enabled" : "Disabled"} />
            {form.manager && <ReviewRow label="Manager" value={form.manager} />}
          </ReviewSection>
        </div>
      )}

      {/* ---------------- NAV ---------------- */}
      <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
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
            className="flex items-center gap-1.5 rounded-lg bg-[var(--color-secondary)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--color-primary)]"
          >
            <Check className="h-4 w-4" /> Create Community
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Review helpers
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
      <span className="max-w-[65%] text-right font-medium text-slate-700">{value || "—"}</span>
    </div>
  );
}