import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Save,
  Check,
} from "lucide-react";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Textarea from "../../components/common/Textarea";

const STATUSES = [
  { value: "Active", color: "bg-emerald-500" },
  { value: "Pending", color: "bg-yellow-400" },
  { value: "Suspended", color: "bg-red-500" },
];

// Sample existing data — replace with real API fetch using useParams id
const SAMPLE = {
  name: "Desire Online School",
  category: "Education",
  tier: "Diamond",
  status: "Active",
  email: "contact@desire.com",
  phone: "0911223344",
  website: "https://desire.com",
  location: "Addis Ababa",
  address: "Bole Road, Building 4, Floor 2",
  description: "Leading online education platform in Ethiopia.",
};

export default function Editbusiness() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState(SAMPLE);
  const [saved, setSaved] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const handleChange = (e) => set(e.target.name, e.target.value);

  const submit = () => {
    console.log("Update Business payload:", { id, ...form });
    setSaved(true);
  };

  if (saved) {
    return (
      <div className="flex min-h-[480px] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Check className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800">Changes Saved</h2>
        <p className="max-w-sm text-sm text-slate-500">
          {form.name}'s details have been updated successfully.
        </p>
        <Button onClick={() => navigate("/businesses")} className="mt-4">
          Back to Businesses
        </Button>
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
          <h1 className="text-2xl font-bold text-primary">Edit Business</h1>
          <p className="text-gray-500 text-sm mt-0.5">Update {form.name}'s details</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-8">

        {/* Business Info */}
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-4">Business Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Business Name" name="name" value={form.name} onChange={handleChange} required leftIcon={<Building2 size={16} />} />
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
            <div className="md:col-span-2">
              <Textarea label="Description" name="description" value={form.description} onChange={handleChange} rows={3} />
            </div>
          </div>
        </section>

        {/* Contact & Location */}
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-4">Contact & Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} leftIcon={<Mail size={16} />} />
            <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} leftIcon={<Phone size={16} />} />
            <Input label="Website" name="website" value={form.website} onChange={handleChange} leftIcon={<Globe size={16} />} />
            <Input label="City / Location" name="location" value={form.location} onChange={handleChange} leftIcon={<MapPin size={16} />} />
            <div className="md:col-span-2">
              <Textarea label="Full Address" name="address" value={form.address} onChange={handleChange} rows={2} />
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          <Button leftIcon={<Save size={16} />} onClick={submit}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
