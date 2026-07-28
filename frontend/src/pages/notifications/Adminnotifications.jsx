import { useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  UserPlus,
  Wallet,
  Flag,
  Building2,
  MessageSquareWarning,
} from "lucide-react";

import Button from "../../components/common/Button";
import Title from "../../components/common/Titel";

const INITIAL_NOTIFICATIONS = [
  {
    id: "n1",
    type: "signup",
    icon: Building2,
    title: "New business signup",
    message: "Addis Tech Hub registered and is awaiting verification.",
    time: "12m ago",
    read: false,
  },
  {
    id: "n2",
    type: "payment",
    icon: Wallet,
    title: "Payment request pending",
    message: "Abebe Kebede requested a payout of 4,200 ETB.",
    time: "1h ago",
    read: false,
  },
  {
    id: "n3",
    type: "signup",
    icon: UserPlus,
    title: "New influencer signup",
    message: "Liya Alemu created an account and submitted her profile.",
    time: "3h ago",
    read: false,
  },
  {
    id: "n4",
    type: "flag",
    icon: MessageSquareWarning,
    title: "Content flagged for review",
    message: "A post in Sara Beauty Community was reported by a member.",
    time: "1d ago",
    read: true,
  },
  {
    id: "n5",
    type: "flag",
    icon: Flag,
    title: "Community reported",
    message: "Foodies Addis was reported for inactive moderation.",
    time: "2d ago",
    read: true,
  },
];

const TYPE_STYLE = {
  signup: "bg-sky-100 text-sky-600",
  payment: "bg-amber-100 text-amber-600",
  flag: "bg-red-100 text-red-600",
};

const filters = ["All", "Unread"];

export default function AdminNotifications() {
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
        <Title titel={"Notifications"} disc={"Platform-wide activity that needs your attention."}>
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