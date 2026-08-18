import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
  HandHeart,
  Sparkles,
  Baby,
  Gift,
  Gift,
  // Trophy,
  Shield,
} from "lucide-react";
import {
  api,
  ApiError,
  clearAdminSession,
  loadAdminSession,
  saveAdminSession,
  adminHasPage,
} from "@/lib/api";
import { GoldButton } from "@/components/festive";
import { PatternBackdrop } from "@/components/motifs";

const NAV = [
  { to: "/admin/admins", page: "admins", label: "Team access", icon: Shield },
  { to: "/admin/scanner", page: "scanner", label: "Scanner", icon: ScanLine },
  { to: "/admin/register", page: "register", label: "Desk Register", icon: UserPlus },
  { to: "/admin/registrations", page: "registrations", label: "Registrations", icon: ClipboardList },
  { to: "/admin/volunteers", page: "volunteers", label: "Volunteers", icon: HandHeart },
  { to: "/admin/abhishek", page: "abhishek", label: "Abhishek", icon: Sparkles },
  { to: "/admin/fancy-dress", page: "fancy-dress", label: "Fancy Dress", icon: Baby },
  { to: "/admin/laddu-gopal", page: "laddu-gopal", label: "Laddu Gopal", icon: Gift },
  // REFERRAL DISABLED
  // { to: "/admin/leaderboard", page: "leaderboard", label: "Leaderboard", icon: Trophy },
];

const PAGE_BY_PATH = {
  "/admin/admins": "admins",
  "/admin/scanner": "scanner",
  "/admin/register": "register",
  "/admin/registrations": "registrations",
  "/admin/volunteers": "volunteers",
  "/admin/abhishek": "abhishek",
  "/admin/fancy-dress": "fancy-dress",
  "/admin/laddu-gopal": "laddu-gopal",
  // REFERRAL DISABLED
  // "/admin/leaderboard": "leaderboard",
};

function firstAllowedPath(admin) {
  if (admin?.role === "super_admin") return "/admin/admins";
  const hit = NAV.find((n) => adminHasPage(admin, n.page));
  return hit?.to ?? "/admin/scanner";
}

export function AdminShell() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [session, setSession] = useState(() => loadAdminSession());
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(() => Boolean(loadAdminSession()?.token));

  const token = session?.token ?? null;
  const admin = session?.admin ?? null;

  const navItems = useMemo(
    () => NAV.filter((n) => adminHasPage(admin, n.page)),
    [admin],
  );

  useEffect(() => {
    if (!token) {
      setBootstrapping(false);
      return;
    }
    let cancelled = false;
    api
      .adminMe(token)
      .then((me) => {
        if (cancelled) return;
        saveAdminSession({ token, admin: me });
        setSession({ token, admin: me });
      })
      .catch((err) => {
        if (cancelled) return;
        // Only force logout on real auth failure. 404 = old backend without /me.
        if (err instanceof ApiError && (err.status === 401 || err.code === "UNAUTHORIZED")) {
          clearAdminSession();
          setSession(null);
        }
      })
      .finally(() => {
        if (!cancelled) setBootstrapping(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!admin || bootstrapping) return;
    const page = PAGE_BY_PATH[pathname];
    if (pathname === "/admin" || pathname === "/admin/") {
      navigate({ to: firstAllowedPath(admin) });
      return;
    }
    if (page && !adminHasPage(admin, page)) {
      navigate({ to: firstAllowedPath(admin) });
    }
  }, [admin, bootstrapping, pathname, navigate]);

  const logout = () => {
    clearAdminSession();
    setSession(null);
    navigate({ to: "/admin" });
  };

  if (bootstrapping) {
    return (
      <div className="grid min-h-screen place-items-center bg-gradient-festive">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

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
              const data = await api.adminLogin(username.trim(), password);
              saveAdminSession({ token: data.token, admin: data.admin });
              setSession({ token: data.token, admin: data.admin });
              navigate({ to: firstAllowedPath(data.admin) });
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
          <p className="text-xs text-muted-foreground">
            {admin?.username ? (
              <>
                {admin.username}
                <span className="mx-1 opacity-40">·</span>
                <span className="capitalize">{admin.role?.replace("_", " ")}</span>
              </>
            ) : (
              "Staff panel"
            )}
          </p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map(({ to, label, icon: Icon }) => (
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
        <header className="flex items-center gap-3 border-b border-primary/20 bg-card/90 px-3 py-3 backdrop-blur md:hidden">
          <span className="shrink-0 font-display text-lg">Admin</span>
          <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto pb-0.5">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                aria-label={label}
                title={label}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-secondary [&.active]:bg-secondary/20"
                activeProps={{ className: "active" }}
              >
                <Icon className="h-4 w-4" />
              </Link>
            ))}
            <button type="button" onClick={logout} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <Outlet context={{ token, admin }} />
        </main>
      </div>
    </div>
  );
}

export function useAdminToken() {
  return loadAdminSession()?.token ?? null;
}
