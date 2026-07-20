import { useState } from "react";
import { Eye, EyeClosed, Lock, Mail, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import loginImage from "../assets/login.png";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

// Password must match backend: min 8, uppercase, lowercase, digit, special char
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-#])/;

export default function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuthStore();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    showPassword: false,
    showConfirm: false,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};

    if (!form.firstName.trim()) e.firstName = "First name is required";
    else if (form.firstName.trim().length < 2) e.firstName = "First name must be at least 2 characters";
    else if (!/^[a-zA-Z\s'-]+$/.test(form.firstName)) e.firstName = "Letters, spaces, hyphens and apostrophes only";

    if (!form.lastName.trim()) e.lastName = "Last name is required";
    else if (form.lastName.trim().length < 2) e.lastName = "Last name must be at least 2 characters";
    else if (!/^[a-zA-Z\s'-]+$/.test(form.lastName)) e.lastName = "Letters, spaces, hyphens and apostrophes only";

    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email format";

    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    else if (!PASSWORD_REGEX.test(form.password))
      e.password = "Must contain uppercase, lowercase, number and special character (@$!%*?&_-#)";

    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";

    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const result = await register({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
    });

    if (result.success) {
      toast.success("Account created! Please check your email for a verification code.");
      navigate("/verify-email", { state: { email: form.email.trim().toLowerCase() } });
    } else {
      toast.error(result.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="w-full max-w-7xl bg-white rounded-3xl shadow-xl overflow-hidden grid lg:grid-cols-2">

        {/* ── LEFT — branding panel (same style as Login) ─────────────────── */}
        <div className="relative bg-gradient-to-br from-primary via-secondary to-primary text-white p-16 flex flex-col justify-between">
          <div className="absolute h-full flex items-end justify-center">
            <img src={loginImage} alt="" className="w-full mt-4 scale-80" />
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-4">Join InfluenceHub 🚀</h4>
            <h1 className="text-5xl font-bold leading-tight">
              Start Your
              <br />
              <span className="text-tertiary">Influence</span>
              <br />
              Journey
            </h1>
            <p className="mt-4 text-lg opacity-90">
              Create an account to manage campaigns, connect with influencers and grow your brand.
            </p>
          </div>
          <div />
        </div>

        {/* ── RIGHT — registration form ────────────────────────────────────── */}
        <div className="p-12 flex items-center overflow-y-auto">
          <div className="w-full">
            <h2 className="text-4xl text-gray-800 font-bold mb-1">Create account</h2>
            <p className="text-gray-500 mb-6">Fill in your details to get started.</p>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>

              {/* Name row */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First name"
                  name="firstName"
                  type="text"
                  placeholder="John"
                  value={form.firstName}
                  onChange={handleChange}
                  leftIcon={<User size={20} />}
                  error={errors.firstName}
                  required
                />
                <Input
                  label="Last name"
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={handleChange}
                  leftIcon={<User size={20} />}
                  error={errors.lastName}
                  required
                />
              </div>

              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                leftIcon={<Mail size={20} />}
                error={errors.email}
                required
              />

              <Input
                label="Password"
                name="password"
                type={form.showPassword ? "text" : "password"}
                placeholder="Min 8 chars, upper, lower, number, symbol"
                value={form.password}
                onChange={handleChange}
                leftIcon={<Lock size={20} />}
                rightIcon={
                  <span
                    onClick={() => setForm((p) => ({ ...p, showPassword: !p.showPassword }))}
                    className="cursor-pointer"
                  >
                    {form.showPassword ? <EyeClosed size={20} /> : <Eye size={20} />}
                  </span>
                }
                error={errors.password}
                required
              />

              <Input
                label="Confirm password"
                name="confirmPassword"
                type={form.showConfirm ? "text" : "password"}
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={handleChange}
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
                Create Account
              </Button>

              <p className="text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-primary hover:underline">
                  Log in
                </Link>
              </p>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
