import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail } from "lucide-react";
import loginImage from "../../assets/login.png";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import toast from "react-hot-toast";
import useApi from "../../hooks/useApi";

export default function ForgotPassword() {
  const navigate = useNavigate();
const forgotApi = useApi({
    request: (body) => ({
      method: "POST",
      path: "/auth/forgot-password",
      data: body,
    }),
  });
  const [email, setEmail]   = useState("");
  const [error, setError]   = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) { setError("Email is required"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Invalid email format"); return; }

    const result = await forgotApi.execute({email:email.trim().toLowerCase()});

    // Always navigate — backend never reveals if email exists
    if (result.success !== false) {
      setSubmitted(true);
      toast.success("If an account exists, a reset code has been sent.");
    } else {
      toast.error(result.message || "Something went wrong. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-full bg-gray-100 flex items-center justify-center p-8">
        <div className="w-full max-w-5xl bg-white rounded-lg shadow-xl overflow-hidden grid lg:grid-cols-2">
          <div className="relative bg-gradient-to-br from-primary via-secondary to-primary text-white p-8 flex flex-col justify-between">
            <div className="absolute h-full flex items-end justify-center">
              <img src={loginImage} alt="" className="w-full mt-4 scale-60" />
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Check your inbox 📬</h4>
              <h1 className="text-4xl font-bold leading-tight">Code Sent!</h1>
              <p className="mt-4 text-sm opacity-90">
                If an account exists for that email, a reset code has been sent. Check your spam folder too.
              </p>
            </div>
            <div />
          </div>

          <div className="p-12 flex items-center">
            <div className="w-full text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="text-green-600" size={36} />
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2">Email sent</h2>
              <p className="text-gray-500 mb-8">
                We sent a 6-digit reset code to <strong>{email.split("").map((chr,index)=>{
                  
                    if (index<=1|| index >=email.length-1) {
                      return chr
                    }
                    else if (index<8) {
                       return "*"
                    }
                  
                }
                  
                )}</strong>.
                <br />It expires in 10 minutes.
              </p>
              <Button
                fullWidth
                onClick={() =>
                  navigate("/auth/verify-reset-code?", { state: { email } })
                }
              >
                Enter reset code
              </Button>
              <p className="mt-4 text-sm text-gray-500">
                <button
                  className="font-semibold text-primary hover:underline"
                  onClick={() => setSubmitted(false)}
                >
                  Use a different email
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid lg:grid-cols-2">

        {/* ── LEFT ─────────────────────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-br from-primary via-secondary to-primary text-white p-16 flex flex-col justify-between">
          <div className="absolute h-full flex items-end justify-center">
            <img src={loginImage} alt="" className="w-full mt-4 scale-80" />
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Forgot your password? 🔑</h4>
            <h1 className="text-2xl font-bold leading-tight">
              Reset
              <br />
              Password
            </h1>
            <p className="mt-4 text-xs opacity-90">
              Enter your email and we'll send you a 6-digit code to reset your password.
            </p>
          </div>
          <div />
        </div>

        {/* ── RIGHT ────────────────────────────────────────────────────────── */}
        <div className="p-12 flex items-center">
          <div className="w-full">
            <h2 className="text-2xl text-gray-800 font-bold mb-1">Forgot password</h2>
            <p className="text-gray-500 text-sm mb-4">
              Enter the email address linked to your account.
            </p>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
              <Input
                label="Email address"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                leftIcon={<Mail size={20} />}
                error={error}
                required
              />

              <Button  type="submit" fullWidth loading={forgotApi.loading} disabled={forgotApi.loading}>
                Send reset code
              </Button>

              <p className="text-center text-sm text-gray-500">
                Remembered it?{" "}
                <Link to="/auth/login" className="font-semibold text-primary hover:underline">
                  Back to login
                </Link>
              </p>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}