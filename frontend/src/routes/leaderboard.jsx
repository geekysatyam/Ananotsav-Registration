import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { SectionHeading } from "@/components/festive";
import { GradientMesh } from "@/components/ambient";
// import { createFileRoute } from "@tanstack/react-router";
// import { useEffect, useMemo, useState } from "react";
// import { motion } from "framer-motion";
// import { Search, Trophy, Loader2 } from "lucide-react";
// import { SectionHeading, Reveal } from "@/components/festive";
// import { FloatingMotifs, GradientMesh } from "@/components/ambient";
// import { PatternBackdrop, PeacockFeather, Flourish } from "@/components/motifs";
// import { LeaderboardList } from "@/components/leaderboard-list";
// import { api } from "@/lib/api";
// import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";


// REFERRAL DISABLED — original leaderboard UI kept in git history / uncomment to restore
export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [{ title: "Competitions — Janmashtami Utsav 2026" }],
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-gradient-festive py-16">
        <GradientMesh />
        <div className="relative mx-auto max-w-xl px-4 text-center">
          <SectionHeading
            eyebrow="Competitions"
            title="Referral challenge paused"
            subtitle="The referral leaderboard is not running right now. Fancy dress and Laddu Gopal shringar are still on."
          />
          <Link
            to="/competitions"
            className="mt-8 inline-flex min-h-11 items-center rounded-full bg-secondary/15 px-6 font-display font-semibold text-secondary ring-1 ring-secondary/35"
          >
            View competitions
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
