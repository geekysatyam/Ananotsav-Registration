import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  Baby,
  Check,
  ClipboardList,
  Gift,
  HandHeart,
  KeyRound,
  Loader2,
  Plus,
  ScanLine,
  Shield,
  Sparkles,
  // Trophy,
  UserPlus,
  Users,
} from "lucide-react";
import { api, ApiError, ADMIN_PAGE_KEYS, loadAdminSession } from "@/lib/api";
import { GoldButton } from "@/components/festive";

export const Route = createFileRoute("/admin/admins")({
  head: () => ({
    meta: [
      { title: "Admins — Team access" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminsPage,
});

const PAGE_META = {
  scanner: { label: "Scanner", hint: "QR check-in", icon: ScanLine },
  register: { label: "Desk Register", hint: "Walk-in signup", icon: UserPlus },
  registrations: { label: "Registrations", hint: "List & export", icon: ClipboardList },
  volunteers: { label: "Volunteers", hint: "Seva opt-ins", icon: HandHeart },
  abhishek: { label: "Abhishek", hint: "Panchamrit list", icon: Sparkles },
  "fancy-dress": { label: "Fancy Dress", hint: "Kids entries", icon: Baby },
  "laddu-gopal": { label: "Laddu Gopal", hint: "Size opt-ins", icon: Gift },
  // REFERRAL DISABLED
  // leaderboard: { label: "Leaderboard", hint: "Referral ranks", icon: Trophy },
};

const ASSIGNABLE_PAGES = ADMIN_PAGE_KEYS.filter((p) => p !== "admins");

const inputClass =
  "min-h-11 w-full rounded-xl border-2 border-primary/30 bg-background px-3 outline-none transition-colors focus:border-primary";

function PagePicker({ selected, onToggle, disabled }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {ASSIGNABLE_PAGES.map((page) => {
        const meta = PAGE_META[page];
        const Icon = meta.icon;
        const on = selected.includes(page);
        return (
          <button
            key={page}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(page)}
            className={`flex items-start gap-3 rounded-2xl border-2 px-3 py-3 text-left transition-colors ${
              on
                ? "border-secondary bg-secondary/10 text-foreground"
                : "border-primary/15 bg-background/60 text-muted-foreground hover:border-primary/35"
            } disabled:opacity-50`}
          >
            <span
              className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                on ? "bg-secondary/20 text-secondary" : "bg-primary/10 text-secondary/70"
              }`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold">{meta.label}</span>
                {on && <Check className="h-4 w-4 shrink-0 text-secondary" />}
              </span>
              <span className="mt-0.5 block text-xs opacity-80">{meta.hint}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function RoleCard({ value, selected, title, description, onSelect }) {
  const on = selected === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`rounded-2xl border-2 px-4 py-3 text-left transition-colors ${
        on
          ? "border-secondary bg-gradient-to-br from-secondary/15 to-primary/10"
          : "border-primary/20 bg-card hover:border-primary/40"
      }`}
    >
      <div className="text-sm font-bold text-secondary">{title}</div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
    </button>
  );
}

function AdminsPage() {
  const token = loadAdminSession()?.token;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [okMsg, setOkMsg] = useState(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("desk");
  const [pages, setPages] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editRole, setEditRole] = useState("desk");
  const [editPages, setEditPages] = useState([]);
  const [editPassword, setEditPassword] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.listAdmins(token);
      setRows(data.rows ?? []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setError(
          "Admins API not found on the server. Redeploy the backend to Railway, then refresh.",
        );
      } else if (err instanceof ApiError && err.status === 403) {
        setError("Only super admin can manage team access.");
      } else {
        setError(err instanceof ApiError ? err.message : "Failed to load admins");
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const togglePage = (page) => {
    setPages((prev) => (prev.includes(page) ? prev.filter((p) => p !== page) : [...prev, page]));
  };

  const toggleEditPage = (page) => {
    setEditPages((prev) => (prev.includes(page) ? prev.filter((p) => p !== page) : [...prev, page]));
  };

  const onCreate = async (e) => {
    e.preventDefault();
    setFormError(null);
    setOkMsg(null);
    if (role === "admin" && pages.length === 0) {
      setFormError("Select at least one page for an admin user.");
      return;
    }
    setSaving(true);
    try {
      await api.createAdmin(token, {
        username: username.trim(),
        password,
        role,
        pages: role === "admin" ? pages : [],
      });
      setUsername("");
      setPassword("");
      setRole("desk");
      setPages([]);
      setOkMsg("User created. They can sign in at /admin.");
      await load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Create failed");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (row) => {
    setEditingId(row.id);
    setEditRole(row.role === "super_admin" ? "super_admin" : row.role);
    setEditPages((row.pages ?? []).filter((p) => p !== "admins"));
    setEditPassword("");
    setFormError(null);
    setOkMsg(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    if (editRole === "admin" && editPages.length === 0) {
      setFormError("Select at least one page for an admin user.");
      return;
    }
    setEditSaving(true);
    setFormError(null);
    try {
      const body = {};
      if (editRole !== "super_admin") {
        body.role = editRole;
        body.pages = editRole === "admin" ? editPages : [];
      }
      if (editPassword.trim().length >= 8) body.password = editPassword.trim();
      await api.updateAdmin(token, editingId, body);
      setEditingId(null);
      setOkMsg("Access updated.");
      await load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Update failed");
    } finally {
      setEditSaving(false);
    }
  };

  const setActive = async (id, isActive) => {
    try {
      await api.updateAdmin(token, id, { isActive });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Update failed");
    }
  };

  if (!token) {
    return (
      <p className="text-sm font-semibold text-destructive">Sign in again to manage team access.</p>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Super admin</p>
          <h1 className="mt-1 flex items-center gap-2 font-display text-3xl">
            <Shield className="h-8 w-8 text-secondary" /> Team access
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Create desk staff or admins, then assign which panel pages they can open. Super admin
            always has full access.
          </p>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-card px-4 py-3 text-sm shadow-warm">
          <div className="flex items-center gap-2 font-bold text-secondary">
            <Users className="h-4 w-4" /> {rows.length} users
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Active + disabled accounts</p>
        </div>
      </div>

      <form
        onSubmit={onCreate}
        className="space-y-5 rounded-[1.75rem] border border-primary/20 bg-card p-5 shadow-warm sm:p-6"
      >
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-secondary">
            <Plus className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-xl">Create user</h2>
            <p className="text-xs text-muted-foreground">Desk = scanner + register only</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <RoleCard
            value="desk"
            selected={role}
            onSelect={setRole}
            title="Desk staff"
            description="Scanner and desk registration only. Best for event-day volunteers."
          />
          <RoleCard
            value="admin"
            selected={role}
            onSelect={setRole}
            title="Admin (custom pages)"
            description="Pick exactly which lists and tools they can open."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1.5 block font-bold">Username</span>
            <input
              required
              autoComplete="off"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. desk1"
              className={inputClass}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-bold">Password</span>
            <input
              required
              type="password"
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className={inputClass}
            />
          </label>
        </div>

        {role === "admin" && (
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-sm font-bold">Page permissions</span>
              <button
                type="button"
                className="text-xs font-bold text-secondary hover:underline"
                onClick={() =>
                  setPages(pages.length === ASSIGNABLE_PAGES.length ? [] : [...ASSIGNABLE_PAGES])
                }
              >
                {pages.length === ASSIGNABLE_PAGES.length ? "Clear all" : "Select all"}
              </button>
            </div>
            <PagePicker selected={pages} onToggle={togglePage} />
          </div>
        )}

        {formError && !editingId && (
          <p className="text-sm font-semibold text-destructive">{formError}</p>
        )}
        {okMsg && <p className="text-sm font-semibold text-secondary">{okMsg}</p>}

        <GoldButton type="submit" disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
          Create user
        </GoldButton>
      </form>

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive">
          {error}
        </div>
      )}

      <div>
        <h2 className="mb-3 font-display text-xl">Existing users</h2>
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
          </div>
        ) : rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-primary/30 px-4 py-10 text-center text-sm text-muted-foreground">
            No users yet. Create a desk or admin account above.
          </p>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => {
              const isSuper = row.role === "super_admin";
              const isEditing = editingId === row.id;
              return (
                <div
                  key={row.id}
                  className="overflow-hidden rounded-[1.5rem] border border-primary/20 bg-card shadow-warm"
                >
                  <div className="flex flex-wrap items-center gap-3 px-4 py-4 sm:px-5">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/15 text-secondary">
                      {isSuper ? <Shield className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-lg">{row.username}</span>
                        <span className="rounded-full bg-secondary/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-secondary">
                          {row.role.replace("_", " ")}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            row.isActive
                              ? "bg-emerald-500/15 text-emerald-800"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {row.isActive ? "Active" : "Disabled"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {isSuper
                          ? "Full access · cannot be edited here"
                          : row.role === "desk"
                            ? "Scanner · Desk Register"
                            : (row.pages ?? [])
                                .map((p) => PAGE_META[p]?.label ?? p)
                                .join(" · ") || "No pages"}
                      </p>
                    </div>
                    {!isSuper && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => (isEditing ? setEditingId(null) : startEdit(row))}
                          className="rounded-full bg-primary/15 px-3 py-2 text-xs font-bold text-secondary hover:bg-primary/25"
                        >
                          {isEditing ? "Cancel" : "Edit access"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setActive(row.id, !row.isActive)}
                          className="rounded-full bg-background px-3 py-2 text-xs font-bold text-muted-foreground ring-1 ring-primary/20 hover:text-foreground"
                        >
                          {row.isActive ? "Disable" : "Enable"}
                        </button>
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="space-y-4 border-t border-primary/15 bg-background/50 px-4 py-4 sm:px-5">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <RoleCard
                          value="desk"
                          selected={editRole}
                          onSelect={setEditRole}
                          title="Desk staff"
                          description="Scanner + desk register only"
                        />
                        <RoleCard
                          value="admin"
                          selected={editRole}
                          onSelect={setEditRole}
                          title="Admin (custom pages)"
                          description="Choose pages below"
                        />
                      </div>
                      {editRole === "admin" && (
                        <PagePicker selected={editPages} onToggle={toggleEditPage} />
                      )}
                      <label className="block text-sm">
                        <span className="mb-1.5 flex items-center gap-2 font-bold">
                          <KeyRound className="h-4 w-4 text-secondary" />
                          Reset password (optional)
                        </span>
                        <input
                          type="password"
                          minLength={8}
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          placeholder="Leave blank to keep current password"
                          className={inputClass}
                        />
                      </label>
                      {formError && editingId && (
                        <p className="text-sm font-semibold text-destructive">{formError}</p>
                      )}
                      <GoldButton
                        type="button"
                        disabled={editSaving}
                        onClick={() => void saveEdit()}
                        className="gap-2"
                      >
                        {editSaving ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Check className="h-5 w-5" />
                        )}
                        Save access
                      </GoldButton>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
