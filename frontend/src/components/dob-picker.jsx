import { useMemo, useState } from "react";
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
 * DOB calendar with month/year dropdowns — easier than native date input for birth years.
 */
export function DobPicker({
  value,
  onChange,
  error = false,
  disabled = false,
  id,
  maxDate = new Date(),
  minYear = DOB_MIN_YEAR,
}) {
  const selected = parseIsoDate(value);
  const max = maxDate instanceof Date ? maxDate : new Date();
  const maxYear = max.getFullYear();

  const initialView = selected ?? new Date(maxYear - 18, 0, 1);
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(initialView.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialView.getMonth());

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

  return (
    <div className="relative">
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => {
          if (selected) {
            setViewYear(selected.getFullYear());
            setViewMonth(selected.getMonth());
          }
          setOpen((o) => !o);
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

      {open && (
        <>
          <button
            type="button"
            aria-label="Close calendar"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute z-50 mt-2 w-full min-w-[280px] rounded-2xl border border-primary/20 bg-card p-3 shadow-lg ring-1 ring-primary/10 sm:w-[320px]">
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
                      "grid aspect-square place-items-center rounded-lg text-sm font-semibold transition-colors",
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
        </>
      )}
    </div>
  );
}
