import { Bell, Menu } from "lucide-react";

export default function MobileHeader() {
  return (
    <header className="sticky top-0 bg-white border-b border-gray-200 z-40">

      <div className="h-16 flex items-center justify-between px-4">

        <button>
          <Menu size={24} />
        </button>

        <h1 className="font-bold text-lg text-primary">
          InfluenceHub
        </h1>

        <button className="relative">

          <Bell size={22} />

          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></span>

        </button>

      </div>

    </header>
  );
}