import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  ChevronRight,
  Check,
} from "lucide-react";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Textarea from "../../components/common/Textarea";
import FileUpload from "../../components/common/FileUpload";

const STEPS = ["Business Info", "Contact & Location", "Documents", "Review"];

const STATUSES = [
  { value: "Active", color: "bg-emerald-500" },
  { value: "Pending", color: "bg-yellow-400" },
  { value: "Suspended", color: "bg-red-500" },
];

const initialForm = {
  name: "",
  category: "",
  tier: "",
  status: "Active",
  email: "",
  phone: "",
  website: "",
  location: "",
  address: "",
  description: "",
  logo: null,
  license: null,
};

function ReviewRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-dashed border-slate-100 pb-2 text-sm last:border-none last:pb-0">
      <span className="shrink-0 text-slate-400">{label}</span>
      <span className="max-w-[65%] text-right font-medium text-slate-700">{value || "—"}</span>
    </div>
  );
}

function ReviewSection({ title, children }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export default function Createbusiness() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const handleChange = (e) => set(e.target.name, e.target.value);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = () => {
    console.log("Create Business payload:", form);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex min-h-[480px] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Check className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800">Business Created</h2>
        <p className="max-w-sm text-sm text-slate-500">
          {form.name || "The new business"} has been added successfully.
        </p>
        <div className="flex gap-3 mt-4">
          <Button variant="secondary" onClick={() => { setForm(initialForm); setStep(0); setSubmitted(false); }}>
            Add Another
          </Button>
          <Button onClick={() => navigate("/businesses")}>
            View Businesses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-primary"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-primary">Create Business</h1>
          <p className="text-gray-500 text-sm mt-0.5">Add a new business profile</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        {/* Stepper */}
        <div className="flex items-center mb-10">
          {STEPS.map((s, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <div key={s} className="flex-1 flex items-center">
                <div className="flex flex-col items-center relative">
                  <div
                    className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition
                      ${done ? "border-primary bg-primary text-white"
                        : active ? "border-secondary bg-white text-secondary"
                        : "border-gray-300 bg-white text-gray-400"}`}
                  >
                    {done ? <Check size={16} /> : i + 1}
                  </div>
                  <span className={`mt-2 text-xs font-medium absolute top-full whitespace-nowrap ${active ? "text-secondary" : done ? "text-slate-600" : "text-slate-400"}`}>
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 ${done ? "bg-primary" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step 1 — Business Info */}
        {step === 0 && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Business Name" name="name" value={form.name} onChange={handleChange} required placeholder="Desire Online School" leftIcon={<Building2 size={16} />} />
              <Select
                label="Category"
                name="category"
                value={form.category}
                onChange={handleChange}
                data={[
                  { label: "Education", value: "Education" },
                  { label: "Technology", value: "Technology" },
                  { label: "Fashion", value: "Fashion" },
                  { label: "Retail", value: "Retail" },
                  { label: "Food & Beverage", value: "Food" },
                  { label: "Health & Beauty", value: "Health" },
                  { label: "Finance", value: "Finance" },
                  { label: "Entertainment", value: "Entertainment" },
                  { label: "Other", value: "Other" },
                ]}
              />
              <Select
                label="Tier"
                name="tier"
                value={form.tier}
                onChange={handleChange}
                data={[
                  { label: "Diamond", value: "Diamond" },
                  { label: "Gold", value: "Gold" },
                  { label: "Silver", value: "Silver" },
                ]}
              />
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Status</label>
                <div className="flex gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => set("status", s.value)}
                      className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                        form.status === s.value
                          ? "border-secondary bg-secondary/10 text-secondary"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${s.color}`} />
                      {s.value}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <Textarea label="Description" name="description" value={form.description} onChange={handleChange} placeholder="Brief description of the business..." rows={3} />
          </div>
        )}

        {/* Step 2 — Contact & Location */}
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="contact@business.com" leftIcon={<Mail size={16} />} />
            <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="0911223344" leftIcon={<Phone size={16} />} />
            <Input label="Website" name="website" value={form.website} onChange={handleChange} placeholder="https://business.com" leftIcon={<Globe size={16} />} />
            <Input label="City / Location" name="location" value={form.location} onChange={handleChange} placeholder="Addis Ababa" leftIcon={<MapPin size={16} />} />
            <div className="md:col-span-2">
              <Textarea label="Full Address" name="address" value={form.address} onChange={handleChange} placeholder="Street address, building, floor..." rows={2} />
            </div>
          </div>
        )}

        {/* Step 3 — Documents */}
        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileUpload label="Business Logo" name="logo" value={form.logo} onChange={handleChange} accept="image/*" />
            <FileUpload label="Business License" name="license" value={form.license} onChange={handleChange} accept=".pdf,image/*" />
          </div>
        )}

        {/* Step 4 — Review */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 mb-4">Review all details before submitting.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ReviewSection title="Business Info">
                <ReviewRow label="Name" value={form.name} />
                <ReviewRow label="Category" value={form.category} />
                <ReviewRow label="Tier" value={form.tier} />
                <ReviewRow label="Status" value={form.status} />
                <ReviewRow label="Description" value={form.description} />
              </ReviewSection>
              <ReviewSection title="Contact & Location">
                <ReviewRow label="Email" value={form.email} />
                <ReviewRow label="Phone" value={form.phone} />
                <ReviewRow label="Website" value={form.website} />
                <ReviewRow label="Location" value={form.location} />
                <ReviewRow label="Address" value={form.address} />
              </ReviewSection>
              <ReviewSection title="Documents">
                <ReviewRow label="Logo" value={form.logo?.name || "Not uploaded"} />
                <ReviewRow label="License" value={form.license?.name || "Not uploaded"} />
              </ReviewSection>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-10 flex items-center justify-between border-t border-gray-100 pt-6">
          <Button variant="secondary" onClick={back} disabled={step === 0}>
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button rightIcon={<ChevronRight size={16} />} onClick={next}>
              Next
            </Button>
          ) : (
            <Button leftIcon={<Check size={16} />} onClick={submit}>
              Create Business
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
