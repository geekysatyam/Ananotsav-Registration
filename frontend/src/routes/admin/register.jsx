import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  Trash2,
  Loader2,
  UserRound,
  Phone,
  Cake,
  Building2,
  Check,
} from "lucide-react";
import { QrSvg } from "@/components/qr";
import { GoldButton } from "@/components/festive";
import {
  api,
  ADMIN_TOKEN_KEY,
  adminTokenStore,
  formatRegistrationError,
  normalizePhone,
  LADDU_GOPAL_SIZES,
} from "@/lib/api";

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

function DeskToggle({ title, value, onChange, children }) {
  return (
    <div className="rounded-xl bg-background p-3 ring-1 ring-primary/15">
      <label className="flex cursor-pointer items-center justify-between gap-3">
        <span className="text-sm font-semibold">{title}</span>
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 accent-secondary"
        />
      </label>
      {value && children ? <div className="mt-2">{children}</div> : null}
    </div>
  );
}

function AdminRegisterPage() {
  const token = adminTokenStore.get(ADMIN_TOKEN_KEY);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [city, setCity] = useState("");
  const [family, setFamily] = useState([]);
  const [wantsVolunteer, setWantsVolunteer] = useState(false);
  const [wantsPanchamrit, setWantsPanchamrit] = useState(false);
  const [wantsFancyDress, setWantsFancyDress] = useState(false);
  const [fancyDressEntries, setFancyDressEntries] = useState([]);
  const [wantsLadduGopal, setWantsLadduGopal] = useState(false);
  const [ladduGopalSize, setLadduGopalSize] = useState("");
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
    setWantsVolunteer(false);
    setWantsPanchamrit(false);
    setWantsFancyDress(false);
    setFancyDressEntries([]);
    setWantsLadduGopal(false);
    setLadduGopalSize("");
    setError(null);
    setResult(null);
    setQrIndex(0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    setError(null);

    if (wantsFancyDress) {
      const validKids = fancyDressEntries.filter((x) => x.childName?.trim() && x.childDob);
      if (validKids.length === 0) {
        setError("Add at least one child for fancy dress, or uncheck it.");
        return;
      }
    }
    if (wantsLadduGopal && !ladduGopalSize.trim()) {
      setError("Select Laddu Gopal size, or uncheck it.");
      return;
    }

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
          wantsVolunteer,
          wantsPanchamritAbhishek: wantsPanchamrit,
          wantsFancyDress,
          fancyDressEntries: wantsFancyDress
            ? fancyDressEntries
                .filter((x) => x.childName?.trim() && x.childDob)
                .map((x) => ({
                  childName: x.childName.trim(),
                  childDob: x.childDob,
                  getupDetail: x.getupDetail?.trim() || "",
                }))
            : [],
          wantsLadduGopal,
          ladduGopalSize: wantsLadduGopal ? ladduGopalSize.trim() : null,
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
      <p className="mt-1 text-sm text-muted-foreground">
        Same form as online — register walk-in bhaktas at the desk.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl bg-card p-5 ring-1 ring-primary/25 sm:p-6">
        <Field
          label="Full Name"
          icon={<UserRound className="h-4 w-4" />}
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Ram Sharma"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Phone"
            icon={<Phone className="h-4 w-4" />}
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="9876543210"
          />
          <Field
            label="Date of Birth"
            icon={<Cake className="h-4 w-4" />}
            required
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
        </div>
        <Field
          label="City"
          icon={<Building2 className="h-4 w-4" />}
          required
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Pune"
        />

        <div className="rounded-xl bg-primary/10 p-4 ring-1 ring-primary/20">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-display font-semibold">Family members</h3>
              <p className="text-xs text-muted-foreground">Each gets their own QR & Divine Gift</p>
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
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-3 rounded-xl bg-background p-3 ring-1 ring-primary/15"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-secondary">Member {i + 1}</span>
                  <button
                    type="button"
                    onClick={() => setFamily((f) => f.filter((_, idx) => idx !== i))}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <input
                    placeholder="Name"
                    value={m.name}
                    onChange={(e) =>
                      setFamily((f) => f.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x)))
                    }
                    className="min-h-10 rounded-lg border-2 border-primary/25 px-3 text-sm outline-none focus:border-primary sm:col-span-1"
                  />
                  <input
                    type="date"
                    value={m.dob}
                    onChange={(e) =>
                      setFamily((f) => f.map((x, idx) => (idx === i ? { ...x, dob: e.target.value } : x)))
                    }
                    className="min-h-10 rounded-lg border-2 border-primary/25 px-3 text-sm outline-none focus:border-primary"
                  />
                  <input
                    placeholder="Phone (optional)"
                    value={m.phone ?? ""}
                    onChange={(e) =>
                      setFamily((f) => f.map((x, idx) => (idx === i ? { ...x, phone: e.target.value } : x)))
                    }
                    className="min-h-10 rounded-lg border-2 border-primary/25 px-3 text-sm outline-none focus:border-primary"
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="space-y-2 rounded-xl bg-secondary/5 p-4 ring-1 ring-secondary/15">
          <h3 className="text-sm font-display font-semibold text-secondary">Seva & celebrations (optional)</h3>
          <DeskToggle title="Youth volunteer" value={wantsVolunteer} onChange={setWantsVolunteer}>
            <p className="text-xs text-muted-foreground">
              Reach venue 2 days prior and stay for Anandotsav preparation.
            </p>
          </DeskToggle>
          <DeskToggle
            title="Divya Panchamrit Abhishek"
            value={wantsPanchamrit}
            onChange={setWantsPanchamrit}
          />
          <DeskToggle
            title="Fancy dress for kids"
            value={wantsFancyDress}
            onChange={(v) => {
              setWantsFancyDress(v);
              if (v && fancyDressEntries.length === 0) {
                setFancyDressEntries([{ childName: "", childDob: "", getupDetail: "" }]);
              }
              if (!v) setFancyDressEntries([]);
            }}
          >
            <div className="space-y-2">
              {fancyDressEntries.map((entry, i) => (
                <div key={i} className="grid gap-2 rounded-lg bg-card p-2 ring-1 ring-primary/15 sm:grid-cols-3">
                  <input
                    placeholder="Child name"
                    value={entry.childName}
                    onChange={(e) =>
                      setFancyDressEntries((list) =>
                        list.map((x, idx) => (idx === i ? { ...x, childName: e.target.value } : x)),
                      )
                    }
                    className="min-h-9 rounded-lg border-2 border-primary/25 px-2 text-sm outline-none focus:border-primary"
                  />
                  <input
                    type="date"
                    value={entry.childDob}
                    onChange={(e) =>
                      setFancyDressEntries((list) =>
                        list.map((x, idx) => (idx === i ? { ...x, childDob: e.target.value } : x)),
                      )
                    }
                    className="min-h-9 rounded-lg border-2 border-primary/25 px-2 text-sm outline-none focus:border-primary"
                  />
                  <div className="flex gap-1">
                    <input
                      placeholder="Getup (optional)"
                      value={entry.getupDetail}
                      onChange={(e) =>
                        setFancyDressEntries((list) =>
                          list.map((x, idx) => (idx === i ? { ...x, getupDetail: e.target.value } : x)),
                        )
                      }
                      className="min-h-9 min-w-0 flex-1 rounded-lg border-2 border-primary/25 px-2 text-sm outline-none focus:border-primary"
                    />
                    {fancyDressEntries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setFancyDressEntries((list) => list.filter((_, idx) => idx !== i))}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setFancyDressEntries((list) => [
                    ...list,
                    { childName: "", childDob: "", getupDetail: "" },
                  ])
                }
                className="text-xs font-bold text-secondary"
              >
                + Add child
              </button>
            </div>
          </DeskToggle>
          <DeskToggle
            title="Laddu Gopal shringar"
            value={wantsLadduGopal}
            onChange={(v) => {
              setWantsLadduGopal(v);
              if (!v) setLadduGopalSize("");
            }}
          >
            <select
              value={ladduGopalSize}
              onChange={(e) => setLadduGopalSize(e.target.value)}
              className="min-h-10 w-full rounded-xl border-2 border-primary/30 bg-background px-3 text-sm outline-none focus:border-primary"
            >
              <option value="">Select size…</option>
              {LADDU_GOPAL_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </DeskToggle>
        </div>

        {error && <p className="text-sm font-semibold text-destructive">{error}</p>}

        <GoldButton type="submit" disabled={submitting} className="w-full justify-center">
          {submitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Check className="h-5 w-5" /> Complete Registration
            </>
          )}
        </GoldButton>
      </form>
    </div>
  );
}
