import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Shield } from "lucide-react";
import { useOutletContext } from "@tanstack/react-router";
import { api, ApiError, ADMIN_PAGE_KEYS } from "@/lib/api";
import { GoldButton } from "@/components/festive";

export const Route = createFileRoute("/admin/admins")({
  component: AdminsPage,
});

const PAGE_LABELS = {
  scanner: "Scanner",
  register: "Desk Register",
  registrations: "Registrations",
  volunteers: "Volunteers",
  abhishek: "Abhishek",
  "fancy-dress": "Fancy Dress",
  "laddu-gopal": "Laddu Gopal",
  leaderboard: "Leaderboard",
  admins: "Admins",
};

const ASSIGNABLE_PAGES = ADMIN_PAGE_KEYS.filter((p) => p !== "admins");

function AdminsPage() {
  const { token } = useOutletContext();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("desk");
  const [pages, setPages] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listAdmins(token);
      setRows(data.rows ?? []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load admins");
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

  const onCreate = async (e) => {
    e.preventDefault();
    setFormError(null);
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
      await load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Create failed");
    } finally {
      setSaving(false);
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

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl">
          <Shield className="h-7 w-7 text-secondary" /> Admins
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create desk staff (scanner + register) or admins with selected pages.
        </p>
      </div>

      <form
        onSubmit={onCreate}
        className="space-y-4 rounded-2xl border border-primary/20 bg-card p-5 shadow-warm"
      >
        <h2 className="flex items-center gap-2 font-semibold text-secondary">
          <Plus className="h-5 w-5" /> New user
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-bold">Username</span>
            <input
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="min-h-11 w-full rounded-xl border-2 border-primary/30 bg-background px-3 outline-none focus:border-primary"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-bold">Password</span>
            <input
              required
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="min-h-11 w-full rounded-xl border-2 border-primary/30 bg-background px-3 outline-none focus:border-primary"
            />
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block font-bold">Role</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="min-h-11 w-full rounded-xl border-2 border-primary/30 bg-background px-3 outline-none focus:border-primary sm:max-w-xs"
          >
            <option value="desk">Desk (scanner + register)</option>
            <option value="admin">Admin (custom pages)</option>
          </select>
        </label>
        {role === "admin" && (
          <fieldset>
            <legend className="mb-2 text-sm font-bold">Pages</legend>
            <div className="flex flex-wrap gap-2">
              {ASSIGNABLE_PAGES.map((page) => (
                <label
                  key={page}
                  className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    pages.includes(page)
                      ? "border-secondary bg-secondary/15 text-secondary"
                      : "border-primary/25 text-muted-foreground"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={pages.includes(page)}
                    onChange={() => togglePage(page)}
                  />
                  {PAGE_LABELS[page] ?? page}
                </label>
              ))}
            </div>
          </fieldset>
        )}
        {formError && <p className="text-sm font-semibold text-destructive">{formError}</p>}
        <GoldButton type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create user"}
        </GoldButton>
      </form>

      {error && <p className="text-sm font-semibold text-destructive">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-primary/20">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-primary/10 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Pages</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-primary/10">
                  <td className="px-4 py-3 font-semibold">{row.username}</td>
                  <td className="px-4 py-3">{row.role.replace("_", " ")}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {(row.pages ?? []).map((p) => PAGE_LABELS[p] ?? p).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3">{row.isActive ? "Active" : "Disabled"}</td>
                  <td className="px-4 py-3">
                    {row.role !== "super_admin" && (
                      <button
                        type="button"
                        onClick={() => setActive(row.id, !row.isActive)}
                        className="text-xs font-bold text-secondary hover:underline"
                      >
                        {row.isActive ? "Disable" : "Enable"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
