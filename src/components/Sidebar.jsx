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
  ShieldCog,
  X,
  Info,
} from "lucide-react";
import { useState } from "react";
import logo from "../assets/logo1.png"
import { Link } from "react-router-dom";
const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Campaigns", icon: Megaphone },
  { name: "Influencers", icon: UserCheck },
  { name: "Communities", icon: Users },
  { name: "Analytics", icon: BarChart3 },
  { name: "Earnings", icon: Wallet },
  { name: "Payments", icon: CreditCard },
  { name: "Notifications", icon: Bell },
  { name: "Settings", icon: Settings },
];

export default function Sidebar() {
  const [showCard, setShowCard] = useState(true);


  return (
    <aside className="w-72 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="h-20 flex  items-center px-6 border-b border-gray-200">
        <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold">
          <img src={logo}></img>
        </div>

        <div className="ml-1 text-primary">
          <h2 className="font-bold text-xl">influenceHub</h2>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 p-4 ">

        <ul className="space-y-1  max-h-full overflow-hidden ">
          {menuItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <li key={index}>
                <Link
                  to={item?.name?.toLowerCase()}
                  className={`w-full flex items-center gap-3 px-4 font-300 py-3 rounded-xl transition
                  ${index === 0
                      ? "bg-primary/10 text-primary"
                      : "b  hover:bg-gray-100 text-gray-500 "
                    }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>


      </div>

      {/* User */}
      <div className=" relative border-t-1 p-4 border-gray-200">
        {/* Verified Card */}
       {showCard&& <div className=" w-full absolute bottom-full pr-4 mb-4  flex-1">
          {/* Close Button */}
          <button
            onClick={() => setShowCard(false)}
            className="absolute right-3 top-3 mr-8 cursor-pointer rounded-full p-1 text-gray-400 transition hover:bg-white hover:text-gray-700"
          >
            <X size={18} />
          </button>

          <div className="flex items-start gap-3 mr-4 flex-1 rounded-lg border border-gray-200 bg-gradient-to-br from-primary via-secondary to-primary p-4  ">
            <ShieldCheck className="mt-1 text-green-600" size={24} />

            <div>
              <h4 className="font-semibold text-sm text-white">
                Business Verified
              </h4>
              <button className="mt-1 text-xs font-medium text-tertiary hover:underline">
                View Documents
              </button>
            </div>
          </div>
        </div>}
        <div className="flex items-center gap-3">
          <img
            src="https://i.pravatar.cc/150?img=12"
            alt=""
            className="w-10 h-10 rounded-full"
          />
          {/* Close Button */}
          {!showCard&&<button
            onClick={() => setShowCard(true)}
            className="absolute right-3 top-3 mr-1 rounded-full cursor-pointer p-1 text-gray-400 transition hover:bg-white hover:text-gray-700"
          >
            <Info size={18} />
          </button>}

          <div>
            <h4 className="font-medium text-gray-800 text-sm ">
              Desire Online School
            </h4>

            <p className="text-xs text-gray-500">
              Business
            </p>
          </div>
        </div>

      </div>
    </aside>
  );
}