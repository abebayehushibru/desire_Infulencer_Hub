import { useState, useRef, useEffect } from "react";
import {
  Bell,
  Search,
  ChevronDown,
  Settings,
  LogOut,
} from "lucide-react";
import Input from "./common/Input";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  // Build display name from user object, fall back to generic label
  const displayName = user
    ? `${user.firstName} ${user.lastName}`
    : "Account";
  const displayRole = user?.role
    ? user.role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "";
  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  return (
    <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white px-8">
      <div className="block w-full flex-1" />

      {/* Right */}
      <div className="flex items-center gap-5">
        {/* Search */}
        <div className="w-[300px] lg:w-[350px]">
          <Input
            name="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search anything..."
            leftIcon={<Search size={18} />}
          />
        </div>

        {/* Notification */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
        >
          <Bell size={20} />
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
            3
          </span>
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-gray-100"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary via-secondary to-primary font-semibold text-white">
              {initials}
            </div>

            <div className="hidden text-left sm:block">
              <h4 className="text-sm font-semibold text-gray-800">{displayName}</h4>
              <p className="text-xs text-gray-400">{displayRole}</p>
            </div>

            <ChevronDown
              size={18}
              className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </button>

          {open && (
            <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl shadow-gray-200/60">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50"
              >
                <Settings size={16} />
                <span>Settings</span>
              </button>

              <div className="border-t border-gray-100" />

              <button
                type="button"
                onClick={handleLogout}
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
