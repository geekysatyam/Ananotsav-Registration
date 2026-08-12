import { Link } from "@tanstack/react-router";
import { CalendarDays, MapPinned, Clock4 } from "lucide-react";
import { FestiveCard, FestiveIcon, GoldButton, Reveal, SectionHeading } from "./festive";
import { Diya, Flourish, Lotus, PatternBackdrop, PeacockFeather, TempleSilhouette } from "./motifs";
import { eventInfo, siteConfig } from "@/lib/site-config";

export function EventDetailsSection() {
  const cards = [
    { Icon: CalendarDays, label: "Date", value: eventInfo.date, tone: "gold" },
    { Icon: Clock4, label: "Timing", value: eventInfo.timing, tone: "peacock" },
    { Icon: MapPinned, label: "Venue", value: eventInfo.venue, tone: "maroon" },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-cream py-20">
      <PatternBackdrop variant="diya" className="text-secondary opacity-[0.08]" />
      <TempleSilhouette className="pointer-events-none absolute inset-x-0 bottom-0 h-48 w-full text-secondary/15" />
      <PeacockFeather className="pointer-events-none absolute -right-8 top-16 h-52 w-52 opacity-25" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Utsav details"
          title="When and where we gather"
          subtitle="Doors open with the sandhya aarti and stay open until the midnight abhishek. Prasad is served through the night."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {cards.map((c, i) => (
            <Reveal key={c.label} delay={i * 0.1}>
              <FestiveCard tone={i === 1 ? "peacock" : "gold"} className="h-full text-center">
                <FestiveIcon tone={c.tone} size="lg" className="mx-auto">
                  <c.Icon className="h-12 w-12" strokeWidth={2.2} />
                </FestiveIcon>
                <div className="mt-5 text-xs font-bold tracking-[0.24em] text-secondary uppercase">{c.label}</div>
                <p className="mt-2 font-display text-2xl leading-snug">{c.value}</p>
                <Flourish className="mx-auto mt-4 h-5 w-40" />
              </FestiveCard>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2} className="mt-12">
          <div className="grid items-center gap-8 rounded-[2rem] bg-gradient-peacock p-8 text-secondary-foreground shadow-warm md:grid-cols-[1fr_auto]">
            <div className="min-w-0">
              <h3 className="font-display text-3xl">Programme of the night</h3>
            <ul className="mt-4 grid gap-2 text-sm opacity-90 sm:grid-cols-2">
              {siteConfig.event.programme.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            </div>
            <div className="flex shrink-0 gap-3">
              <Diya className="h-20 w-20" />
              <Lotus className="h-20 w-20" />
            </div>
          </div>
        </Reveal>
        <div className="mt-10 text-center">
          <Link to="/register">
            <GoldButton glow>Register for the Utsav</GoldButton>
          </Link>
        </div>
      </div>
    </section>
  );
}
