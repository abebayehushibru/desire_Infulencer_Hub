import {
  LayoutDashboard,
  Megaphone,
  Users,
  UserCheck,
  BarChart3,
  Wallet,
  CreditCard,
  Bell,
  Settings,
  ShieldCheck,
  X,
  Info,
  ChevronRight,
  BriefcaseBusiness,
} from "lucide-react";
import { useState } from "react";
import logo from "../assets/logo1.png";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Campaigns", icon: Megaphone },
  { name: "Influencers", icon: UserCheck },
  { name: "Communities", icon: Users },
  { name: "Businesses", icon: BriefcaseBusiness },
  { name: "Analytics", icon: BarChart3 },
  { name: "Earnings", icon: Wallet },
  { name: "Payments", icon: CreditCard },
  { name: "Notifications", icon: Bell },
  { name: "Settings", icon: Settings },
];

export default function Sidebar() {
  const [showCard, setShowCard] = useState(true);
  const location = useLocation();

  return (
    <aside className="flex min-h-full   w-72 flex-col border-r border-gray-100 bg-white">
      {/* Logo */}
      <div className="flex h-20 items-center gap-3 border-b border-gray-100 px-6">
        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl shadow-sm shadow-primary/10">
          <img src={logo} alt="InfluenceHub" className="h-full w-full object-contain" />
        </div>
        <h2 className="text-lg font-bold tracking-tight text-primary">influenceHub</h2>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-4 py-5">
        <ul className="space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const path = `/${item.name.toLowerCase()}`;
            const isActive =
              location.pathname === path || location.pathname.startsWith(`${path}/`);

            return (
              <li key={index} className="relative">
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                )}
                <Link
                  to={item.name.toLowerCase()}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary text-white shadow-sm shadow-primary/30"
                        : "bg-gray-50 text-gray-400 group-hover:bg-white group-hover:text-gray-600"
                    }`}
                  >
                    <Icon size={16} strokeWidth={2.25} />
                  </span>
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="border-t relative border-gray-100 p-4">
        {/* Verified card */}
        {showCard && (
          <div className="absolute mb-4 bottom-16 left-4 right-4 z-10">
          <div className="relative mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-secondary to-primary p-4 shadow-lg shadow-primary/20">
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

            <button
              onClick={() => setShowCard(false)}
              aria-label="Dismiss"
              className="absolute right-2.5 top-2.5 rounded-full p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <X size={15} />
            </button>

            <div className="flex items-start gap-3 pr-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                <ShieldCheck className="text-emerald-300" size={18} />
              </span>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-white">Business Verified</h4>
                <p className="mt-0.5 text-xs leading-snug text-white/70">
                  Your documents have been approved.
                </p>
                <button className="mt-2 text-xs font-semibold text-tertiary transition hover:underline">
                  View Documents →
                </button>
              </div>
            </div>
          </div>
          </div>
        )}

        {/* User */}
        <button
          onClick={() => setShowCard(true)}
          className="group flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-gray-50"
        >
          <div className="relative shrink-0">
            <img
              src="https://i.pravatar.cc/150?img=12"
              alt="Account avatar"
              className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
            />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-semibold text-gray-800">
              Desire Online School
            </h4>
            <p className="text-xs text-gray-500">Business</p>
          </div>

          {!showCard ? (
            <Info
              size={16}
              className="shrink-0 text-gray-300 transition group-hover:text-primary"
            />
          ) : (
            <ChevronRight
              size={16}
              className="shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-primary"
            />
          )}
        </button>
      </div>
    </aside>
  );
}