import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { FloatingMotifs, GradientMesh } from "@/components/ambient";
import { Flourish } from "@/components/motifs";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/competitions")({
  head: () => ({
    meta: [
      { title: `Competitions — ${siteConfig.brand.name}` },
      {
        name: "description",
        content:
          "Join Anandotsav competitions: kids fancy dress and Laddu Gopal shringar at Sri Gokul Gaushala, Amritsar.",
      },
      { property: "og:title", content: `Competitions — ${siteConfig.brand.name}` },
      {
        property: "og:description",
        content: "Festive competitions — fancy dress for kids and Laddu Gopal shringar.",
      },
    ],
  }),
  component: CompetitionsPage,
});

function PosterImage({ competition }) {
  const [failed, setFailed] = useState(false);
  const theme = competition.theme ?? { from: "#08495B", to: "#D89B24" };

  if (failed) {
    return (
      <div
        className="flex aspect-[2/3] w-full flex-col items-center justify-center gap-3 rounded-2xl px-6 text-center"
        style={{ background: `linear-gradient(160deg, ${theme.from}, ${theme.to})` }}
      >
        <p className="font-display text-2xl font-bold text-white">{competition.title}</p>
        <p className="text-sm text-white/80">{competition.tagline}</p>
      </div>
    );
  }

  return (
    <img
      src={competition.poster}
      alt={`${competition.title} poster`}
      width={1024}
      height={1536}
      loading="lazy"
      onError={() => setFailed(true)}
      className="aspect-[2/3] w-full rounded-2xl object-cover shadow-[0_20px_50px_-20px_rgba(8,73,91,0.45)] ring-1 ring-[#08495B]/10"
    />
  );
}

function CompetitionBlock({ competition, reverse = false }) {
  // REFERRAL DISABLED
  // const endsAt = competition.endsAt ?? siteConfig.event.competitionEnds;

  return (
    <section
      id={competition.id}
      className="scroll-mt-28 border-b border-[#D89B24]/15 py-14 last:border-b-0 sm:py-16"
    >
      <div
        className={cn(
          "mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-14",
          reverse && "lg:[&>*:first-child]:order-2",
        )}
      >
        <div className="mx-auto w-full max-w-sm lg:mx-0 lg:max-w-md">
          <PosterImage competition={competition} />
        </div>

        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-[#D89B24] uppercase">
            {competition.audience}
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-[#08495B] sm:text-4xl">
            {competition.title}
          </h2>
          <Flourish className="mt-3 h-5 w-36" />
          <p className="mt-3 font-display text-lg text-[#126B82]">{competition.tagline}</p>
          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
            {competition.description}
          </p>

          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex gap-2">
              <dt className="shrink-0 font-bold text-[#08495B]">When:</dt>
              <dd className="text-slate-600">{competition.timing}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0 font-bold text-[#08495B]">Who:</dt>
              <dd className="min-w-0 flex-1 text-slate-600">
                {competition.categories?.length ? (
                  <ul className="space-y-2">
                    {competition.categories.map((cat) => (
                      <li key={cat.label}>
                        <span className="font-semibold text-[#08495B]">{cat.label}</span>
                        {cat.detail ? (
                          <span className="text-slate-600"> — {cat.detail}</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  competition.audience
                )}
              </dd>
            </div>
            {competition.venue ? (
              <div className="flex gap-2">
                <dt className="shrink-0 font-bold text-[#08495B]">Where:</dt>
                <dd className="text-slate-600">{competition.venue}</dd>
              </div>
            ) : null}
          </dl>

          {competition.note ? (
            <p className="mt-4 rounded-xl bg-[#FFF8E7] px-3 py-2.5 text-sm leading-relaxed text-[#08495B] ring-1 ring-[#D89B24]/25">
              {competition.note}
            </p>
          ) : null}

          {/* REFERRAL DISABLED
          {competition.id === "referral" && endsAt ? (
            <div className="mt-6 max-w-md rounded-2xl border border-[#D89B24]/20 bg-[#FFF8E7]/60 p-4">
              <p className="text-[10px] font-bold tracking-[0.18em] text-[#D89B24] uppercase">
                Competition ends in
              </p>
              <Countdown to={endsAt} variant="light" compact />
            </div>
          ) : null}
          */}

          {competition.howTo?.length ? (
            <ol className="mt-7 space-y-3">
              {competition.howTo.map((step, i) => (
                <li key={step} className="flex gap-3 text-sm text-slate-600">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#D89B24]/15 text-xs font-extrabold text-[#08495B]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="pt-1 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          ) : null}

          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:gap-3">
            {competition.primaryCta ? (
              <Link
                to={competition.primaryCta.to}
                className="inline-flex items-center justify-center rounded-xl bg-secondary px-5 py-2.5 text-sm font-extrabold text-white shadow-md transition hover:bg-[#08495B]"
              >
                {competition.primaryCta.label} →
              </Link>
            ) : null}
            {competition.secondaryCta ? (
              <Link
                to={competition.secondaryCta.to}
                className="inline-flex items-center justify-center rounded-xl border border-secondary/20 bg-white px-5 py-2.5 text-sm font-bold text-secondary shadow-sm transition hover:bg-[#EEF9F8]"
              >
                {competition.secondaryCta.label}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function CompetitionsPage() {
  const competitions = siteConfig.competitions ?? [];

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.replace("#", "") : "";
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) {
      requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }, []);

  return (
    <SiteShell>
      <div className="relative overflow-hidden">
        <GradientMesh />
        <FloatingMotifs />

        <header className="relative border-b border-[#D89B24]/15 bg-gradient-to-b from-[#EEF9F8] to-white py-10 sm:py-20">
          <div className="relative z-10 mx-auto max-w-3xl px-5 text-center sm:px-8">
            <p className="text-xs font-bold tracking-[0.22em] text-[#D89B24] uppercase">
              {siteConfig.brand.name}
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold text-[#08495B] sm:text-5xl">
              Competitions
            </h1>
            <Flourish className="mx-auto mt-4 h-5 w-40" />
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              Celebrate with devotion — dress up the little ones, or offer shringar to Laddu Gopal.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {competitions.map((c) => (
                <a
                  key={c.id}
                  href={`#${c.id}`}
                  className="rounded-full border border-[#D89B24]/25 bg-white/80 px-3.5 py-1.5 text-xs font-bold text-[#08495B] transition hover:border-[#D89B24]/50 hover:bg-white"
                >
                  {c.shortTitle ?? c.title}
                </a>
              ))}
            </div>
          </div>
        </header>

        <div className="relative z-10 bg-white">
          {competitions.map((competition, index) => (
            <CompetitionBlock
              key={competition.id}
              competition={competition}
              reverse={index % 2 === 1}
            />
          ))}
        </div>

        <div className="relative z-10 border-t border-[#D89B24]/15 bg-[#EEF9F8]/50 py-12 text-center">
          <p className="font-display text-2xl font-bold text-[#08495B]">Coming to Anandotsav?</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            Register online for your entry QR — then join any competition that calls to you.
          </p>
          <Link
            to="/register"
            className="mt-5 inline-flex rounded-xl bg-secondary px-6 py-3 text-sm font-extrabold text-white shadow-lg transition hover:bg-[#08495B]"
          >
            Register for Free !!
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
