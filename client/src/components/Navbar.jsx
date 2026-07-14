import { useState } from "react";
import {
  Bell,
  Search,
  ChevronDown,
  Settings,
  LogOut,
} from "lucide-react";
import Input from "./common/Input";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 h-20 px-8 flex items-center justify-between">
    <div className="flex-1 block w-full "></div>
      {/* Right */}
      <div className="flex items-center gap-6">
        
          {/* Search */}
      <div className="relative w-[350px]">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <Input
          name="search"
          value=""
          onChange={() => {}}
          placeholder="Search anythings..."
          leftIcon={<Search
          size={18}
          className=""
        />}
        />
      </div>

        {/* Notification */}
        <button className="relative text-gray-500">
          <Bell size={22} />

          <span className="absolute -top-1 -right-1 bg-red-500 h-4 w-4 rounded-full text-white text-[10px] flex items-center justify-center">
            3
          </span>
        </button>

        {/* User Dropdown */}
        <div className="relative border-gray-400">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-3  cursor-pointer rounded-lg px-2 py-2 hover:bg-gray-100 transition"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary via-secondary to-primary text-white flex items-center justify-center font-semibold">
              D
            </div>

            <div className="text-left">
              <h4 className="text-sm font-medium text-gray-500">
                Desire Online School
              </h4>
            </div>

            <ChevronDown
              size={18}
              className={`transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-200 z-50">
              <button
                className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
              >
                <Settings size={18} />
                <span>Settings</span>
              </button>

              <div className="border-t border-gray-200 " />

              <button
                className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition"
                onClick={() => {
                  console.log("Logout");
                }}
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}