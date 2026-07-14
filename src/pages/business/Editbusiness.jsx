import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Building2, Mail, Phone, Lock, Save, Clock, Calendar } from "lucide-react";

import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";

// Stand-in for a record loaded from the API — swap for a real fetch by :id.
const SAMPLE_BUSINESS = {
  id: "b1f0c2b2-2f3a-4a5b-9e2a-6d1f2c3a4b5c",
  name_or_company_name: "Desire Online School",
  email: "info@desire.et",
  phone_1: "0911223344",
  phone_2: "",
  status: "active",
  login_attempts: 0,
  created_at: "2025-11-02T09:14:00Z",
  updated_at: "2026-07-10T14:02:00Z",
};

export default function EditBusiness() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({ ...SAMPLE_BUSINESS });
  const [changePassword, setChangePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name_or_company_name.trim()) e.name_or_company_name = "Company name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.phone_1.trim()) e.phone_1 = "Primary phone number is required.";
    if (changePassword) {
      if (!password) e.password = "Enter a new password.";
      else if (password.length < 8) e.password = "Use at least 8 characters.";
      if (confirmPassword !== password || !confirmPassword) e.confirm_password = "Passwords do not match.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        name_or_company_name: form.name_or_company_name,
        email: form.email,
        phone_1: form.phone_1,
        phone_2: form.phone_2 || null,
        status: form.status,
        ...(changePassword ? { password } : {}),
      };
      console.log("Update business payload:", payload);
      // await api.patch(`/users/${id}`, payload);
      navigate(`/businesses/${id ?? form.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-full bg-gray-50">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-700"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Edit Business</h1>
        <p className="mt-1 text-gray-500">Update {form.name_or_company_name || "this business"}'s account.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Account Details
        </h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="Company Name"
              name="name_or_company_name"
              required
              leftIcon={<Building2 size={18} />}
              value={form.name_or_company_name}
              onChange={set("name_or_company_name")}
              error={errors.name_or_company_name}
            />
          </div>

          <Input
            label="Email"
            name="email"
            type="email"
            required
            leftIcon={<Mail size={18} />}
            value={form.email}
            onChange={set("email")}
            error={errors.email}
          />

          <Select
            label="Status"
            name="status"
            value={form.status}
            onChange={set("status")}
            data={[
              { label: "Active", value: "active" },
              { label: "Pending", value: "pending" },
              { label: "Inactive", value: "inactive" },
              { label: "Suspended", value: "suspended" },
            ]}
          />

          <Input
            label="Phone Number"
            name="phone_1"
            required
            leftIcon={<Phone size={18} />}
            value={form.phone_1}
            onChange={set("phone_1")}
            error={errors.phone_1}
          />

          <Input
            label="Alternative Phone Number"
            name="phone_2"
            leftIcon={<Phone size={18} />}
            value={form.phone_2}
            onChange={set("phone_2")}
          />
        </div>

        {/* Password */}
        <div className="mt-6 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Password</h3>
          <button
            type="button"
            onClick={() => {
              setChangePassword((v) => !v);
              setPassword("");
              setConfirmPassword("");
              setErrors((er) => ({ ...er, password: undefined, confirm_password: undefined }));
            }}
            className="text-xs font-semibold text-primary hover:underline"
          >
            {changePassword ? "Cancel" : "Change password"}
          </button>
        </div>

        {changePassword ? (
          <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              label="New Password"
              name="password"
              type="password"
              required
              leftIcon={<Lock size={18} />}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />
            <Input
              label="Confirm New Password"
              name="confirm_password"
              type="password"
              required
              leftIcon={<Lock size={18} />}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirm_password}
            />
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-400">•••••••••••• (unchanged)</p>
        )}

        {/* Read-only audit info */}
        <div className="mt-6 grid grid-cols-1 gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs text-gray-400">Login Attempts</p>
            <p className="font-medium text-gray-700">{form.login_attempts}</p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar size={12} /> Created
            </p>
            <p className="font-medium text-gray-700">
              {new Date(form.created_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-xs text-gray-400">
              <Clock size={12} /> Last Updated
            </p>
            <p className="font-medium text-gray-700">
              {new Date(form.updated_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-6">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" leftIcon={<Save size={18} />} disabled={submitting}>
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}