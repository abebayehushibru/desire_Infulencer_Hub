import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  Lock,
  LogOut,
  Search,
  Settings,
  LayoutDashboard,
  Megaphone,
  FileWarning,
  UserCheck,
  UserPlus,
  Users,
  BriefcaseBusiness,
  Wallet,
  BellRing,
} from "lucide-react";
import Input from "./common/Input";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Static, navigable routes pulled from AppRouter.jsx — dynamic ":id" routes
// (e.g. campaign/influencer/community/business detail pages) aren't included
// since they need a real record, not just a label to search for.
const SEARCH_INDEX = [
  { label: "Dashboard", path: "/dashboard", group: "General", icon: LayoutDashboard },

  { label: "Campaigns", path: "/campaigns", group: "Campaigns", icon: Megaphone },
  { label: "Create Campaign", path: "/campaigns/create", group: "Campaigns", icon: Megaphone },
  { label: "Campaign Claims", path: "/campaigns/claims", group: "Campaigns", icon: FileWarning },

  { label: "Influencers", path: "/influencers", group: "Influencers", icon: UserCheck },
  { label: "Add Influencer", path: "/influencers/create", group: "Influencers", icon: UserPlus },

  { label: "Communities", path: "/communities", group: "Communities", icon: Users },
  { label: "Add Community", path: "/communities/create", group: "Communities", icon: Users },

  { label: "Businesses", path: "/businesses", group: "Businesses", icon: BriefcaseBusiness },
  { label: "Add Business", path: "/businesses/create", group: "Businesses", icon: BriefcaseBusiness },

  { label: "Payments", path: "/payments", group: "Finance", icon: Wallet },

  { label: "Notifications", path: "/notifications", group: "Account", icon: BellRing },
  { label: "Settings", path: "/settings", group: "Account", icon: Settings },
  { label: "Change Password", path: "/settings/password", group: "Account", icon: Lock },
];

export default function Navbar() {
  const navigate = useNavigate();
  const {user,logout}=useAuth()
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const query = search.trim().toLowerCase();
  const results = query ? SEARCH_INDEX.filter((item) => item.label.toLowerCase().includes(query)) : [];

  const groupedResults = results.reduce((acc, item) => {
    acc[item.group] = acc[item.group] || [];
    acc[item.group].push(item);
    return acc;
  }, {});

  const goToResult = (path) => {
    navigate(path);
    setSearch("");
    setSearchOpen(false);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && results.length > 0) {
      goToResult(results[0].path);
    }
    if (e.key === "Escape") {
      setSearchOpen(false);
    }
  };

  return (
    <header className="flex h-20 items-center justify-between border-b border-white/10 bg-gradient-to-br from-primary via-secondary to-primary px-8 shadow-lg shadow-primary/20">
      <div className="block w-full flex-1" />

      {/* Right */}
      <div className="flex items-center gap-5">
        {/* Search */}
        <div className="relative w-[300px] lg:w-[350px]" ref={searchRef}>
          <Input
            name="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search anything..."
            leftIcon={<Search size={18} />}
          />

          {searchOpen && query && (
            <div className="absolute left-0 right-0 z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl shadow-gray-200/60">
              {results.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-gray-400">
                  No pages match "{search}".
                </p>
              ) : (
                Object.entries(groupedResults).map(([group, items]) => (
                  <div key={group} className="border-b border-gray-50 py-2 last:border-none">
                    <p className="px-4 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      {group}
                    </p>
                    {items.map((item) => (
                      <button
                        key={item.path}
                        type="button"
                        onClick={() => goToResult(item.path)}
                        className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                      >
                        <item.icon size={15} className="shrink-0 text-primary" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Notification */}
        <button
          type="button"
          aria-label="Notifications"
          onClick={() => navigate("/notifications")}
          className="relative rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <Bell size={20} />
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white ring-2 ring-primary">
            1
          </span>
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex cursor-pointer items-center gap-3 rounded-xl bg-white/10 px-2 py-2 transition hover:bg-white/20"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tertiary font-semibold text-primary">
             { user?.firstName?.split("")?.[0]}
            </div>

            <div className="hidden text-left sm:block">
              <h4 className="text-sm font-semibold text-white">{user?.firstName} {user?.lastName}</h4>
              <p className="text-xs text-white/60">{user?.role}</p>
            </div>

            <ChevronDown
              size={18}
              className={`text-white/70 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </button>

          {open && (
            <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl shadow-gray-200/60">
              <Link
                to="/settings"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50"
              >
                <Settings size={16} />
                <span>Settings</span>
              </Link>
              <Link
                to="/settings/password"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50"
              >
                <Lock size={16} />
                <span>Change Password</span>
              </Link>

              <div className="border-t border-gray-100" />

              <button
                type="button"
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}