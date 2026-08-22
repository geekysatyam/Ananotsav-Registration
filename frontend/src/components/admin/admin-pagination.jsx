import { ChevronLeft, ChevronRight } from "lucide-react";

export const ADMIN_PAGE_SIZE = 15;

/**
 * Simple prev/next pager for admin list pages.
 * @param {{ page: number, total: number, pageSize?: number, onPageChange: (page: number) => void, disabled?: boolean }} props
 */
export function AdminPagination({
  page,
  total,
  pageSize = ADMIN_PAGE_SIZE,
  onPageChange,
  disabled = false,
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  if (total === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-muted-foreground">
        Showing {from.toLocaleString("en-IN")}–{to.toLocaleString("en-IN")} of{" "}
        {total.toLocaleString("en-IN")}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex min-h-9 items-center gap-1 rounded-xl border-2 border-primary/25 bg-card px-3 text-sm font-semibold text-secondary outline-none hover:border-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </button>
        <span className="min-w-[5.5rem] text-center text-xs font-semibold text-muted-foreground">
          Page {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={disabled || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex min-h-9 items-center gap-1 rounded-xl border-2 border-primary/25 bg-card px-3 text-sm font-semibold text-secondary outline-none hover:border-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
