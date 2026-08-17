import { memo } from "react";
import { Medal } from "lucide-react";
import { PatternBackdrop } from "./motifs";

export const LeaderboardList = memo(function LeaderboardList({ rows }) {
  const medal = [
    "from-[oklch(0.82_0.14_85)]",
    "from-[oklch(0.82_0.02_250)]",
    "from-[oklch(0.7_0.1_50)]",
  ];

  return (
    <div className="space-y-3">
      {rows.map((r, i) => (
        <div
          key={`${r.rank}-${r.fullName}`}
          className={`rounded-2xl p-[2px] shadow-warm ${i < 3 ? `bg-gradient-to-r ${medal[i]} to-transparent` : "bg-primary/25"}`}
        >
          <div
            className={`relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 overflow-hidden rounded-[calc(1rem-1px)] px-4 py-4 sm:px-6 ${i % 2 ? "bg-background/85" : "bg-card/95"}`}
          >
            <PatternBackdrop variant="feather" className="text-secondary opacity-[0.05]" />
            <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/20 font-display text-xl text-secondary ring-1 ring-primary/40">
              {i < 3 ? (
                <Medal className="h-7 w-7 text-primary" strokeWidth={2.4} />
              ) : (
                r.rank
              )}
            </div>
            <div className="relative min-w-0">
              <div className="truncate font-display text-lg sm:text-xl">{r.fullName}</div>
            </div>
            <div className="relative text-right">
              <div className="font-display text-2xl text-secondary tabular-nums">{r.referralCount}</div>
              <div className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">referrals</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});
