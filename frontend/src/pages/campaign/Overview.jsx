// src/pages/campaign/Overview.jsx

import {
  Calendar,
  Globe,
  Wallet,
  Target,
  Link2,
  Copy,
  Users,
  Eye,
  MousePointerClick,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function Overview() {
  const stats = [
    {
      title: "Views",
      value: "235.4K",
      icon: Eye,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Clicks",
      value: "18,320",
      icon: MousePointerClick,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Conversions",
      value: "742",
      icon: ShoppingCart,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Revenue",
      value: "371K",
      icon: DollarSign,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div className="space-y-4 text-primary">
      {/* ====================== */}
      {/* Statistics */}
      {/* ====================== */}

      <div className="grid lg:grid-cols-4 grid-cols-2 gap-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-sm">{item.title}</p>

                  <h2 className="text-xl text-primary font-bold mt-2">
                    {item.value}
                  </h2>

                  <p className="text-green-600 text-xs mt-1">
                    +12.5% this week
                  </p>
                </div>

                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}
                >
                  <Icon size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ====================== */}
      {/* Campaign Information */}
      {/* ====================== */}

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Left */}

        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="font-semibold text-lg mb-4">
            Campaign Information
          </h2>

          <div className="grid  md:grid-cols-4 gap-3">
            <Info
              icon={Target}
              title="Campaign Type"
              value="Sales"
            />

            <Info
              icon={Globe}
              title="Platform"
              value="TikTok"
            />

            <Info
              icon={Calendar}
              title="Start Date"
              value="15 July 2026"
            />

            <Info
              icon={Calendar}
              title="End Date"
              value="30 August 2026"
            />

            <Info
              icon={Wallet}
              title="Budget"
              value="500,000 ETB"
            />

            <Info
              icon={Users}
              title="Creators"
              value="45 Joined"
            />
          </div>

          {/* Progress */}

          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold ">
                Budget Used
              </span>

              <span>68%</span>
            </div>

            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="w-[68%] h-full bg-primary rounded-full"></div>
            </div>

            <div className="flex justify-between mt-3 text-sm text-gray-500">
              <span>340,000 ETB Used</span>

              <span>160,000 ETB Remaining</span>
            </div>
          </div>
        </div>

        {/* Right */}

        <div className="space-y-4">
          {/* Status */}

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="font-semibold text-lg mb-4">
              Campaign Status
            </h2>

            <div className="flex items-center gap-2">
              <CheckCircle2
                className="text-green-600"
                size={20}
              />

              <div>
                <h4 className="font-semibold text-sm">
                  Active
                </h4>

                <p className="text-xs text-gray-500">
                  Campaign is currently running.
                </p>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-3">
              <Clock
                className="text-yellow-500"
                size={20}
              />

              <div>
                <h4 className="font-medium text-sm">
                  24 Days Remaining
                </h4>

                <p className="text-xs text-gray-500">
                  Ends on 30 August 2026
                </p>
              </div>
            </div>
          </div>

          {/* Tracking */}

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="font-semibold text-sm mb-4">
              Tracking Link
            </h2>

            <div className="flex items-center justify-between border border-gray-200 rounded-xl p-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <Link2
                  className="text-primary"
                  size={16}
                />

                <p className="truncate text-sm">
                  https://desire.com/ref/ENG2026
                </p>
              </div>

              <button className="text-primary hover:text-primary/80 cursor-pointer ">
                <Copy size={16} />
              </button>
            </div>

    
          </div>
        </div>
      </div>

    
    </div>
  );
}

/* ======================================== */

function Info({ icon: Icon, title, value }) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon
          size={16}
          className="text-primary"
        />
      </div>

      <div>
        <p className="text-gray-500  text-xs truncate">
          {title}
        </p>

        <h4 className="font-semibold  text-sm mt-1">
          {value}
        </h4>
      </div>
    </div>
  );
}

/* ======================================== */

function Summary({ title, value }) {
  return (
    <div className="rounded-lg bg-gray-50 p-5 text-center">
      <p className="text-gray-500 text-sm">
        {title}
      </p>

      <h3 className=" text-sm md:text-sm font-bold mt-2">
        {value}
      </h3>
    </div>
  );
}