import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanLine, Lock, User, CheckCircle2, XCircle, Keyboard, LogOut, Loader2 } from "lucide-react";
import { GradientMesh } from "@/components/ambient";
import { PatternBackdrop, PeacockFeather, Flourish } from "@/components/motifs";
import { GoldButton } from "@/components/festive";
import { api, ApiError, ADMIN_TOKEN_KEY, adminTokenStore } from "@/lib/api";
import { QR_READER_CLASS, SCANNER_CAMERA_CONFIG } from "@/lib/scanner-config";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
export const Route = createFileRoute("/scanner")({
  head: () => ({
    meta: [{
      title: "Desk Scanner — Janmashtami Utsav Staff"
    }, {
      name: "description",
      content: "Staff-only entry QR scanner for the Janmashtami Utsav registration desk."
    }, {
      name: "robots",
      content: "noindex"
    }, {
      property: "og:title",
      content: "Desk Scanner — Janmashtami Utsav Staff"
    }, {
      property: "og:description",
      content: "Check in bhaktas and mark Divine Gift claims at the desk."
    }]
  }),
  component: ScannerPage
});
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit"
  });
}
function ScannerPage() {
  const [token, setToken] = useState(() => adminTokenStore.get(ADMIN_TOKEN_KEY));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [manual, setManual] = useState("");
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const processingRef = useRef(false);
  const handleCheckinPayload = useCallback(async signedPayload => {
    if (!token || processingRef.current) return;
    processingRef.current = true;
    setScanning(true);
    setResult(null);
    try {
      const data = await api.scanCheckin(token, signedPayload);
      setResult({
        kind: "ok",
        name: data.fullName,
        note: `This person checked in · Divine Gift issued · ${formatTime(data.checkInTime)}`
      });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "SIGNATURE_MISMATCH") {
          const entryCode = err.data?.entryCode ?? "";
          setResult({
            kind: "err",
            title: "Signature Mismatch",
            note: "QR may be damaged. Use manual override below.",
            overrideEntryCode: entryCode
          });
          if (entryCode) setManual(entryCode);
        } else if (err.code === "ALREADY_CHECKED_IN") {
          const d = err.data;
          setResult({
            kind: "err",
            title: "This person already checked in",
            note: `${d.fullName ?? "Bhakta"} · ${d.checkInTime ? formatTime(d.checkInTime) : "earlier today"}`
          });
        } else if (err.code === "NOT_FOUND") {
          setResult({
            kind: "err",
            title: "Not Found",
            note: "This code is not in the register"
          });
        } else {
          setResult({
            kind: "err",
            title: "Scan Failed",
            note: err.message
          });
        }
      } else {
        setResult({
          kind: "err",
          title: "Scan Failed",
          note: "Could not reach the server"
        });
      }
    } finally {
      processingRef.current = false;
      setScanning(false);
    }
  }, [token]);
  const handleManualCheckin = useCallback(async () => {
    if (!token || !manual.trim()) return;
    setScanning(true);
    setResult(null);
    try {
      const payload = manual.trim();
      if (payload.includes(".")) {
        await handleCheckinPayload(payload);
        return;
      }
      const data = await api.scanCheckinOverride(token, payload);
      setResult({
        kind: "ok",
        name: data.fullName,
        note: `This person checked in · Divine Gift issued · ${formatTime(data.checkInTime)}`
      });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "ALREADY_CHECKED_IN") {
          const d = err.data;
          setResult({
            kind: "err",
            title: "This person already checked in",
            note: `${d.fullName ?? "Bhakta"} · ${d.checkInTime ? formatTime(d.checkInTime) : "earlier today"}`
          });
        } else if (err.code === "NOT_FOUND") {
          setResult({
            kind: "err",
            title: "Not Found",
            note: "This code is not in the register"
          });
        } else {
          setResult({
            kind: "err",
            title: "Check-in Failed",
            note: err.message
          });
        }
      } else {
        setResult({
          kind: "err",
          title: "Check-in Failed",
          note: "Could not reach the server"
        });
      }
    } finally {
      setScanning(false);
    }
  }, [handleCheckinPayload, manual, token]);
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const {
          Html5Qrcode
        } = await import("html5-qrcode");
        if (cancelled) return;
        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;
        await scanner.start({
          facingMode: "environment"
        }, SCANNER_CAMERA_CONFIG, decoded => {
          void handleCheckinPayload(decoded);
        }, () => undefined);
      } catch {
        /* camera unavailable — manual fallback still works */
      }
    })();
    return () => {
      cancelled = true;
      void scannerRef.current?.stop().catch(() => undefined);
      scannerRef.current = null;
    };
  }, [token, handleCheckinPayload]);
  if (!token) {
    return /*#__PURE__*/_jsxs("div", {
      className: "relative grid min-h-screen place-items-center overflow-hidden bg-gradient-festive px-4",
      children: [/*#__PURE__*/_jsx(GradientMesh, {}), /*#__PURE__*/_jsx(PatternBackdrop, {
        variant: "mandala",
        className: "text-secondary opacity-[0.07]"
      }), /*#__PURE__*/_jsx("form", {
        onSubmit: async e => {
          e.preventDefault();
          setLoginError(null);
          setLoginLoading(true);
          try {
            const {
              token: jwt
            } = await api.adminLogin(username, password);
            adminTokenStore.set(ADMIN_TOKEN_KEY, jwt);
            setToken(jwt);
          } catch {
            setLoginError("Invalid username or password");
          } finally {
            setLoginLoading(false);
          }
        },
        className: "relative w-full max-w-sm rounded-[2rem] bg-gradient-gold p-[3px] shadow-warm",
        children: /*#__PURE__*/_jsxs("div", {
          className: "rounded-[calc(2rem-2px)] bg-card p-8",
          children: [/*#__PURE__*/_jsx(PeacockFeather, {
            className: "mx-auto h-14 w-14"
          }), /*#__PURE__*/_jsx("h1", {
            className: "mt-4 text-center font-display text-2xl",
            children: "Desk Scanner"
          }), /*#__PURE__*/_jsx(Flourish, {
            className: "mx-auto mt-2 h-5 w-40"
          }), /*#__PURE__*/_jsx("p", {
            className: "mt-2 text-center text-sm text-muted-foreground",
            children: "Staff access only"
          }), /*#__PURE__*/_jsxs("div", {
            className: "mt-6 space-y-4",
            children: [/*#__PURE__*/_jsxs("label", {
              className: "block",
              children: [/*#__PURE__*/_jsxs("span", {
                className: "mb-2 flex items-center gap-2 text-sm font-bold text-secondary",
                children: [/*#__PURE__*/_jsx(User, {
                  className: "h-5 w-5"
                }), " Username"]
              }), /*#__PURE__*/_jsx("input", {
                required: true,
                value: username,
                onChange: e => setUsername(e.target.value),
                className: "min-h-12 w-full rounded-xl border-2 border-primary/30 bg-background px-4 outline-none focus:border-primary"
              })]
            }), /*#__PURE__*/_jsxs("label", {
              className: "block",
              children: [/*#__PURE__*/_jsxs("span", {
                className: "mb-2 flex items-center gap-2 text-sm font-bold text-secondary",
                children: [/*#__PURE__*/_jsx(Lock, {
                  className: "h-5 w-5"
                }), " Password"]
              }), /*#__PURE__*/_jsx("input", {
                required: true,
                type: "password",
                value: password,
                onChange: e => setPassword(e.target.value),
                className: "min-h-12 w-full rounded-xl border-2 border-primary/30 bg-background px-4 outline-none focus:border-primary"
              })]
            }), loginError && /*#__PURE__*/_jsx("p", {
              className: "text-sm font-semibold text-destructive",
              children: loginError
            }), /*#__PURE__*/_jsx(GoldButton, {
              type: "submit",
              disabled: loginLoading,
              className: "w-full justify-center",
              children: loginLoading ? /*#__PURE__*/_jsx(Loader2, {
                className: "h-5 w-5 animate-spin"
              }) : "Sign in"
            })]
          })]
        })
      })]
    });
  }
  return /*#__PURE__*/_jsxs("div", {
    className: "relative min-h-screen overflow-hidden bg-background",
    children: [/*#__PURE__*/_jsx(PatternBackdrop, {
      variant: "feather",
      className: "text-secondary opacity-[0.05]"
    }), /*#__PURE__*/_jsxs("header", {
      className: "relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-primary/25 bg-card/90 px-4 py-3 backdrop-blur",
      children: [/*#__PURE__*/_jsxs("div", {
        className: "flex min-w-0 items-center gap-3",
        children: [/*#__PURE__*/_jsx("span", {
          className: "grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/20 text-secondary",
          children: /*#__PURE__*/_jsx(ScanLine, {
            className: "h-6 w-6"
          })
        }), /*#__PURE__*/_jsx("h1", {
          className: "truncate font-display text-xl",
          children: "Registration Desk Scanner"
        })]
      }), /*#__PURE__*/_jsxs("button", {
        onClick: () => {
          adminTokenStore.remove(ADMIN_TOKEN_KEY);
          setToken(null);
        },
        className: "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-secondary/15 px-4 text-sm font-bold text-secondary",
        children: [/*#__PURE__*/_jsx(LogOut, {
          className: "h-5 w-5"
        }), " Exit"]
      })]
    }), /*#__PURE__*/_jsxs("main", {
      className: "relative mx-auto max-w-3xl px-4 py-6",
      children: [/*#__PURE__*/_jsx("div", {
        id: "qr-reader",
        className: QR_READER_CLASS
      }), scanning && /*#__PURE__*/_jsxs("div", {
        className: "mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground",
        children: [/*#__PURE__*/_jsx(Loader2, {
          className: "h-4 w-4 animate-spin"
        }), " Processing scan\u2026"]
      }), /*#__PURE__*/_jsx(AnimatePresence, {
        mode: "wait",
        children: result && /*#__PURE__*/_jsx(motion.div, {
          initial: {
            opacity: 0,
            scale: 0.94
          },
          animate: {
            opacity: 1,
            scale: 1
          },
          exit: {
            opacity: 0,
            scale: 0.94
          },
          className: `mt-6 rounded-3xl p-8 text-center shadow-warm ${result.kind === "ok" ? "bg-secondary text-secondary-foreground" : "bg-destructive text-destructive-foreground"}`,
          children: result.kind === "ok" ? /*#__PURE__*/_jsxs(_Fragment, {
            children: [/*#__PURE__*/_jsx(CheckCircle2, {
              className: "mx-auto h-20 w-20",
              strokeWidth: 2.2
            }), /*#__PURE__*/_jsx("p", {
              className: "mt-3 font-display text-4xl",
              children: result.name
            }), /*#__PURE__*/_jsx("p", {
              className: "mt-1 text-lg opacity-90",
              children: result.note
            })]
          }) : /*#__PURE__*/_jsxs(_Fragment, {
            children: [/*#__PURE__*/_jsx(XCircle, {
              className: "mx-auto h-20 w-20",
              strokeWidth: 2.2
            }), /*#__PURE__*/_jsx("p", {
              className: "mt-3 font-display text-4xl",
              children: result.title
            }), /*#__PURE__*/_jsx("p", {
              className: "mt-1 text-lg opacity-90",
              children: result.note
            }), result.overrideEntryCode && /*#__PURE__*/_jsx("button", {
              type: "button",
              onClick: () => void handleManualCheckin(),
              className: "mt-4 rounded-full bg-background/20 px-6 py-2 text-sm font-bold",
              children: "Force override check-in"
            })]
          })
        }, `${result.kind}-${result.kind === "ok" ? result.name : result.title}`)
      }), /*#__PURE__*/_jsxs("div", {
        className: "mt-8 rounded-2xl bg-card p-5 ring-1 ring-primary/25",
        children: [/*#__PURE__*/_jsxs("span", {
          className: "flex items-center gap-2 text-sm font-bold text-muted-foreground",
          children: [/*#__PURE__*/_jsx(Keyboard, {
            className: "h-5 w-5"
          }), " Manual entry (fallback)"]
        }), /*#__PURE__*/_jsxs("div", {
          className: "mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-3",
          children: [/*#__PURE__*/_jsx("input", {
            value: manual,
            onChange: e => setManual(e.target.value),
            placeholder: "JN2026-00452 or signed payload",
            className: "min-h-12 min-w-0 rounded-xl border-2 border-primary/30 bg-background px-4 outline-none focus:border-primary"
          }), /*#__PURE__*/_jsx("button", {
            onClick: () => void handleManualCheckin(),
            disabled: scanning,
            className: "min-h-12 shrink-0 rounded-xl bg-secondary px-5 font-bold text-secondary-foreground",
            children: "Check"
          })]
        })]
      })]
    })]
  });
}