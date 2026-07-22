import { useEffect, useRef } from "react";
import { MoreVertical, Pencil, Trash2, Inbox, EyeIcon } from "lucide-react";

export default function Table({ columns, data }) {
  return (
    <div className="overflow-hidden rounded-lg  border border-gray-100">
      <div className=" relative overflow-x-auto scroll-container">
        <table className="w-full">
          <thead className=" sticky bg-primary">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="whitespace-nowrap px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-50"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className={`${rowIndex%2==1?"":"bg-primary/10"} cursor-pointer transition-colors text-gray-700 hover:text-gray-100  hover:bg-tertiary/50`}>
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-2 text-sm ">
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

export function ActionMenu({ onEdit, onDelete,onView, index, active, setActive }) {
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      console.log();
      
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        // setActive?.(null);
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
            className="flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-600 transition hover:bg-gray-50"
          >
            <Pencil size={14} /> Edit
          </button>
             {onView && (
            <button
              onClick={() => {
                onView();
                setActive?.(null);
              }}
                className="flex w-full  cursor-pointer items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-600 transition hover:bg-gray-50"
       >
              <EyeIcon size={14} /> View
            </button>
          )}

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