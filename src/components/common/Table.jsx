import { useEffect, useRef, useState } from "react";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Inbox,
  Eye,
  Play,
  XCircle,
  CheckCircle,
  DollarSign,
} from "lucide-react";

/* ----------------------------
   Table
-----------------------------*/

export default function Table({ columns, data, loading = false }) {
  const skeletonRows = 5;
  const rows = Array.isArray(data) ? data : [];

  return (
    <div className="overflow-hidden rounded-xl poppins border border-slate-200 bg-white shadow-sm">
      <div className="relative max-h-full overflow-auto">
        <table className="w-full border-collapse">
          <thead className="p-0 z-10">
            <tr className="bg-primary">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="whitespace-nowrap px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-300"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`}>
                  {columns.map((column) => (
                    <td key={column.key} className="px-5 py-4">
                      <div className="relative h-3.5 w-3/4 overflow-hidden rounded-full bg-slate-100">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length ? (
              rows.map((row, rowIndex) => (
                <tr
                  key={row.id ?? rowIndex}
                  className="group text-sm text-slate-600 transition-colors odd:bg-slate-50/60 hover:bg-indigo-50/50"
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-5 py-3.5 align-middle">
                      {column.render
                        ? column.render(row[column.key], row, rowIndex)
                        : (
                          <span className="text-slate-700">{row[column.key]}</span>
                        )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2.5 text-slate-400">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
                      <Inbox size={20} strokeWidth={1.5} />
                    </span>
                    <span className="text-sm font-medium text-slate-500">No data found</span>
                    <span className="text-xs text-slate-400">
                      There&apos;s nothing to show here yet.
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

/* ----------------------------
   Reusable Action Menu
-----------------------------*/

const ACTION_STYLES = {
  neutral: "text-slate-600 hover:bg-slate-50",
  positive: "text-emerald-600 hover:bg-emerald-50",
  caution: "text-amber-600 hover:bg-amber-50",
  info: "text-indigo-600 hover:bg-indigo-50",
  danger: "text-red-600 hover:bg-red-50",
};

function MenuItem({ icon: Icon, label, onClick, tone = "neutral" }) {
  return (
    <button
      onClick={onClick}
      role="menuitem"
      className={`flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium transition-colors ${ACTION_STYLES[tone]}`}
    >
      <Icon size={15} strokeWidth={2} />
      {label}
    </button>
  );
}

export function ActionMenu({
  onEdit,
  onDelete,
  onView,
  onApprove,
  onAccept,
  onReject,
  onMakeActive,
  onAddPayment,
  index,
  active,
  setActive,
}) {
  const menuRef = useRef(null);
  const isOpen = active === index;

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActive(null);
      }
    }
    function handleEscape(event) {
      if (event.key === "Escape") setActive(null);
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, setActive]);

  const primaryActions = [
    onView && { icon: Eye, label: "View", onClick: onView, tone: "neutral" },
    onEdit && { icon: Pencil, label: "Edit", onClick: onEdit, tone: "neutral" },
  ].filter(Boolean);

  const statusActions = [
    onApprove && { icon: CheckCircle, label: "Approve", onClick: onApprove, tone: "positive" },
    onAccept && { icon: CheckCircle, label: "Accept", onClick: onAccept, tone: "positive" },
    onReject && { icon: XCircle, label: "Reject", onClick: onReject, tone: "caution" },
    onMakeActive && { icon: Play, label: "Activate", onClick: onMakeActive, tone: "info" },
    onAddPayment && { icon: DollarSign, label: "Add payment", onClick: onAddPayment, tone: "positive" },
  ].filter(Boolean);

  const destructiveActions = [
    onDelete && { icon: Trash2, label: "Delete", onClick: onDelete, tone: "danger" },
  ].filter(Boolean);

  const groups = [primaryActions, statusActions, destructiveActions].filter((g) => g.length);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setActive(isOpen ? null : index)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={`rounded-lg p-2 text-slate-400 outline-none transition hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-500 ${
          isOpen ? "bg-slate-100 text-slate-700" : ""
        }`}
      >
        <MoreVertical size={18} />
      </button>

      {isOpen && (
        <div
          role="menu"
          className={`absolute right-0 z-50 w-48 origin-top-right overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg shadow-slate-900/10 ring-1 ring-black/5 transition duration-150 ease-out animate-[menuIn_0.12s_ease-out] ${
            index > 1 ? "bottom-full mb-2 origin-bottom-right" : "top-full mt-2"
          }`}
        >
          {groups.map((group, i) => (
            <div key={i}>
              {i > 0 && <div className="my-1.5 border-t border-slate-100" />}
              {group.map((action, j) => (
                <MenuItem
                  key={j}
                  icon={action.icon}
                  label={action.label}
                  tone={action.tone}
                  onClick={() => {
                    action.onClick();
                    setActive(null);
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes menuIn {
          from { opacity: 0; transform: scale(0.96) translateY(-4px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ----------------------------
   Demo (usage example)
-----------------------------*/

function StatusBadge({ status }) {
  const styles = {
    Active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    Pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
    Rejected: "bg-red-50 text-red-700 ring-red-600/20",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${styles[status] || "bg-slate-50 text-slate-600 ring-slate-500/20"}`}
    >
      {status}
    </span>
  );
}

