import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  User,
  Wallet,
  CreditCard,
  Calendar,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Save,
  Landmark,
  Hash,
  Mail,
  MessageSquare,
  ShieldCheck,
  ShieldX,
  BadgeCheck,
  Clock,
} from "lucide-react";

import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import Title from "../../components/common/Title";
import useApi from "../../hooks/useApi";



const STATUS_STYLE = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-sky-100 text-sky-700",
  PAID: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-600",
};

const BANKS = {
  cbe: { label: "Commercial Bank of Ethiopia", color: "bg-[#FFDA00] text-[#16115A]" },
  dashen: { label: "Dashen Bank", color: "bg-secondary text-white" },
};

const formatMoney = (value) =>
  `${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ETB`;

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    : null;

function InfoCard({ icon: Icon, label, children }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-white text-gray-400 shadow-sm">
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{label}</p>
        {children}
      </div>
    </div>
  );
}

function TimelineStep({ icon: Icon, label, timestamp, actor, tone = "gray", pending }) {
  const toneStyles = {
    gray: "bg-gray-100 text-gray-400",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    sky: "bg-sky-100 text-sky-600",
  };

  return (
    <div className="flex items-start gap-3">
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${toneStyles[tone]}`}>
        <Icon size={14} />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-700">{label}</p>
        {pending ? (
          <p className="text-[11px] text-gray-400">Not yet</p>
        ) : (
          <>
            <p className="text-[11px] text-gray-500">{formatDateTime(timestamp)}</p>
            {actor && <p className="text-[11px] text-gray-400">by {actor}</p>}
          </>
        )}
      </div>
    </div>
  );
}

export default function EditPayment() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const getPaymentApi = useApi({
    request: (paymentId) => ({
      method: "GET",
      path: `/withdrawals/${paymentId}`,
      manual: true,
    }),
  });

  const updatePaymentApi = useApi({
    request: (payload) => ({
      method: "PATCH",
      path: `/withdrawals/${id}`,
      manual: true,
      data: payload,
    }),
  });

  useEffect(() => {
    if (!id) return;

    const fetchPayment = async () => {
      setSubmitError("");
      const response = await getPaymentApi.execute(id);

      if (!response?.success) {
        setSubmitError(response?.message || "Failed to load payment information.");
        return;
      }

      // Adjust this line if your API wraps the record differently.
      const w = response?.data?.data?.withdrawal || response?.data?.data;
      console.log(w);

      if (!w) {
        setSubmitError("Payment record not found.");
        return;
      }

      setForm({
        id: w.id,
        requesterName: w.requested_by?.name_or_company_name || "N/A",
        requesterEmail: w.requested_by?.email || null,
        fullName: w.full_name || "—",
        amount: w.amount,
        bankType: w.bank_type,
        account: w.account_number || "—",
        status: String(w.status || "pending").toUpperCase(),
         old_status: String(w.status || "pending").toUpperCase(),
        rejection_reason: w.rejection_reason || "",
        transaction_reference: w.transaction_reference || "",
        note: w.note || "",
        createdAt: w.createdAt,
        approvedAt: w.approved_at,
        approvedBy: w.approved_by?.name_or_company_name || null,
        rejectedAt: w.rejected_at,
        rejectedBy: w.rejected_by?.name_or_company_name || null,
        paidAt: w.paid_at,
        paidBy: w.paid_by?.name_or_company_name || null,
      });
    };

    fetchPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (getPaymentApi.loading || !form) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="animate-spin text-violet-600" />
          <p className="text-sm font-medium text-gray-500">Loading payment data...</p>
        </div>
      </div>
    );
  }
  const STATUS_OPTIONS = [
    ...(form.old_status === "PENDING" ? [{ label: "Approved", value: "APPROVED" }] : []),
    ...(form.old_status === "APPROVED" ? [{ label: "Paid", value: "PAID" }] : []),
    ...(form.old_status === "PENDING" ? [{ label: "Rejected", value: "REJECTED" }] : [])
  ];
  const isRejected = form.status === "REJECTED";
  const isPaid = form.status === "PAID";
  const bank = BANKS[form.bankType] || { label: form.bankType || "Bank", color: "bg-gray-200 text-gray-600" };

  const setStatus = (e) => {
    const value = e.target.value;

    setForm((current) => ({
      ...current,
      status: value,
      rejection_reason: value === "REJECTED" ? current.rejection_reason : "",
      transaction_reference: value === "PAID" ? current.transaction_reference : "",
    }));

    setErrors({});
    setSubmitError("");
  };

  const validate = () => {
    const validationErrors = {};

    if (isRejected && !form.rejection_reason.trim()) {
      validationErrors.rejection_reason = "A rejection reason is required.";
    }

    if (isPaid && !form.transaction_reference.trim()) {
      validationErrors.transaction_reference = "A transaction reference is required to mark this as paid.";
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!validate()) return;

    const payload = {
      status: form.status.toLowerCase(),
      rejection_reason: isRejected ? form.rejection_reason.trim() : null,
      transaction_reference: isPaid ? form.transaction_reference.trim() : form.transaction_reference || null,
      note: form.note?.trim() || null,
    };

    const res = await updatePaymentApi.execute(payload);

    if (res?.success) {
      setSubmitted(true);
    } else {
      setSubmitError(res?.message || "Something went wrong. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-[500px] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 size={30} className="text-green-600" />
          </div>

          <h2 className="text-lg font-bold text-gray-800">Payment Updated Successfully</h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            {form.requesterName}'s payment is now marked as{" "}
            <span className="font-semibold text-gray-700">{form.status}</span>.
          </p>

          <Button onClick={() => navigate(-1)} variant="primary" className="mt-6">
            Back to Payments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Title
        titel="Edit Payment"
        disc={`Review and update platform payment entry status #${form.id}.`}
      />

      <form
        onSubmit={handleSubmit}
        className="flex max-w-full flex-col gap-6 mt-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        {/* Payment Details */}
        <div>
          <div className="mb-4 flex items-center gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Payment Details</h3>

            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLE[form.status] || "bg-gray-100 text-gray-600"
                }`}
            >
              {form.old_status}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 rounded-xl border border-gray-100 bg-gray-50/40 p-4 sm:grid-cols-3">
            <InfoCard icon={User} label="Requested By">
              <p className="truncate text-xs font-semibold text-gray-700">{form.requesterName}</p>
            </InfoCard>

            {form.requesterEmail && (
              <InfoCard icon={Mail} label="Email">
                <p className="truncate text-xs font-medium text-gray-600">{form.requesterEmail}</p>
              </InfoCard>
            )}

            <InfoCard icon={Wallet} label="Amount">
              <p className="text-xs font-bold text-green-600">{formatMoney(form.amount)}</p>
            </InfoCard>

            <InfoCard icon={Landmark} label="Bank">
              <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${bank.color}`}>
                {bank.label}
              </span>
            </InfoCard>

            <InfoCard icon={CreditCard} label="Account Number">
              <p className="font-mono text-xs font-medium text-gray-600">{form.account}</p>
            </InfoCard>

            <InfoCard icon={User} label="Account Holder">
              <p className="truncate text-xs font-medium text-gray-600">{form.fullName}</p>
            </InfoCard>

            {form.transaction_reference && (
              <InfoCard icon={Hash} label="Transaction Reference">
                <p className="font-mono text-xs font-medium text-gray-600">{form.transaction_reference}</p>
              </InfoCard>
            )}

            <InfoCard icon={Calendar} label="Requested">
              <p className="text-xs font-semibold text-gray-700">{formatDateTime(form.createdAt)}</p>
            </InfoCard>
          </div>
        </div>

        {/* Lifecycle timeline */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Payment Lifecycle</h3>

          <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-100 bg-gray-50/40 p-4 sm:grid-cols-3">
            <TimelineStep icon={Clock} label="Requested" timestamp={form.createdAt} tone="gray" />

            {form.rejectedAt ? (
              <TimelineStep
                icon={ShieldX}
                label="Rejected"
                timestamp={form.rejectedAt}
                actor={form.rejectedBy}
                tone="red"
              />
            ) : (
              <TimelineStep icon={ShieldCheck} label="Approved" timestamp={form.approvedAt} actor={form.approvedBy} tone="sky" pending={!form.approvedAt} />
            )}

            <TimelineStep icon={BadgeCheck} label="Paid" timestamp={form.paidAt} actor={form.paidBy} tone="green" pending={!form.paidAt} />
          </div>

          {form.rejectedAt && form.rejection_reason && (
            <div className="mt-3 rounded-lg border border-red-100 bg-red-50 p-3 text-xs text-red-700">
              <span className="font-semibold">Rejection reason: </span>
              {form.rejection_reason}
            </div>
          )}
        </div>

        {/* Update Status */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Update Workflow Action</h3>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Select label="Select New Status" name="status" value={form.status} onChange={setStatus} data={STATUS_OPTIONS} />
          </div>
        </div>

        {/* Rejection Reason */}
        {isRejected && (
          <div className="animate-in fade-in slide-in-from-top-1 duration-200">
            <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-700">
              Rejection Reason
              <span className="font-bold text-rose-500">*</span>
            </label>

            <textarea
              rows={3}
              placeholder="Explain transparently why this specific payment request is being rejected..."
              value={form.rejection_reason}
              onChange={(e) => setForm((current) => ({ ...current, rejection_reason: e.target.value }))}
              className={`w-full rounded-xl border bg-white p-3 text-xs font-medium text-gray-800 outline-none transition-all duration-200 placeholder:font-normal placeholder:text-gray-400 focus:ring-4 ${errors.rejection_reason
                  ? "border-rose-400 bg-rose-50/5 focus:border-rose-400 focus:ring-rose-400/10"
                  : "border-gray-200 hover:border-gray-300 focus:border-violet-500 focus:ring-violet-500/10"
                }`}
            />

            {errors.rejection_reason && (
              <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-500">
                <AlertCircle size={13} />
                {errors.rejection_reason}
              </p>
            )}
          </div>
        )}

        {/* Transaction Reference — required when marking Paid */}
        {isPaid && (
          <div className="animate-in fade-in slide-in-from-top-1 duration-200">
            <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-700">
              Transaction Reference
              <span className="font-bold text-rose-500">*</span>
            </label>

            <div className="relative">
              <Hash size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="e.g. FT24201XXXXX"
                value={form.transaction_reference}
                onChange={(e) => setForm((current) => ({ ...current, transaction_reference: e.target.value }))}
                className={`w-full rounded-xl border bg-white py-2.5 pl-9 pr-3 text-xs font-medium text-gray-800 outline-none transition-all duration-200 placeholder:font-normal placeholder:text-gray-400 focus:ring-4 ${errors.transaction_reference
                    ? "border-rose-400 bg-rose-50/5 focus:border-rose-400 focus:ring-rose-400/10"
                    : "border-gray-200 hover:border-gray-300 focus:border-violet-500 focus:ring-violet-500/10"
                  }`}
              />
            </div>

            {errors.transaction_reference && (
              <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-500">
                <AlertCircle size={13} />
                {errors.transaction_reference}
              </p>
            )}
          </div>
        )}

        {/* Admin Note — optional, independent of status */}
        <div>
          <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-700">
            <MessageSquare size={12} /> Admin Note
            <span className="text-[10px] font-normal normal-case text-gray-400">(Optional, internal)</span>
          </label>

          <textarea
            rows={2}
            placeholder="Any internal notes about this payment..."
            value={form.note}
            onChange={(e) => setForm((current) => ({ ...current, note: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 bg-white p-3 text-xs font-medium text-gray-800 outline-none transition-all duration-200 placeholder:font-normal placeholder:text-gray-400 hover:border-gray-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
          />
        </div>

        {/* Submit Error */}
        {submitError && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
            disabled={updatePaymentApi.loading}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={updatePaymentApi.loading}
            className="flex items-center gap-2"
          >
            {updatePaymentApi.loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={15} />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}