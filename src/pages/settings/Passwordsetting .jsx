import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Title from "../../components/common/Titel";

function getStrength(password) {
  if (!password) return { label: "", percent: 0, color: "bg-gray-200" };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: "Weak", percent: 25, color: "bg-red-500" };
  if (score <= 2) return { label: "Fair", percent: 50, color: "bg-amber-500" };
  if (score <= 3) return { label: "Good", percent: 75, color: "bg-sky-500" };
  return { label: "Strong", percent: 100, color: "bg-green-500" };
}

export default function PasswordSetting() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const strength = getStrength(newPassword);

  const validate = () => {
    const e = {};
    if (!currentPassword) e.currentPassword = "Enter your current password.";
    if (!newPassword) e.newPassword = "Enter a new password.";
    else if (newPassword.length < 8) e.newPassword = "Use at least 8 characters.";
    if (currentPassword && newPassword && currentPassword === newPassword) {
      e.newPassword = "New password must be different from your current password.";
    }
    if (!confirmPassword) e.confirmPassword = "Confirm your new password.";
    else if (confirmPassword !== newPassword) e.confirmPassword = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSaved(false);
    if (!validate()) return;

    setSubmitting(true);
    try {
      console.log("Change password payload:", { currentPassword, newPassword });
      // await api.post("/account/change-password", { currentPassword, newPassword });
      await new Promise((r) => setTimeout(r, 700));

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
      setSaved(true);
    } catch (err) {
      setSubmitError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-full bg-gray-50/10 pb-4">
        
      

      <div className="mb-4">
        <Title titel={"Password"} disc={"Update the password used to sign in to your account."}>

            <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-700"
      >
        <ArrowLeft size={16} /> Back
      </button>

        </Title>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-lg rounded-lg mx-auto border border-gray-200 bg-white p-4 mb-4 shadow-sm"
      >
        <div className="mb-5 flex items-start gap-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-500">
          <ShieldCheck size={15} className="mt-0.5 shrink-0 text-primary" />
          Use at least 8 characters, mixing letters, numbers, and symbols for a stronger password.
        </div>

        <div className="space-y-3">
          <Input
            label="Current Password"
            name="current_password"
            type="password"
            required
            leftIcon={<Lock size={18} />}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            error={errors.currentPassword}
          />

          <div>
            <Input
              label="New Password"
              name="new_password"
              type="password"
              required
              leftIcon={<Lock size={18} />}
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={errors.newPassword}
            />
            {newPassword && (
              <div className="mt-2">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${strength.percent}%` }}
                  />
                </div>
                <p className="mt-1 text-xs font-medium text-gray-400">
                  Password strength: <span className="text-gray-600">{strength.label}</span>
                </p>
              </div>
            )}
          </div>

          <Input
            label="Confirm New Password"
            name="confirm_password"
            type="password"
            required
            leftIcon={<Lock size={18} />}
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
          />
        </div>

        {submitError && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
            {submitError}
          </p>
        )}

        <div className="mt-4 flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
              <CheckCircle2 size={16} /> Password updated
            </span>
          )}
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" /> Updating...
              </span>
            ) : (
              "Update Password"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}