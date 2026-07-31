import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    User,
    Wallet,
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
    Clock,
} from "lucide-react";

import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import Title from "../../components/common/Title";
import useApi from "../../hooks/useApi";

const STATUS_STYLE = {
    PENDING: "bg-yellow-100 text-yellow-700",
    VERIFIED: "bg-sky-100 text-sky-700",
    REJECTED: "bg-rose-100 text-rose-700",
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

export default function RechargeDetails() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [form, setForm] = useState(null);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const getRechargeApi = useApi({
        request: (paymentId) => ({
            method: "GET",
            path: `/recharges/${id}`,
            manual: true,
        }),
    });

    const updateRechargeApi = useApi({
        request: (payload) => ({
            method: "PATCH",
            path: `/recharges/${id}/verify`,
            manual: true,
            data: payload,
        }),
    });

    useEffect(() => {
        if (!id) return;

        const fetchPayment = async () => {
            setSubmitError("");
            const response = await getRechargeApi.execute(id);

            if (response?.success) {
                // Adjust this line if your API wraps the record differently.
                const r = response?.data?.data?.withdrawal || response?.data?.data;

                setForm({
                    id: r.id,

                    businessName: r.business?.name_or_company_name || "N/A",
                    businessEmail: r.business?.email || "",

                    amount: r.amount,
                    currency: r.currency,
                    bankType: r.bank_type,

                    transactionReference: r.transaction_reference || "",
                    rejectionReason: r.rejection_reason || "",
                    note: r.note || "",

                    status: String(r.status || "pending").toUpperCase(),
                    old_status: String(r.status || "pending").toUpperCase(),

                    verifiedAt: r.verified_at,
                    verifiedBy: r.verified_by || null,

                    createdAt: r.createdAt,
                });
                return;
            }
        };

        fetchPayment();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (getRechargeApi.loading || !form) {
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
        ...(form.old_status === "PENDING" ? [{ label: "Approved", value: "VERIFIED" }] : []),
        ...(form.old_status === "PENDING" ? [{ label: "Rejected", value: "REJECTED" }] : []),
    ];

    const isRejected = form.status === "REJECTED";
    const wasRejected = form.old_status === "REJECTED";
    const bank = BANKS[form.bankType] || { label: form.bankType || "Bank", color: "bg-gray-200 text-gray-600" };

    const setStatus = (e) => {
        const value = e.target.value;

        setForm((current) => ({
            ...current,
            status: value,
            rejectionReason: value === "REJECTED" ? current.rejectionReason : "",
        }));

        setErrors({});
        setSubmitError("");
    };

    const validate = () => {
        const validationErrors = {};

        if (isRejected && !form.rejectionReason.trim()) {
            validationErrors.rejectionReason = "A rejection reason is required.";
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
            rejection_reason: isRejected ? form.rejectionReason.trim() : null,
            transaction_reference: form.transactionReference?.trim() || null,
            note: form.note?.trim() || null,
        };

        const res = await updateRechargeApi.execute(payload);

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
                        {form.businessName}'s payment is now marked as{" "}
                        <span className="font-semibold text-gray-700">{form.status}</span>.
                    </p>

                    <Button onClick={() => navigate(-1)} variant="primary" className="mt-6">
                        Back to Recharges
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Title
                titel="Recharge Details "
                disc={`Review and update platform recharges #${form.id}.`}
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
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLE[form.old_status] || "bg-gray-100 text-gray-600"
                                }`}
                        >
                            {form.old_status}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-5 rounded-xl border border-gray-100 bg-gray-50/40 p-4 sm:grid-cols-3">
                        <InfoCard icon={User} label="Requested By Business">
                            <p className="truncate text-xs font-semibold text-gray-700">{form.businessName}</p>
                        </InfoCard>

                        {form.businessEmail && (
                            <InfoCard icon={Mail} label="Email">
                                <p className="truncate text-xs font-medium text-gray-600">{form.businessEmail}</p>
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

                        {form.transactionReference && (
                            <InfoCard icon={Hash} label="Transaction Reference">
                                <p className="font-mono text-xs font-medium text-gray-600">{form.transactionReference}</p>
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

                    <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-100 bg-gray-50/40 p-4 sm:grid-cols-2">
                        <TimelineStep icon={Clock} label="Requested" timestamp={form.createdAt} tone="gray" />

                        {wasRejected ? (
                            <TimelineStep
                                icon={ShieldX}
                                label="Rejected"
                                timestamp={form.verifiedAt}
                                actor={form.verifiedBy}
                                tone="red"
                            />
                        ) : (
                            <TimelineStep
                                icon={ShieldCheck}
                                label="Approved"
                                timestamp={form.verifiedAt}
                                actor={form.verifiedBy?.name_or_company_name}
                                tone="sky"
                                pending={!form.verifiedAt}
                            />
                        )}
                    </div>

                    {wasRejected && form.rejectionReason && (
                        <div className="mt-3 rounded-lg border border-red-100 bg-red-50 p-3 text-xs text-red-700">
                            <span className="font-semibold">Rejection reason: </span>
                            {form.rejectionReason}
                        </div>
                    )}
                </div>

                {/* Update Status */}
                {form.old_status === "PENDING" && (
                    <div className="border-t border-gray-100 pt-4">
                        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Update Workflow Action</h3>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <Select label="Select New Status" name="status" value={form.status} onChange={setStatus} data={STATUS_OPTIONS} />
                        </div>
                    </div>
                )}

                {/* Rejection Reason */}
                {isRejected && (
                    <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                        <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-700">
                            <MessageSquare size={12} /> Rejection Reason
                            <span className="font-bold text-rose-500">*</span>
                        </label>

                        <textarea
                            rows={3}
                            placeholder="Explain transparently why this specific payment request is being rejected..."
                            value={form.rejectionReason}
                            onChange={(e) => setForm((current) => ({ ...current, rejectionReason: e.target.value }))}
                            className={`w-full rounded-xl border bg-white p-3 text-xs font-medium text-gray-800 outline-none transition-all duration-200 placeholder:font-normal placeholder:text-gray-400 focus:ring-4 ${errors.rejectionReason
                                ? "border-rose-400 bg-rose-50/5 focus:border-rose-400 focus:ring-rose-400/10"
                                : "border-gray-200 hover:border-gray-300 focus:border-violet-500 focus:ring-violet-500/10"
                                }`}
                        />

                        {errors.rejectionReason && (
                            <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-500">
                                <AlertCircle size={13} />
                                {errors.rejectionReason}
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
                        disabled={form.old_status!="PENDING"}
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
            {   form.old_status=="PENDING"&&<div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate(-1)}
                        disabled={updateRechargeApi.loading}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        variant="primary"
                        disabled={updateRechargeApi.loading}
                        className="flex items-center gap-2"
                    >
                        {updateRechargeApi.loading ? (
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
                </div>}
            </form>
        </div>
    );
}