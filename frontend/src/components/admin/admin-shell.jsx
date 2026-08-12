import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ClipboardList,
  LogOut,
  ScanLine,
  UserPlus,
  Lock,
  User,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { api, ApiError, ADMIN_TOKEN_KEY, adminTokenStore } from "@/lib/api";
import { GoldButton } from "@/components/festive";
import { PatternBackdrop } from "@/components/motifs";

const NAV = [
  { to: "/admin/scanner", label: "Scanner", icon: ScanLine },
  { to: "/admin/register", label: "Desk Register", icon: UserPlus },
  { to: "/admin/registrations", label: "Registrations", icon: ClipboardList },
];

export function AdminShell() {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => adminTokenStore.get(ADMIN_TOKEN_KEY));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const logout = () => {
    adminTokenStore.remove(ADMIN_TOKEN_KEY);
    setToken(null);
    navigate({ to: "/admin" });
  };

  if (!token) {
    return (
      <div className="relative grid min-h-screen place-items-center overflow-hidden bg-gradient-festive px-4">
        <PatternBackdrop variant="mandala" className="text-secondary opacity-[0.07]" />
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoginError(null);
            setLoginLoading(true);
            try {
              const { token: jwt } = await api.adminLogin(username.trim(), password);
              adminTokenStore.set(ADMIN_TOKEN_KEY, jwt);
              setToken(jwt);
            } catch (err) {
              if (err instanceof ApiError && err.code === "INVALID_CREDENTIALS") {
                setLoginError("Invalid username or password");
              } else if (err instanceof ApiError && err.code === "NETWORK_ERROR") {
                setLoginError("Cannot reach the server. Start the backend (port 5000) and restart the frontend.");
              } else if (err instanceof ApiError) {
                setLoginError(err.message);
              } else {
                setLoginError("Login failed. Please try again.");
              }
            } finally {
              setLoginLoading(false);
            }
          }}
          className="relative w-full max-w-sm rounded-[2rem] bg-gradient-gold p-[3px] shadow-warm"
        >
          <div className="rounded-[calc(2rem-2px)] bg-card p-8">
            <h1 className="text-center font-display text-2xl">Admin Panel</h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">Staff access only</p>
            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-bold text-secondary">
                  <User className="h-5 w-5" /> Username
                </span>
                <input
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="min-h-12 w-full rounded-xl border-2 border-primary/30 bg-background px-4 outline-none focus:border-primary"
                />
              </label>
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-bold text-secondary">
                  <Lock className="h-5 w-5" /> Password
                </span>
                <div className="relative">
                  <input
                    required
                    autoComplete="current-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="min-h-12 w-full rounded-xl border-2 border-primary/30 bg-background px-4 pr-12 outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </label>
              {loginError && <p className="text-sm font-semibold text-destructive">{loginError}</p>}
              <GoldButton type="submit" disabled={loginLoading} className="w-full justify-center">
                {loginLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign in"}
              </GoldButton>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-primary/20 bg-card md:flex">
        <div className="border-b border-primary/15 p-5">
          <h1 className="font-display text-lg">Admin Panel</h1>
          <p className="text-xs text-muted-foreground">Janmashtami Desk</p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground [&.active]:bg-primary/15 [&.active]:text-secondary"
              activeProps={{ className: "active" }}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={logout}
          className="m-3 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5" /> Log out
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-primary/20 bg-card/90 px-4 py-3 backdrop-blur md:hidden">
          <span className="font-display text-lg">Admin</span>
          <div className="flex items-center gap-2">
            {NAV.map(({ to, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-secondary [&.active]:bg-secondary/20"
                activeProps={{ className: "active" }}
              >
                <Icon className="h-5 w-5" />
              </Link>
            ))}
            <button type="button" onClick={logout} className="grid h-10 w-10 place-items-center rounded-full bg-destructive/10 text-destructive">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <Outlet context={{ token }} />
        </main>
      </div>
    </div>
  );
}

export function useAdminToken() {
  return adminTokenStore.get(ADMIN_TOKEN_KEY);
}
