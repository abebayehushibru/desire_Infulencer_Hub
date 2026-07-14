import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";

export default function Table({ columns, data }) {
  const [openMenu, setOpenMenu] = useState(null);

  return (
    <div className="overflow-x-auto bg-white">
      <table className="w-full">
        <thead className="  bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 text-left text-sm font-semibold text-gray-400"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-gray-200 last:border-none hover:bg-gray-50"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-4 py-3 text-xs text-gray-700"
                >
                  {column.render
                    ? column.render(row[column.key], row,rowIndex)
                    : row[column.key]}
                </td>
              ))}
            </tr>
          ))}

          {!data.length && (
            <tr>
              <td
                colSpan={columns.length}
                className="py-10 text-center text-gray-500"
              >
                No data found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ----------------------------
   Reusable Action Menu
-----------------------------*/

export function ActionMenu({
  onEdit,
  onDelete,
  index,
  active,
  setActive,
}) {
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        // setActive?.(null);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [setActive]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() =>
          setActive(active === index ? null : index)
        }
        className="p-2 rounded-lg hover:bg-gray-100"
      >
        <MoreVertical size={18} />
      </button>

      {active === index && (
        <div
          className={`absolute right-0 z-50 w-40 bg-white border border-gray-200 rounded-xl shadow-lg ${
            index > 1
              ? "bottom-full mb-2"
              : "top-full mt-2"
          }`}
        >
          <button
            onClick={() => {
              
              onEdit?.();
              // setActive(null);
            }}
            className="w-full px-4 py-3 text-left hover:bg-gray-100"
          >
            Edit
          </button>

          {onDelete && (
            <button
              onClick={() => {
                // setActive(null);
                onDelete();
              }}
              className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}