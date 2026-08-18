import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  // MessageCircle,
  // Copy,
  // Send,
  // PartyPopper,
  CalendarDays,
} from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { Reveal, SectionHeading } from "@/components/festive";
// REFERRAL DISABLED — restore FestiveIcon with Reveal, SectionHeading
// import { FestiveIcon, Reveal, SectionHeading } from "@/components/festive";
import { FloatingMotifs, GradientMesh } from "@/components/ambient";
import { Flourish, Gift, PatternBackdrop, PeacockFeather } from "@/components/motifs";
// REFERRAL DISABLED — restore Lotus with the motifs import
// import { Flourish, Gift, Lotus, PatternBackdrop, PeacockFeather } from "@/components/motifs";
import { QrSvg, downloadEntryPass } from "@/components/qr";
// import { downloadReferralPass } from "@/components/qr";
import { eventInfo, getGoogleCalendarEventUrl, siteConfig } from "@/lib/event-info";
// import { REFERRAL_LINK_BASE } from "@/lib/event-info";
import { loadRegistrationResult } from "@/lib/api";

export const Route = createFileRoute("/success")({
  head: () => ({
    meta: [
      { title: "Registration Confirmed — Janmashtami Utsav 2026" },
      {
        name: "description",
        content:
          "Your Janmashtami Utsav entry QR codes are ready. Come for a lot of memories and a divine evening.",
      },
      { property: "og:title", content: "Registration Confirmed — Janmashtami Utsav 2026" },
      {
        property: "og:description",
        content: "Entry QR codes for every family member — attend for memories and a divine evening.",
      },
    ],
  }),
  component: SuccessPage,
});

function Confetti() {
  const bits = Array.from({ length: 20 }).map((_, i) => ({
    x: (i * 53) % 100,
    delay: (i % 10) * 0.06,
    hue: i % 3,
  }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {bits.map((b, i) => (
        <motion.span
          key={i}
          className={`absolute top-0 h-3 w-1.5 rounded-full ${
            b.hue === 0 ? "bg-primary" : b.hue === 1 ? "bg-secondary" : "bg-destructive"
          }`}
          style={{ left: `${b.x}%` }}
          initial={{ y: -40, opacity: 1, rotate: 0 }}
          animate={{ y: "100vh", opacity: [1, 1, 0], rotate: 720 }}
          transition={{ duration: 2.6 + (i % 5) * 0.4, delay: b.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

function displayFirstName(name) {
  const part = name.trim().split(/\s+/)[0] || name;
  return part.length > 14 ? `${part.slice(0, 14)}…` : part;
}

function CompetitionDetailsCard({ competition, extra }) {
  if (!competition) return null;
  return (
    <Reveal delay={0.08} className="mt-6 sm:mt-8">
      <div className="rounded-[1.5rem] bg-gradient-peacock p-[2px] shadow-warm sm:rounded-[2rem] sm:p-[3px]">
        <div className="relative overflow-hidden rounded-[calc(1.5rem-2px)] bg-gradient-cream p-4 sm:rounded-[calc(2rem-2px)] sm:p-7">
          <PatternBackdrop variant="diya" className="text-secondary opacity-[0.07]" />
          <p className="text-xs font-bold tracking-[0.18em] text-secondary uppercase">
            Competition details
          </p>
          <h3 className="mt-1 font-display text-2xl sm:text-3xl">{competition.title}</h3>
          <Flourish className="mt-2 h-5 w-40" />
          <p className="mt-2 text-sm font-semibold text-secondary">{competition.tagline}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{competition.description}</p>
          <p className="mt-3 text-sm font-semibold text-foreground">
            {competition.timing}
            {competition.venue ? ` · ${competition.venue}` : ""}
          </p>
          {extra ? <div className="mt-3">{extra}</div> : null}
          {competition.categories?.length > 0 && (
            <ul className="mt-4 space-y-2">
              {competition.categories.map((cat) => (
                <li
                  key={cat.label}
                  className="rounded-xl bg-background/70 px-3 py-2 text-sm ring-1 ring-primary/20"
                >
                  <span className="font-bold text-secondary">{cat.label}</span>
                  {cat.detail ? (
                    <span className="mt-0.5 block text-xs text-muted-foreground">{cat.detail}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
          {competition.howTo?.length > 0 && (
            <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-sm text-foreground">
              {competition.howTo.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          )}
          {competition.note ? (
            <p className="mt-4 rounded-xl bg-primary/10 px-3 py-2 text-sm font-semibold text-secondary ring-1 ring-primary/25">
              {competition.note}
            </p>
          ) : null}
          <Link
            to="/competitions"
            hash={competition.id}
            className="mt-4 inline-flex min-h-10 items-center rounded-full bg-secondary/15 px-4 text-sm font-display font-semibold text-secondary ring-1 ring-secondary/35"
          >
            Full competition details
          </Link>
        </div>
      </div>
    </Reveal>
  );
}

function GiftCard({ name }) {
  const first = displayFirstName(name);
  return (
    <div className="mt-2 rounded-xl bg-gradient-gold p-[2px] sm:mt-3">
      <div className="flex items-start gap-2.5 rounded-[calc(0.75rem-1px)] bg-card p-2.5 sm:items-center sm:gap-3 sm:p-3">
        <Gift className="h-10 w-10 shrink-0 sm:h-12 sm:w-12" />
        <div className="min-w-0 flex-1">
          <div className="font-display text-sm sm:text-base">A divine evening awaits</div>
          <p className="text-xs leading-snug text-muted-foreground">
            Attend the event,{" "}
            <span className="break-all font-semibold text-foreground" title={name}>
              {first}
            </span>
            — a lot of memories and a divine evening.
          </p>
        </div>
      </div>
    </div>
  );
}

function DownloadActions({ member, registrations, downloaded, onDownload, onDownloadAll }) {
  const btn =
    "flex min-h-10 w-full items-center justify-center gap-2 rounded-full px-3 py-2 font-display text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98] sm:min-h-11 sm:px-4";
  return (
    <div className="relative mt-2 w-full sm:mt-3">
      <div className={`grid w-full gap-2 ${registrations.length > 1 ? "sm:grid-cols-2" : "sm:grid-cols-1"}`}>
        <button
          type="button"
          onClick={() => onDownload(member)}
          className={`${btn} bg-gradient-gold text-primary-foreground shadow-warm ring-1 ring-primary/50`}
        >
          <Download className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
          <span>Download Pass</span>
        </button>
        {registrations.length > 1 && (
          <button
            type="button"
            onClick={onDownloadAll}
            className={`${btn} bg-secondary/15 text-secondary ring-1 ring-secondary/35`}
          >
            <Download className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
            <span>Download All</span>
          </button>
        )}
      </div>
      <p className="mt-1.5 text-center text-xs text-muted-foreground">
        {downloaded.length} of {registrations.length} downloaded
      </p>
    </div>
  );
}

function SuccessPage() {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [familyGroupId, setFamilyGroupId] = useState(null);
  const [index, setIndex] = useState(0);
  const [downloaded, setDownloaded] = useState([]);
  // REFERRAL DISABLED
  // const [referralCopied, setReferralCopied] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const result = loadRegistrationResult();
    if (!result || result.registrations.length === 0) {
      navigate({ to: "/register" });
      return;
    }
    setRegistrations(result.registrations);
    setFamilyGroupId(result.familyGroupId);
    setReady(true);
  }, [navigate]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-festive">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const safeIndex = Math.min(index, registrations.length - 1);
  const member = registrations[safeIndex];
  const primary = registrations.find((r) => r.isPrimaryRegistrant) ?? registrations[0];
  const confirmationLabel = familyGroupId ?? primary.entryCode;

  const markDownload = async (reg) => {
    await downloadEntryPass({
      signedPayload: reg.signedPayload,
      fullName: reg.fullName,
      entryCode: reg.entryCode,
      filename: `entry-pass-${reg.entryCode}`,
    });
    setDownloaded((d) => (d.includes(reg.id) ? d : [...d, reg.id]));
  };

  // REFERRAL DISABLED
  // const referralLink = primary.referralCode
  //   ? `${REFERRAL_LINK_BASE}?ref=${encodeURIComponent(primary.referralCode)}`
  //   : null;

  const googleCalendarUrl = getGoogleCalendarEventUrl(registrations);

  // const copyReferral = async () => {
  //   if (!referralLink) return;
  //   try {
  //     await navigator.clipboard.writeText(referralLink);
  //     setReferralCopied(true);
  //     setTimeout(() => setReferralCopied(false), 2000);
  //   } catch {
  //     /* ignore */
  //   }
  // };
  //
  // const downloadReferral = async () => {
  //   if (!referralLink || !primary.referralCode) return;
  //   await downloadReferralPass({
  //     referralLink,
  //     referralCode: primary.referralCode,
  //     filename: `referral-${primary.referralCode}`,
  //   });
  // };

  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-gradient-festive py-5 sm:py-16">
        <GradientMesh />
        <PatternBackdrop variant="mandala" className="text-secondary opacity-[0.07]" />
        <FloatingMotifs count={10} />
        <Confetti />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
          <SectionHeading
            compact
            eyebrow={`Confirmation · ${confirmationLabel}`}
            title="Hari Bol! You're registered! 🎉"
            subtitle={`${eventInfo.date} · ${eventInfo.venue}`}
          />

          <Reveal className="mt-4 sm:mt-10">
            <div className="rounded-[1.5rem] bg-gradient-gold p-[2px] shadow-warm sm:rounded-[2rem] sm:p-[3px]">
              <div className="relative overflow-hidden rounded-[calc(1.5rem-2px)] bg-card p-4 pb-5 sm:rounded-[calc(2rem-2px)] sm:p-7 sm:pb-8">
                <PatternBackdrop variant="feather" className="text-primary opacity-[0.06]" />
                <PeacockFeather className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 opacity-25" />

                <div className="relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:gap-3">
                  {registrations.length > 1 && (
                    <button
                      type="button"
                      aria-label="Previous member"
                      onClick={() =>
                        setIndex((i) => (i - 1 + registrations.length) % registrations.length)
                      }
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary/15 text-secondary ring-1 ring-secondary/30 sm:h-12 sm:w-12"
                    >
                      <ChevronLeft className="h-5 w-5 sm:h-7 sm:w-7" />
                    </button>
                  )}

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      className={`min-w-0 text-center ${registrations.length === 1 ? "col-span-3" : ""}`}
                    >
                      <div className="mx-auto w-fit rounded-2xl bg-background p-3 shadow-warm ring-2 ring-primary/40 sm:rounded-3xl sm:p-4">
                        <QrSvg value={member.signedPayload} size={170} />
                      </div>
                      <div className="mt-3 break-words font-display text-lg sm:mt-4 sm:text-2xl">
                        {member.fullName}
                      </div>
                      <div className="text-[10px] tracking-[0.15em] text-muted-foreground uppercase sm:text-xs sm:tracking-[0.2em]">
                        Entry pass · {member.entryCode}
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {registrations.length > 1 && (
                    <button
                      type="button"
                      aria-label="Next member"
                      onClick={() => setIndex((i) => (i + 1) % registrations.length)}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary/15 text-secondary ring-1 ring-secondary/30 sm:h-12 sm:w-12"
                    >
                      <ChevronRight className="h-5 w-5 sm:h-7 sm:w-7" />
                    </button>
                  )}
                </div>

                {registrations.length > 1 && (
                  <div className="relative mt-2 flex items-center justify-center gap-1.5 sm:mt-3">
                    {registrations.map((m, i) => (
                      <button
                        key={m.id}
                        type="button"
                        aria-label={`Show ${m.fullName}`}
                        onClick={() => setIndex(i)}
                        className={`h-2.5 rounded-full transition-all ${
                          i === safeIndex ? "w-8 bg-gradient-gold" : "w-2.5 bg-primary/35"
                        }`}
                      />
                    ))}
                    <span className="ml-3 text-xs font-bold tracking-[0.15em] text-muted-foreground uppercase">
                      {safeIndex + 1} / {registrations.length}
                    </span>
                  </div>
                )}

                <GiftCard name={member.fullName} />

                <DownloadActions
                  member={member}
                  registrations={registrations}
                  downloaded={downloaded}
                  onDownload={markDownload}
                  onDownloadAll={async () => {
                    for (const m of registrations) {
                      await markDownload(m);
                    }
                  }}
                />

                <div className="relative mt-3 sm:mt-4">
                  <a
                    href={googleCalendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-primary/15 px-3 py-2 font-display text-sm font-semibold text-secondary ring-1 ring-primary/35 transition-transform hover:scale-[1.02] active:scale-[0.98] sm:min-h-11 sm:px-4"
                  >
                    <CalendarDays className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                    <span>Add to Google Calendar</span>
                  </a>
                </div>
              </div>
            </div>
          </Reveal>

          {primary.wantsFancyDress && (
            <CompetitionDetailsCard
              competition={siteConfig.competitions.find((c) => c.id === "fancy-dress")}
            />
          )}

          {primary.wantsLadduGopal && (
            <CompetitionDetailsCard
              competition={siteConfig.competitions.find((c) => c.id === "laddu-gopal")}
              extra={
                primary.ladduGopalSize ? (
                  <p className="rounded-xl bg-background/80 px-3 py-2 text-sm ring-1 ring-primary/20">
                    Registered size:{" "}
                    <span className="font-bold text-secondary">{primary.ladduGopalSize}</span>
                  </p>
                ) : null
              }
            />
          )}

          {/* REFERRAL DISABLED — original share Krishna code card (uncomment + restore FestiveIcon, Lotus, referral helpers)
          {primary.wantsReferral && primary.referralCode && referralLink && (
            <Reveal delay={0.1} className="mt-10">
              <div className="rounded-[2rem] bg-gradient-peacock p-[3px] shadow-warm">
                <div className="relative overflow-hidden rounded-[calc(2rem-2px)] bg-gradient-cream p-6 sm:p-9">
                  <PatternBackdrop variant="diya" className="text-secondary opacity-[0.07]" />
                  <Lotus className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 opacity-25" />

                  <div className="relative grid items-center gap-8 md:grid-cols-[auto_minmax(0,1fr)]">
                    <div className="mx-auto rounded-3xl bg-background p-4 shadow-warm ring-2 ring-secondary/35">
                      <QrSvg value={referralLink} size={170} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-display text-3xl">Share your Krishna code</h3>
                      <Flourish className="mt-3 h-5 w-48" />
                      <p className="mt-3 font-display text-2xl tracking-[0.15em] text-secondary">
                        {primary.referralCode}
                      </p>
                      <p className="mt-2 text-muted-foreground">
                        Every bhakta who registers with your code lifts you up the leaderboard.
                      </p>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={downloadReferral}
                          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gradient-gold px-5 text-sm font-bold text-primary-foreground shadow-warm ring-1 ring-primary/40 transition-transform hover:scale-105"
                        >
                          <Download className="h-5 w-5" />
                          Download QR
                        </button>
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(
                            `Join me at Janmashtami Utsav 2026! Register with my code: ${referralLink}`,
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary/20 px-5 text-sm font-bold text-secondary ring-1 ring-primary/40 transition-transform hover:scale-105"
                        >
                          <MessageCircle className="h-5 w-5" /> WhatsApp
                        </a>
                        <a
                          href={`sms:?body=${encodeURIComponent(`Register for Janmashtami Utsav: ${referralLink}`)}`}
                          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary/20 px-5 text-sm font-bold text-secondary ring-1 ring-primary/40 transition-transform hover:scale-105"
                        >
                          <Send className="h-5 w-5" /> SMS
                        </a>
                        <button
                          type="button"
                          onClick={copyReferral}
                          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary/20 px-5 text-sm font-bold text-secondary ring-1 ring-primary/40 transition-transform hover:scale-105"
                        >
                          <Copy className="h-5 w-5" />
                          {referralCopied ? "Copied" : "Copy link"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          )}

          {primary.wantsReferral && primary.referralCode ? (
            <div className="mt-8 flex flex-wrap justify-center gap-4 sm:mt-10">
              <FestiveIcon tone="maroon">
                <PartyPopper className="h-8 w-8" strokeWidth={2.4} />
              </FestiveIcon>
              <Link
                to="/leaderboard"
                className="inline-flex min-h-12 items-center rounded-full bg-gradient-gold px-7 font-display font-semibold text-primary-foreground shadow-warm"
              >
                See where you rank
              </Link>
            </div>
          ) : null}
          */}

          <div className="mt-8 text-center sm:mt-10">
            <p className="text-sm text-muted-foreground">
              Attend the event for a lot of memories and a divine evening. See you at the utsav! 🙏
            </p>
            <Link
              to="/"
              className="mt-4 inline-flex min-h-11 items-center rounded-full bg-secondary/15 px-6 font-display font-semibold text-secondary ring-1 ring-secondary/35 transition hover:scale-105"
            >
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
