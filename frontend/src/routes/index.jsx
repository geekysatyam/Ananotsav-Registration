import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AnandotsavGallery } from "@/components/anandotsav-gallery";
import { SiteShell } from "@/components/site-shell";
import { Cushion, Flourish, Krishna, PeacockFeather, TempleSilhouette } from "@/components/motifs";
import { eventInfo } from "@/lib/event-info";
import { siteConfig } from "@/lib/site-config";
import { api } from "@/lib/api";

export { EventDetailsSection } from "@/components/event-details-section";
export { LeaderboardList } from "@/components/leaderboard-list";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Janmashtami Utsav 2026 — Bhakta Registration" },
      {
        name: "description",
        content:
          "Register for Janmashtami Utsav 2026: free Krishna keychain for every bhakta, referral competition, live leaderboard and midnight aarti darshan.",
      },
      { property: "og:title", content: "Janmashtami Utsav 2026 — Bhakta Registration" },
      {
        property: "og:description",
        content: "Register your family in 60 seconds, collect your free Krishna keychain and climb the referral leaderboard.",
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

function Countdown({ to }) {
  const [left, setLeft] = useState(() => Math.max(0, +new Date(to) - Date.now()));
  useEffect(() => {
    if (left <= 0) return;
    const id = setInterval(() => {
      const remaining = Math.max(0, +new Date(to) - Date.now());
      setLeft(remaining);
      if (remaining <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [to, left <= 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const units = [
    { label: "Days", value: Math.floor(left / 86400000) },
    { label: "Hours", value: Math.floor(left / 3600000) % 24 },
    { label: "Mins", value: Math.floor(left / 60000) % 60 },
  ];

  return (
    <div className="mt-5 grid grid-cols-3 gap-3">
      {units.map((u) => (
        <div key={u.label} className="rounded-2xl bg-white/10 p-4 text-center">
          <b className="text-2xl">{String(u.value).padStart(2, "0")}</b>
          <div className="mt-1 text-[10px] text-white/50 uppercase">{u.label}</div>
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

        {/* Hero — one viewport below fixed navbar */}
        <section
          id="home"
          className="jh-hero-bg relative h-[calc(100svh-3.75rem)] max-h-[calc(100svh-3.75rem)] overflow-hidden"
        >
          <div className="jh-pattern" />
          <div className="jh-mandala absolute top-1/2 right-[-100px] hidden -translate-y-1/2 opacity-80 lg:block" />
          <div className="jh-float absolute top-[20%] left-[6%] hidden text-2xl opacity-50 xl:block">🪷</div>
          <div className="jh-float3 absolute right-[10%] bottom-[14%] hidden text-2xl opacity-55 xl:block">🪔</div>

          <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
            <div className="grid w-full grid-cols-1 items-center gap-4 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10 xl:gap-12">
              {/* Illustration — desktop only */}
              <div className="relative order-2 hidden aspect-square w-full max-w-[340px] place-self-center lg:order-2 lg:mx-auto lg:block lg:w-[min(42vh,340px)] xl:max-w-[380px]">
                <div className="absolute inset-[6%] rounded-full border border-[#D89B24]/20" />
                <div className="absolute inset-[14%] rounded-full border border-secondary/15" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#D89B24]/18 via-white/20 to-secondary/12 blur-2xl" />

                <div className="jh-float2 jh-glass absolute -top-1 -right-2 z-20 hidden items-center gap-2 rounded-xl border border-[#D89B24]/20 px-3 py-2 lg:flex lg:-top-2 lg:-right-6">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-[#D89B24]/15 text-lg">🔑</div>
                  <div>
                    <div className="text-xs font-bold text-[#08495B]">Free Krishna Keychain</div>
                    <div className="text-[10px] text-slate-500">Every registered Bhakta</div>
                  </div>
                </div>

                <div className="jh-float3 jh-glass absolute bottom-[10%] -left-5 z-20 hidden items-center gap-2 rounded-xl px-3 py-2 lg:flex lg:-left-8">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-secondary/10 text-base">🏆</div>
                  <div>
                    <div className="text-xs font-bold">Invite & Rise</div>
                    <div className="text-[10px] text-slate-500">Festive leaderboard</div>
                  </div>
                </div>

                <div className="absolute inset-0 z-10 grid place-items-center">
                  <div className="grid aspect-square w-[58%] place-items-center rounded-full border-8 border-white/70 bg-gradient-peacock shadow-2xl">
                    <div className="px-2 text-center text-white">
                      <div className="text-[clamp(2rem,4vw,3.5rem)] leading-none">{siteConfig.brand.logoEmoji}</div>
                      <div className="mt-1 font-display text-[clamp(1.1rem,2vw,1.75rem)] font-bold leading-tight">श्री कृष्ण</div>
                      <div className="mt-1 text-[10px] tracking-[0.18em] text-[#F7D98A] uppercase">
                        {siteConfig.brand.shortName}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute top-1/2 -left-[18%] hidden -translate-y-1/2 lg:block">
                  <PeacockFeather className="jh-float h-[190px] w-[86px] rotate-[18deg] opacity-90" />
                </div>
                <div className="jh-float absolute -right-1 top-[12%] hidden text-xl opacity-80 lg:block">✨</div>
                <div className="jh-float2 absolute -left-3 bottom-[18%] hidden text-xl opacity-80 lg:block">🪷</div>
                <div className="jh-float3 absolute -right-1 bottom-[8%] hidden text-2xl opacity-70 lg:block">🪔</div>
              </div>

              {/* Copy */}
              <div className="order-1 flex w-full min-w-0 flex-col items-center text-center lg:items-start lg:py-2 lg:text-left">
                <div className="inline-flex w-fit max-w-full items-center gap-1.5 rounded-full border border-[#D89B24]/25 bg-white/75 px-2.5 py-1 text-[10px] font-bold text-secondary shadow-sm sm:px-3 sm:text-xs">
                  <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[#D89B24]" />
                  <span className="line-clamp-1">{siteConfig.event.heroTagline}</span>
                </div>

                <p className="mt-2 text-[10px] font-bold tracking-[0.2em] text-[#D89B24] uppercase sm:text-xs">
                  Jai Shri Krishna · {eventInfo.date.split(",")[0]}
                </p>

                {/* Mobile — compact row: small circle + headline */}
                <div className="mt-3 flex w-full max-w-md items-center gap-3 text-left lg:hidden">
                  <div className="grid h-[4.25rem] w-[4.25rem] shrink-0 place-items-center rounded-full border-[4px] border-white/80 bg-gradient-peacock shadow-lg">
                    <span className="text-2xl leading-none">{siteConfig.brand.logoEmoji}</span>
                  </div>
                  <h1 className="min-w-0 font-display text-[clamp(1.35rem,5.2vw,1.65rem)] leading-[1.08] font-bold text-[#08495B]">
                    Come as a <span className="text-[#D89B24]">Bhakta.</span> Celebrate as{" "}
                    <span className="text-secondary">one family.</span>
                  </h1>
                </div>

                {/* Desktop headline */}
                <h1 className="mt-2 hidden font-display text-[clamp(2.5rem,3.8vw,3.75rem)] leading-[1.02] font-bold text-[#08495B] lg:block">
                  Come as a <span className="text-[#D89B24]">Bhakta.</span>
                  <br />
                  Celebrate as <span className="text-secondary">one family.</span>
                </h1>

                <Flourish className="my-2 hidden h-5 w-40 max-w-xs lg:flex lg:my-2.5" />

                <p className="hidden max-w-lg text-sm leading-6 text-slate-600 lg:block lg:text-[15px] lg:leading-7">
                  Register for {siteConfig.brand.name}, receive your entry QR, invite fellow Bhaktas and
                  climb the referral leaderboard.
                </p>

                <div className="mt-4 flex w-full max-w-sm flex-col gap-2 sm:max-w-md sm:flex-row sm:justify-center lg:mt-4 lg:max-w-none lg:justify-start">
                  <Link
                    to="/register"
                    className="jh-pulse-glow inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-5 py-2.5 text-sm font-extrabold text-white shadow-lg transition hover:bg-[#08495B] sm:px-6 sm:py-3"
                  >
                    Register as a Bhakta <span>→</span>
                  </Link>
                  <a
                    href="#competition"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-secondary/15 bg-white/80 px-5 py-2.5 text-sm font-bold text-secondary shadow-sm transition hover:bg-white sm:px-6 sm:py-3"
                  >
                    See how referrals work
                  </a>
                </div>

                <div className="mt-2.5 hidden flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] font-semibold text-slate-600 sm:flex lg:justify-start sm:text-xs">
                  <span className="whitespace-nowrap">🔐 Secure QR Entry</span>
                  <span className="whitespace-nowrap">🎁 Free Keychain</span>
                  <span className="whitespace-nowrap">🪶 Referral Rewards</span>
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
                  <Krishna className="jh-float absolute bottom-[18%] left-1/2 z-10 aspect-[731/1081] w-[58%] max-w-[11rem] -translate-x-1/2 drop-shadow-[0_16px_32px_rgba(8,73,91,0.25)] sm:w-[52%] sm:max-w-[12rem]" />
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
        <section id="event" className="jh-section-wash relative overflow-hidden py-20">
          <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="text-xs font-bold tracking-[0.2em] text-[#D89B24] uppercase">Come celebrate with us</div>
              <h2 className="mt-3 font-display text-4xl font-bold text-[#08495B] sm:text-5xl">
                A night filled with <span className="text-[#D89B24]">divine joy</span>
              </h2>
              <Flourish className="mx-auto h-5 w-40" />
              <p className="text-slate-600">Save the date and bring your family, friends and Krishna-bhakti.</p>
            </div>

            <div className="mt-12 grid items-center gap-10 lg:grid-cols-[1fr_0.65fr]">
              <div className="grid gap-5 md:grid-cols-3">
                {[
                  { icon: "📅", label: "Date", value: eventInfo.date.split(",")[0], sub: "The sacred celebration of Krishna's birth." },
                  { icon: "📍", label: "Venue", value: eventInfo.venue.split(",")[0], sub: eventInfo.venue },
                  { icon: "🪔", label: "Timing", value: eventInfo.timing.split("—")[0].trim(), sub: "Come early and enjoy the festivities together." },
                ].map((c) => (
                  <div key={c.label} className="jh-card rounded-3xl p-7">
                    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#D89B24]/15 text-4xl">{c.icon}</div>
                    <div className="mt-6 text-xs font-bold tracking-[0.15em] text-[#D89B24] uppercase">{c.label}</div>
                    <div className="mt-2 font-display text-2xl font-bold">{c.value}</div>
                    <p className="mt-2 text-sm text-slate-500">{c.sub}</p>
                  </div>
                ))}
              </div>

              <div className="jh-card rounded-[2rem] bg-white/75 p-7">
                <div className="text-center">
                  <div className="text-xs font-bold tracking-[0.18em] text-secondary uppercase">Blessings await</div>
                  <div className="mt-5">
                    <TempleSilhouette className="mx-auto h-48 w-full max-w-xs text-[#D89B24]/80" />
                  </div>
                  <div className="font-display text-2xl font-bold text-[#08495B]">Bring your loved ones.</div>
                  <p className="mt-2 text-sm text-slate-500">One celebration. Thousands of smiles.</p>
                  <Link to="/event-details" className="mt-4 inline-block text-sm font-bold text-secondary underline">
                    Full event details →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Competition */}
        <section id="competition" className="jh-section-blue relative overflow-hidden py-20 text-white">
          <div className="absolute top-20 -right-32 h-96 w-96 rounded-full border border-white/10" />
          <div className="absolute top-32 -right-20 h-72 w-72 rounded-full border border-[#F7D98A]/10" />
          <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
              <div>
                <div className="text-xs font-bold tracking-[0.2em] text-[#F7D98A] uppercase">Referral competition</div>
                <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
                  Register. Share.
                  <br />
                  <span className="text-[#F7D98A]">Spread the joy.</span>
                </h2>
                <Flourish className="mx-auto h-5 w-40 [&_svg_path]:stroke-[#F7D98A] [&_svg_circle]:fill-[#F7D98A]" />
                <p className="leading-8 text-white/75">
                  Choose to join the referral challenge. You'll receive a unique Krishna code and shareable QR.
                  Each verified registration through your code adds to your score.
                </p>
                <div className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold tracking-[0.18em] text-white/55 uppercase">Competition ends in</div>
                      <div className="mt-2 font-display text-2xl font-bold">The countdown begins</div>
                    </div>
                    <div className="text-3xl">🏆</div>
                  </div>
                  <Countdown to={eventInfo.competitionEnds} />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                {[
                  { icon: "📝", step: "Step 01", title: "Register", copy: "Complete the short Bhakta registration in less than 60 seconds." },
                  { icon: "🪶", step: "Step 02", title: "Get Codes", copy: "Receive your secure Entry QR and, if opted in, your Krishna referral code." },
                  { icon: "📣", step: "Step 03", title: "Share", copy: "Invite friends and family. Every verified referral moves you up the board." },
                ].map((s, i) => (
                  <div key={s.title} className="relative overflow-hidden rounded-3xl bg-white p-6 text-[#17313A] shadow-2xl">
                    <div className={`absolute top-0 right-0 left-0 h-1 ${i === 1 ? "bg-secondary" : "bg-[#D89B24]"}`} />
                    <div className="grid h-16 w-16 place-items-center rounded-full bg-[#D89B24]/15 text-4xl">{s.icon}</div>
                    <div className="mt-6 text-xs font-bold tracking-[0.18em] text-[#D89B24] uppercase">{s.step}</div>
                    <h3 className="mt-2 font-display text-2xl font-bold">{s.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-500">{s.copy}</p>
                  </div>
                ))}
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
              Registration is quick, your Entry QR is personal and secure, and every Bhakta gets a Krishna
              keychain. Opt into the referral challenge if you want to invite your friends.
            </p>
            <Link
              to="/register"
              className="mt-8 inline-flex rounded-2xl bg-gradient-peacock px-8 py-4 text-lg font-extrabold text-white shadow-2xl transition hover:-translate-y-1"
            >
              Register Now · It's Free
            </Link>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
