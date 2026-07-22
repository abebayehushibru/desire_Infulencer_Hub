import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Wallet,
  CreditCard,
  Calendar,
  Clock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Save,
} from "lucide-react";

import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import Title from "../../components/common/Titel";

// Stand-in for a record loaded from the API — swap for a real fetch by :id.
const SAMPLE_PAYMENT = {
  id: "PAY-2041",
  payee: "Abebe Kebede",
  payee_type: "Influencer",
  amount: "12,400 ETB",
  method: "Telebirr",
  account:"0964799523",
  status: "pending",
  reason: "",
  requested_at: "2026-07-12T09:00:00Z",
  created_at: "2026-07-12T09:00:00Z",
  updated_at: "2026-07-12T09:00:00Z",
};

const STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Paid", value: "paid" },
  { label: "Rejected", value: "rejected" },
];

const STATUS_STYLE = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-sky-100 text-sky-700",
  paid: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};

const fetchPayment = (id) =>
  new Promise((resolve) => setTimeout(() => resolve({ ...SAMPLE_PAYMENT, id }), 600));

export default function EditPayment() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchPayment(id).then((data) => {
      if (mounted) {
        setForm(data);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading || !form) {
    return (
      <div className="flex min-h-[420px] items-center justify-center text-gray-400">
        <Loader2 size={22} className="animate-spin" />
        <span className="ml-2 text-sm font-medium">Loading payment...</span>
      </div>
    );
  }

  const isRejected = form.status === "rejected";

  const setStatus = (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, status: value, reason: value === "rejected" ? f.reason : "" }));
    setErrors((er) => ({ ...er, reason: undefined }));
  };

  const validate = () => {
    const e = {};
    if (isRejected && !form.reason.trim()) {
      e.reason = "A rejection reason is required.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        status: form.status,
        reason: isRejected ? form.reason : null,
      };
      console.log("Update payment payload:", payload);
      // await api.patch(`/payments/${id}`, payload);
      await new Promise((r) => setTimeout(r, 700));

      setSubmitted(true);
    } catch (err) {
      setSubmitError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto flex min-h-[420px] max-w-2xl flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 size={28} className="text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">Payment updated</h2>
        <p className="max-w-sm text-sm text-gray-500">
          {form.payee}'s payment is now marked as <span className="font-medium capitalize">{form.status}</span>.
        </p>
        <Button onClick={() => navigate(-1)}>Back to Payments</Button>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50/10">
     

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Title titel={"Edit Payment"} disc={`Review payment #${form.id}. `}>
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
        className="max-w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        {/* Read-only payment info */}
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Payment Details <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLE[form.status]}`}>
          {form.status}
        </span>
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
              <User size={16} />
            </span>
            <div>
              <p className="text-xs text-gray-400">Payee</p>
              <p className="text-sm font-medium text-gray-700">
                {form.payee} <span className="text-xs font-normal text-gray-400">· {form.payee_type}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
              <Wallet size={16} />
            </span>
            <div>
              <p className="text-xs text-gray-400">Amount</p>
              <p className="text-sm font-medium text-gray-700">{form.amount}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
              <CreditCard size={16} />
            </span>
            <div>
              <p className="text-xs text-gray-400">Method</p>
              <p className="text-sm font-medium text-gray-700">{form.method}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
              <CreditCard size={16} />
            </span>
            <div>
              <p className="text-xs text-gray-400">Account Number</p>
              <p className="text-sm font-medium text-gray-700">{form.account}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
              <Calendar size={16} />
            </span>
            <div>
              <p className="text-xs text-gray-400">Requested</p>
              <p className="text-sm font-medium text-gray-700">
                {new Date(form.requested_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Status */}
        <h3 className="mb-4 mt-6 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Status
        </h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Select label="Status" name="status" value={form.status} onChange={setStatus} data={STATUS_OPTIONS} />
        </div>

        {isRejected && (
          <div className="mt-5">
            <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-gray-700">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Explain why this payment is being rejected..."
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              className={`w-full resize-none rounded-xl border px-3.5 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:ring-2 ${
                errors.reason
                  ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                  : "border-gray-200 focus:border-primary focus:ring-primary/20"
              }`}
            />
            {errors.reason && (
              <span className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
                <AlertCircle size={13} /> {errors.reason}
              </span>
            )}
          </div>
        )}

        {/* Read-only audit info */}
        <div className="mt-6 grid grid-cols-1 gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm sm:grid-cols-2">
          <div>
            <p className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar size={12} /> Created At
            </p>
            <p className="font-medium text-gray-700">{new Date(form.created_at).toLocaleString()}</p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-xs text-gray-400">
              <Clock size={12} /> Last Updated
            </p>
            <p className="font-medium text-gray-700">{new Date(form.updated_at).toLocaleString()}</p>
          </div>
        </div>

        {submitError && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
            {submitError}
          </p>
        )}

        <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-6">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
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