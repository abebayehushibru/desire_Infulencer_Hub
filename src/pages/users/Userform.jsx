import { useState } from "react";
import {
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  Shield,
  BadgeCheck,
  Camera,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";

/* ----------------------------
   Field options (mirrors the Sequelize enums)
-----------------------------*/

const ROLE_OPTIONS = [
  { value: "influencer", label: "Influencer" , disabled: true},
  { value: "business", label: "Business" , disabled: true},
  { value: "agent", label: "Agent" },
  { value: "admin", label: "Admin" },

];

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" , disabled: true},
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "blocked", label: "Blocked" },
];

const EMPTY_FORM = {
  name_or_company_name: "",
  email: "",
  phone1: "",
  phone2: "",
  password: "",
  role: "influencer",
  status: "pending",
  email_verified: false,
  phone_verified: false,
};

/* ----------------------------
   Small building blocks
-----------------------------*/

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="mb-4 flex items-start gap-2.5">
      <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
        <Icon size={15} />
      </span>
      <div>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        {description && <p className="text-xs text-slate-400">{description}</p>}
      </div>
    </div>
  );
}

function FormField({ label, error, required, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-red-500">{error}</span>}
    </label>
  );
}

function TextInput({ error, className = "", ...props }) {
  return (
    <input
      {...props}
      className={`h-11 w-full rounded-lg border bg-white px-3 text-base text-slate-700 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/30 sm:h-10 sm:text-sm ${
        error ? "border-red-300 focus:ring-red-500/30" : "border-slate-200 focus:border-[var(--color-secondary)]"
      } ${className}`}
    />
  );
}

function SelectInput({ options, error, className = "", ...props }) {
  return (
    <select
      {...props}
      className={`h-11 w-full rounded-lg border bg-white px-3 text-base text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/30 sm:h-10 sm:text-sm ${
        error ? "border-red-300" : "border-slate-200 focus:border-[var(--color-secondary)]"
      } ${className}`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function ToggleField({ label, description, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 px-3.5 py-3.5 text-left transition-colors hover:bg-slate-50 sm:py-3"
    >
      <span>
        <span className="block text-sm font-medium text-slate-700">{label}</span>
        {description && <span className="block text-xs text-slate-400">{description}</span>}
      </span>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-tertiary" : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

/* ----------------------------
   UserForm — shared by Create + Edit
-----------------------------*/

export function UserForm({ mode = "create", initialData, onSubmit, onCancel, loading = false }) {
  const isEdit = mode === "edit";
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initialData });
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(initialData?.photo_preview_url || null);

  const isBusiness = form.role === "business";

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const next = {};
    if (!form.name_or_company_name.trim()) {
      next.name_or_company_name = isBusiness ? "Company name is required" : "Name is required";
    }
    if (!form.email.trim()) {
      next.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      next.email = "Enter a valid email address";
    }
    if (!form.phone1.trim()) next.phone1 = "Primary phone is required";
    if (!isEdit && !form.password.trim()) next.password = "Password is required";
    if (!isEdit && form.password && form.password.length < 8) {
      next.password = "Password must be at least 8 characters";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    const payload = { ...form };
    if (isEdit && !payload.password) delete payload.password;
    onSubmit?.(payload);
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    set("profile_photo_file", file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full  min-w-full"
     
    >
      {/* Header */}
      <div className="mb-5 flex items-center gap-3 sm:mb-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
          >
            <ChevronLeft size={16} />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-base font-semibold text-slate-900 sm:text-lg">
            {isEdit ? "Edit user" : "Create new user"}
          </h1>
          <p className="truncate text-xs text-slate-500 sm:text-sm">
            {isEdit
              ? "Update account details and permissions."
              : "Add a new user to the platform."}
          </p>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-5">
        {/* Profile photo */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <SectionHeader icon={Camera} title="Profile photo" description="Optional. JPG or PNG, up to 5MB." />
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-400 ring-1 ring-slate-200">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile preview" className="h-full w-full object-cover" />
              ) : (
                <UserIcon size={24} />
              )}
            </div>
            <label className="cursor-pointer rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
              {photoPreview ? "Change photo" : "Upload photo"}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </label>
          </div>
        </div>

        {/* Basic info */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <SectionHeader icon={UserIcon} title="Basic information" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FormField
                label={isBusiness ? "Company name" : "Full name"}
                required
                error={errors.name_or_company_name}
              >
                <TextInput
                  value={form.name_or_company_name}
                  onChange={(e) => set("name_or_company_name", e.target.value)}
                  placeholder={isBusiness ? "Acme Inc." : "Jane Doe"}
                  error={errors.name_or_company_name}
                />
              </FormField>
            </div>

            <FormField label="Email" required error={errors.email}>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <TextInput
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="name@example.com"
                  className="pl-9"
                  error={errors.email}
                />
              </div>
            </FormField>

            <FormField label={isEdit ? "New password" : "Password"} required={!isEdit} error={errors.password}
              hint={isEdit ? "Leave blank to keep the current password." : "At least 8 characters."}>
              <div className="relative">
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder={isEdit ? "••••••••" : "Create a password"}
                  className="pl-9"
                  error={errors.password}
                  // leftIcon={<Lock size={15} className="text-slate-400" />}
                />
              </div>
            </FormField>

            <FormField label="Primary phone" required error={errors.phone1}>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  value={form.phone1}
                  onChange={(e) => set("phone1", e.target.value)}
                  placeholder="+251 9xx xxx xxx"
                  className="pl-9"
                  error={errors.phone1}
                />
              </div>
            </FormField>

            <FormField label="Secondary phone" hint="Optional">
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input

                name="phone2"
                  type="text"
                  id="phone2"
                  value={form.phone2}
                  onChange={(e) => set("phone2", e.target.value)}
                  placeholder="+251 9xx xxx xxx"
                  className="pl-9"
                />
              </div>
            </FormField>
          </div>
        </div>

        {/* Role & status */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <SectionHeader icon={Shield} title="Role & status" description="Controls access level and account state." />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Role" required>
              <Select
                  searchable={false}
                  data={ROLE_OPTIONS}
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
              />
            </FormField>
            <FormField label="Status" required>
              <Select
                data={STATUS_OPTIONS}
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                searchable={false}
              />
            </FormField>
          </div>
        </div>

        {/* Verification */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <SectionHeader icon={BadgeCheck} title="Verification" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ToggleField
              label="Email verified"
              description="Mark this email as confirmed"
              checked={form.email_verified}
              onChange={(v) => set("email_verified", v)}
            />
            <ToggleField
              label="Phone verified"
              description="Mark this phone as confirmed"
              checked={form.phone_verified}
              onChange={(v) => set("phone_verified", v)}
            />
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div
        className="sticky bottom-0 mt-6 flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50/95 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-end"
      
      >
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 sm:h-10 sm:w-auto"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary/80 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-primary sm:h-10 sm:w-auto"
        >
          {loading && <Loader2 size={15} className="animate-spin" />}
          {isEdit ? "Save changes" : "Create user"}
        </button>
      </div>
    </form>
  );
}

/* ----------------------------
   Demo (usage example)
-----------------------------*/

export default function UserFormDemo() {
  const [loading, setLoading] = useState(false);

  function handleSubmit(payload) {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      console.log("submitted:", payload);
      alert("Saved (see console for payload)");
    }, 900);
  }

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 sm:py-10">
      <UserForm mode="create" onSubmit={handleSubmit} onCancel={() => alert("cancelled")} loading={loading} />
    </div>
  );
}