import {
  Home,
  Megaphone,
  MessageCircle,
  DollarSign,
  User,
  Wallet,
  Users,
  Building2,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const menus = {
  influencer: [
    { name: "Home", icon: Home, path: "/dashboard" },
    { name: "Campaigns", icon: Megaphone, path: "/campaigns" },
    { name: "Chats", icon: MessageCircle, path: "/chats" },
    { name: "Earnings", icon: DollarSign, path: "/earnings" },
    { name: "Profile", icon: User, path: "/profile" },
  ],

  business: [
    { name: "Home", icon: Home, path: "/dashboard" },
    { name: "Campaigns", icon: Megaphone, path: "/campaigns" },
    { name: "Chats", icon: MessageCircle, path: "/chats" },
    { name: "Wallet", icon: Wallet, path: "/wallet" },
    { name: "Profile", icon: User, path: "/profile" },
  ],

  admin: [
    { name: "Dashboard", icon: Home, path: "/dashboard" },
    { name: "Businesses", icon: Building2, path: "/businesses" },
    { name: "Influencers", icon: Users, path: "/influencers" },
    { name: "Chats", icon: MessageCircle, path: "/chats" },
    { name: "Profile", icon: User, path: "/profile" },
  ],
  super_admin: [
    { name: "Dashboard", icon: Home, path: "/dashboard" },
    { name: "Businesses", icon: Building2, path: "/businesses" },
    { name: "Influencers", icon: Users, path: "/influencers" },
    { name: "Chats", icon: MessageCircle, path: "/chats" },
    { name: "Profile", icon: User, path: "/profile" },
  ],
};

export default function MobileBottomNav() {
  const { user } = useAuth();
  const role = user?.role || "influencer";
  const roleMenus = menus[role] || menus.influencer;

  const checkForActive = (path) => {
    const currentPath = window.location.pathname.startsWith("/")
      ? window.location.pathname.slice(1)
      : window.location.pathname;

    const cleanComparePath = path?.startsWith("/") ? path.slice(1) : path;

    return currentPath.includes(cleanComparePath);
  };

  return (
    <div
      className="
        fixed bottom-0 left-0 right-0 z-[999]
        bg-white/80 backdrop-blur-lg
        border-t border-gray-100
        shadow-[0_-4px_20px_rgba(0,0,0,0.06)]
        px-2 pt-2
        pb-[calc(0.5rem+env(safe-area-inset-bottom))]
        flex justify-around
        animate-[slideUp_0.4s_ease-out]
      "
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes popIn {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes iconBounce {
          0%, 100% { transform: translateY(0); }
          40% { transform: translateY(-3px); }
        }
      `}</style>

      {roleMenus.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => {
              const active = isActive || checkForActive(item.path);
              return `
                group relative flex flex-col items-center justify-center
                rounded-lg px-3 py-2 min-w-[68px]
                transition-all duration-300 ease-out
                active:scale-90
                ${active ? "text-primary" : "text-gray-400 hover:text-gray-600"}
              `;
            }}
          >
            {({ isActive }) => {
              const active = isActive || checkForActive(item.path);
              return (
                <>
                  {/* animated active pill background */}
                  <span
                    className={`
                      absolute inset-0 rounded-2xl bg-primary/10
                      transition-all duration-300 ease-out
                      ${
                        active
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-75"
                      }
                    `}
                    style={active ? { animation: "popIn 0.35s ease-out" } : {}}
                  />

                  <Icon
                    size={20}
                    strokeWidth={active ? 2.4 : 2}
                    className="relative z-10 transition-transform duration-300 ease-out"
                    style={
                      active
                        ? { animation: "iconBounce 0.4s ease-out" }
                        : {}
                    }
                  />

                  <span
                    className={`
                      relative z-10 text-[10px] mt-1
                      transition-all duration-300
                      ${active ? "font-semibold" : "font-medium"}
                    `}
                  >
                    {item.name}
                  </span>

                  {/* active dot indicator */}
                  <span
                    className={`
                      absolute -bottom-0.5 left-1/2 -translate-x-1/2
                      w-1 h-1 rounded-full bg-primary
                      transition-all duration-300 ease-out
                      ${active ? "opacity-100 scale-100" : "opacity-0 scale-0"}
                    `}
                  />
                </>
              );
            }}
          </NavLink>
        );
      })}
    </div>
  );
}