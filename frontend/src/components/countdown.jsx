import { useEffect, useState } from "react";

export function Countdown({ to, variant = "dark", compact = false }) {
  const [mounted, setMounted] = useState(false);
  const [left, setLeft] = useState(0);

  useEffect(() => {
    setMounted(true);
    setLeft(Math.max(0, +new Date(to) - Date.now()));
  }, [to]);

  useEffect(() => {
    if (!mounted || left <= 0) return;
    const id = setInterval(() => {
      const remaining = Math.max(0, +new Date(to) - Date.now());
      setLeft(remaining);
      if (remaining <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [to, mounted, left <= 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const units = [
    { label: "Days", value: Math.floor(left / 86400000) },
    { label: "Hours", value: Math.floor(left / 3600000) % 24 },
    { label: "Mins", value: Math.floor(left / 60000) % 60 },
  ];

  const cellClass =
    variant === "light"
      ? compact
        ? "jh-countdown-cell rounded-lg px-2 py-1.5 text-center sm:rounded-xl sm:px-2.5 sm:py-2 lg:px-3 lg:py-2"
        : "jh-glass-gold rounded-xl px-3 py-2.5 text-center lg:rounded-2xl lg:px-4 lg:py-3"
      : "rounded-2xl bg-white/10 p-4 text-center lg:p-5";

  const valueClass = compact ? "text-lg sm:text-xl lg:text-2xl" : "text-2xl lg:text-3xl";
  const labelClass =
    variant === "light"
      ? compact
        ? "mt-0.5 text-[8px] font-bold tracking-wide text-[#D89B24] uppercase sm:text-[9px]"
        : "mt-0.5 text-[9px] font-bold tracking-wide text-[#D89B24] uppercase sm:text-[10px] lg:text-xs"
      : "mt-1 text-[10px] text-white/50 uppercase lg:text-xs";

  return (
    <div className={compact ? "mt-2 flex gap-1.5 sm:gap-2 lg:gap-2.5" : "mt-5 grid grid-cols-3 gap-3 lg:gap-4"}>
      {units.map((u) => (
        <div key={u.label} className={`${cellClass} ${compact ? "min-w-0 flex-1" : ""}`}>
          <b className={valueClass} suppressHydrationWarning>
            {mounted ? String(u.value).padStart(2, "0") : "--"}
          </b>
          <div className={labelClass}>{u.label}</div>
        </div>
      ))}
    </div>
  );
}
