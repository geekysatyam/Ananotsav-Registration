import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AnandotsavGallery } from "@/components/anandotsav-gallery";
import { SiteShell } from "@/components/site-shell";
import { Cushion, Flourish, Krishna, PeacockFeather } from "@/components/motifs";
import { eventInfo } from "@/lib/event-info";
import { siteConfig } from "@/lib/site-config";
import { api } from "@/lib/api";
import heroTempleImg from "@/assets/hero-gaur-nitai-temple.png";

export { EventDetailsSection } from "@/components/event-details-section";
export { LeaderboardList } from "@/components/leaderboard-list";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: siteConfig.seo.siteTitle },
      {
        name: "description",
        content: siteConfig.seo.description,
      },
      { property: "og:title", content: siteConfig.seo.siteTitle },
      {
        property: "og:description",
        content: siteConfig.seo.description,
      },
    ],
  }),
  component: Landing,
});

function useCountUp(target, duration = 1500) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting || started.current) return;
      started.current = true;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - start) / duration);
        setValue(Math.floor(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);

  return { value, ref };
}

function Countdown({ to, variant = "dark", compact = false }) {
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
        ? "rounded-lg border border-[#D89B24]/15 bg-white px-2 py-1.5 text-center shadow-sm sm:rounded-xl sm:px-2.5 sm:py-2 lg:px-3 lg:py-2"
        : "rounded-xl border border-[#D89B24]/15 bg-white px-3 py-2.5 text-center shadow-sm lg:rounded-2xl lg:px-4 lg:py-3"
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

function HomeLeaderboardPreview({ rows }) {
  const badges = ["👑", "🪶", "🪷", "✨", "🌸"];
  const rankBg = [
    "bg-gradient-gold text-white",
    "bg-slate-200 text-slate-600",
    "bg-orange-100 text-orange-700",
    "bg-slate-100 text-slate-500",
    "bg-slate-100 text-slate-500",
  ];

  if (rows.length === 0) {
    return (
      <div className="px-6 py-8 text-center text-sm text-slate-500">
        Leaderboard loading… Be the first to invite your friends!
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {rows.slice(0, 5).map((r, i) => (
        <div
          key={r.referralCode}
          className={`flex items-center gap-4 px-6 py-5 ${i === 0 ? "jh-rank-glow" : ""}`}
        >
          <div
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-full font-black ${rankBg[i] ?? rankBg[4]}`}
          >
            {i + 1}
          </div>
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#D89B24]/10 text-xl">
            {badges[i] ?? "🪶"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-bold">{r.fullName}</div>
            <div className="truncate text-xs text-slate-400">{r.referralCode}</div>
          </div>
          <div className="font-display text-2xl font-bold text-[#D89B24]">{r.referralCount}</div>
        </div>
      ))}
    </div>
  );
}

function Landing() {
  const [registrantCount, setRegistrantCount] = useState(0);
  const [previewRows, setPreviewRows] = useState([]);

  useEffect(() => {
    api.getStatsCount().then((d) => setRegistrantCount(d.totalRegistrants)).catch(() => undefined);
    api.getLeaderboard().then((rows) => setPreviewRows(rows.slice(0, 5))).catch(() => undefined);
  }, []);

  const counter = useCountUp(registrantCount, 1500);

  return (
    <SiteShell>
      <div className="overflow-x-clip bg-white text-[#17313A]">
        {/* Particles */}
        <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden>
          <i className="jh-particle absolute top-[72%] left-[12%] h-2 w-2 rounded-full bg-[#D89B24]/40" style={{ animationDuration: "8s" }} />
          <i className="jh-particle absolute top-[80%] left-[24%] h-1.5 w-1.5 rounded-full bg-secondary/30" style={{ animationDuration: "11s", animationDelay: "1s" }} />
          <i className="jh-particle absolute top-[68%] left-[72%] h-2 w-2 rounded-full bg-[#D89B24]/35" style={{ animationDuration: "9s", animationDelay: "2s" }} />
          <i className="jh-particle absolute top-[84%] left-[87%] h-1.5 w-1.5 rounded-full bg-secondary/30" style={{ animationDuration: "12s", animationDelay: "0.4s" }} />
        </div>

        {/* Hero — one viewport; event details + countdown sit under the illustration */}
        <section
          id="home"
          className="jh-hero-bg relative flex h-[calc(100dvh-3.75rem)] items-center overflow-hidden py-4 sm:py-5 lg:py-6"
        >
          <div className="jh-pattern" />
          <div className="jh-mandala absolute top-1/2 right-[-80px] hidden -translate-y-1/2 opacity-60 lg:block" />

          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-4 sm:gap-5 lg:grid-cols-2 lg:grid-rows-[auto_auto] lg:gap-x-10 lg:gap-y-4 xl:gap-x-12">
              {/* Mobile temple — above tagline */}
              <div className="order-first flex w-full justify-center lg:hidden">
                <img
                  src={heroTempleImg}
                  alt="Sri Sri Gaur-Nitai temple at Anandotsav"
                  className="h-[clamp(4rem,15vw,5.5rem)] w-auto max-w-[min(52vw,9.5rem)] object-contain drop-shadow-[0_14px_28px_rgba(8,73,91,0.2)]"
                  width={512}
                  height={512}
                  decoding="async"
                  fetchPriority="high"
                />
              </div>

              {/* Copy */}
              <div className="order-1 flex w-full min-w-0 flex-col items-center text-center lg:order-1 lg:row-span-2 lg:items-start lg:text-left">
                <div className="inline-flex w-fit max-w-full items-center gap-1.5 rounded-full border border-[#D89B24]/25 bg-white/75 px-2.5 py-1 text-[10px] font-bold text-secondary shadow-sm sm:px-3 sm:text-xs lg:px-4 lg:py-1.5 lg:text-sm">
                  <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[#D89B24]" />
                  <span className="line-clamp-1">{siteConfig.event.heroTagline}</span>
                </div>

                <p className="mt-1.5 text-[10px] font-bold tracking-[0.2em] text-[#D89B24] uppercase sm:text-xs lg:mt-2 lg:text-sm">
                  Jai Shri Krishna · {eventInfo.date.split(",")[0]}
                </p>

                <h1 className="mt-2 font-display text-[clamp(1.35rem,5vw,1.75rem)] leading-[1.08] font-bold text-[#08495B] lg:mt-3 lg:text-[clamp(2.5rem,3.8vw,4rem)] lg:leading-[1.02]">
                  Come as a <span className="text-[#D89B24]">Bhakta.</span>
                  <br />
                  Celebrate as <span className="text-secondary">one family.</span>
                </h1>

                <Flourish className="my-1.5 hidden h-5 w-40 max-w-xs lg:flex lg:my-3 lg:h-6 lg:w-48" />

                <p className="mt-1.5 hidden max-w-lg text-[12px] leading-5 text-slate-600 sm:text-sm sm:leading-6 lg:mt-3 lg:block lg:max-w-xl lg:text-base lg:leading-7">
                  Register for {siteConfig.brand.name}, receive your entry QR, invite fellow Bhaktas and
                  climb the referral leaderboard.
                </p>

                <div className="mt-3 flex w-full max-w-md flex-col gap-2 sm:flex-row sm:justify-center lg:mt-5 lg:max-w-none lg:justify-start lg:gap-3">
                  <Link
                    to="/register"
                    className="jh-pulse-glow inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-extrabold text-white shadow-lg transition hover:bg-[#08495B] sm:px-6 sm:py-3 lg:px-7 lg:py-3.5 lg:text-base"
                  >
                    Register as a Bhakta <span>→</span>
                  </Link>
                  <a
                    href="#competition"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-secondary/15 bg-white/80 px-4 py-2.5 text-sm font-bold text-secondary shadow-sm transition hover:bg-white sm:px-6 sm:py-3 lg:px-7 lg:py-3.5 lg:text-base"
                  >
                    See how referrals work
                  </a>
                </div>

                <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] font-semibold text-slate-600 lg:mt-3 lg:justify-start lg:gap-x-4 sm:text-xs lg:text-sm">
                  <span className="whitespace-nowrap">🔐 Secure QR Entry</span>
                  <span className="whitespace-nowrap">🎁 Free Keychain</span>
                  <span className="whitespace-nowrap">🪶 Referral Rewards</span>
                </div>
              </div>

              {/* Illustration — desktop only */}
              <div className="order-2 hidden w-full justify-center lg:flex lg:order-2 lg:col-start-2 lg:row-start-1">
                <div className="relative flex w-full max-w-sm items-center justify-center sm:max-w-md lg:max-w-none">
                  <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-[#D89B24]/12 via-transparent to-secondary/10 blur-3xl" />

                  <div className="jh-float2 jh-glass absolute top-0 right-0 z-20 hidden items-center gap-2 rounded-xl border border-[#D89B24]/20 px-3 py-2 lg:flex xl:-right-4">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-[#D89B24]/15 text-lg">🔑</div>
                    <div>
                      <div className="text-xs font-bold text-[#08495B]">Free Krishna Keychain</div>
                      <div className="text-[10px] text-slate-500">Every registered Bhakta</div>
                    </div>
                  </div>

                  <div className="jh-float3 jh-glass absolute bottom-2 -left-4 z-20 hidden items-center gap-2 rounded-xl px-3 py-2 lg:flex xl:-left-10">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-secondary/10 text-base">🏆</div>
                    <div>
                      <div className="text-xs font-bold">Invite & Rise</div>
                      <div className="text-[10px] text-slate-500">Festive leaderboard</div>
                    </div>
                  </div>

                  <img
                    src={heroTempleImg}
                    alt="Sri Sri Gaur-Nitai temple at Anandotsav"
                    className="relative z-10 h-[min(42vh,380px)] w-auto max-w-full object-contain drop-shadow-[0_16px_32px_rgba(8,73,91,0.2)]"
                    width={512}
                    height={512}
                    decoding="async"
                    fetchPriority="high"
                  />

                  <PeacockFeather className="jh-float pointer-events-none absolute -left-6 top-1/2 hidden h-28 w-14 -translate-y-1/2 rotate-[18deg] opacity-80 lg:block xl:-left-10" />
                </div>
              </div>

              {/* Event details + countdown — directly under SVG */}
              <div className="order-3 w-full max-w-md justify-self-center space-y-2 sm:space-y-2.5 lg:order-3 lg:col-start-2 lg:row-start-2 lg:max-w-xl lg:justify-self-center lg:space-y-3">
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 lg:gap-3">
                    {[
                      { icon: "📅", label: siteConfig.event.date.split(",")[0] },
                      { icon: "🪔", label: siteConfig.event.timing },
                      { icon: "📍", label: siteConfig.event.venueShort },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="jh-glass rounded-lg border border-[#D89B24]/15 px-2 py-2 text-center sm:rounded-xl sm:px-2.5 sm:py-2.5 lg:rounded-2xl lg:px-3 lg:py-3"
                      >
                        <div className="text-sm sm:text-base lg:text-xl">{item.icon}</div>
                        <p className="mt-0.5 text-[9px] font-bold leading-tight text-[#08495B] sm:mt-1 sm:text-[10px] lg:text-xs">
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-[#D89B24]/20 bg-white/75 p-3 shadow-sm backdrop-blur-sm sm:rounded-2xl sm:p-3 lg:p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold tracking-[0.16em] text-[#D89B24] uppercase sm:text-[10px] lg:text-xs">
                          The celebration begins in
                        </p>
                        <p className="mt-1 font-display text-sm font-bold leading-snug text-[#08495B] sm:text-base lg:mt-1.5 lg:text-lg">
                          Be ready to witness an evening full of joy
                        </p>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-500 sm:text-xs lg:text-sm">
                          Kirtan, dance, abhishek & prasadam — with fellow Bhaktas under the stars
                        </p>
                      </div>
                      <span className="shrink-0 text-xl sm:text-2xl lg:text-3xl" aria-hidden>
                        🪔
                      </span>
                    </div>
                    <Countdown to={eventInfo.competitionEnds} variant="light" compact />
                  </div>
              </div>
            </div>
          </div>
        </section>

        <AnandotsavGallery />

        {/* Stats */}
        <section id="stats" className="jh-section-blue relative overflow-hidden py-16 text-white">
          <div className="jh-pattern opacity-[0.07]" />
          <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid items-center gap-10 md:grid-cols-[1fr_auto]">
              <div>
                <div className="inline-flex items-center gap-2 text-sm font-bold text-[#F7D98A]">
                  <span>🔥</span> THE FESTIVE CHALLENGE
                </div>
                <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
                  The more you share,
                  <br />
                  <span className="text-[#F7D98A]">the more you inspire.</span>
                </h2>
                <p className="mt-4 max-w-2xl leading-7 text-white/75">
                  Invite friends and family using your Krishna referral code. Every verified registration
                  adds to your count and moves you closer to the top of the leaderboard.
                </p>
              </div>
              <div className="jh-glass min-w-[230px] rounded-3xl border-white/10 bg-white/10 px-10 py-7 text-center">
                <div className="text-sm font-bold tracking-[0.18em] text-white/65 uppercase">Bhaktas Registered</div>
                <div ref={counter.ref} className="mt-2 font-display text-6xl font-bold text-[#F7D98A] tabular-nums">
                  {counter.value.toLocaleString("en-IN")}
                </div>
                <div className="mt-2 text-sm text-white/60">and counting...</div>
              </div>
            </div>
          </div>
        </section>

        {/* Keychain */}
        <section className="jh-section-gold relative overflow-hidden py-20">
          <div className="jh-pattern opacity-[0.09]" />
          <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="relative grid min-h-[320px] place-items-center px-2 sm:min-h-[360px] sm:px-0">
                <div className="absolute h-64 w-64 rounded-full bg-[#D89B24]/15 blur-2xl" />
                <div className="relative w-full max-w-[min(100%,20rem)] sm:max-w-[24rem]">
                  <Cushion className="relative z-0 aspect-[1004/545] w-full drop-shadow-[0_20px_40px_rgba(154,100,20,0.28)]" />
                  <Krishna className="jh-float absolute bottom-[36%] left-1/2 z-10 aspect-[731/1081] w-[58%] max-w-[11rem] -translate-x-1/2 drop-shadow-[0_16px_32px_rgba(8,73,91,0.25)] sm:bottom-[38%] sm:w-[52%] sm:max-w-[12rem]" />
                </div>
              </div>
              <div>
                <div className="inline-flex rounded-full bg-[#D89B24]/10 px-4 py-2 text-sm font-extrabold text-[#D89B24]">
                  🎁 A little blessing for every Bhakta
                </div>
                <h2 className="mt-4 font-display text-4xl font-bold text-[#08495B] sm:text-5xl">
                  Every Bhakta Gets a <span className="text-[#D89B24]">Free Krishna Keychain</span> 🔑
                </h2>
                <Flourish className="mt-4 h-5 w-40" />
                <p className="max-w-2xl leading-8 text-slate-600">
                  Register online, save your Entry QR and collect your Krishna keychain at the Registration
                  Desk on {eventInfo.date}. One QR per bhakta — including every family member you add.
                </p>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <div className="jh-card rounded-2xl p-5">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#D89B24]/15 text-2xl">📱</div>
                    <div className="mt-3 font-bold">Show your Entry QR</div>
                    <div className="mt-1 text-sm text-slate-500">Your personal code is scanned at the desk.</div>
                  </div>
                  <div className="jh-card rounded-2xl p-5">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary/10 text-2xl">🎁</div>
                    <div className="mt-3 font-bold">Receive your gift</div>
                    <div className="mt-1 text-sm text-slate-500">Your free Krishna keychain is yours to keep.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Event */}
        <section id="event" className="jh-section-wash relative overflow-hidden py-14 sm:py-16">
          <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="text-xs font-bold tracking-[0.2em] text-[#D89B24] uppercase">Come celebrate with us</div>
              <h2 className="mt-3 font-display text-4xl font-bold text-[#08495B] sm:text-5xl">
                A night filled with <span className="text-[#D89B24]">divine joy</span>
              </h2>
              <Flourish className="mx-auto h-5 w-40" />
              <p className="text-slate-600">{siteConfig.event.invitation.closing}</p>
            </div>

            <div className="jh-card mt-10 overflow-hidden rounded-[1.75rem] bg-white/85">
              {/* Date · venue · time — compact horizontal strip */}
              <div className="grid divide-y border-b border-[#D89B24]/12 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                {[
                  { icon: "📅", label: "Date", value: siteConfig.event.date.split(",")[0], sub: "6 September 2026" },
                  { icon: "📍", label: "Venue", value: siteConfig.event.venueShort, sub: "Birbalpura, Amritsar" },
                  { icon: "🪔", label: "Timing", value: siteConfig.event.timing, sub: "Celebrations at the Gaushala" },
                ].map((c) => (
                  <div key={c.label} className="flex items-start gap-3 px-5 py-4 sm:px-6 sm:py-5">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#D89B24]/12 text-xl">
                      {c.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold tracking-[0.18em] text-[#D89B24] uppercase">{c.label}</div>
                      <div className="mt-0.5 font-display text-lg font-bold leading-snug text-[#08495B]">{c.value}</div>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{c.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Celebration features */}
              <div className="p-5 sm:p-6">
                <div className="rounded-full bg-[#8B2942] px-4 py-2 text-center">
                  <p className="text-[10px] font-bold tracking-[0.18em] text-[#F7D98A] uppercase sm:text-xs">
                    A divine celebration featuring
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
                  {siteConfig.event.celebrationFeatures.map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center gap-2.5 rounded-xl border border-[#D89B24]/12 bg-[#FFFDF7] px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3"
                    >
                      <span className="text-xl sm:text-2xl">{item.emoji}</span>
                      <p className="text-[10px] font-bold leading-snug text-[#08495B] uppercase sm:text-[11px]">
                        {item.title}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-center sm:gap-3">
                  <Link
                    to="/event-details"
                    className="inline-flex items-center justify-center rounded-xl bg-secondary px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#08495B]"
                  >
                    Full event details →
                  </Link>
                  <a
                    href={siteConfig.event.posterSrc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-xl border border-secondary/15 bg-white px-5 py-2.5 text-sm font-bold text-secondary transition hover:bg-[#FFFDF7]"
                  >
                    View official poster
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Competition */}
        <section id="competition" className="jh-section-blue relative overflow-hidden py-14 text-white sm:py-16">
          <div className="jh-pattern opacity-[0.06]" />
          <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left">
              <div className="text-xs font-bold tracking-[0.2em] text-[#F7D98A] uppercase">Referral competition</div>
              <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
                Register. Share. <span className="text-[#F7D98A]">Spread the joy.</span>
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/75 sm:text-base">
                Join the referral challenge, get your Krishna code and shareable QR — every verified registration
                through your link moves you up the leaderboard.
              </p>
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm">
              <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden>🏆</span>
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.18em] text-white/55 uppercase">
                      Competition ends in
                    </p>
                    <p className="font-display text-lg font-bold sm:text-xl">The countdown begins</p>
                  </div>
                </div>
                <div className="w-full sm:max-w-md">
                  <Countdown to={eventInfo.competitionEnds} compact />
                </div>
              </div>

              <div className="grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                {[
                  { icon: "📝", step: "Step 01", title: "Register", copy: "Complete Bhakta registration in under 60 seconds." },
                  { icon: "🪶", step: "Step 02", title: "Get Codes", copy: "Receive your Entry QR and Krishna referral code." },
                  { icon: "📣", step: "Step 03", title: "Share", copy: "Invite friends — every referral moves you up the board." },
                ].map((s, i) => (
                  <div key={s.title} className="relative bg-white p-5 text-[#17313A] sm:p-6">
                    <div className={`absolute top-0 right-0 left-0 h-1 ${i === 1 ? "bg-secondary" : "bg-[#D89B24]"}`} />
                    <div className="flex items-start gap-3">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#D89B24]/12 text-xl">
                        {s.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold tracking-[0.16em] text-[#D89B24] uppercase">{s.step}</div>
                        <h3 className="mt-0.5 font-display text-lg font-bold text-[#08495B]">{s.title}</h3>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-500 sm:text-sm">{s.copy}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-stretch gap-2 border-t border-white/10 bg-white/5 px-5 py-4 sm:flex-row sm:justify-center sm:gap-3 sm:px-6">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-xl bg-[#F7D98A] px-5 py-2.5 text-sm font-extrabold text-[#08495B] transition hover:bg-white"
                >
                  Join the challenge →
                </Link>
                <Link
                  to="/leaderboard"
                  className="inline-flex items-center justify-center rounded-xl border border-white/25 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  View leaderboard
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Leaderboard */}
        <section id="leaderboard" className="jh-section-wash relative overflow-hidden py-20">
          <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <div className="text-xs font-bold tracking-[0.2em] text-[#D89B24] uppercase">Who is leading?</div>
                <h2 className="mt-3 font-display text-4xl font-bold text-[#08495B] sm:text-5xl">
                  Bhakta <span className="text-[#D89B24]">Leaderboard</span>
                </h2>
                <Flourish className="mt-4 h-5 w-40" />
                <p className="text-slate-600">A little friendly competition, powered by devotion.</p>
              </div>
              <Link
                to="/leaderboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-secondary/15 bg-white px-5 py-3 font-bold text-secondary shadow-sm"
              >
                View Full Leaderboard →
              </Link>
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.7fr]">
              <div className="jh-card overflow-hidden rounded-3xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                  <div className="font-bold">Top Referrers</div>
                  <div className="text-xs text-slate-400">Live ranking</div>
                </div>
                <HomeLeaderboardPreview rows={previewRows} />
              </div>

              <div className="relative overflow-hidden rounded-3xl bg-gradient-peacock p-8 text-white">
                <div className="absolute -top-16 -right-16 h-52 w-52 rounded-full border border-white/10" />
                <div className="jh-float absolute top-6 right-6 text-5xl">🪶</div>
                <div className="relative z-10">
                  <div className="text-xs font-bold tracking-[0.18em] text-[#F7D98A] uppercase">Want your name here?</div>
                  <h3 className="mt-3 font-display text-3xl font-bold">Your next referral could change the board.</h3>
                  <p className="mt-4 leading-7 text-white/70">
                    Register, opt into the referral challenge and start inviting your people.
                  </p>
                  <Link
                    to="/register"
                    className="mt-7 inline-flex rounded-xl bg-white px-6 py-3 font-extrabold text-secondary transition hover:bg-[#F7D98A]"
                  >
                    Join the Challenge →
                  </Link>
                  <div className="mt-10 flex items-center gap-3 border-t border-white/10 pt-6">
                    <div className="text-3xl">🙏</div>
                    <div>
                      <div className="font-bold">Celebrate together</div>
                      <div className="text-xs text-white/50">Every invitation spreads the joy.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Register CTA */}
        <section id="register" className="jh-hero-bg relative overflow-hidden py-24">
          <div className="jh-pattern" />
          <div className="relative z-10 mx-auto max-w-5xl px-5 text-center sm:px-8">
            <div className="jh-float mb-5 text-6xl">🪷</div>
            <div className="text-xs font-bold tracking-[0.25em] text-[#D89B24] uppercase">Your celebration starts here</div>
            <h2 className="mt-3 font-display text-5xl font-bold text-[#08495B] sm:text-6xl">
              Ready to become a <span className="text-[#D89B24]">Bhakta?</span>
            </h2>
            <div className="jh-flourish justify-center">
              <span />
              <b>ॐ</b>
              <span />
            </div>
            <p className="mx-auto max-w-2xl leading-8 text-slate-600">
              {siteConfig.event.invitation.body} Every Bhakta receives a personal Entry QR and a free Krishna
              keychain. Opt into the referral challenge to invite friends and climb the leaderboard.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                className="jh-pulse-glow inline-flex rounded-2xl bg-gradient-peacock px-8 py-4 text-lg font-extrabold text-white shadow-2xl transition hover:-translate-y-1"
              >
                Register Now · It&apos;s Free
              </Link>
              <Link
                to="/event-details"
                className="inline-flex rounded-2xl border border-secondary/20 bg-white/80 px-8 py-4 text-lg font-bold text-secondary shadow-sm transition hover:bg-white"
              >
                Explore event details
              </Link>
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
