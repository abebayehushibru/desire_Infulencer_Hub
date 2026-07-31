import { useEffect, useState } from "react";
import {
  Landmark,
  Wallet,
  TrendingUp,
  Clock3,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  PlusCircle,
  Copy,
  Check,
  Hash,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Input from "../../components/common/Input";
import { useAuth } from "../../contexts/AuthContext";
import { formatFollowers } from "../../services/helpers";
import useApi from "../../hooks/useApi";

// Bank details the business transfers money into before confirming a
// recharge. Swap for whatever your real settlement account is.
const RECHARGE_BANK = {
  id: "cbe",
  name: "Commercial Bank of Ethiopia",
  accountName: "InfluenceHub PLC",
  accountNumber: "1000123456789",
  color: "bg-[#FFDA00] text-[#16115A]",
};

const STATUS_STYLE = {
  completed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  rejected: "bg-red-100 text-red-700",
};

const STATUS_ICON = {
  completed: CheckCircle2,
  pending: Clock,
  rejected: XCircle,
};

const TABS = [
  { id: "recharge", label: "Recharge History" },
  { id: "withdrawal", label: "Withdrawal History" },
];

function CopyableField({ label, value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — ignore
    }
  };

  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3.5 py-2.5">
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-800">{value}</p>
      </div>
      <button
        onClick={handleCopy}
        className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-primary"
        aria-label={`Copy ${label}`}
      >
        {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
      </button>
    </div>
  );
}

export default function BusinessWallet() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("recharge");

  const [showRecharge, setShowRecharge] = useState(false);
  const [step, setStep] = useState(1); // 1: bank details, 2: amount + reference
  const [amount, setAmount] = useState("");
  const [transactionReference, setTransactionReference] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── APIs ────────────────────────────────────────────────────────────
  const rechargeHistoryApi = useApi({
    request: (payload) => ({
      method: "GET",
      path: `/recharges/my`,
      manual: true,
      query: payload,
    }),
  });

  const withdrawalHistoryApi = useApi({
    request: (payload) => ({
      method: "GET",
      path: `/withdrawals/my`,
      manual: true,
      query: payload,
    }),
  });

  const rechargeApi = useApi({
    request: (payload) => ({
      method: "POST",
      path: `/recharges`,
      manual: true,
      data: payload,
    }),
  });

  const summary = withdrawalHistoryApi.data?.data?.summary;
  const recharges = rechargeHistoryApi.data?.data?.rows || [];
  const withdrawals = withdrawalHistoryApi.data?.data?.withdrwals|| [];

  
  const activeHistory = activeTab === "recharge" ? recharges : withdrawals;

  const fetchAll = async () => {
    await Promise.all([rechargeHistoryApi.execute(), withdrawalHistoryApi.execute()]);
  };

  useEffect(() => {
    if (!user?.id) return;
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  function resetRecharge() {
    setShowRecharge(false);
    setStep(1);
    setAmount("");
    setTransactionReference("");
    setError("");
    setSubmitting(false);
  }

  const handleConfirm = async () => {
    setError("");

    const rechargeAmount = Number(amount);

    if (!rechargeAmount || rechargeAmount <= 0) {
      setError("Enter a valid recharge amount.");
      return;
    }

    if (!transactionReference.trim()) {
      setError("Enter the transaction reference from your bank transfer.");
      return;
    }

    setSubmitting(true);

    const res = await rechargeApi.execute(
      {
        amount: rechargeAmount,
        transaction_reference: transactionReference.trim(),
        bank_type: RECHARGE_BANK.id,
      },
      "Recharge request submitted for verification!"
    );

    if (res?.success) {
      resetRecharge();
      await rechargeHistoryApi.execute();
    } else {
      setError(res?.message || "Something went wrong. Please try again.");
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-full rounded-lg bg-primary/10">
      <div className="mx-auto max-w-full space-y-4 p-4">
        {/* ---------------- BALANCE CARD ---------------- */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-secondary to-primary p-5 text-white shadow-lg">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-white/5" />

          <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-primary/10 text-white">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-lg font-semibold uppercase">
                    {user?.name_or_company_name?.[0] || user?.name?.[0]}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold">{user?.name_or_company_name || user?.name}</p>
                <p className="text-xs text-white/80">{user?.email}</p>
              </div>
            </div>

            <div className="relative col-span-2 grid w-full flex-1 grid-cols-3 gap-4">
              <div>
                <p className="flex items-center gap-1.5 text-xs text-white/70">
                  <Wallet size={13} /> Available 
                </p>
                <p className="mt-1 text-xl font-bold tabular-nums">
                  {formatFollowers(summary?.available_balance || 0)} ETB
                </p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-xs text-white/70">
                  <TrendingUp size={13} /> Total 
                </p>
                <p className="mt-1 text-xl font-bold tabular-nums">
                  {formatFollowers(summary?.total_recharged || 0)} ETB
                </p>
              </div>
              <div className="border-l border-white/20 pl-4">
                <p className="flex items-center gap-1.5 text-xs text-white/70">
                  <Clock3 size={13} /> Pending 
                </p>
                <p className="mt-1 text-xl font-bold tabular-nums">
                  {formatFollowers(summary?.pending_recharge || 0)} ETB
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowRecharge(true)}
              className="relative flex w-full max-w-sm items-center justify-center gap-2 rounded-lg bg-white py-3 text-sm font-semibold text-primary transition hover:bg-white/90"
            >
              <PlusCircle size={16} /> Recharge
            </button>
          </div>
        </div>
        {/* ---------------- HISTORY ---------------- */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-1 rounded-lg bg-gray-50 p-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "bg-white text-primary shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {(activeTab === "recharge" ? rechargeHistoryApi.loading : withdrawalHistoryApi.loading) ? (
            <div className="flex items-center justify-center py-10 text-gray-400">
              <Loader2 size={20} className="animate-spin" />
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {activeHistory.map((item) => {
                const StatusIcon = STATUS_ICON[item.status] || Clock;
                return (
                  <div key={item.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-400">
                        <Landmark size={16} />
                      </span>

                      <div>
                        <p className="text-sm font-medium text-gray-800">{item.amount} ETB</p>
                        <p className="text-xs uppercase text-gray-400">
                          {item.bank_type} · {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                        {activeTab === "recharge" && item.transaction_reference && (
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                            <Hash size={11} /> {item.transaction_reference}
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUS_STYLE[item.status] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <StatusIcon size={12} /> {item.status}
                    </span>
                  </div>
                );
              })}

              {!activeHistory.length && (
                <p className="py-8 text-center text-sm text-gray-400">
                  {activeTab === "recharge" ? "No recharges yet." : "No withdrawals yet."}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ---------------- RECHARGE MODAL ---------------- */}
      {showRecharge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-lg bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">
                {step === 1 ? "Recharge via Bank Transfer" : "Confirm Transfer"}
              </h3>
              <button onClick={resetRecharge} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${RECHARGE_BANK.color}`}
                  >
                    <Landmark size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{RECHARGE_BANK.name}</p>
                    <p className="text-xs text-gray-400">Transfer to this account, then confirm below</p>
                  </div>
                </div>

                <CopyableField label="Account Name" value={RECHARGE_BANK.accountName} />
                <CopyableField label="Account Number" value={RECHARGE_BANK.accountNumber} />

                <p className="rounded-lg bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-700">
                  Transfer any amount to the account above, then enter the amount and the transaction
                  reference from your bank receipt. We'll verify and credit your wallet shortly.
                </p>

                <button
                  onClick={() => setStep(2)}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
                >
                  I've made the transfer <ArrowRight size={16} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${RECHARGE_BANK.color}`}
                  >
                    <Landmark size={12} />
                  </span>
                  {RECHARGE_BANK.name}
                  <button onClick={() => setStep(1)} className="ml-auto text-xs font-medium text-primary">
                    Back
                  </button>
                </div>

                <div>
                  <Input
                    name="amount"
                    type="number"
                    label="Amount Transferred"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    leftIcon={<span className="text-sm font-semibold text-gray-400">ETB</span>}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <Input
                    name="transaction_reference"
                    type="text"
                    label="Transaction Reference"
                    leftIcon={<Hash size={16} />}
                    value={transactionReference}
                    onChange={(e) => setTransactionReference(e.target.value)}
                    placeholder="e.g. FT24201XXXXX"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                  onClick={handleConfirm}
                  disabled={!amount || !transactionReference || submitting}
                  className="w-full cursor-pointer rounded-xl bg-primary py-3 text-sm font-semibold text-white transition disabled:opacity-40"
                >
                  {submitting ? "Submitting..." : "Submit Recharge"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}