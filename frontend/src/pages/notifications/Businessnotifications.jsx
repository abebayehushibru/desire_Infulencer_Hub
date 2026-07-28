import { useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  Wallet,
  CheckCircle2,
  XCircle,
  Megaphone,
  UserCheck,
} from "lucide-react";

import Button from "../../components/common/Button";
import Title from "../../components/common/Titel";

const INITIAL_NOTIFICATIONS = [
  {
    id: "n1",
    type: "payment",
    icon: Wallet,
    title: "Payment approved",
    message: "Your payout of 18,600 ETB has been approved and is being processed.",
    time: "20m ago",
    read: false,
  },
  {
    id: "n2",
    type: "conversion",
    icon: CheckCircle2,
    title: "New conversion recorded",
    message: "A new conversion was logged for Summer Refresh via Hana T.",
    time: "2h ago",
    read: false,
  },
  {
    id: "n3",
    type: "campaign",
    icon: Megaphone,
    title: "Campaign approved",
    message: "Your campaign \"New Term Enrollment\" was approved and is now live.",
    time: "5h ago",
    read: false,
  },
  {
    id: "n4",
    type: "influencer",
    icon: UserCheck,
    title: "Influencer joined your campaign",
    message: "Fit Coach Dawit joined Summer Refresh.",
    time: "1d ago",
    read: true,
  },
  {
    id: "n5",
    type: "payment",
    icon: XCircle,
    title: "Payment rejected",
    message: "Your payout request was rejected: bank details did not match.",
    time: "3d ago",
    read: true,
  },
];

const TYPE_STYLE = {
  payment: "bg-amber-100 text-amber-600",
  conversion: "bg-green-100 text-green-600",
  campaign: "bg-sky-100 text-sky-600",
  influencer: "bg-primary/10 text-primary",
};

const filters = ["All", "Unread"];

export default function BusinessNotifications() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState("All");

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const filtered = useMemo(
    () => (filter === "Unread" ? notifications.filter((n) => !n.read) : notifications),
    [notifications, filter]
  );

  const markAsRead = (id) =>
    setNotifications((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const markAllAsRead = () => setNotifications((list) => list.map((n) => ({ ...n, read: true })));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Title titel={"Notifications"} disc={"Updates on your campaigns, conversions, and payments."}>
          {unreadCount > 0 && (
          <Button variant="outline" leftIcon={<CheckCheck size={16} />} onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
        </Title>
        
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                filter === f ? "bg-primary text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {f}
              {f === "Unread" && unreadCount > 0 && (
                <span className={`ml-1.5 ${filter === f ? "text-white/70" : "text-gray-400"}`}>
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <ul className="divide-y divide-gray-100">
          {filtered.map((n) => (
            <li
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`flex cursor-pointer items-start gap-3 rounded-xl px-3 py-3.5 transition hover:bg-gray-50 ${
                !n.read ? "bg-primary/[0.03]" : ""
              }`}
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${TYPE_STYLE[n.type]}`}>
                <n.icon size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                  {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                </div>
                <p className="mt-0.5 text-sm text-gray-500">{n.message}</p>
                <p className="mt-1 text-xs text-gray-400">{n.time}</p>
              </div>
            </li>
          ))}

          {filtered.length === 0 && (
            <li className="flex flex-col items-center gap-2 py-14 text-center text-gray-400">
              <Bell size={28} strokeWidth={1.5} />
              <span className="text-sm">You're all caught up.</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}