import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  MessageCircle,
  Copy,
  Send,
  PartyPopper,
  CalendarDays,
} from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { Reveal, SectionHeading, FestiveIcon } from "@/components/festive";
import { FloatingMotifs, GradientMesh } from "@/components/ambient";
import { Flourish, PatternBackdrop, PeacockFeather, Lotus } from "@/components/motifs";
import { QrSvg, downloadEntryPass, downloadReferralPass } from "@/components/qr";
import { eventInfo, REFERRAL_LINK_BASE, getGoogleCalendarEventUrl, siteConfig } from "@/lib/event-info";
import { loadRegistrationResult } from "@/lib/api";

export const Route = createFileRoute("/success")({
  head: () => ({
    meta: [
      { title: "Registration Confirmed — Janmashtami Utsav 2026" },
      {
        name: "description",
        content:
          "Your Janmashtami Utsav entry QR codes are ready. Download them, share your referral code and claim Divine Gifts at the desk.",
      },
      { property: "og:title", content: "Registration Confirmed — Janmashtami Utsav 2026" },
      {
        property: "og:description",
        content: "Entry QR codes for every family member, plus your Divine Gift pass.",
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

function EntryPassCard({ member }) {
  return (
    <article className="mx-auto w-full max-w-[22rem] rounded-[1.6rem] bg-[#D89B24] p-[2px] shadow-warm sm:max-w-[24rem]">
      <div className="rounded-[calc(1.6rem-2px)] bg-[#F7D98A]/50 p-[4px]">
        <div className="relative overflow-hidden rounded-[1.25rem] bg-[#fffdf8] px-5 py-5 text-center sm:px-6 sm:py-6">
          <p className="font-display text-[1.55rem] font-bold leading-none text-[#08495B] sm:text-[1.75rem]">
            {siteConfig.brand.name}
          </p>
          <p className="mt-1.5 text-[10px] font-bold tracking-[0.22em] text-[#D89B24] uppercase">
            Bhakta Entry Pass
          </p>

          <div className="mx-auto mt-4 w-fit rounded-2xl border-[3px] border-[#126B82] bg-white p-2">
            <QrSvg value={member.signedPayload} size={188} />
          </div>

          <h3 className="mt-4 break-words font-display text-[1.45rem] font-bold leading-tight text-[#08495B] sm:text-2xl">
            {member.fullName}
          </h3>
          <p className="mt-1 text-[11px] font-semibold tracking-[0.12em] text-[#126B82] uppercase">
            Entry pass · {member.entryCode}
          </p>

          <div className="mt-4 rounded-xl border border-[#D89B24]/50 bg-[#F7D98A]/35 px-3.5 py-3 text-left">
            <p className="font-display text-sm font-bold text-[#08495B]">Your Divine Gift</p>
            <p className="mt-1 text-xs leading-snug text-slate-600">
              Show your registration pass at the Seva Desk for event assistance.
            </p>
          </div>

          <p className="mt-4 text-xs text-slate-500">{eventInfo.date}</p>
          <p className="mt-0.5 text-[11px] text-slate-400">{eventInfo.venue}</p>
        </div>
      </div>
    </article>
  );
}

function DownloadActions({ member, registrations, downloaded, onDownload, onDownloadAll }) {
  const btn =
    "flex min-h-10 w-full items-center justify-center gap-2 rounded-full px-3 py-2 font-display text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98] sm:min-h-11 sm:px-4";
  return (
    <div className="relative mt-3 w-full sm:mt-4">
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
  const [referralCopied, setReferralCopied] = useState(false);
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

  const referralLink = primary.referralCode
    ? `${REFERRAL_LINK_BASE}?ref=${encodeURIComponent(primary.referralCode)}`
    : null;

  const googleCalendarUrl = getGoogleCalendarEventUrl(registrations);

  const copyReferral = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setReferralCopied(true);
      setTimeout(() => setReferralCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const downloadReferral = async () => {
    if (!referralLink || !primary.referralCode) return;
    await downloadReferralPass({
      referralLink,
      referralCode: primary.referralCode,
      filename: `referral-${primary.referralCode}`,
    });
  };

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
                      className={`min-w-0 ${registrations.length === 1 ? "col-span-3" : ""}`}
                    >
                      <EntryPassCard member={member} />
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
                  <div className="relative mt-3 flex items-center justify-center gap-1.5">
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

          {primary.wantsReferral && primary.referralCode && referralLink && (
            <Reveal delay={0.1} className="mt-8 sm:mt-10">
              <div className="rounded-[2rem] bg-gradient-peacock p-[3px] shadow-warm">
                <div className="relative overflow-hidden rounded-[calc(2rem-2px)] bg-gradient-cream p-5 sm:p-9">
                  <PatternBackdrop variant="diya" className="text-secondary opacity-[0.07]" />
                  <Lotus className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 opacity-25" />

                  <div className="relative grid items-center gap-6 md:grid-cols-[auto_minmax(0,1fr)] md:gap-8">
                    <div className="mx-auto rounded-3xl bg-background p-4 shadow-warm ring-2 ring-secondary/35">
                      <QrSvg value={referralLink} size={170} />
                    </div>

                    <div className="min-w-0 text-center md:text-left">
                      <h3 className="font-display text-2xl sm:text-3xl">Share your Krishna code</h3>
                      <Flourish className="mx-auto mt-3 h-5 w-48 md:mx-0" />
                      <p className="mt-3 font-display text-2xl tracking-[0.12em] text-secondary sm:text-3xl">
                        {primary.referralCode}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                        Every bhakta who registers with your code lifts you up the leaderboard.
                      </p>

                      <div className="mt-5 flex flex-wrap justify-center gap-2.5 md:justify-start">
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
          ) : (
            <div className="mt-8 text-center sm:mt-10">
              <p className="text-sm text-muted-foreground">Your entry pass is ready — see you at the utsav! 🙏</p>
              <Link
                to="/"
                className="mt-4 inline-flex min-h-11 items-center rounded-full bg-secondary/15 px-6 font-display font-semibold text-secondary ring-1 ring-secondary/35 transition hover:scale-105"
              >
                Back to home
              </Link>
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
