import { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Bell,
  Loader2,
  Save,
  CheckCircle2,
  Percent,
  Wallet,
} from "lucide-react";

import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import Toggle from "../../components/common/Toggle";
import Title from "../../components/common/Titel";
import { Link } from "react-router-dom";

const AdminSettings=()=> {
  const [commissionType, setCommissionType] = useState("rate");
  const [commissionValue, setCommissionValue] = useState("10");

  const [requireLicense, setRequireLicense] = useState(true);
  const [requireInfluencerId, setRequireInfluencerId] = useState(false);
  const [autoApproveCommunities, setAutoApproveCommunities] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState({});

  const [notifySignups, setNotifySignups] = useState(true);
  const [notifyPayments, setNotifyPayments] = useState(true);
  const [notifyFlags, setNotifyFlags] = useState(true);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const validatePassword = () => {
    const e = {};
    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword) e.currentPassword = "Enter your current password.";
      if (!newPassword) e.newPassword = "Enter a new password.";
      else if (newPassword.length < 8) e.newPassword = "Use at least 8 characters.";
      if (confirmPassword !== newPassword || !confirmPassword) e.confirmPassword = "Passwords do not match.";
    }
    setPasswordErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setSaving(true);
    setSaved(false);
    try {
      const payload = {
        platform_defaults: {
          commission_type: commissionType,
          commission_rate: commissionType === "rate" ? Number(commissionValue) : null,
          commission_amount: commissionType === "fixed" ? Number(commissionValue) : null,
        },
        verification: {
          require_license: requireLicense,
          require_influencer_id: requireInfluencerId,
          auto_approve_communities: autoApproveCommunities,
        },
        ...(newPassword ? { password_change: { currentPassword, newPassword } } : {}),
        notifications: {
          signups: notifySignups,
          payments: notifyPayments,
          flags: notifyFlags,
        },
      };
      console.log("Save admin settings payload:", payload);
      // await api.patch("/admin/settings", payload);
      await new Promise((r) => setTimeout(r, 700));

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
        <div className="mb-4">
 <Title titel={"Settings"} disc={"Manage platform-wide defaults and your admin account."}/>

        </div>
      

      <form onSubmit={handleSave} className="space-y-4">
        {/* Platform Defaults */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
            <Wallet size={14} /> Platform Commission Default
          </h3>
          <div className="flex gap-2">
            {[
              { label: "Rate (%)", value: "rate" },
              { label: "Fixed Amount", value: "fixed" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setCommissionType(opt.value)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  commissionType === opt.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="mt-4 max-w-xs">
            <Input
              label={commissionType === "rate" ? "Default Commission Rate" : "Default Commission Amount"}
              name="commission_value"
              type="number"
              min="0"
              leftIcon={commissionType === "rate" ? <Percent size={18} /> : <Wallet size={18} />}
              value={commissionValue}
              onChange={(e) => setCommissionValue(e.target.value)}
            />
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Applied to new campaigns unless the campaign owner sets a custom commission.
          </p>
        </div>

        {/* Verification Requirements */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
            <ShieldCheck size={14} /> Verification Requirements
          </h3>
          <div className="space-y-3">
            <Toggle
              checked={requireLicense}
              onChange={setRequireLicense}
              label="Require business license"
              description="Businesses must upload a license before verification is approved."
            />
            <Toggle
              checked={requireInfluencerId}
              onChange={setRequireInfluencerId}
              label="Require influencer ID"
              description="Influencers must upload a national ID / passport to be approved."
            />
            <Toggle
              checked={autoApproveCommunities}
              onChange={setAutoApproveCommunities}
              label="Auto-approve new communities"
              description="Skip manual review for newly created communities."
            />
          </div>
        </div>

        {/* Security */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
            <Lock size={14} /> Security
          </h3>
            <Link to={"/settings/password"} className="text-primary" > Change password</Link>
        </div>

        {/* Notification Preferences */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
            <Bell size={14} /> Notification Preferences
          </h3>
          <div className="space-y-3">
            <Toggle checked={notifySignups} onChange={setNotifySignups} label="New signups" description="Businesses, influencers, and communities awaiting review." />
            <Toggle checked={notifyPayments} onChange={setNotifyPayments} label="Payment requests" description="New payout requests that need approval." />
            <Toggle checked={notifyFlags} onChange={setNotifyFlags} label="Flagged content & reports" description="Reported posts, communities, or campaigns." />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
              <CheckCircle2 size={16} /> Saved
            </span>
          )}
          <Button type="submit" disabled={saving}>
            {saving ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" /> Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save size={16} /> Save Changes
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default  AdminSettings