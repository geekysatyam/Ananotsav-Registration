import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Trophy, Loader2 } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { SectionHeading, Reveal } from "@/components/festive";
import { FloatingMotifs, GradientMesh } from "@/components/ambient";
import { PatternBackdrop, PeacockFeather, Flourish } from "@/components/motifs";
import { LeaderboardList } from "@/components/leaderboard-list";
import { api } from "@/lib/api";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [{
      title: "Referral Leaderboard — Janmashtami Utsav 2026"
    }, {
      name: "description",
      content: "Live standings of the Janmashtami Utsav referral competition. Search by name and see your rank."
    }, {
      property: "og:title",
      content: "Referral Leaderboard — Janmashtami Utsav 2026"
    }, {
      property: "og:description",
      content: "Top bhakta referrers competing for the hand-painted Krishna idol."
    }]
  }),
  component: LeaderboardPage
});
function LeaderboardPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    let cancelled = false;
    function fetchData() {
      api.getLeaderboard()
        .then((data) => { if (!cancelled) { setLeaderboard(data); setError(null); } })
        .catch(() => { if (!cancelled) setError("Could not load leaderboard."); })
        .finally(() => { if (!cancelled) setLoading(false); });
    }
    fetchData();
    const interval = setInterval(fetchData, 60_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [query]);
  const rows = useMemo(() => {
    if (!debouncedQuery) return leaderboard;
    return leaderboard.filter((r) => r.fullName.toLowerCase().includes(debouncedQuery));
  }, [debouncedQuery, leaderboard]);
  const match = debouncedQuery ? rows[0] : undefined;
  return /*#__PURE__*/_jsx(SiteShell, {
    children: /*#__PURE__*/_jsxs("section", {
      className: "relative overflow-hidden bg-gradient-festive py-10 sm:py-16",
      children: [/*#__PURE__*/_jsx(GradientMesh, {}), /*#__PURE__*/_jsx(PatternBackdrop, {
        variant: "mandala",
        className: "text-secondary opacity-[0.07]"
      }), /*#__PURE__*/_jsx(FloatingMotifs, {
        count: 8
      }), /*#__PURE__*/_jsx(PeacockFeather, {
        className: "pointer-events-none absolute -right-10 top-24 h-56 w-56 opacity-25"
      }), /*#__PURE__*/_jsxs("div", {
        className: "relative mx-auto max-w-4xl px-4 sm:px-6",
        children: [/*#__PURE__*/_jsx(SectionHeading, {
          eyebrow: "Referral utsav",
          title: "The bhakta leaderboard",
          subtitle: "Updated live through the festival. Top three are honoured on stage before the midnight aarti."
        }), /*#__PURE__*/_jsx(Reveal, {
          className: "mt-8",
          children: /*#__PURE__*/_jsxs("div", {
            className: "relative mx-auto max-w-xl",
            children: [/*#__PURE__*/_jsx(Search, {
              className: "absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-secondary"
            }), /*#__PURE__*/_jsx("input", {
              value: query,
              onChange: e => setQuery(e.target.value),
              placeholder: "Search by name or Krishna code\u2026",
              className: "min-h-12 w-full rounded-full border-2 border-primary/30 bg-card pl-12 pr-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
            })]
          })
        }), match && /*#__PURE__*/_jsx(motion.div, {
          initial: {
            opacity: 0,
            y: 14
          },
          animate: {
            opacity: 1,
            y: 0
          },
          className: "sticky top-20 z-30 mt-6",
          children: /*#__PURE__*/_jsx("div", {
            className: "rounded-2xl bg-gradient-gold p-[3px] shadow-warm",
            children: /*#__PURE__*/_jsxs("div", {
              className: "relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 overflow-hidden rounded-[calc(1rem-1px)] bg-card px-5 py-4",
              children: [/*#__PURE__*/_jsx(PatternBackdrop, {
                variant: "diya",
                className: "text-primary opacity-[0.07]"
              }), /*#__PURE__*/_jsx("span", {
                className: "relative grid h-12 w-12 place-items-center rounded-full bg-primary/25 text-primary ring-1 ring-primary/40",
                children: /*#__PURE__*/_jsx(Trophy, {
                  className: "h-7 w-7",
                  strokeWidth: 2.4
                })
              }), /*#__PURE__*/_jsxs("div", {
                className: "relative min-w-0",
                children: [/*#__PURE__*/_jsx("div", {
                  className: "text-[11px] font-bold tracking-[0.2em] text-secondary uppercase",
                  children: "Your rank"
                }), /*#__PURE__*/_jsx("div", {
                  className: "truncate font-display text-xl",
                  children: match.fullName
                })]
              }), /*#__PURE__*/_jsxs("div", {
                className: "relative text-right",
                children: [/*#__PURE__*/_jsxs("div", {
                  className: "font-display text-3xl text-secondary",
                  children: ["#", match.rank]
                }), /*#__PURE__*/_jsxs("div", {
                  className: "text-[10px] tracking-[0.2em] text-muted-foreground uppercase",
                  children: [match.referralCount, " referrals"]
                })]
              })]
            })
          })
        }), /*#__PURE__*/_jsx("div", {
          className: "mt-8",
          children: loading ? /*#__PURE__*/_jsx("div", {
            className: "flex justify-center py-16",
            children: /*#__PURE__*/_jsx(Loader2, {
              className: "h-10 w-10 animate-spin text-secondary"
            })
          }) : error ? /*#__PURE__*/_jsx("div", {
            className: "rounded-3xl bg-card/80 p-10 text-center ring-1 ring-primary/25",
            children: /*#__PURE__*/_jsx("p", {
              className: "font-display text-xl text-destructive",
              children: error
            })
          }) : rows.length ? /*#__PURE__*/_jsx(LeaderboardList, {
            rows: rows
          }) : /*#__PURE__*/_jsxs("div", {
            className: "rounded-3xl bg-card/80 p-10 text-center ring-1 ring-primary/25",
            children: [/*#__PURE__*/_jsx(PeacockFeather, {
              className: "mx-auto h-20 w-20 opacity-60"
            }), /*#__PURE__*/_jsx("p", {
              className: "mt-4 font-display text-xl",
              children: "No bhakta found by that name or code"
            }), /*#__PURE__*/_jsx(Flourish, {
              className: "mx-auto mt-3 h-5 w-40"
            })]
          })
        })]
      })]
    })
  });
}