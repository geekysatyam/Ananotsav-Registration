import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Cake, Search, Loader2 } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { GoldButton, SectionHeading } from "@/components/festive";
import { FloatingMotifs, GradientMesh } from "@/components/ambient";
import { Flourish, Lotus, PatternBackdrop, PeacockFan, TempleSilhouette } from "@/components/motifs";
import { DobPicker } from "@/components/dob-picker";
import { api, normalizePhone, saveRegistrationResult } from "@/lib/api";
import { phoneValidationMessage, dobValidationMessage } from "@/lib/validators";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/find")({
  head: () => ({
    meta: [
      { title: "Find My Registration — Janmashtami Utsav 2026" },
      {
        name: "description",
        content:
          "Lost your entry QR? Look up your Janmashtami Utsav registration with your phone number and date of birth.",
      },
      { property: "og:title", content: "Find My Registration — Janmashtami Utsav 2026" },
      {
        property: "og:description",
        content: "Retrieve your entry QR codes for a divine evening in seconds.",
      },
    ],
  }),
  component: FindPage,
});

function FindPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [noMatch, setNoMatch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState({ phone: false, dob: false });

  const phoneError = touched.phone ? phoneValidationMessage(phone) : null;
  const dobError = touched.dob ? dobValidationMessage(dob) : null;

  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-gradient-festive py-10 sm:py-20">
        <GradientMesh />
        <PatternBackdrop variant="mandala" className="text-secondary opacity-[0.07]" />
        <FloatingMotifs count={8} />
        <TempleSilhouette className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full text-secondary/15" />
        <Lotus className="pointer-events-none absolute -left-10 top-32 h-52 w-52 opacity-25" />

        <div className="relative mx-auto max-w-2xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Already registered?"
            title="Find my registration"
            subtitle="Enter the phone number and date of birth you registered with — we'll bring back your entry QR codes."
          />

          <motion.form
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={async (e) => {
              e.preventDefault();
              setNoMatch(false);
              setTouched({ phone: true, dob: true });
              const pErr = phoneValidationMessage(phone);
              const dErr = dobValidationMessage(dob);
              if (pErr || dErr) {
                setError(pErr || dErr);
                return;
              }
              setError(null);
              setLoading(true);
              try {
                const match = await api.findRegistration(normalizePhone(phone), dob);
                if (!match) {
                  setNoMatch(true);
                  return;
                }
                const result = Array.isArray(match.registrations)
                  ? match
                  : { registrations: [match], familyGroupId: match.familyGroupId ?? null };
                if (!result.registrations.length) {
                  setNoMatch(true);
                  return;
                }
                saveRegistrationResult(result);
                navigate({ to: "/success" });
              } catch {
                setError("Lookup failed. Please try again.");
              } finally {
                setLoading(false);
              }
            }}
            className="mt-10 rounded-[2rem] bg-gradient-gold p-[3px] shadow-warm"
          >
            <div className="relative overflow-hidden rounded-[calc(2rem-2px)] bg-card p-6 sm:p-8">
              <PatternBackdrop variant="feather" className="text-primary opacity-[0.06]" />
              <div className="relative space-y-5">
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-bold text-secondary">
                    <Phone className="h-5 w-5" /> Phone Number
                  </span>
                  <input
                    required
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength={13}
                    value={phone}
                    onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/[^\d+\s-]/g, "").slice(0, 16));
                      setTouched((t) => ({ ...t, phone: true }));
                      setNoMatch(false);
                      setError(null);
                    }}
                    placeholder="9XXXXXXXXX"
                    className={cn(
                      "min-h-12 w-full rounded-2xl border-2 bg-background px-4 outline-none focus:ring-4",
                      phoneError
                        ? "border-destructive/60 focus:border-destructive focus:ring-destructive/20"
                        : "border-primary/30 focus:border-primary focus:ring-primary/20",
                    )}
                  />
                  {phoneError ? (
                    <p className="mt-1.5 text-xs font-semibold text-destructive">{phoneError}</p>
                  ) : (
                    <p className="mt-1.5 text-xs text-muted-foreground">10-digit Indian mobile</p>
                  )}
                </label>

                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-bold text-secondary">
                    <Cake className="h-5 w-5" /> Date of Birth
                  </span>
                  <DobPicker
                    value={dob}
                    error={Boolean(dobError)}
                    onChange={(iso) => {
                      setDob(iso);
                      setTouched((t) => ({ ...t, dob: true }));
                      setNoMatch(false);
                      setError(null);
                    }}
                  />
                  {dobError ? (
                    <p className="mt-1.5 text-xs font-semibold text-destructive">{dobError}</p>
                  ) : (
                    <p className="mt-1.5 text-xs text-muted-foreground">Tap to open calendar</p>
                  )}
                </label>

                {error && <p className="text-sm font-semibold text-destructive">{error}</p>}

                <div className="pt-2 text-center">
                  <GoldButton
                    glow
                    type="submit"
                    disabled={loading}
                    className="w-full justify-center py-4 text-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" /> Searching…
                      </>
                    ) : (
                      <>
                        <Search className="h-5 w-5" /> Find My Registration
                      </>
                    )}
                  </GoldButton>
                  <Flourish className="mx-auto mt-5 h-5 w-44" />
                </div>
              </div>
            </div>
          </motion.form>

          {noMatch && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 rounded-[2rem] bg-gradient-peacock p-[3px] shadow-warm"
            >
              <div className="relative overflow-hidden rounded-[calc(2rem-2px)] bg-gradient-cream p-8 text-center">
                <PatternBackdrop variant="diya" className="text-secondary opacity-[0.07]" />
                <PeacockFan className="relative mx-auto h-40 w-40 opacity-70" />
                <h3 className="relative mt-2 font-display text-2xl">
                  No registration found under that number
                </h3>
                <p className="relative mx-auto mt-2 max-w-md text-muted-foreground">
                  Perhaps a family member registered on your behalf, or the details differ slightly.
                  You can always register afresh — it takes under a minute.
                </p>
                <Link to="/register" className="relative mt-6 inline-block">
                  <GoldButton>Register for Free !!</GoldButton>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
