import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2, Loader2, UserRound, Phone, Cake, Building2, Check } from "lucide-react";
import { QrSvg } from "@/components/qr";
import { GoldButton } from "@/components/festive";
import { api, ADMIN_TOKEN_KEY, adminTokenStore, formatRegistrationError, normalizePhone } from "@/lib/api";

export const Route = createFileRoute("/admin/register")({
  head: () => ({ meta: [{ title: "Desk Register — Admin" }] }),
  component: AdminRegisterPage,
});

function Field({ label, icon, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-2 text-sm font-bold text-secondary">
        {icon}
        {label}
      </span>
      <input
        {...props}
        className="min-h-11 w-full rounded-xl border-2 border-primary/30 bg-background px-4 outline-none focus:border-primary"
      />
    </label>
  );
}

function AdminRegisterPage() {
  const token = adminTokenStore.get(ADMIN_TOKEN_KEY);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [city, setCity] = useState("");
  const [family, setFamily] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [qrIndex, setQrIndex] = useState(0);

  const resetForm = useCallback(() => {
    setFullName("");
    setPhone("");
    setDob("");
    setCity("");
    setFamily([]);
    setError(null);
    setResult(null);
    setQrIndex(0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setSubmitting(true);
    try {
      const data = await api.deskRegister(token, {
        primary: {
          fullName: fullName.trim(),
          phone: normalizePhone(phone),
          dob,
          city: city.trim(),
          wantsReferral: false,
          referredBy: null,
        },
        members: family
          .filter((m) => m.name.trim() && m.dob)
          .map((m) => ({
            fullName: m.name.trim(),
            dob: m.dob,
            phone: m.phone?.trim() ? normalizePhone(m.phone) : undefined,
          })),
      });
      setResult(data.registrations);
    } catch (err) {
      const { message } = formatRegistrationError(err);
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) return null;

  if (result?.length) {
    const current = result[qrIndex];
    return (
      <div className="mx-auto max-w-lg">
        <h2 className="font-display text-2xl text-secondary">Registration complete</h2>
        <p className="mt-1 text-sm text-muted-foreground">Registered at desk — marked as checked in.</p>
        <div className="mt-6 rounded-2xl bg-card p-6 text-center ring-1 ring-primary/25">
          <div className="mx-auto w-fit rounded-2xl bg-background p-4 ring-2 ring-primary/30">
            <QrSvg value={current.signedPayload} size={200} />
          </div>
          <p className="mt-4 font-display text-xl">{current.fullName}</p>
          <span className="mt-2 inline-flex rounded-full bg-secondary/20 px-3 py-1 text-xs font-bold text-secondary">
            Checked in at desk
          </span>
          <p className="mt-2 text-xs tracking-widest text-muted-foreground uppercase">{current.entryCode}</p>
          {result.length > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              {result.map((r, i) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setQrIndex(i)}
                  className={`h-2.5 rounded-full transition-all ${i === qrIndex ? "w-8 bg-gradient-gold" : "w-2.5 bg-primary/35"}`}
                />
              ))}
            </div>
          )}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <GoldButton onClick={resetForm}>Register another</GoldButton>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="font-display text-2xl">Desk Registration</h2>
      <p className="mt-1 text-sm text-muted-foreground">Same form as online — register walk-in bhaktas at the desk.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl bg-card p-5 ring-1 ring-primary/25 sm:p-6">
        <Field label="Full Name" icon={<UserRound className="h-4 w-4" />} required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ram Sharma" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone" icon={<Phone className="h-4 w-4" />} required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" />
          <Field label="Date of Birth" icon={<Cake className="h-4 w-4" />} required type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
        </div>
        <Field label="City" icon={<Building2 className="h-4 w-4" />} required value={city} onChange={(e) => setCity(e.target.value)} placeholder="Pune" />

        <div className="rounded-xl bg-primary/10 p-4 ring-1 ring-primary/20">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-display font-semibold">Family members</h3>
              <p className="text-xs text-muted-foreground">Each gets their own QR & keychain</p>
            </div>
            <button
              type="button"
              onClick={() => setFamily((f) => [...f, { name: "", dob: "", phone: "" }])}
              className="inline-flex items-center gap-1 rounded-full bg-gradient-gold px-3 py-1.5 text-sm font-semibold text-primary-foreground"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
          <AnimatePresence initial={false}>
            {family.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-3 rounded-xl bg-background p-3 ring-1 ring-primary/15">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-secondary">Member {i + 1}</span>
                  <button type="button" onClick={() => setFamily((f) => f.filter((_, idx) => idx !== i))} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <input placeholder="Name" value={m.name} onChange={(e) => setFamily((f) => f.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x)))} className="min-h-10 rounded-lg border-2 border-primary/25 px-3 text-sm outline-none focus:border-primary sm:col-span-1" />
                  <input type="date" value={m.dob} onChange={(e) => setFamily((f) => f.map((x, idx) => (idx === i ? { ...x, dob: e.target.value } : x)))} className="min-h-10 rounded-lg border-2 border-primary/25 px-3 text-sm outline-none focus:border-primary" />
                  <input placeholder="Phone (optional)" value={m.phone ?? ""} onChange={(e) => setFamily((f) => f.map((x, idx) => (idx === i ? { ...x, phone: e.target.value } : x)))} className="min-h-10 rounded-lg border-2 border-primary/25 px-3 text-sm outline-none focus:border-primary" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {error && <p className="text-sm font-semibold text-destructive">{error}</p>}

        <GoldButton type="submit" disabled={submitting} className="w-full justify-center">
          {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Check className="h-5 w-5" /> Complete Registration</>}
        </GoldButton>
      </form>
    </div>
  );
}
