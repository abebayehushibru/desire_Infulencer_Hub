import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

/**
 * Drop-in replacement for "./common/Select" in your project.
 * Swap this import back to your real Select component —
 * it's inlined here only so the file renders standalone.
 */
import PageSizeSelect from "./common/Select";

export default function Pagination({
  page = 1,
  totalPages = 1,
  limit = 10,
  total = 0,
  onPageChange,
  onLimitChange,
}) {
  const safeTotalPages = Math.max(1, totalPages);
  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, total);

  const pageNumbers = getPageNumbers(page, safeTotalPages);

  return (
    <nav
      aria-label="Pagination"
      className="mt-3 flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
    >
      {/* Left: page size + result count */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500"> page</span>
          <PageSizeSelect
            name="limit"
            value={limit}
            onChange={(e) => onLimitChange?.(Number(e.target.value))}
            data={[10, 20, 50, 100].map((item) => ({
              label: String(item),
              value: item,
            }))}
            awayFrom="bottom-full"
          />
        </div>

        <span className="hidden text-xs text-gray-500 sm:inline">
          {total === 0 ? (
            "No results"
          ) : (
            <>
              <span className="font-medium text-gray-700">{rangeStart}</span>
              {"–"}
              <span className="font-medium text-gray-700">{rangeEnd}</span> of{" "}
              <span className="font-medium text-gray-700">{total}</span>
            </>
          )}
        </span>
      </div>

      {/* Right: page controls */}
      <div className="flex items-center justify-end gap-1.5">
        <NavButton
          label="First page"
          onClick={() => onPageChange?.(1)}
          disabled={page <= 1}
          className="hidden sm:flex"
        >
          <ChevronsLeft size={16} />
        </NavButton>

        <NavButton
          label="Previous page"
          onClick={() => onPageChange?.(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft size={16} />
        </NavButton>

        <div className="mx-1 flex items-center gap-1">
          {pageNumbers.map((item, i) =>
            item === "…" ? (
              <span
                key={`ellipsis-${i}`}
                className="flex h-9 w-9 items-center justify-center text-sm text-gray-400 select-none"
              >
                …
              </span>
            ) : (
              <button
                key={item}
                onClick={() => onPageChange?.(item)}
                aria-current={item === page ? "page" : undefined}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  item === page
                    ? "bg-tertiary text-primary shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item}
              </button>
            )
          )}
        </div>

        <NavButton
          label="Next page"
          onClick={() => onPageChange?.(page + 1)}
          disabled={page >= safeTotalPages}
        >
          <ChevronRight size={16} />
        </NavButton>

        <NavButton
          label="Last page"
          onClick={() => onPageChange?.(safeTotalPages)}
          disabled={page >= safeTotalPages}
          className="hidden sm:flex"
        >
          <ChevronsRight size={16} />
        </NavButton>
      </div>
    </nav>
  );
}

function NavButton({ label, onClick, disabled, children, className = "" }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 flex ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * Builds a compact page list with ellipses, e.g.
 * 1 … 4 5 [6] 7 8 … 24
 */
function getPageNumbers(page, totalPages, siblings = 1) {
  const totalNumbers = siblings * 2 + 5; // first, last, current, 2 ellipses, siblings

  if (totalPages <= totalNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(page - siblings, 1);
  const rightSibling = Math.min(page + siblings, totalPages);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  const pages = [1];

  if (showLeftEllipsis) pages.push("…");
  for (let i = leftSibling; i <= rightSibling; i++) {
    if (i !== 1 && i !== totalPages) pages.push(i);
  }
  if (showRightEllipsis) pages.push("…");

  pages.push(totalPages);

  return pages;
}
