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
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-sm">{item.title}</p>

                  <h2 className="text-3xl text-primary font-bold mt-2">
                    {item.value}
                  </h2>

                  <p className="text-green-600 text-sm mt-2">
                    +12.5% this week
                  </p>
                </div>

                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center ${item.color}`}
                >
                  <Icon size={26} />
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
          <h2 className="font-semibold text-xl mb-6">
            Campaign Information
          </h2>

          <div className="grid  md:grid-cols-4 gap-6">
            <Info
              icon={Target}
              title="Campaign Type"
              value="Sales Campaign"
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

          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">
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

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="font-semibold text-lg mb-5">
              Campaign Status
            </h2>

            <div className="flex items-center gap-3">
              <CheckCircle2
                className="text-green-600"
                size={28}
              />

              <div>
                <h4 className="font-semibold">
                  Active
                </h4>

                <p className="text-sm text-gray-500">
                  Campaign is currently running.
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Clock
                className="text-yellow-500"
                size={24}
              />

              <div>
                <h4 className="font-medium">
                  24 Days Remaining
                </h4>

                <p className="text-sm text-gray-500">
                  Ends on 30 August 2026
                </p>
              </div>
            </div>
          </div>

          {/* Tracking */}

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="font-semibold text-lg mb-5">
              Tracking Link
            </h2>

            <div className="flex items-center justify-between border border-gray-200 rounded-xl p-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <Link2
                  className="text-primary"
                  size={20}
                />

                <p className="truncate text-sm">
                  https://desire.com/ref/ENG2026
                </p>
              </div>

              <button className="text-primary hover:text-primary/80">
                <Copy size={18} />
              </button>
            </div>

            <button className="w-full mt-5 rounded-xl bg-primary text-white py-3 font-medium hover:opacity-90">
              Copy Referral Link
            </button>
          </div>
        </div>
      </div>

    
    </div>
  );
}

/* ======================================== */

function Info({ icon: Icon, title, value }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon
          size={20}
          className="text-primary"
        />
      </div>

      <div>
        <p className="text-gray-500 md:text-sm text-xs truncate">
          {title}
        </p>

        <h4 className="font-semibold mt-1 block">
          {value}
        </h4>
      </div>
    </div>
  );
}

/* ======================================== */

function Summary({ title, value }) {
  return (
    <div className="rounded-xl bg-gray-50 p-5 text-center">
      <p className="text-gray-500 text-sm">
        {title}
      </p>

      <h3 className=" text-lg md:text-3xl font-bold mt-2">
        {value}
      </h3>
    </div>
  );
}