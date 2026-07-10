import {
  Wallet,
  Clock,
  CheckCircle2,
  ArrowDownToLine,
  Banknote,
} from "lucide-react";

const payouts = [
  {
    id: "PO-3301",
    date: "15 Jun 2024",
    method: "Bank Transfer",
    amount: "42,500 ETB",
    status: "Paid",
  },
  {
    id: "PO-3287",
    date: "01 Jun 2024",
    method: "Bank Transfer",
    amount: "31,000 ETB",
    status: "Paid",
  },
  {
    id: "PO-3265",
    date: "18 May 2024",
    method: "Telebirr",
    amount: "18,500 ETB",
    status: "Paid",
  },
];

const summary = [
  {
    label: "Total Earned",
    value: "92,000 ETB",
    icon: <Wallet size={18} />,
    accent: "bg-purple-50 text-primary",
  },
  {
    label: "Paid Out",
    value: "75,500 ETB",
    icon: <CheckCircle2 size={18} />,
    accent: "bg-green-50 text-green-600",
  },
  {
    label: "Pending",
    value: "16,500 ETB",
    icon: <Clock size={18} />,
    accent: "bg-amber-50 text-amber-600",
  },
];

export default function  Earnings () {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {summary.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-lg border border-gray-200 p-5"
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.accent}`}
            >
              {s.icon}
            </div>
            <p className="text-2xl font-bold mt-3">{s.value}</p>
            <p className="text-gray-500 text-sm mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {/* Payout history */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between p-6 pb-4">
            <h3 className="font-semibold text-gray-900">Payout History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-t border-gray-100">
                  <th className="font-medium px-6 py-3">ID</th>
                  <th className="font-medium px-6 py-3">Date</th>
                  <th className="font-medium px-6 py-3">Method</th>
                  <th className="font-medium px-6 py-3">Amount</th>
                  <th className="font-medium px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id} className="border-t border-gray-100">
                    <td className="px-6 py-3.5 text-gray-500">{p.id}</td>
                    <td className="px-6 py-3.5 text-gray-500">{p.date}</td>
                    <td className="px-6 py-3.5 text-gray-700">{p.method}</td>
                    <td className="px-6 py-3.5 font-medium">{p.amount}</td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        <CheckCircle2 size={14} />
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Withdraw / payout settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4 h-fit">
          <h3 className="font-semibold text-gray-900">Available Balance</h3>

          <div>
            <p className="text-3xl font-bold text-gray-900">16,500 ETB</p>
            <p className="text-gray-500 text-sm mt-1">
              Ready to withdraw from this campaign
            </p>
          </div>

          <button className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-xl py-2.5 font-medium hover:opacity-90">
            <ArrowDownToLine size={18} />
            Withdraw Funds
          </button>

          <hr className="border-gray-100" />

          <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
              <Banknote size={16} className="text-gray-500" />
            </span>
            <div>
              <p className="text-sm font-medium">Payout Method</p>
              <p className="text-sm text-gray-500">
                Bank Transfer — Commercial Bank of Ethiopia
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}