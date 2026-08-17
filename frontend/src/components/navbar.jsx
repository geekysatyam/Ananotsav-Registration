import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

const links = [
  { to: "/", label: "Home" },
  { to: "/event-details", label: "Event Details" },
  { to: "/competitions", label: "Competitions" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/find", label: "Find Registration" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-2 pt-2 sm:px-4">
      <nav className="jh-glass mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl px-2.5 py-1.5 sm:px-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-2 justify-self-start"
          onClick={() => setOpen(false)}
        >
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-peacock text-base text-white shadow-md">
            {siteConfig.brand.logoEmoji}
          </div>
          <div className="min-w-0 leading-none">
            <div className="truncate font-display text-sm font-bold text-[#08495B] sm:text-[15px]">
              {siteConfig.brand.shortName}
            </div>
            <div className="mt-0.5 hidden text-[9px] font-bold tracking-[0.16em] text-[#D89B24] uppercase sm:block">
              {siteConfig.brand.tagline}
            </div>
          </div>
        </Link>

        <div className="hidden items-center justify-center gap-3 text-[13px] font-semibold lg:flex xl:gap-5 xl:text-sm">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              hash={l.hash}
              className="whitespace-nowrap text-[#17313A] transition hover:text-secondary [&.active]:text-secondary"
              activeOptions={{ exact: !l.hash }}
              activeProps={{ className: "active text-secondary" }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-self-end gap-1 sm:gap-1.5">
          <Link
            to="/register"
            onClick={() => setOpen(false)}
            className="inline-flex min-h-8 shrink-0 items-center rounded-lg bg-gradient-gold px-2.5 py-1.5 text-[11px] font-bold text-white shadow-md transition hover:-translate-y-0.5 sm:px-3.5 sm:text-[13px]"
          >
            <span className="lg:hidden">Register for Free !!</span>
            <span className="hidden lg:inline">Register for Free !! →</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Open menu"
            aria-expanded={open}
            className="grid h-8 w-8 place-items-center rounded-lg bg-secondary/10 text-secondary lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </nav>

      <div
        className={cn(
          "jh-glass mx-auto mt-1.5 max-w-7xl rounded-xl p-1.5 lg:hidden",
          open ? "block" : "hidden",
        )}
      >
        {links.map((l) => (
          <Link
            key={l.label}
            to={l.to}
            hash={l.hash}
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-secondary/10"
          >
            {l.label}
          </Link>
        ))}
        <Link
          to="/register"
          onClick={() => setOpen(false)}
          className="mt-0.5 block rounded-lg bg-gradient-gold px-3 py-2.5 text-center text-sm font-bold text-white"
        >
          Register for Free !! →
        </Link>
      </div>
    </header>
  );
}
