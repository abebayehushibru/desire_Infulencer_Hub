import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { KeyRound, RefreshCw } from "lucide-react";
import loginImage from "../../assets/login.png";
import Button from "../../components/common/Button";
import toast from "react-hot-toast";
import useApi from "../../hooks/useApi";

export default function VerifyResetCode() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const forgotApi = useApi({
      request: (body) => ({
        method: "POST",
        path: "/auth/forgot-password",
        data: body,
      }),
    });
    const verifyApi = useApi({
        request: (body) => ({
          method: "POST",
          path: "/auth/forgot-password",
          data: body,
        }),
      });
  const emailFromState = location.state?.email || "";
  const [email, setEmail]   = useState(emailFromState);
  const [otp, setOtp]       = useState(["", "", "", "", "", ""]);
  const [error, setError]   = useState("");
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown]   = useState(0);

  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleOtpChange = (i, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next  = [...otp];
    next[i] = digit;
    setOtp(next);
    setError("");
    if (digit && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0)
      inputRefs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next   = [...otp];
    pasted.split("").forEach((d, i) => { if (i < 6) next[i] = d; });
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) { setError("Please enter the complete 6-digit code"); return; }
    // if (!email.trim())   { setError("Email is required"); return; }

    const result = await verifyApi.execute({
      email:email.trim().toLowerCase(), code
    });
    if (result.success) {
      toast.success("Code verified! Set your new password.");
      navigate("/auth/reset-password", { state: { email: email.trim().toLowerCase() } });
    } else {
      setError(result.message || "Invalid or expired code");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    // if (!email.trim()) { setError("Please enter your email"); return; }
    if (cooldown > 0)  return;
    // setResending(true);
    await forgotApi.execute({email:email.trim().toLowerCase()});
    setResending(false);
    toast.success("New reset code sent.");
    setCooldown(60);
  };

  return (
    <div className="h-full bg-gray-100 flex items-center justify-center p-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid lg:grid-cols-2">

        {/* LEFT */}
        <div className="relative bg-gradient-to-br from-primary via-secondary to-primary text-white p-16 flex flex-col justify-between">
          <div className="absolute h-full flex items-end justify-center">
            <img src={loginImage} alt="" className="w-full mt-4 scale-80" />
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Reset your password 🔐</h4>
            <h1 className="text-2xl font-bold leading-tight">
              Enter
              <br />
              Reset Code
            </h1>
            <p className="mt-4 text-sm opacity-90">
              Enter the 6-digit code we sent to your email. It expires in 10 minutes.
            </p>
          </div>
          <div />
        </div>

        {/* RIGHT */}
        <div className="p-6 flex items-center">
          <div className="w-full">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <KeyRound className="text-primary" size={28} />
            </div>

            <h2 className="text-3xl text-gray-800 font-bold mb-1">Enter code</h2>
            <p className="text-gray-500 mb-6">
              {emailFromState
                ? `We sent a code to ${emailFromState}`
                : "Enter your email and the reset code below."}
            </p>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

              {/* OTP boxes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Reset code
                </label>
                <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (inputRefs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl
                        focus:outline-none focus:border-primary transition-colors
                        ${digit ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-800"}
                        ${error ? "border-red-400" : ""}`}
                    />
                  ))}
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>

              <Button type="submit" fullWidth className="cursor-pointer" loading={verifyApi.loading} disabled={verifyApi.loading || otp.length<6}>
                Verify Code
              </Button>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <span>Didn't receive a code?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={forgotApi.loading || cooldown > 0}
                  className="flex items-center gap-1 font-semibold text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {forgotApi.loading ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                </button>
              </div>

              <p className="text-center text-sm text-gray-500">
                <Link to="/auth/forgot-password" className="font-semibold text-primary hover:underline">
                  ← Back
                </Link>
              </p>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}