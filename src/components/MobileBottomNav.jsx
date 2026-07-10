import {
  Home,
  Megaphone,
  MessageCircle,
  DollarSign,
  User,
} from "lucide-react";

import { NavLink, useLocation } from "react-router-dom";

const menus = [
  {
    name: "Home",
    icon: Home,
    path: "/",
  },
  {
    name: "Campaigns",
    icon: Megaphone,
    path: "/campaigns/claims",
  },
  {
    name: "Chats",
    icon: MessageCircle,
    path: "/chats",
  },
  {
    name: "Earnings",
    icon: DollarSign,
    path: "/earnings",
  },
  {
    name: "Profile",
    icon: User,
    path: "/profile",
  },
];

export default function MobileBottomNav() {
      const location = useLocation();
 const checkForActive = (path) => {
  // 1. Remove slash at index 0 from current URL path if it exists
  const currentPath = location.pathname.startsWith('/') 
    ? location.pathname.slice(1) 
    : location.pathname; 
  
  // 2. Remove slash at index 0 from the input path argument if it exists
  const cleanComparePath = path?.startsWith('/') 
    ? path.slice(1) 
    : path;

  // 3. Check if the current URL path includes the clean comparison path
  const matchedTab = currentPath.includes(cleanComparePath);
  
  return matchedTab;
};

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">

      <div className="bg-white shadow-xl border border-gray-200 p-2 flex justify-around">

        {menus.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center rounded-2xl transition-all px-4 py-3 min-w-[68px]
                ${
                  isActive||checkForActive(item.path)
                    ? "bg-primary/10 text-primary"
                    : "text-gray-500"
                }`
              }
            >
              <Icon size={24} />

              <span className="text-xs mt-2 font-medium">
                {item.name}
              </span>
            </NavLink>
          );
        })}

      </div>

    </nav>
  );
}