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
  ChevronLeft,
  BriefcaseBusiness,
} from "lucide-react";
import { useState } from "react";
import logo from "../assets/logos/logo7.png";
import { Link, useLocation } from "react-router-dom";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", icon: LayoutDashboard },
      // { name: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Management",
    items: [
      { name: "Campaigns", icon: Megaphone },
      { name: "Influencers", icon: UserCheck },
      { name: "Communities", icon: Users },
      { name: "Businesses", icon: BriefcaseBusiness },
    ],
  },
  {
    label: "Finance",
    items: [
      // { name: "Earnings", icon: Wallet },
      { name: "Payments", icon: CreditCard },
    ],
  },
  {
    label: "Account",
    items: [
      { name: "Notifications", icon: Bell, badge: 3 },
      { name: "Settings", icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const [showCard, setShowCard] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={`relative bg-gradient-to-br from-primary to-secondary  flex min-h-full flex-col border-r border-gray-400/50 transition-all duration-200 ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-8 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm transition hover:text-white"
      >
        <ChevronLeft size={13} className={`transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`} />
      </button>

      {/* Logo */}
      <div className="flex h-20 items-center gap-3 border-b border-gray-400/50 px-6">
        <div className="flex w-full shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-sm shadow-primary/10">
          <img src={logo} alt="InfluenceHub" className="h-full w-full object-contain" />
        </div>
        {!collapsed && (
          <h2 className="truncate  text-lg font-bold tracking-tight text-white">Influence Hub</h2>
        )}
      </div>

      {/* Menu */}
      <div className="flex-1  relative">
<nav className="max-h-full absolute  w-full overflow-y-auto scroll-container overflow-x-hidden px-4 py-5">
        <ul className="space-y-3">
          {NAV_GROUPS.map((group) => (
            <li key={group.label}>
              {!collapsed && (
                <p className="mb-2 px-3 text-[12px] font-semibold uppercase tracking-wider text-gray-300">
                  {group.label}
                </p>
              )}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const path = `/${item.name.toLowerCase()}`;
                  const isActive =
                    location.pathname === path || location.pathname.startsWith(`${path}/`);

                  return (
                    <li key={item.name} className="relative">
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-tertiary" />
                      )}
                      <Link
                        to={item.name.toLowerCase()}
                        title={collapsed ? item.name : undefined}
                        className={`group flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-150 ${
                          collapsed ? "justify-center px-0" : ""
                        } ${
                          isActive
                            ? "bg-gray-100 text-primary"
                            : "text-gray-400 hover:bg-gray-300 hover:text-gray-800"
                        }`}
                      >
                        <span
                          className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                            isActive
                              ? "bg-primary text-white shadow-sm shadow-primary/30"
                              : "bg-gray-50 text-primary group-hover:bg-white group-hover:text-primary"
                          }`}
                        >
                          <Icon size={16} strokeWidth={2.25} />
                          {item.badge && (
                            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-semibold text-white ring-2 ring-white">
                              {item.badge}
                            </span>
                          )}
                        </span>
                        {!collapsed && <span className="truncate">{item.name}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </nav>
      </div>
      

      {/* Bottom section */}
      <div className="border-t border-gray-100 p-4">
        <div className="relative">
          {/* Verified card */}
          {showCard && !collapsed && (
            <div className="absolute inset-x-0 bottom-full z-10 mb-3">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 p-4 shadow-lg shadow-primary/20">
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />

                <button
                  onClick={() => setShowCard(false)}
                  aria-label="Dismiss"
                  className="absolute right-2.5 top-2.5 rounded-full p-1 text-primary/80 transition hover:bg-primary/50 hover:text-primary"
                >
                  <X size={15} />
                </button>

                <div className="flex items-start gap-1 pr-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                    <ShieldCheck className="text-emerald-300" size={18} />
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-primary">Business Verified</h4>
                    <p className="mt-0.5 text-[9px] leading-snug text-primary/70">
                      Your documents have been approved.
                    </p>
                    <button className="mt-1 text-xs font-semibold text-tertiary transition hover:underline">
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
            title={collapsed ? "Desire Online School" : undefined}
            className={`group flex w-full items-center gap-3 rounded-xl p-2 text-left transition bg-gray-50/5 hover:bg-gray-50/20 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div className="relative shrink-0">
              <img
                src="https://i.pravatar.cc/150?img=12"
                alt="Account avatar"
                className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
              />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
            </div>

            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-semibold text-gray-300">
                    Desire Online School
                  </h4>
                  <p className="text-xs text-gray-400">Business</p>
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
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}