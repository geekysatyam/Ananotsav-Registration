import { Link } from "@tanstack/react-router";
import { CalendarDays, Clock4, MapPinned, Phone, Mail } from "lucide-react";
import { Flourish, PeacockFeather, TempleSilhouette } from "./motifs";
import { siteConfig } from "@/lib/site-config";

const { event, contact, organization } = siteConfig;

export function EventDetailsSection() {
  const infoCards = [
    { Icon: CalendarDays, label: "Date", value: event.date, accent: "border-[#D89B24]/30 bg-[#D89B24]/8" },
    { Icon: Clock4, label: "Time", value: event.timing, accent: "border-secondary/25 bg-secondary/8" },
    { Icon: MapPinned, label: "Venue", value: event.venue, accent: "border-[#8B2942]/20 bg-[#8B2942]/5" },
  ];

  return (
    <div className="overflow-x-clip bg-[#FFFDF7] text-[#17313A]">
      {/* Hero — poster invitation */}
      <section className="jh-hero-bg relative overflow-hidden py-12 sm:py-16 lg:py-20">
        <div className="jh-pattern" />
        <PeacockFeather className="pointer-events-none absolute -left-6 top-24 hidden h-40 w-20 rotate-[-24deg] opacity-20 lg:block" />
        <PeacockFeather className="pointer-events-none absolute -right-4 top-32 hidden h-36 w-16 rotate-[160deg] scale-x-[-1] opacity-20 lg:block" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
            <div className="text-center lg:text-left">
              <p className="font-display text-lg italic text-[#5c4a3a] sm:text-xl">
                {event.invitation.lead}
              </p>
              <p className="mt-3 text-xs font-bold tracking-[0.28em] text-[#8B2942] uppercase sm:text-sm">
                Sri Krishna Janmashtami
              </p>
              <h1 className="mt-2 font-display text-[clamp(2.15rem,9vw,4.5rem)] leading-[1.02] font-bold text-[#08495B]">
                {siteConfig.brand.shortName}
              </h1>
              <div className="mt-4 flex items-center justify-center gap-3 lg:justify-start">
                <PeacockFeather className="hidden h-10 w-5 rotate-[-18deg] opacity-70 sm:block" />
                <p className="max-w-md text-[11px] font-bold tracking-[0.14em] text-[#5c4a3a] uppercase sm:text-xs">
                  {event.invitation.tagline}
                </p>
                <PeacockFeather className="hidden h-10 w-5 rotate-[18deg] scale-x-[-1] opacity-70 sm:block" />
              </div>
              <Flourish className="mx-auto mt-5 h-5 w-48 lg:mx-0" />
              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                {event.invitation.body}
              </p>
              <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
                <Link
                  to="/register"
                  className="jh-pulse-glow inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-3 text-sm font-extrabold text-white shadow-lg transition hover:bg-[#08495B]"
                >
                  Register for Free !! <span aria-hidden>→</span>
                </Link>
                <a
                  href={event.posterSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border border-[#D89B24]/35 bg-white/80 px-5 py-3 text-sm font-bold text-[#08495B] shadow-sm transition hover:bg-white"
                >
                  View official poster
                </a>
              </div>
            </div>

            <div className="mx-auto w-full max-w-md lg:max-w-none">
              <div className="overflow-hidden rounded-2xl border-4 border-[#D89B24]/35 bg-white p-2 shadow-[0_24px_60px_rgba(8,73,91,0.14)] sm:rounded-3xl sm:p-3">
                <img
                  src={event.posterSrc}
                  alt="Anandotsav 2026 official invitation poster"
                  className="aspect-[2/3] w-full rounded-xl object-cover"
                  width={1024}
                  height={1536}
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Date · Time · Venue */}
      <section className="relative border-y border-[#D89B24]/15 bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-bold tracking-[0.24em] text-[#D89B24] uppercase">Utsav details</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-[#08495B] sm:text-4xl">
              When & where we gather
            </h2>
            <Flourish className="mx-auto mt-4 h-5 w-44" />
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-6">
            {infoCards.map(({ Icon, label, value, accent }) => (
              <div
                key={label}
                className={`jh-glass rounded-2xl border p-6 text-center ${accent}`}
              >
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white/80 text-secondary shadow-sm">
                  <Icon className="h-7 w-7" strokeWidth={2} />
                </div>
                <div className="mt-4 text-xs font-bold tracking-[0.22em] text-secondary uppercase">{label}</div>
                <p className="mt-2 font-display text-xl leading-snug font-bold text-[#08495B]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Celebration featuring — poster grid */}
      <section className="relative overflow-hidden py-14 sm:py-16">
        <div className="jh-pattern opacity-[0.12]" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl rounded-2xl bg-[#8B2942] px-4 py-3 text-center shadow-md sm:rounded-full sm:px-6">
            <p className="text-[11px] font-bold tracking-[0.14em] text-[#F7D98A] uppercase sm:text-sm sm:tracking-[0.22em]">
              A divine celebration featuring
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {event.celebrationFeatures.map((item) => (
              <article
                key={item.title}
                className="group overflow-hidden rounded-2xl border border-[#D89B24]/20 bg-white shadow-[0_12px_40px_rgba(8,73,91,0.08)] transition hover:-translate-y-1 hover:shadow-[0_18px_48px_rgba(8,73,91,0.12)]"
              >
                <div className="flex h-28 items-center justify-center bg-gradient-to-br from-[#FFF8E7] via-white to-[#EEF9F8] text-5xl">
                  {item.emoji}
                </div>
                <div className="border-t border-[#8B2942]/15 bg-[#8B2942] px-4 py-3">
                  <h3 className="text-center text-[11px] font-bold tracking-[0.12em] text-white uppercase sm:text-xs">
                    {item.title}
                  </h3>
                </div>
                <p className="px-4 py-4 text-sm leading-relaxed text-slate-600">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Programme */}
      <section className="jh-section-blue relative overflow-hidden py-14 text-white sm:py-16">
        <div className="jh-pattern opacity-[0.07]" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-bold tracking-[0.2em] text-[#F7D98A] uppercase">Programme</p>
              <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">How the night unfolds</h2>
              <p className="mt-4 leading-7 text-white/75">
                {event.invitation.closing}
              </p>
            </div>
            <ul className="grid gap-2 rounded-2xl border border-white/15 bg-white/10 p-6 text-sm leading-relaxed backdrop-blur-sm sm:grid-cols-2 sm:gap-x-4 sm:gap-y-2 sm:p-8">
              {event.programme.map((item) => (
                <li key={item} className="flex gap-2 text-white/90">
                  <span className="text-[#F7D98A]">·</span>
                  <span>{item.replace(/^·\s*/, "")}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Competitions — short details */}
      <section className="relative border-b border-[#D89B24]/15 bg-[#FFFDF7] py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold tracking-[0.24em] text-[#D89B24] uppercase">Competitions</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-[#08495B] sm:text-4xl">
                Join in the celebration
              </h2>
              <Flourish className="mt-4 h-5 w-40" />
            </div>
            <Link
              to="/competitions"
              className="inline-flex items-center justify-center rounded-xl border border-secondary/20 bg-white px-4 py-2.5 text-sm font-bold text-secondary shadow-sm transition hover:bg-[#EEF9F8]"
            >
              View all competitions →
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {siteConfig.competitions.map((c) => (
              <Link
                key={c.id}
                to="/competitions"
                hash={c.id}
                className="block rounded-2xl border border-[#D89B24]/20 bg-white p-5 shadow-[0_10px_32px_rgba(8,73,91,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(8,73,91,0.1)]"
              >
                <h3 className="font-display text-xl font-bold text-[#08495B]">{c.title}</h3>
                <p className="mt-1 text-sm text-[#126B82]">{c.tagline}</p>
                {c.description ? (
                  <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-slate-600">
                    {c.description}
                  </p>
                ) : null}
                <p className="mt-3 text-xs leading-relaxed text-slate-600">{c.timing}</p>
                {c.venue ? (
                  <p className="mt-1 text-xs text-slate-500">{c.venue}</p>
                ) : null}
                {c.categories?.length ? (
                  <ul className="mt-3 space-y-1 text-xs text-slate-600">
                    {c.categories.map((cat) => (
                      <li key={cat.label}>
                        <span className="font-semibold text-[#08495B]">{cat.label}</span>
                        {cat.detail ? ` — ${cat.detail}` : ""}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {c.note ? (
                  <p className="mt-3 rounded-lg bg-[#FFF8E7] px-2.5 py-2 text-xs leading-relaxed text-[#08495B] ring-1 ring-[#D89B24]/20">
                    {c.note}
                  </p>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Venue & logistics */}
      <section className="relative overflow-hidden py-14 sm:py-16">
        <TempleSilhouette className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full text-secondary/10" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h2 className="font-display text-3xl font-bold text-[#08495B] sm:text-4xl">
                {event.venueInfo.title}
              </h2>
              <Flourish className="mt-4 h-5 w-40" />
              <p className="mt-4 max-w-2xl leading-8 text-slate-600">{event.venueInfo.description}</p>
              <ul className="mt-6 space-y-3 text-sm leading-relaxed text-slate-600">
                <li>{event.venueInfo.cows}</li>
                <li>{event.venueInfo.temple}</li>
                <li>{event.venueInfo.gurukul}</li>
              </ul>
            </div>
            <div className="space-y-4">
              {event.logistics.map((item) => (
                <div key={item.title} className="jh-glass rounded-2xl border border-secondary/10 p-5">
                  <h3 className="font-display text-xl font-bold text-[#08495B]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact & CTA */}
      <section className="relative overflow-hidden border-t border-[#D89B24]/20 bg-gradient-to-br from-[#FFF8E7] to-[#EEF9F8] py-14 sm:py-16">
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="jh-glass mx-auto max-w-xl rounded-2xl border border-[#D89B24]/25 p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold text-[#08495B] sm:text-3xl">Reach the seva desk</h2>
            <div className="mt-6 space-y-4 text-left text-sm sm:text-base">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(event.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 text-slate-700 transition hover:text-secondary"
              >
                <MapPinned className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                <span>{event.address}</span>
              </a>
              {contact.phone && (
                <a href={contact.phoneHref} className="flex items-center gap-3 text-slate-700 transition hover:text-secondary">
                  <Phone className="h-5 w-5 shrink-0 text-secondary" />
                  <span>{contact.phone}</span>
                </a>
              )}
              <a href={contact.emailHref} className="flex items-center gap-3 text-slate-700 transition hover:text-secondary">
                <Mail className="h-5 w-5 shrink-0 text-secondary" />
                <span className="min-w-0 break-all">{contact.email}</span>
              </a>
            </div>
          </div>

          <p className="mt-8 font-display text-lg italic text-[#5c4a3a] sm:text-xl">
            {event.invitation.footerBanner}
          </p>

          <Link
            to="/register"
            className="jh-pulse-glow mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-gold px-8 py-3.5 text-base font-extrabold text-white shadow-lg transition hover:opacity-95"
          >
            Register for {siteConfig.brand.name} <span aria-hidden>→</span>
          </Link>
          <p className="mt-4 text-xs text-slate-500">{organization.name}</p>
        </div>
      </section>
    </div>
  );
}
