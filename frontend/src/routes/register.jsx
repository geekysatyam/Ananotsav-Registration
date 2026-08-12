import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  Plus,
  Trash2,
  Sparkles,
  UserRound,
  Phone,
  Cake,
  Building2,
  Loader2,
} from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { GoldButton, SectionHeading } from "@/components/festive";
import { FloatingMotifs, GradientMesh } from "@/components/ambient";
import { Flourish, Lotus, PatternBackdrop, PeacockFeather, TempleSilhouette } from "@/components/motifs";
import { api, formatRegistrationError, normalizePhone, saveRegistrationResult } from "@/lib/api";

const FORM_STORAGE_KEY = "janmashtami_register_draft";

function Field({ label, icon, hint, children, className = "", ...props }) {
  const inputClass =
    "min-h-10 w-full rounded-xl border-2 border-primary/30 bg-background px-3 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20 sm:min-h-11 sm:rounded-2xl sm:px-4 sm:focus:ring-4";
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1.5 text-xs font-bold tracking-wide text-secondary sm:mb-1.5 sm:gap-2 sm:text-sm">
        {icon}
        {label}
      </span>
      {children ?? (
        <input
          {...props}
          suppressHydrationWarning
          className={`${inputClass} ${className}`.trim()}
        />
      )}
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </label>
  );
}

function PillToggle({ value, onChange, options, compact = false }) {
  return (
    <div
      className={`flex shrink-0 rounded-full bg-background ring-1 ring-primary/30 ${compact ? "p-0.5" : "p-1"}`}
      suppressHydrationWarning
    >
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          type="button"
          suppressHydrationWarning
          onClick={() => onChange(opt.value)}
          className={`rounded-full font-bold transition-colors ${
            compact ? "min-h-8 px-3 text-xs" : "min-h-10 px-5 text-sm"
          } ${
            value === opt.value
              ? "bg-gradient-gold text-primary-foreground shadow-warm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function CompactToggleRow({ title, value, onChange, children }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 flex-1 text-sm font-semibold leading-snug">{title}</span>
        <PillToggle
          compact
          value={value}
          onChange={onChange}
          options={[
            { value: false, label: "No" },
            { value: true, label: "Yes" },
          ]}
        />
      </div>
      <AnimatePresence initial={false}>
        {value && children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const Route = createFileRoute("/register")({
  validateSearch: (search) => ({
    ref: typeof search.ref === "string" ? search.ref : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Register for Free !! — Janmashtami Utsav 2026" },
      {
        name: "description",
        content:
          "Register yourself and your family for Janmashtami Utsav 2026 in under 60 seconds and reserve a free Krishna keychain each.",
      },
      { property: "og:title", content: "Register for Free !! — Janmashtami Utsav 2026" },
      {
        property: "og:description",
        content: "Takes less than 60 seconds. Add family members and get an entry QR for each.",
      },
    ],
  }),
  component: RegisterPage,
});

function readDraft() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(FORM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function RegisterPage() {
  const navigate = useNavigate();
  const { ref: refParam } = Route.useSearch();

  const [fullName, setFullName] = useState(() => readDraft().fullName ?? "");
  const [phone, setPhone] = useState(() => readDraft().phone ?? "");
  const [dob, setDob] = useState(() => readDraft().dob ?? "");
  const [city, setCity] = useState(() => readDraft().city ?? "");
  const [hasIncomingCode, setHasIncomingCode] = useState(() => readDraft().hasIncomingCode ?? readDraft().hasReferral ?? false);
  const [incomingReferral, setIncomingReferral] = useState(() => readDraft().incomingReferral ?? readDraft().referral ?? "");
  const [wantsOwnReferral, setWantsOwnReferral] = useState(() => readDraft().wantsOwnReferral ?? false);
  const [family, setFamily] = useState(() => readDraft().family ?? []);

  // Someone referred this registrant (incoming code → referredBy)
  const [incomingValid, setIncomingValid] = useState(null);
  const [incomingChecking, setIncomingChecking] = useState(false);

  const [totalRegistrants, setTotalRegistrants] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [duplicateNames, setDuplicateNames] = useState([]);
  // Track whether we are past the first render so the draft-save effect
  // does not fire immediately on mount (which would overwrite a valid draft
  // with the values just read from it).
  const mountedRef = useRef(false);
  useEffect(() => { mountedRef.current = true; }, []);

  // Apply ?ref= query param on mount (overrides any saved draft)
  useEffect(() => {
    if (refParam) {
      setHasIncomingCode(true);
      setIncomingReferral(refParam);
    }
  }, [refParam]);

  useEffect(() => {
    if (!mountedRef.current) return;
    const t = setTimeout(() => {
      localStorage.setItem(
        FORM_STORAGE_KEY,
        JSON.stringify({
          fullName,
          phone,
          dob,
          city,
          hasIncomingCode,
          incomingReferral,
          wantsOwnReferral,
          family,
        }),
      );
    }, 500);
    return () => clearTimeout(t);
  }, [fullName, phone, dob, city, hasIncomingCode, incomingReferral, wantsOwnReferral, family]);

  useEffect(() => {
    api.getStatsCount().then((d) => setTotalRegistrants(d.totalRegistrants)).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!hasIncomingCode || !incomingReferral.trim()) {
      setIncomingValid(null);
      return;
    }
    const code = incomingReferral.trim();
    setIncomingChecking(true);
    const timer = setTimeout(() => {
      api
        .validateReferral(code)
        .then((r) => setIncomingValid(r.valid))
        .catch(() => setIncomingValid(false))
        .finally(() => setIncomingChecking(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [hasIncomingCode, incomingReferral]);

  const socialLine =
    totalRegistrants !== null
      ? `🎁 ${totalRegistrants.toLocaleString("en-IN")} keychains reserved so far`
      : "🔥 Bhaktas are registering right now";

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError(null);
      setDuplicateNames([]);

      if (hasIncomingCode && incomingReferral.trim() && incomingValid === false) {
        setError("Please enter a valid referral code, or choose No for “Were you referred?”");
        return;
      }

      setSubmitting(true);
      try {
        const result = await api.register({
          primary: {
            fullName: fullName.trim(),
            phone: normalizePhone(phone),
            dob,
            city: city.trim(),
            wantsReferral: wantsOwnReferral,
            referredBy:
              hasIncomingCode && incomingReferral.trim() ? incomingReferral.trim() : null,
          },
          members: family
            .filter((m) => m.name.trim() && m.dob)
            .map((m) => ({
              fullName: m.name.trim(),
              dob: m.dob,
              phone: m.phone?.trim() ? normalizePhone(m.phone) : undefined,
            })),
        });

        localStorage.removeItem(FORM_STORAGE_KEY);
        saveRegistrationResult(result);
        navigate({ to: "/success" });
      } catch (err) {
        const { message, duplicateNames: dupNames } = formatRegistrationError(err);
        setError(message);
        setDuplicateNames(dupNames);
      } finally {
        setSubmitting(false);
      }
    },
    [
      city,
      dob,
      family,
      fullName,
      hasIncomingCode,
      incomingReferral,
      incomingValid,
      navigate,
      phone,
      wantsOwnReferral,
    ],
  );

  return (
    <SiteShell hideFooter>
      <section className="relative overflow-hidden bg-gradient-festive py-5 sm:py-16">
        <GradientMesh />
        <PatternBackdrop variant="mandala" className="text-secondary opacity-[0.07]" />
        <div className="pointer-events-none absolute inset-0 hidden overflow-hidden sm:block">
          <FloatingMotifs count={6} />
        </div>
        <TempleSilhouette className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-40 w-full text-secondary/15 sm:block" />
        <PeacockFeather className="pointer-events-none absolute -left-10 top-24 hidden h-56 w-56 opacity-25 sm:block" />
        <Lotus className="pointer-events-none absolute -right-12 bottom-24 hidden h-64 w-64 opacity-20 sm:block" />

        <div className="relative mx-auto max-w-3xl px-3 sm:px-6">
          <SectionHeading
            compact
            eyebrow="Bhakta registration"
            title="Reserve your place at the utsav"
            subtitle="One entry QR and one free Krishna keychain for every name you add."
          />

          <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            onSubmit={handleSubmit}
            className="mt-4 rounded-[1.5rem] bg-gradient-gold p-[2px] shadow-warm sm:mt-8 sm:rounded-[2rem] sm:p-[3px]"
          >
            <div className="relative overflow-hidden rounded-[calc(1.5rem-2px)] bg-card p-4 sm:rounded-[calc(2rem-2px)] sm:p-9">
              <PatternBackdrop variant="feather" className="text-primary opacity-[0.05]" />

              <div className="relative space-y-3 sm:space-y-5">
                {/* Personal details */}
                <Field
                  label="Full Name"
                  icon={<UserRound className="h-4 w-4 sm:h-5 sm:w-5" />}
                  required
                  placeholder="Ram Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />

                <div className="grid gap-3 sm:grid-cols-2 sm:gap-5">
                  <Field
                    label="Phone"
                    icon={<Phone className="h-4 w-4 sm:h-5 sm:w-5" />}
                    required
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Field
                    label="Date of Birth"
                    icon={<Cake className="h-4 w-4 sm:h-5 sm:w-5" />}
                    required
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>

                <Field
                  label="City"
                  icon={<Building2 className="h-4 w-4 sm:h-5 sm:w-5" />}
                  required
                  placeholder="Pune"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />

                {/* Referrals — compact two-row block */}
                <div className="rounded-xl bg-primary/5 px-3 py-2.5 ring-1 ring-primary/15 sm:rounded-2xl sm:p-4">
                  <div className="space-y-2.5 sm:space-y-3">
                    <CompactToggleRow
                      title="Referred by someone?"
                      value={hasIncomingCode}
                      onChange={(v) => {
                        setHasIncomingCode(v);
                        if (!v) {
                          setIncomingReferral("");
                          setIncomingValid(null);
                        }
                      }}
                    >
                      <div className="relative">
                        <Field
                          label="Their code"
                          icon={<Sparkles className="h-4 w-4" />}
                          value={incomingReferral}
                          onChange={(e) => setIncomingReferral(e.target.value)}
                          placeholder="Murari219"
                          className="pr-10"
                        />
                        {incomingReferral.length > 0 && (
                          <span
                            className={`absolute right-2 top-[1.85rem] grid h-7 w-7 place-items-center rounded-full sm:top-[2rem] sm:h-8 sm:w-8 ${
                              incomingChecking
                                ? "bg-muted text-muted-foreground"
                                : incomingValid
                                  ? "bg-secondary/20 text-secondary"
                                  : "bg-destructive/15 text-destructive"
                            }`}
                          >
                            {incomingChecking ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : incomingValid ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </span>
                        )}
                        {incomingReferral.length > 0 && (
                          <p
                            className={`mt-1 text-xs font-semibold ${
                              incomingChecking
                                ? "text-muted-foreground"
                                : incomingValid
                                  ? "text-secondary"
                                  : "text-destructive"
                            }`}
                          >
                            {incomingChecking
                              ? "Checking…"
                              : incomingValid
                                ? "Valid — referrer gets credit 🙏"
                                : "Code not found"}
                          </p>
                        )}
                      </div>
                    </CompactToggleRow>

                    <div className="border-t border-primary/10 pt-2.5">
                      <CompactToggleRow
                        title="Want your own referral code?"
                        value={wantsOwnReferral}
                        onChange={setWantsOwnReferral}
                      >
                        <p className="text-xs leading-snug text-muted-foreground">
                          Your Krishna code appears on the confirmation page. Choose No if you only
                          need your entry pass.
                        </p>
                      </CompactToggleRow>
                    </div>
                  </div>
                </div>

                {/* Family members */}
                <div className="rounded-xl bg-primary/10 px-3 py-2.5 ring-1 ring-primary/25 sm:rounded-2xl sm:p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-display font-semibold sm:text-base">Add family member</h3>
                      <p className="text-xs text-muted-foreground">Each gets their own QR & keychain</p>
                    </div>
                    <button
                      type="button"
                      suppressHydrationWarning
                      onClick={() =>
                        setFamily((f) => [
                          ...f,
                          { id: crypto.randomUUID(), name: "", dob: "", phone: "" },
                        ])
                      }
                      className="inline-flex min-h-9 shrink-0 items-center justify-center gap-1 rounded-full bg-gradient-gold px-3.5 text-sm font-display font-semibold text-primary-foreground shadow-warm sm:min-h-10 sm:gap-2 sm:px-5"
                    >
                      <Plus className="h-4 w-4" strokeWidth={3} /> Add
                    </button>
                  </div>

                  <AnimatePresence initial={false}>
                    {family.map((m, i) => (
                      <motion.div
                        key={m.id ?? i}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        className="mt-2 rounded-xl bg-background p-2.5 ring-1 ring-primary/20 sm:mt-3 sm:p-3"
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="text-xs font-display font-semibold text-secondary sm:text-sm">
                            Member {i + 1}
                          </span>
                          <button
                            type="button"
                            aria-label="Remove member"
                            onClick={() => setFamily((f) => f.filter((x) => x.id !== m.id))}
                            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-destructive/12 text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid gap-2">
                          <input
                            placeholder="Name"
                            suppressHydrationWarning
                            value={m.name}
                            onChange={(e) =>
                              setFamily((f) =>
                                f.map((x) => (x.id === m.id ? { ...x, name: e.target.value } : x)),
                              )
                            }
                            className="min-h-9 rounded-lg border-2 border-primary/25 bg-card px-2.5 text-sm outline-none focus:border-primary sm:min-h-10 sm:rounded-xl sm:px-3"
                          />
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5">
                            <input
                              type="date"
                              suppressHydrationWarning
                              value={m.dob}
                              onChange={(e) =>
                                setFamily((f) =>
                                  f.map((x) => (x.id === m.id ? { ...x, dob: e.target.value } : x)),
                                )
                              }
                              className="min-h-9 rounded-lg border-2 border-primary/25 bg-card px-2.5 text-sm outline-none focus:border-primary sm:min-h-10 sm:rounded-xl sm:px-3"
                            />
                            <input
                              placeholder="Phone (optional)"
                              suppressHydrationWarning
                              value={m.phone ?? ""}
                              onChange={(e) =>
                                setFamily((f) =>
                                  f.map((x) => (x.id === m.id ? { ...x, phone: e.target.value } : x)),
                                )
                              }
                              className="min-h-9 rounded-lg border-2 border-primary/25 bg-card px-2.5 text-sm outline-none focus:border-primary sm:min-h-10 sm:rounded-xl sm:px-3"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {error && (
                  <div className="rounded-2xl bg-destructive/10 p-4 text-sm font-semibold text-destructive ring-1 ring-destructive/30">
                    {error}
                    {duplicateNames.length > 0 && (
                      <p className="mt-2 font-normal">
                        <Link to="/find" className="underline">
                          Find my registration
                        </Link>
                      </p>
                    )}
                  </div>
                )}

                <div className="border-t border-primary/15 pt-4 text-center sm:pt-6">
                  <p className="text-xs font-semibold text-secondary sm:text-sm">{socialLine}</p>
                  <div className="mt-3 sm:mt-4">
                    <GoldButton
                      glow
                      type="submit"
                      disabled={submitting}
                      className="w-full justify-center px-6 py-3 text-base sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" /> Registering…
                        </>
                      ) : (
                        "Complete Registration"
                      )}
                    </GoldButton>
                  </div>
                  <Flourish className="mx-auto mt-3 hidden h-5 w-48 sm:mt-5 sm:block" />
                  <p className="mt-2 text-xs text-muted-foreground sm:mt-3">
                    Already registered?{" "}
                    <Link to="/find" className="font-bold text-secondary underline">
                      Find my registration
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </motion.form>
        </div>
      </section>
    </SiteShell>
  );
}
