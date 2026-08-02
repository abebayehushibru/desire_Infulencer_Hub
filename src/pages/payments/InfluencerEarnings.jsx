import { useState } from "react";
import {
  Landmark,
  Wallet,
  TrendingUp,
  ChevronRight,
  X,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowDownToLine,
  WalletCards,
  WalletIcon,
  User,
} from "lucide-react";
import Input from "../../components/common/Input";
import { useAuth } from "../../contexts/AuthContext";
import { formatFollowers } from "../../services/helpers";
import { useEffect } from "react";
import useApi from "../../hooks/useApi";

const BANKS = [
  { id: "dashen", name: "Dashen Bank", color: "bg-secondary" },
  { id: "cbe", name: "Commercial Bank of Ethiopia", color: "bg-[#FFDa00]" },
];

const WITHDRAW_HISTORY = [
  { id: 1, amount: "500.00 ETB", bank: "CBE", date: "2026-07-20", status: "Completed" },
  { id: 2, amount: "1,200.00 ETB", bank: "Dashen Bank", date: "2026-07-15", status: "Pending" },
  { id: 3, amount: "300.00 ETB", bank: "CBE", date: "2026-07-02", status: "Rejected" },
];

const STATUS_STYLE = {
  approved: "bg-green-100 text-green-700",
  paid: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  rejected: "bg-red-100 text-red-700",
};

const STATUS_ICON = {
  approved: CheckCircle2,
  paid: CheckCircle2,
  pending: Clock,
  rejected: XCircle,
};

export default function InfluencerEarnings() {
  const { user } = useAuth()
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [step, setStep] = useState(1); // 1: pick bank, 2: enter details
  const [selectedBank, setSelectedBank] = useState(null);
  const [error, setError] = useState("");
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState("");
  const totalEarnings = 3025.198;
  const currentBalance = 2115.19;
  const withdrawalApi = useApi({
    request: (payload, method = "GET") => ({
      method: method,
      path: `/withdrawals/my`,
      manual: true,
      data: payload,

    }),
  });
  const withdrawApi = useApi({
    request: (payload) => ({
      method: "POST",
      path: `/withdrawals`,
      manual: true,
      data: payload,

    }),
  });


  function resetWithdraw() {
    setShowWithdraw(false);
    setStep(1);
    setSelectedBank(null);
    setAccount("");
    setPassword("");
    setShowPassword(false);
    setSubmitting(false);
  }

  const handleConfirm = async () => {
    if (!selectedBank || !account || !password || !amount) {
      return;
    }

    setError("")

    const withdrawalAmount = Number(amount);

    const availableBalance = Number(
      withdrawalApi.data?.data?.summary?.available_balance || 0
    );
    const cbeRegex = /^1000\d{9}$/;
    const dashenRegex = /^55\d{7,11}$/;
    let isAccountValid = false;

    if (selectedBank?.id == 'cbe') {
      isAccountValid = cbeRegex.test(account);
    } else if (selectedBank?.id== 'dashen') {
      isAccountValid = dashenRegex.test(account);
    }

    if (!isAccountValid) {
      setError("Enter a valid bank account number.");
      return;
    }

    // 2. Withdrawal Amount Validation
    if (withdrawalAmount <= 0) {
      setError("Enter a valid withdrawal amount.");
      return;
    }

    if (withdrawalAmount > availableBalance) {
      setError("Insufficient available balance.");
      return;
    }

    setSubmitting(true);

    const res = await withdrawApi.execute(
      {
        amount: withdrawalAmount,
        account_number: account,
        bank_type: selectedBank.id,
        password,
        full_name: user.name
      }
    );

    if (res?.success) {
      resetWithdraw();

      // Refresh wallet summary and withdrawals
      await withdrawalApi.execute();
    }

    setSubmitting(false);

  };

  useEffect(() => {
    if (!user?.id) {
      return null
    }
    (async () => {
      await withdrawalApi.execute();

    })();
  }, [user?.id,])

  return (
    <div className="min-h-full -m-4  bg-primary/10 bg-blur-sm rounded-lg">
      <div className="max-w-full space-y-4 - p-4">
        {/* ---------------- PROFILE ---------------- */}
        {/* ---------------- BALANCE CARD ---------------- */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-secondary to-primary p-5 text-white shadow-lg">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-white/5" />

          <div className="relative grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 border-2 border-white text-white">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-lg font-semibold uppercase">{user.name?.[0]}</span>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold ">{user.name}</p>
                <p className="text-xs text-white">{user.email}</p>
              </div>
            </div>
            <div className="relative w-full flex-1 col-span-2 grid grid-cols-3 gap-4">
              <div>
                <p className="flex items-center gap-1.5 text-xs text-white/70">
                  <Wallet size={13} /> Current Balance
                </p>
                <p className="mt-1 text-xl font-bold tabular-nums">{formatFollowers(withdrawalApi.data?.data?.summary?.available_balance)} ETB</p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-xs text-white/70">
                  <Wallet size={13} /> Pending Balance
                </p>
                <p className="mt-1 text-xl font-bold tabular-nums">{formatFollowers(withdrawalApi.data?.data?.summary?.pending_balance)} ETB</p>
              </div>
              <div className="border-l border-white/20 pl-4">
                <p className="flex items-center gap-1.5 text-xs text-white/70">
                  <TrendingUp size={13} /> Total Earnings
                </p>
                <p className="mt-1 text-xl font-bold tabular-nums">{formatFollowers(withdrawalApi.data?.data?.summary?.total_earned)} ETB</p>
              </div>
            </div>

            <button
              onClick={() => setShowWithdraw(true)}
              className="relative  flex w-full max-w-sm items-center justify-center gap-2 rounded-lg bg-white py-3 text-sm font-semibold text-primary transition hover:bg-white/90"
            >
              <ArrowDownToLine size={16} /> Withdraw
            </button>
          </div>
        </div>

        {/* ---------------- WITHDRAW HISTORY ---------------- */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Recent Withdrawals</h3>
            {/* <button className="flex items-center text-xs font-medium text-primary">
              See all <ChevronRight size={14} />
            </button> */}
          </div>
        
          <div className="divide-y divide-gray-50">
            {withdrawalApi.data?.data?.withdrwals?.map((w) => {
              const StatusIcon = STATUS_ICON[w.status];
              return (
                <div key={w.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-400">
                      <Landmark size={16} />
                    </span>


                    <div>
                      <p className="text-sm font-medium text-gray-800">{w.amount} ETB</p>
                      <p className="text-xs uppercase text-gray-400">
                        {w.bank_type} · {new Date(w.createdAt)?.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE}`}
                  >
                    <StatusIcon size={12} /> {w.status}
                  </span>
                </div>
              );
            })}

            {!WITHDRAW_HISTORY.length && (
              <p className="py-8 text-center text-sm text-gray-400">No withdrawals yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* ---------------- WITHDRAW MODAL ---------------- */}
      {showWithdraw && (
        <div className="fixed  inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs sm:items-center">
          <div className="w-full mx-4 max-w-sm bg-white p-5 rounded-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">
                {step === 1 ? "Select a bank" : "Withdrawal details"}
              </h3>
              <button onClick={resetWithdraw} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {step === 1 && (
              <div className="space-y-2">
                {BANKS.map((bank) => (
                  <button
                    key={bank.id}
                    onClick={() => {
                      setSelectedBank(bank);
                      setStep(2);
                    }}
                    className="flex w-full items-center justify-between rounded-lg cursor-pointer border border-gray-200 p-3.5 text-left transition hover:border-primary hover:bg-primary/5"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-white ${bank.color}`}
                      >
                        <Landmark size={16} />
                      </span>
                      <span className="text-sm font-medium text-gray-800">{bank.name}</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-300" />
                  </button>
                ))}
              </div>
            )}

            {step === 2 && selectedBank && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-white ${selectedBank.color}`}
                  >
                    <Landmark size={12} />
                  </span>
                  {selectedBank.name}
                  <button onClick={() => setStep(1)} className="ml-auto text-xs font-medium text-primary">
                    Change
                  </button>
                </div>

                <div>

                  <Input
                    type="text"
                    label={"Account Holder name"}
                    leftIcon={<User size={18} />}
                    value={user.name}

                    disabled
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />


                </div>
                <div>

                  <Input
                    name={"account"}
                    type="text"
                    label={"Account number"}
                    // leftIcon={< size={18} />}
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    placeholder="Enter account number"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />


                </div>

                <div>
                  <Input
                    name={"amount"}
                    type="number"
                    label="Withdrawal amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    leftIcon={<span className="text-gray-400 text-sm font-semibold" size={10} >ETB</span>}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>

                  <div className="relative">
                    <Input
                      label={"Password"}
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 pr-10 text-sm outline-none focus:border-primary"
                      rightIcon={<button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className=" text-gray-400"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>} />

                  </div>
                </div>

                <p className="text-sm my-2 text-red-500">{error}</p>

                <button
                  onClick={handleConfirm}
                  disabled={!account || !password || submitting}
                  className="w-full rounded-xl cursor-pointer bg-primary py-3 text-sm font-semibold text-white transition disabled:opacity-40"
                >
                  {submitting ? "Processing..." : "Confirm Withdrawal"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}