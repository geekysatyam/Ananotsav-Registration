import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AnandotsavGallery } from "@/components/anandotsav-gallery";
import { CompetitionsCarousel } from "@/components/competitions-carousel";
import { Countdown } from "@/components/countdown";
import { SiteShell } from "@/components/site-shell";
import { Cushion, Flourish, Krishna, PeacockFeather } from "@/components/motifs";
import { eventInfo } from "@/lib/event-info";
import { siteConfig } from "@/lib/site-config";
import { api } from "@/lib/api";
import heroTempleImg from "@/assets/hero-gaur-nitai-temple.png";

export { EventDetailsSection } from "@/components/event-details-section";
// REFERRAL DISABLED
// export { LeaderboardList } from "@/components/leaderboard-list";

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
  const startedFor = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (target == null || target <= 0) {
      setValue(0);
      startedFor.current = target;
      return;
    }

    const run = () => {
      if (startedFor.current === target) return;
      startedFor.current = target;
      const start = performance.now();
      const from = 0;
      const tick = (now) => {
        const p = Math.min(1, (now - start) / duration);
        setValue(Math.floor(from + (target - from) * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) run();
      },
      { threshold: 0.15 },
    );
    io.observe(el);

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) run();

    return () => io.disconnect();
  }, [target, duration]);

  return { value, ref };
}

/* REFERRAL DISABLED
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
          key={`${r.rank}-${r.fullName}`}
          className={`flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-6 sm:py-5 ${i === 0 ? "jh-rank-glow" : ""}`}
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
          </div>
          <div className="font-display text-2xl font-bold text-[#D89B24]">{r.referralCount}</div>
        </div>
      ))}
    </div>
  );
}
*/

function Landing() {
  const [registrantCount, setRegistrantCount] = useState(null);
  // REFERRAL DISABLED
  // const [previewRows, setPreviewRows] = useState([]);

  useEffect(() => {
    api.getStatsCount().then((d) => setRegistrantCount(d.totalRegistrants ?? 0)).catch(() => setRegistrantCount(0));
    // api.getLeaderboard().then((rows) => setPreviewRows(rows.slice(0, 5))).catch(() => undefined);
  }, []);

  const counter = useCountUp(registrantCount ?? 0, 1500);

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
          className="jh-hero-bg relative flex min-h-[calc(100dvh-3.75rem)] items-center overflow-x-clip py-5 sm:py-6 lg:h-[calc(100dvh-3.75rem)] lg:py-6"
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
                  Hare Krishna · {eventInfo.date.split(",")[0]}
                </p>

                <h1 className="mt-2 font-display text-[clamp(1.35rem,5vw,1.75rem)] leading-[1.08] font-bold text-[#08495B] lg:mt-3 lg:text-[clamp(2.5rem,3.8vw,4rem)] lg:leading-[1.02]">
                  Come as a <span className="text-[#D89B24]">Bhakta.</span>
                  <br />
                  Celebrate as <span className="text-secondary">one family.</span>
                </h1>

                <Flourish className="my-1.5 hidden h-5 w-40 max-w-xs lg:flex lg:my-3 lg:h-6 lg:w-48" />

                <p className="mt-1.5 hidden max-w-lg text-[12px] leading-5 text-slate-600 sm:text-sm sm:leading-6 lg:mt-3 lg:block lg:max-w-xl lg:text-base lg:leading-7">
                  Register for {siteConfig.brand.name}, receive your entry QR, and celebrate as one family.
                </p>

                <div className="mt-3 flex w-full max-w-md flex-col gap-2 sm:flex-row sm:justify-center lg:mt-5 lg:max-w-none lg:justify-start lg:gap-3">
                  <Link
                    to="/register"
                    className="jh-pulse-glow inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-extrabold text-white shadow-lg transition hover:bg-[#08495B] sm:px-6 sm:py-3 lg:px-7 lg:py-3.5 lg:text-base"
                  >
                    Register for Free !! <span>→</span>
                  </Link>
                  <Link
                    to="/competitions"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-secondary/15 bg-white/80 px-4 py-2.5 text-sm font-bold text-secondary shadow-sm transition hover:bg-white sm:px-6 sm:py-3 lg:px-7 lg:py-3.5 lg:text-base"
                  >
                    See competitions
                  </Link>
                </div>

                <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] font-semibold text-slate-600 lg:mt-3 lg:justify-start lg:gap-x-4 sm:text-xs lg:text-sm">
                  <span className="whitespace-nowrap">🔐 Secure QR Entry</span>
                  <span className="whitespace-nowrap">🪔 Divine Evening</span>
                  {/* REFERRAL DISABLED
                  <span className="whitespace-nowrap">🪶 Referral Rewards</span>
                  */}
                </div>
              </div>

              {/* Illustration — desktop only */}
              <div className="order-2 hidden w-full justify-center lg:flex lg:order-2 lg:col-start-2 lg:row-start-1">
                <div className="relative flex w-full max-w-sm items-center justify-center overflow-visible pt-2 sm:max-w-md lg:max-w-none lg:pt-4">
                  <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-[#D89B24]/12 via-transparent to-secondary/10 blur-3xl" />

                  <div className="jh-float2 jh-glass absolute top-6 right-2 z-20 hidden items-center gap-2 rounded-xl border border-[#D89B24]/15 px-3 py-2 lg:flex lg:top-10 lg:right-6">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-[#D89B24]/15 text-lg">🪔</div>
                    <div>
                      <div className="text-xs font-bold text-[#08495B]">Divine Evening</div>
                      <div className="text-[10px] text-slate-500">Memories for every Bhakta</div>
                    </div>
                  </div>

                  {/* REFERRAL DISABLED
                  <div className="jh-float3 jh-glass absolute bottom-2 -left-4 z-20 hidden items-center gap-2 rounded-xl border border-[#D89B24]/15 px-3 py-2 lg:flex xl:-left-8">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-secondary/10 text-base">🏆</div>
                    <div>
                      <div className="text-xs font-bold">Invite & Rise</div>
                      <div className="text-[10px] text-slate-500">Festive leaderboard</div>
                    </div>
                  </div>
                  */}

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
                        className="jh-glass-gold rounded-lg px-2 py-2 text-center sm:rounded-xl sm:px-2.5 sm:py-2.5 lg:rounded-2xl lg:px-3 lg:py-3"
                      >
                        <div className="text-sm sm:text-base lg:text-xl">{item.icon}</div>
                        <p className="mt-0.5 text-[9px] font-bold leading-tight text-[#08495B] sm:mt-1 sm:text-[10px] lg:text-xs">
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="jh-glass-gold rounded-xl p-3 sm:rounded-2xl sm:p-3 lg:p-4">
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
                  <span>🔥</span> THE FESTIVE GATHERING
                </div>
                <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
                  Come as a bhakta,
                  <br />
                  <span className="text-[#F7D98A]">celebrate as one family.</span>
                </h2>
                <p className="mt-4 max-w-2xl leading-7 text-white/75">
                  Register for Anandotsav, receive your entry QR, and join thousands of bhaktas at Sri
                  Gokul Gaushala.
                </p>
              </div>
              <div className="mx-auto w-full max-w-sm rounded-3xl border border-white/20 bg-[#042f3c]/75 px-6 py-6 text-center shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:px-10 sm:py-7 md:mx-0 md:min-w-[240px]">
                <div className="text-[11px] font-bold tracking-[0.18em] text-[#F7D98A]/85 uppercase sm:text-sm">
                  Bhaktas Registered
                </div>
                <div
                  ref={counter.ref}
                  className="mt-2 font-display text-5xl font-bold text-[#F7D98A] tabular-nums sm:text-6xl"
                >
                  {registrantCount == null ? "—" : counter.value.toLocaleString("en-IN")}
                </div>
                <div className="mt-2 text-sm text-white/80">and counting...</div>
              </div>
            </div>
          </div>
        </section>

        {/* Divine Evening */}
        <section className="jh-section-gold relative overflow-hidden py-14 sm:py-20">
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
                <div className="inline-flex max-w-full rounded-full bg-[#D89B24]/10 px-3 py-2 text-xs font-extrabold text-[#D89B24] sm:px-4 sm:text-sm">
                  🪔 A divine evening for every Bhakta
                </div>
                <h2 className="mt-4 font-display text-3xl font-bold text-[#08495B] sm:text-4xl lg:text-5xl">
                  Every Bhakta Gets a <span className="text-[#D89B24]">Divine Evening</span>
                </h2>
                <Flourish className="mt-4 h-5 w-40" />
                <p className="max-w-2xl leading-8 text-slate-600">
                  Register online, save your Entry QR and come for a lot of memories and a divine evening
                  on {eventInfo.date}. One QR per bhakta — including every family member you add.
                </p>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <div className="jh-card rounded-2xl p-5">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#D89B24]/15 text-2xl">📱</div>
                    <div className="mt-3 font-bold">Show your Entry QR</div>
                    <div className="mt-1 text-sm text-slate-500">Your personal code is scanned at the desk.</div>
                  </div>
                  <div className="jh-card rounded-2xl p-5">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary/10 text-2xl">🪔</div>
                    <div className="mt-3 font-bold">Attend the evening</div>
                    <div className="mt-1 text-sm text-slate-500">A lot of memories and a divine evening await.</div>
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
              <h2 className="mt-3 font-display text-3xl font-bold text-[#08495B] sm:text-4xl lg:text-5xl">
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
                <div className="rounded-2xl bg-[#8B2942] px-3 py-2 text-center sm:rounded-full sm:px-4">
                  <p className="text-[10px] font-bold tracking-[0.12em] text-[#F7D98A] uppercase sm:text-xs sm:tracking-[0.18em]">
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

        <CompetitionsCarousel />

        {/* REFERRAL DISABLED — homepage leaderboard
        <section id="leaderboard" className="jh-section-wash relative overflow-hidden py-14 sm:py-20">
          ... Bhakta Leaderboard / Top Referrers ...
        </section>
        */}

        {/* Register CTA */}
        <section id="register" className="jh-hero-bg relative overflow-hidden py-16 sm:py-24">
          <div className="jh-pattern" />
          <div className="relative z-10 mx-auto max-w-5xl px-5 text-center sm:px-8">
            <div className="jh-float mb-5 text-6xl">🪷</div>
            <div className="text-xs font-bold tracking-[0.25em] text-[#D89B24] uppercase">Your celebration starts here</div>
            <h2 className="mt-3 font-display text-3xl font-bold text-[#08495B] sm:text-5xl lg:text-6xl">
              Ready to become a <span className="text-[#D89B24]">Bhakta?</span>
            </h2>
            <div className="jh-flourish justify-center">
              <span />
              <b>ॐ</b>
              <span />
            </div>
            <p className="mx-auto max-w-2xl leading-8 text-slate-600">
              {siteConfig.event.invitation.body} Every Bhakta receives a personal Entry QR and Divine
              Gifts.
            </p>
            <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link
                to="/register"
                className="jh-pulse-glow inline-flex items-center justify-center rounded-2xl bg-gradient-peacock px-6 py-3.5 text-base font-extrabold text-white shadow-2xl transition hover:-translate-y-1 sm:px-8 sm:py-4 sm:text-lg"
              >
                Register for Free !! · It&apos;s Free
              </Link>
              <Link
                to="/event-details"
                className="inline-flex items-center justify-center rounded-2xl border border-secondary/20 bg-white/80 px-6 py-3.5 text-base font-bold text-secondary shadow-sm transition hover:bg-white sm:px-8 sm:py-4 sm:text-lg"
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
