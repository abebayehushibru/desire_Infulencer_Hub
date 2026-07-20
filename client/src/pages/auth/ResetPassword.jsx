import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Eye, EyeClosed, Lock, CheckCircle } from "lucide-react";
import loginImage from "../../assets/login.png";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-#])/;

// Visual password strength indicator
function StrengthBar({ password }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[@$!%*?&_\-#]/.test(password),
  ];
  const score   = checks.filter(Boolean).length;
  const labels  = ["", "Weak", "Fair", "Good", "Strong", "Very strong"];
  const colors  = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"];

  if (!password) return null;

  return (
    <div className="mt-1">
      <div className="flex gap-1 mb-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all ${i < score ? colors[score] : "bg-gray-200"}`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${score >= 4 ? "text-green-600" : score >= 3 ? "text-blue-500" : "text-orange-500"}`}>
        {labels[score]}
      </p>
    </div>
  );
}

export default function ResetPassword() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { resetPassword, loading } = useAuthStore();

  const email = location.state?.email || "";
  const otp   = location.state?.otp   || "";

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
    showNew:     false,
    showConfirm: false,
  });
  const [errors,  setErrors]  = useState({});
  const [success, setSuccess] = useState(false);

  // Redirect if landed here without state (direct URL access)
  if (!email || !otp) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Invalid or expired reset session.</p>
          <Link to="/forgot-password" className="text-primary font-semibold hover:underline">
            Start password reset
          </Link>
        </div>
      </div>
    );
  }

  const validate = () => {
    const e = {};
    if (!form.newPassword) {
      e.newPassword = "Password is required";
    } else if (form.newPassword.length < 8) {
      e.newPassword = "Password must be at least 8 characters";
    } else if (!PASSWORD_REGEX.test(form.newPassword)) {
      e.newPassword = "Must contain uppercase, lowercase, number and special character";
    }
    if (!form.confirmPassword) {
      e.confirmPassword = "Please confirm your password";
    } else if (form.newPassword !== form.confirmPassword) {
      e.confirmPassword = "Passwords do not match";
    }
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const result = await resetPassword(email, otp, form.newPassword);
    if (result.success) {
      setSuccess(true);
      toast.success("Password reset successfully!");
    } else {
      toast.error(result.message || "Reset failed. Please try again.");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={40} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Password reset!</h2>
          <p className="text-gray-500 mb-8">
            Your password has been changed successfully. You can now log in with your new password.
          </p>
          <Button fullWidth onClick={() => navigate("/login")}>
            Go to login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid lg:grid-cols-2">

        {/* LEFT */}
        <div className="relative bg-gradient-to-br from-primary via-secondary to-primary text-white p-16 flex flex-col justify-between">
          <div className="absolute h-full flex items-end justify-center">
            <img src={loginImage} alt="" className="w-full mt-4 scale-80" />
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-4">Almost done! 🔒</h4>
            <h1 className="text-5xl font-bold leading-tight">
              Create
              <br />
              New Password
            </h1>
            <p className="mt-4 text-lg opacity-90">
              Choose a strong password. It must contain uppercase, lowercase, a number and a special character.
            </p>
          </div>
          <div />
        </div>

        {/* RIGHT */}
        <div className="p-12 flex items-center">
          <div className="w-full">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <Lock className="text-primary" size={28} />
            </div>

            <h2 className="text-4xl text-gray-800 font-bold mb-1">New password</h2>
            <p className="text-gray-500 mb-6">
              Resetting password for <strong>{email}</strong>
            </p>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

              <div>
                <Input
                  label="New password"
                  name="newPassword"
                  type={form.showNew ? "text" : "password"}
                  placeholder="Min 8 chars, upper, lower, number, symbol"
                  value={form.newPassword}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, newPassword: e.target.value }));
                    if (errors.newPassword) setErrors((p) => ({ ...p, newPassword: "" }));
                  }}
                  leftIcon={<Lock size={20} />}
                  rightIcon={
                    <span
                      onClick={() => setForm((p) => ({ ...p, showNew: !p.showNew }))}
                      className="cursor-pointer"
                    >
                      {form.showNew ? <EyeClosed size={20} /> : <Eye size={20} />}
                    </span>
                  }
                  error={errors.newPassword}
                  required
                />
                <StrengthBar password={form.newPassword} />
              </div>

              <Input
                label="Confirm new password"
                name="confirmPassword"
                type={form.showConfirm ? "text" : "password"}
                placeholder="Re-enter your new password"
                value={form.confirmPassword}
                onChange={(e) => {
                  setForm((p) => ({ ...p, confirmPassword: e.target.value }));
                  if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: "" }));
                }}
                leftIcon={<Lock size={20} />}
                rightIcon={
                  <span
                    onClick={() => setForm((p) => ({ ...p, showConfirm: !p.showConfirm }))}
                    className="cursor-pointer"
                  >
                    {form.showConfirm ? <EyeClosed size={20} /> : <Eye size={20} />}
                  </span>
                }
                error={errors.confirmPassword}
                required
              />

              <Button type="submit" fullWidth loading={loading} disabled={loading}>
                Reset Password
              </Button>

              <p className="text-center text-sm text-gray-500">
                <Link to="/login" className="font-semibold text-primary hover:underline">
                  ← Back to login
                </Link>
              </p>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
