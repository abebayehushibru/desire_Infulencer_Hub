import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, LogOut, Search, Settings } from "lucide-react";
import Input from "./common/Input";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex h-20 items-center justify-between border-b border-white/10 bg-gradient-to-br from-primary via-secondary to-primary px-8 shadow-lg shadow-primary/20">
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
          className="relative rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <Bell size={20} />
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white ring-2 ring-primary">
            3
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
              D
            </div>

            <div className="hidden text-left sm:block">
              <h4 className="text-sm font-semibold text-white">Desire Online School</h4>
              <p className="text-xs text-white/60">Business</p>
            </div>

            <ChevronDown
              size={18}
              className={`text-white/70 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </button>

          {open && (
            <div className="absolute w-full right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl shadow-gray-200/60">
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
                onClick={() => {
                  console.log("Logout");
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