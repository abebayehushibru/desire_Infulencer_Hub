import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Lock,
  Bell,
  Loader2,
  Save,
  CheckCircle2,
  Pencil,
  Sparkles,
  Calendar,
} from "lucide-react";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Toggle from "../../components/common/Toggle";
import Title from "../../components/common/Titel";

const BUSINESS = {
  name: "Desire Online School",
  email: "info@desire.et",
  phone: "0911223344",
  subscription_type: "Premium",
  subscription_status: "Active",
  subscription_end_date: "2026-12-31",
};

const SUBSCRIPTION_STYLE = {
  Free: "bg-gray-100 text-gray-600",
  Basic: "bg-sky-100 text-sky-700",
  Premium: "bg-primary/10 text-primary",
  Enterprise: "bg-yellow-100 text-yellow-700",
};



const BusinessSettings=()=> {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState({});

  const [notifyConversions, setNotifyConversions] = useState(true);
  const [notifyPayments, setNotifyPayments] = useState(true);
  const [notifyCampaigns, setNotifyCampaigns] = useState(true);

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
        ...(newPassword ? { password_change: { currentPassword, newPassword } } : {}),
        notifications: {
          conversions: notifyConversions,
          payments: notifyPayments,
          campaigns: notifyCampaigns,
        },
      };
      console.log("Save business settings payload:", payload);
      // await api.patch("/businesses/me/settings", payload);
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
 <Title titel={"Settings"} disc={"Manage your account, notifications, and subscription."}/>

        </div>
       
      {/* Account snapshot */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 size={20} />
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-800">{BUSINESS.name}</p>
              <p className="text-xs text-gray-400">{BUSINESS.email} · {BUSINESS.phone}</p>
            </div>
          </div>
          
        </div>
      </div>

      {/* Subscription */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
          <Sparkles size={14} /> Subscription
        </h3>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${SUBSCRIPTION_STYLE[BUSINESS.subscription_type]}`}>
                {BUSINESS.subscription_type}
              </span>
              <span className="text-xs font-medium text-green-600">{BUSINESS.subscription_status}</span>
            </div>
            <p className="mt-2 flex items-center gap-1 text-xs text-gray-400">
              <Calendar size={12} /> Renews {new Date(BUSINESS.subscription_end_date).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Manage Billing</Button>
            <Button size="sm">Upgrade Plan</Button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
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
            <Toggle
              checked={notifyConversions}
              onChange={setNotifyConversions}
              label="New conversions"
              description="When a customer conversion is recorded on your campaigns."
            />
            <Toggle
              checked={notifyPayments}
              onChange={setNotifyPayments}
              label="Payment updates"
              description="When a payout is approved, paid, or rejected."
            />
            <Toggle
              checked={notifyCampaigns}
              onChange={setNotifyCampaigns}
              label="Campaign updates"
              description="Approvals, influencer join requests, and status changes."
            />
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

export default BusinessSettings  