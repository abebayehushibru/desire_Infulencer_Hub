import { useEffect, useRef } from "react";
import { MoreVertical, Pencil, Trash2, Inbox } from "lucide-react";

export default function Table({ columns, data }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-100">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/80">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="transition-colors hover:bg-gray-50/70">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3.5 text-sm text-gray-700">
                    {column.render
                      ? column.render(row[column.key], row, rowIndex)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}

            {!data.length && (
              <tr>
                <td colSpan={columns.length} className="py-14 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Inbox size={28} strokeWidth={1.5} />
                    <span className="text-sm">No data found.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ----------------------------
   Reusable Action Menu
-----------------------------*/

export function ActionMenu({ onEdit, onDelete, index, active, setActive }) {
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActive?.(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setActive]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setActive(active === index ? null : index)}
        className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
      >
        <MoreVertical size={18} />
      </button>

      {active === index && (
        <div
          className={`absolute right-0 z-50 w-40 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg shadow-gray-200/60 ${
            index > 1 ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          <button
            onClick={() => {
              onEdit?.();
              setActive?.(null);
            }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-600 transition hover:bg-gray-50"
          >
            <Pencil size={14} /> Edit
          </button>

          {onDelete && (
            <button
              onClick={() => {
                onDelete();
                setActive?.(null);
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}