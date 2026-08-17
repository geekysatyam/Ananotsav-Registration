import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DOB_MIN_YEAR, parseIsoDate, toIsoDate } from "@/lib/validators";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function startOfMonth(year, monthIndex) {
  return new Date(year, monthIndex, 1);
}

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function sameDay(a, b) {
  return (
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * DOB calendar with month/year dropdowns.
 * Renders the popover in a portal so overflow:hidden parents cannot clip it.
 */
export function DobPicker({
  value,
  onChange,
  error = false,
  disabled = false,
  id,
  maxDate = new Date(),
  minYear = DOB_MIN_YEAR,
  defaultAgeYears = 18,
}) {
  const selected = parseIsoDate(value);
  const max = maxDate instanceof Date ? maxDate : new Date();
  const maxYear = max.getFullYear();

  const fallbackView = new Date(maxYear - defaultAgeYears, 0, 1);
  const initialView = selected ?? fallbackView;
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(initialView.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialView.getMonth());
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 320 });

  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  const years = useMemo(() => {
    const list = [];
    for (let y = maxYear; y >= minYear; y -= 1) list.push(y);
    return list;
  }, [maxYear, minYear]);

  const cells = useMemo(() => {
    const first = startOfMonth(viewYear, viewMonth);
    const total = daysInMonth(viewYear, viewMonth);
    const startPad = first.getDay();
    const out = [];
    for (let i = 0; i < startPad; i += 1) out.push(null);
    for (let d = 1; d <= total; d += 1) out.push(new Date(viewYear, viewMonth, d));
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [viewYear, viewMonth]);

  const displayLabel = selected
    ? selected.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Select date of birth";

  const isDisabledDay = (day) => {
    if (!day) return true;
    const t = new Date(day);
    t.setHours(0, 0, 0, 0);
    const m = new Date(max);
    m.setHours(0, 0, 0, 0);
    return t > m || t.getFullYear() < minYear;
  };

  const shiftMonth = (delta) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    if (next.getFullYear() < minYear || next.getFullYear() > maxYear) return;
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  useLayoutEffect(() => {
    if (!open) return;

    const place = () => {
      const el = triggerRef.current;
      const panel = panelRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const gap = 8;
      const pad = 12;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Keep a compact calendar on desktop — stretching to the field width
      // makes aspect-square days huge and clips the last week.
      const width = Math.min(320, vw - pad * 2);
      const left = Math.min(
        Math.max(pad, rect.left + (rect.width - width) / 2),
        vw - width - pad,
      );
      const panelH = panel?.offsetHeight || 340;
      const spaceBelow = vh - rect.bottom - gap - pad;
      const spaceAbove = rect.top - gap - pad;
      const openBelow = spaceBelow >= panelH || spaceBelow >= spaceAbove;
      let top = openBelow ? rect.bottom + gap : rect.top - gap - panelH;
      top = Math.min(Math.max(pad, top), vh - pad - Math.min(panelH, vh - pad * 2));
      setCoords({ top, left, width });
    };

    place();
    const id = requestAnimationFrame(place);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, viewMonth, viewYear]);

  const calendar = open
    ? createPortal(
        <>
          <button
            type="button"
            aria-label="Close calendar"
            className="fixed inset-0 z-[80] cursor-default bg-black/20"
            onClick={() => setOpen(false)}
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Choose date of birth"
            style={{
              top: coords.top,
              left: coords.left,
              width: coords.width,
            }}
            className="fixed z-[90] rounded-2xl border border-primary/20 bg-card p-3 shadow-xl ring-1 ring-primary/10"
          >
            <div className="mb-3 flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => shiftMonth(-1)}
                className="grid h-8 w-8 place-items-center rounded-lg text-secondary hover:bg-primary/10"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="min-h-8 flex-1 rounded-lg border border-primary/25 bg-background px-2 text-sm font-semibold outline-none focus:border-primary"
              >
                {MONTHS.map((name, i) => (
                  <option key={name} value={i}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="min-h-8 w-[5.5rem] rounded-lg border border-primary/25 bg-background px-2 text-sm font-semibold outline-none focus:border-primary"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => shiftMonth(1)}
                className="grid h-8 w-8 place-items-center rounded-lg text-secondary hover:bg-primary/10"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-1 grid grid-cols-7 gap-0.5 text-center text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
              {WEEKDAYS.map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {cells.map((day, i) => {
                if (!day) return <div key={`e-${i}`} />;
                const disabledDay = isDisabledDay(day);
                const isSelected = sameDay(day, selected);
                const isToday = sameDay(day, new Date());
                return (
                  <button
                    key={toIsoDate(day)}
                    type="button"
                    disabled={disabledDay}
                    onClick={() => {
                      onChange(toIsoDate(day));
                      setOpen(false);
                    }}
                    className={cn(
                      "grid h-9 place-items-center rounded-lg text-sm font-semibold transition-colors",
                      disabledDay && "cursor-not-allowed text-muted-foreground/30",
                      !disabledDay && !isSelected && "hover:bg-primary/15 text-foreground",
                      isSelected && "bg-gradient-gold text-primary-foreground shadow-warm",
                      isToday && !isSelected && "ring-1 ring-secondary/40",
                    )}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </>,
        document.body,
      )
    : null;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => {
          const next = !open;
          if (next) {
            const view = selected ?? new Date(maxYear - defaultAgeYears, 0, 1);
            setViewYear(view.getFullYear());
            setViewMonth(view.getMonth());
          }
          setOpen(next);
        }}
        className={cn(
          "flex min-h-10 w-full items-center justify-between gap-2 rounded-xl border-2 bg-background px-3 text-left text-base outline-none transition-colors sm:min-h-11 sm:rounded-2xl sm:px-4",
          error
            ? "border-destructive/60 focus:border-destructive focus:ring-2 focus:ring-destructive/20"
            : "border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 sm:focus:ring-4",
          !selected && "text-muted-foreground/70",
          disabled && "opacity-60",
        )}
      >
        <span className="truncate">{displayLabel}</span>
        <CalendarDays className="h-4 w-4 shrink-0 text-secondary" />
      </button>
      {calendar}
    </div>
  );
}
