import React, { useMemo, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  ChevronLeft,
  ChevronRight,
  Upload,
  Globe,
  MapPin,
  Percent,
  Trash2,
  AlertCircle,
  Camera,
  FileText,
  Music2,
  Video,
  Send,
  Users,
  Gem,
  Check,
  X,
  Save,
} from "lucide-react";

/* ---------------------------------------------------------
   Static data
--------------------------------------------------------- */

const PLATFORMS = [
  { value: "TikTok", icon: Music2 },
  { value: "Instagram", icon: Camera },
  { value: "Facebook", icon: Users },
  { value: "YouTube", icon: Video },
  { value: "Telegram", icon: Send },
  { value: "Other", icon: Globe },
];

const LEVELS = [
  { value: "Diamond", color: "text-sky-600 bg-sky-50 border-sky-200" },
  { value: "Gold", color: "text-[#8a5a00] bg-[var(--color-tertiary)]/15 border-[var(--color-tertiary)]" },
  { value: "Silver", color: "text-slate-600 bg-slate-100 border-slate-300" },
];

const STATUSES = [
  { value: "Active", color: "bg-emerald-500" },
  { value: "Pending", color: "bg-[var(--color-tertiary)]" },
  { value: "Suspended", color: "bg-rose-500" },
];

const COUNTRIES = [
  "Ethiopia", "Bahrain", "Brazil", "Canada", "Djibouti", "Egypt", "Europe",
  "Iran", "Iraq", "Israel", "Jordan", "Kuwait", "Lebanon", "Oman",
  "Palestine", "Qatar", "Saudi Arabia", "South Africa", "Sudan", "Turkey",
  "United Arab Emirates", "USA", "Yemen", "Others",
];

const ETHIOPIAN_CITIES = [
  "Addis Ababa", "Adama", "Bahir Dar", "Hawassa", "Mekelle", "Dire Dawa",
  "Jimma", "Harar", "Arba Minch", "Debre Birhan", "Dessie", "Gondar",
  "Shashemene", "Nekemte", "Jigjiga", "Assosa", "Semera",
];

const STEPS = [
  { label: "User Information" },
  { label: "Influencer Profile" },
  { label: "Audience Locations" },
  { label: "Review & Submit" },
];

const EMPTY_FORM = {
  fullName: "",
  email: "",
  phone: "",
  altPhone: "",
  password: "",
  confirmPassword: "",
  status: "Active",

  mainPlatform: "",
  profileLink: "",
  followersCount: "",
  level: "",
  address: "",
  bio: "",
  languages: "",
  profilePhoto: null,
  nationalId: null,
  existingProfilePhoto: null,
  existingNationalId: null,

  countries: [],
  cities: [],
  countryStats: {},
  cityStats: {},
};

// Stand-in for a record loaded from the API — swap for a real fetch/prop.
const SAMPLE_INFLUENCER = {
  fullName: "Abebe Kebede",
  email: "abebe@gmail.com",
  phone: "0911223344",
  altPhone: "",
  status: "Active",

  mainPlatform: "TikTok",
  profileLink: "https://tiktok.com/@abebe",
  followersCount: "245000",
  level: "Diamond",
  address: "Bole, Addis Ababa",
  bio: "Lifestyle and comedy content creator based in Addis Ababa.",
  languages: "Amharic, English",
  existingProfilePhoto: "abebe-profile.jpg",
  existingNationalId: "abebe-id.pdf",

  countries: ["Ethiopia", "United Arab Emirates", "Saudi Arabia"],
  cities: ["Addis Ababa", "Adama", "Hawassa"],
  countryStats: { Ethiopia: 70, "United Arab Emirates": 10, "Saudi Arabia": 8 },
  cityStats: { "Addis Ababa": 40, Adama: 15, Hawassa: 10 },
};

/* ---------------------------------------------------------
   Reusable primitives
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
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      )}
      <input
        {...props}
        className={`w-full rounded-lg border bg-white py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-[var(--color-secondary)]/30 ${
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
      className={`w-full resize-none rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-[var(--color-secondary)]/30 ${
        error ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-[var(--color-secondary)]"
      }`}
    />
  );
}

function FileDrop({ label, value, onChange, optional, existingName }) {
  const hasExisting = !!existingName && !value;
  return (
    <label className="block cursor-pointer">
      <span className="mb-1.5 flex items-baseline gap-1 text-sm font-medium text-slate-700">
        {label} {!optional && !existingName && <span className="text-rose-500">*</span>}
        {optional && <span className="ml-1 text-xs font-normal text-slate-400">(Optional)</span>}
      </span>
      <div
        className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition hover:border-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/10 ${
          hasExisting ? "border-slate-200 bg-white" : "border-dashed border-slate-300 bg-slate-50"
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
      <input
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
    </label>
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
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                  done
                    ? "border-[var(--color-tertiary)] bg-[var(--color-tertiary)] text-[var(--color-primary)]"
                    : active
                    ? "border-[var(--color-secondary)] bg-white text-[var(--color-secondary)]"
                    : "border-slate-200 bg-white text-slate-400"
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={`hidden text-xs font-medium sm:block ${
                  active ? "text-[var(--color-primary)]" : done ? "text-slate-600" : "text-slate-400"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`mx-0 mb-6 h-0.5 flex-1 rounded transition-colors sm:mb-6 ${
                  i < step ? "bg-[var(--color-tertiary)]" : "bg-slate-200"
                }`}
              />
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

export default function EditInfluencer({ influencer = SAMPLE_INFLUENCER }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ ...EMPTY_FORM, ...influencer });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const toggleInList = (key, item) => {
    setForm((f) => {
      const list = f[key].includes(item) ? f[key].filter((x) => x !== item) : [...f[key], item];
      // clean up stats + cities if a country is deselected
      let patch = { [key]: list };
      if (key === "countries") {
        const stats = { ...f.countryStats };
        if (!list.includes(item)) delete stats[item];
        patch.countryStats = stats;
        if (item === "Ethiopia" && !list.includes("Ethiopia")) {
          patch.cities = [];
          patch.cityStats = {};
        }
      }
      if (key === "cities") {
        const stats = { ...f.cityStats };
        if (!list.includes(item)) delete stats[item];
        patch.cityStats = stats;
      }
      return { ...f, ...patch };
    });
  };

  const setStat = (statKey, item, value) => {
    const num = value === "" ? "" : Math.max(0, Math.min(100, Number(value)));
    setForm((f) => ({ ...f, [statKey]: { ...f[statKey], [item]: num } }));
  };

  const countryTotal = useMemo(
    () => Object.values(form.countryStats).reduce((a, b) => a + (Number(b) || 0), 0),
    [form.countryStats]
  );
  const cityTotal = useMemo(
    () => Object.values(form.cityStats).reduce((a, b) => a + (Number(b) || 0), 0),
    [form.cityStats]
  );

  /* ---- validation ---- */
  const validateStep = (s) => {
    const e = {};
    if (s === 0) {
      if (!form.fullName.trim()) e.fullName = "Full name is required.";
      if (!form.email.trim()) e.email = "Email is required.";
      else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email.";
      if (!form.phone.trim()) e.phone = "Phone number is required.";
      if (changePassword) {
        if (!form.password) e.password = "Enter a new password.";
        else if (form.password.length < 8) e.password = "Use at least 8 characters.";
        if (form.confirmPassword !== form.password || !form.confirmPassword)
          e.confirmPassword = "Passwords do not match.";
      }
    }
    if (s === 1) {
      if (!form.mainPlatform) e.mainPlatform = "Choose a platform.";
      if (!form.profileLink.trim()) e.profileLink = "Profile link is required.";
      if (!form.followersCount) e.followersCount = "Followers count is required.";
      if (!form.profilePhoto && !form.existingProfilePhoto) e.profilePhoto = "Profile photo is required.";
    }
    if (s === 2) {
      if (form.countries.length === 0) e.countries = "Select at least one country.";
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
    // Payload shaped for influencer_profiles + influencer_audience_locations
    const payload = {
      user: {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        altPhone: form.altPhone || null,
        status: form.status,
        ...(changePassword ? { password: form.password } : {}),
      },
      influencer_profile: {
        main_platform: form.mainPlatform,
        profile_link: form.profileLink,
        followers_count: Number(form.followersCount),
        level: form.level || null,
        bio: form.bio || null,
        address: form.address || null,
        languages: form.languages || null,
        // include only when the user picked a replacement file
        profile_photo: form.profilePhoto || undefined,
        national_id: form.nationalId || undefined,
      },
      influencer_audience_locations: [
        ...form.countries
          .filter((c) => c !== "Ethiopia")
          .map((c) => ({ country: c, city: null, audience_percentage: form.countryStats[c] || 0 })),
        ...(form.countries.includes("Ethiopia")
          ? form.cities.length
            ? form.cities.map((city) => ({
                country: "Ethiopia",
                city,
                audience_percentage: form.cityStats[city] || 0,
              }))
            : [{ country: "Ethiopia", city: null, audience_percentage: form.countryStats["Ethiopia"] || 0 }]
          : []),
      ],
    };
    console.log("Update Influencer payload:", payload);
    setSubmitted(true);
  };

  const platformIcon = PLATFORMS.find((p) => p.value === form.mainPlatform)?.icon || Globe;

  const brandVars = {
    "--color-primary": "#16115A",
    "--color-secondary": "#2E1C8D",
    "--color-tertiary": "#FEB209",
  };

  if (submitted) {
    return (
      <div
        style={brandVars}
        className="mx-auto flex min-h-[480px] w-full  flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-secondary)]/10">
          <Check className="h-7 w-7 text-[var(--color-secondary)]" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800">Changes saved</h2>
        <p className="max-w-sm text-sm text-slate-500">
          {form.fullName || "This influencer"}'s profile has been updated and is now {form.status.toLowerCase()}.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-4 rounded-lg bg-[var(--color-secondary)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--color-primary)]"
        >
          Back to profile
        </button>
      </div>
    );
  }

  return (
    <div
      style={brandVars}
      className="mx-auto w-full  rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-slate-800">Edit Influencer</h1>
        <p className="text-sm text-slate-500">
          Update {form.fullName || "this influencer"}'s profile and audience details.
        </p>
      </div>

      <Stepper step={step} />

      {/* ---------------- STEP 1 ---------------- */}
      {step === 0 && (
        <div className="space-y-6">
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full Name" required error={errors.fullName}>
                <TextInput
                  icon={User}
                  placeholder="Abebe Kebede"
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  error={errors.fullName}
                />
              </Field>
              <Field label="Email" required error={errors.email}>
                <TextInput
                  icon={Mail}
                  type="email"
                  placeholder="abebe@gmail.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  error={errors.email}
                />
              </Field>
              <Field label="Phone Number" required error={errors.phone}>
                <TextInput
                  icon={Phone}
                  placeholder="0911223344"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  error={errors.phone}
                />
              </Field>
              <Field label="Alternative Phone Number" hint="(Optional)">
                <TextInput
                  icon={Phone}
                  placeholder="0911223344"
                  value={form.altPhone}
                  onChange={(e) => set("altPhone", e.target.value)}
                />
              </Field>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Password</h3>
              <button
                type="button"
                onClick={() => {
                  setChangePassword((v) => !v);
                  set("password", "");
                  set("confirmPassword", "");
                }}
                className="text-xs font-semibold text-[var(--color-secondary)] hover:underline"
              >
                {changePassword ? "Cancel" : "Change password"}
              </button>
            </div>
            {changePassword ? (
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="New Password" required error={errors.password}>
                  <TextInput
                    icon={Lock}
                    type="password"
                    placeholder="At least 8 characters"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    error={errors.password}
                  />
                </Field>
                <Field label="Confirm New Password" required error={errors.confirmPassword}>
                  <TextInput
                    icon={Lock}
                    type="password"
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={(e) => set("confirmPassword", e.target.value)}
                    error={errors.confirmPassword}
                  />
                </Field>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-400">•••••••••••• (unchanged)</p>
            )}
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Account Status
            </h3>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => set("status", s.value)}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                    form.status === s.value
                      ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 text-[var(--color-primary)]"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
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
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Social Media Information
            </h3>
            <Field label="Main Platform" required error={errors.mainPlatform}>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {PLATFORMS.map(({ value, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set("mainPlatform", value)}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-medium transition ${
                      form.mainPlatform === value
                        ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 text-[var(--color-primary)]"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {value}
                  </button>
                ))}
              </div>
            </Field>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Profile Link" required error={errors.profileLink}>
                <TextInput
                  icon={platformIcon}
                  placeholder="https://tiktok.com/@abebe"
                  value={form.profileLink}
                  onChange={(e) => set("profileLink", e.target.value)}
                  error={errors.profileLink}
                />
              </Field>
              <Field label="Followers Count" required error={errors.followersCount}>
                <TextInput
                  icon={Users}
                  type="number"
                  min="0"
                  placeholder="245000"
                  value={form.followersCount}
                  onChange={(e) => set("followersCount", e.target.value)}
                  error={errors.followersCount}
                />
              </Field>
            </div>

            <Field label="Level" hint="(Optional)">
              <div className="mt-1 flex gap-2">
                {LEVELS.map((l) => (
                  <button
                    key={l.value}
                    type="button"
                    onClick={() => set("level", form.level === l.value ? "" : l.value)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                      form.level === l.value ? l.color : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    <Gem className="h-3.5 w-3.5" />
                    {l.value}
                  </button>
                ))}
              </div>
            </Field>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Personal Details
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Target Address / Location" hint="(Optional)">
                <TextInput
                  icon={MapPin}
                  placeholder="Bole, Addis Ababa"
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                />
              </Field>
              <Field label="Languages Spoken" hint="(Optional)">
                <TextInput
                  placeholder="Amharic, English"
                  value={form.languages}
                  onChange={(e) => set("languages", e.target.value)}
                />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Short Bio" hint="(Optional)">
                <TextArea
                  rows={3}
                  placeholder="A brief description of the influencer..."
                  value={form.bio}
                  onChange={(e) => set("bio", e.target.value)}
                />
              </Field>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Documents
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FileDrop
                label="Profile Photo"
                value={form.profilePhoto}
                existingName={form.existingProfilePhoto}
                onChange={(f) => set("profilePhoto", f)}
              />
              <FileDrop
                label="National ID / Passport"
                optional
                value={form.nationalId}
                existingName={form.existingNationalId}
                onChange={(f) => set("nationalId", f)}
              />
            </div>
            {errors.profilePhoto && (
              <span className="mt-2 flex items-center gap-1 text-xs font-medium text-rose-500">
                <AlertCircle className="h-3.5 w-3.5" /> {errors.profilePhoto}
              </span>
            )}
          </section>
        </div>
      )}

      {/* ---------------- STEP 3 ---------------- */}
      {step === 2 && (
        <div className="space-y-6">
          <p className="rounded-lg bg-[var(--color-secondary)]/10 px-4 py-3 text-sm text-[var(--color-primary)]">
            This is the most important part — campaigns match influencers to brands using audience location.
          </p>

          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Countries <span className="text-rose-500">*</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {COUNTRIES.map((c) => (
                <label
                  key={c}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                    form.countries.includes(c)
                      ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 text-[var(--color-primary)]"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 accent-[var(--color-secondary)]"
                    checked={form.countries.includes(c)}
                    onChange={() => toggleInList("countries", c)}
                  />
                  {c}
                </label>
              ))}
            </div>
            {errors.countries && (
              <span className="mt-2 flex items-center gap-1 text-xs font-medium text-rose-500">
                <AlertCircle className="h-3.5 w-3.5" /> {errors.countries}
              </span>
            )}
          </section>

          {form.countries.includes("Ethiopia") && (
            <section>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                Ethiopian Audience Cities
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {ETHIOPIAN_CITIES.map((c) => (
                  <label
                    key={c}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                      form.cities.includes(c)
                        ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 text-[var(--color-primary)]"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 accent-[var(--color-secondary)]"
                      checked={form.cities.includes(c)}
                      onChange={() => toggleInList("cities", c)}
                    />
                    {c}
                  </label>
                ))}
              </div>
            </section>
          )}

          {form.countries.length > 0 && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                  Audience Statistics — Countries
                </h3>
                <span className={`text-xs font-semibold ${countryTotal === 100 ? "text-[var(--color-secondary)]" : "text-slate-400"}`}>
                  {countryTotal}% total
                </span>
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <th className="px-4 py-2">Country</th>
                      <th className="px-4 py-2 text-right">Audience %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.countries.map((c) => (
                      <tr key={c} className="border-t border-slate-100">
                        <td className="px-4 py-2 text-slate-700">{c}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={form.countryStats[c] ?? ""}
                              onChange={(e) => setStat("countryStats", c, e.target.value)}
                              placeholder="0"
                              className="w-16 rounded-md border border-slate-200 px-2 py-1 text-right outline-none focus:border-[var(--color-secondary)] focus:ring-2 focus:ring-[var(--color-secondary)]/30"
                            />
                            <Percent className="h-3.5 w-3.5 text-slate-400" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {form.countries.includes("Ethiopia") && form.cities.length > 0 && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                  Audience Statistics — Ethiopian Cities
                </h3>
                <span className={`text-xs font-semibold ${cityTotal === 100 ? "text-[var(--color-secondary)]" : "text-slate-400"}`}>
                  {cityTotal}% total
                </span>
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <th className="px-4 py-2">City</th>
                      <th className="px-4 py-2 text-right">Audience %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.cities.map((c) => (
                      <tr key={c} className="border-t border-slate-100">
                        <td className="px-4 py-2 text-slate-700">{c}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={form.cityStats[c] ?? ""}
                              onChange={(e) => setStat("cityStats", c, e.target.value)}
                              placeholder="0"
                              className="w-16 rounded-md border border-slate-200 px-2 py-1 text-right outline-none focus:border-[var(--color-secondary)] focus:ring-2 focus:ring-[var(--color-secondary)]/30"
                            />
                            <Percent className="h-3.5 w-3.5 text-slate-400" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      )}

      {/* ---------------- STEP 4 : REVIEW ---------------- */}
      {step === 3 && (
        <div className="space-y-5">
          <ReviewSection title="User Information">
            <ReviewRow label="Name" value={form.fullName} />
            <ReviewRow label="Email" value={form.email} />
            <ReviewRow label="Phone" value={form.phone} />
            {form.altPhone && <ReviewRow label="Alt. Phone" value={form.altPhone} />}
            <ReviewRow label="Status" value={form.status} />
          </ReviewSection>

          <ReviewSection title="Influencer Profile">
            <ReviewRow label="Platform" value={form.mainPlatform} />
            <ReviewRow label="Followers" value={Number(form.followersCount || 0).toLocaleString()} />
            {form.level && <ReviewRow label="Level" value={form.level} />}
            <ReviewRow label="Profile" value={form.profileLink} />
            {form.address && <ReviewRow label="Location" value={form.address} />}
            {form.languages && <ReviewRow label="Languages" value={form.languages} />}
            <ReviewRow
              label="Profile Photo"
              value={form.profilePhoto ? `${form.profilePhoto.name} (new)` : form.existingProfilePhoto || "—"}
            />
            <ReviewRow
              label="National ID"
              value={form.nationalId ? `${form.nationalId.name} (new)` : form.existingNationalId || "Not provided"}
            />
            {changePassword && <ReviewRow label="Password" value="Will be updated" />}
          </ReviewSection>

          <ReviewSection title="Audience">
            <div className="mb-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Countries</span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {form.countries.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--color-primary)]"
                  >
                    {c} {form.countryStats[c] ? `· ${form.countryStats[c]}%` : ""}
                  </span>
                ))}
              </div>
            </div>
            {form.cities.length > 0 && (
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Ethiopian Cities
                </span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {form.cities.map((c) => (
                    <span
                      key={c}
                      className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600"
                    >
                      {c} {form.cityStats[c] ? `· ${form.cityStats[c]}%` : ""}
                    </span>
                  ))}
                </div>
              </div>
            )}
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
            <Save className="h-4 w-4" /> Save Changes
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
    <div className="flex items-center justify-between gap-4 border-b border-dashed border-slate-100 pb-2 text-sm last:border-none last:pb-0">
      <span className="text-slate-400">{label}</span>
      <span className="max-w-[60%] truncate text-right font-medium text-slate-700">{value || "—"}</span>
    </div>
  );
}