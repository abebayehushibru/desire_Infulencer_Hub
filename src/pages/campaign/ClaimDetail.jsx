// src/pages/mobile/ClaimDetail.jsx

import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Share2,
  PlayCircle,
  MessageCircle,
  BarChart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

const SWIPE_THRESHOLD = 60; // px needed to trigger a tab change
const MAX_DRAG_RESISTANCE = 90; // px cap so the drag doesn't fly off-screen

export default function ClaimDetail() {
  const loc = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      path: `/campaigns/${id}`,
      icon: <BarChart size={18} />,
    },
    {
      id: "contents",
      label: "Contents",
      path: `/campaigns/${id}/contents`,
      icon: <PlayCircle size={18} />,
    },
    {
      id: "chat",
      label: "Chat",
      path: `/campaigns/${id}/chat`,
      icon: <MessageCircle size={18} />,
    },
  ];

  // Derive the active tab from the actual URL rather than search params,
  // so it stays correct on refresh, back/forward nav, and swipe.
  const activeIndex = useMemo(() => {
    const idx = tabs.findIndex((tab) =>
      tab.id === "overview"
        ? loc.pathname === tab.path
        : loc.pathname.startsWith(tab.path)
    );
    return idx === -1 ? 0 : idx;
  }, [loc.pathname, id]);

  const handleBack = () => navigate(-1);

  const goToTab = (index) => {
    if (index < 0 || index >= tabs.length) return;
    navigate(tabs[index].path);
  };

  // ---------------- Swipe handling ----------------
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const lockedAxis = useRef(null); // "x" | "y" | null

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    lockedAxis.current = null;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (touchStartX.current === null) return;

    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    // Decide once whether this gesture is horizontal or vertical, so a
    // vertical scroll inside a tab's content never gets hijacked.
    if (lockedAxis.current === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      lockedAxis.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }

    if (lockedAxis.current !== "x") return;

    // Prevent overscrolling past the first/last tab, with resistance.
    const atStart = activeIndex === 0 && dx > 0;
    const atEnd = activeIndex === tabs.length - 1 && dx < 0;
    const resisted = atStart || atEnd ? dx / 3 : dx;

    setDragX(Math.max(-MAX_DRAG_RESISTANCE, Math.min(MAX_DRAG_RESISTANCE, resisted)));
  };

  const handleTouchEnd = () => {
    if (lockedAxis.current === "x") {
      if (dragX <= -SWIPE_THRESHOLD) {
        goToTab(activeIndex + 1);
      } else if (dragX >= SWIPE_THRESHOLD) {
        goToTab(activeIndex - 1);
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    lockedAxis.current = null;
    setIsDragging(false);
    setDragX(0);
  };
 const location = useLocation();
    const isChatRoute = /^\/campaigns\/[^/]+\/chat$/.test(location.pathname);
  return (
    <div className="flex min-h-screen flex-1 bg-gray-500 flex-col text-primary -m-4">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .tab-content-in {
          animation: fadeIn 0.2s ease-out both;
        }
      `}</style>

      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between gap-4 px-1 py-2">
          <button
            onClick={handleBack}
            className="rounded-full p-1.5 transition-colors duration-200 hover:bg-gray-100 active:scale-90"
            aria-label="Go back"
          >
            <ArrowLeft size={22} />
          </button>

          <h2 className="flex-1 text-sm font-semibold">
            {tabs[activeIndex]?.label || "Campaign"}
          </h2>

          <button
            className="rounded-full p-1.5 transition-colors duration-200 hover:bg-gray-100 active:scale-90"
            aria-label="Share"
          >
            <Share2 size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="relative flex overflow-x-auto">
          {tabs.map((tab, index) => (
            <NavLink
              key={tab.id}
              to={tab.path}
              end={tab.id === "overview"}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 p-2 pt-0 pb-3 font-semibold transition-colors duration-200 ${
                index === activeIndex
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-primary"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Swipe edge hints — fade in briefly while dragging near a boundary */}
      <div className="relative flex-1  flex flex-col bg-gray-100 w-full p-4 overflow-hidden">
        {isDragging && dragX > 20 && activeIndex > 0 && (
          <div className="pointer-events-none absolute left-2 top-1/2 z-10 -translate-y-1/2 text-gray-300 transition-opacity">
            <ChevronLeft size={28} />
          </div>
        )}
        {isDragging && dragX < -20 && activeIndex < tabs.length - 1 && (
          <div className="pointer-events-none absolute right-2 top-1/2 z-10 -translate-y-1/2 text-gray-300 transition-opacity">
            <ChevronRight size={28} />
          </div>
        )}

        {/* Body — swipeable */}
        <div
          className="flex min-h-full flex-1 flex-col w-full overflow-y-auto"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: `translateX(${dragX}px)`,
            transition: isDragging ? "none" : "transform 0.25s ease-out",
          }}
        >
          <div key={loc.pathname} className="tab-content-in relative flex-1 h-full flex flex-col w-full   min-h-full">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, title, value }) {
  return (
    <div className="flex gap-3">
      <div className="mt-1 text-primary">{icon}</div>

      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h4 className="font-semibold">{value}</h4>
      </div>
    </div>
  );
}