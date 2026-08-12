import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Keyboard, Loader2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { QR_READER_CLASS, SCANNER_CAMERA_CONFIG } from "@/lib/scanner-config";

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

export function ScannerPanel({ token }) {
  const [result, setResult] = useState(null);
  const [manual, setManual] = useState("");
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const processingRef = useRef(false);

  const handleCheckinPayload = useCallback(
    async (signedPayload) => {
      if (!token || processingRef.current) return;
      processingRef.current = true;
      setScanning(true);
      setResult(null);
      try {
        const data = await api.scanCheckin(token, signedPayload);
        setResult({
          kind: "ok",
          name: data.fullName,
          note: `This person checked in · keychain issued · ${formatTime(data.checkInTime)}`,
        });
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.code === "SIGNATURE_MISMATCH") {
            const entryCode = err.data?.entryCode ?? "";
            setResult({
              kind: "err",
              title: "Signature Mismatch",
              note: "QR may be damaged. Use manual override below.",
              overrideEntryCode: entryCode,
            });
            if (entryCode) setManual(entryCode);
          } else if (err.code === "ALREADY_CHECKED_IN") {
            const d = err.data;
            setResult({
              kind: "err",
              title: "This person already checked in",
              note: `${d.fullName ?? "Bhakta"} · ${d.checkInTime ? formatTime(d.checkInTime) : "earlier today"}`,
            });
          } else if (err.code === "NOT_FOUND") {
            setResult({ kind: "err", title: "Not Found", note: "This code is not in the register" });
          } else {
            setResult({ kind: "err", title: "Scan Failed", note: err.message });
          }
        } else {
          setResult({ kind: "err", title: "Scan Failed", note: "Could not reach the server" });
        }
      } finally {
        processingRef.current = false;
        setScanning(false);
      }
    },
    [token],
  );

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
        note: `This person checked in · keychain issued · ${formatTime(data.checkInTime)}`,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "ALREADY_CHECKED_IN") {
          const d = err.data;
          setResult({
            kind: "err",
            title: "This person already checked in",
            note: `${d.fullName ?? "Bhakta"} · ${d.checkInTime ? formatTime(d.checkInTime) : "earlier today"}`,
          });
        } else if (err.code === "NOT_FOUND") {
          setResult({ kind: "err", title: "Not Found", note: "This code is not in the register" });
        } else {
          setResult({ kind: "err", title: "Check-in Failed", note: err.message });
        }
      } else {
        setResult({ kind: "err", title: "Check-in Failed", note: "Could not reach the server" });
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
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;
        const scanner = new Html5Qrcode("admin-qr-reader");
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          SCANNER_CAMERA_CONFIG,
          (decoded) => {
            void handleCheckinPayload(decoded);
          },
          () => undefined,
        );
      } catch {
        /* camera unavailable */
      }
    })();
    return () => {
      cancelled = true;
      void scannerRef.current?.stop().catch(() => undefined);
      scannerRef.current = null;
    };
  }, [token, handleCheckinPayload]);

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="font-display text-2xl">Entry Scanner</h2>
      <p className="mt-1 text-sm text-muted-foreground">Scan QR codes to check in bhaktas and issue keychains.</p>

      <div id="admin-qr-reader" className={QR_READER_CLASS} />

      {scanning && (
        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Processing scan…
        </div>
      )}

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            className={`mt-6 rounded-3xl p-8 text-center shadow-warm ${
              result.kind === "ok" ? "bg-secondary text-secondary-foreground" : "bg-destructive text-destructive-foreground"
            }`}
          >
            {result.kind === "ok" ? (
              <>
                <CheckCircle2 className="mx-auto h-20 w-20" strokeWidth={2.2} />
                <p className="mt-3 font-display text-4xl">{result.name}</p>
                <p className="mt-1 text-lg opacity-90">{result.note}</p>
              </>
            ) : (
              <>
                <XCircle className="mx-auto h-20 w-20" strokeWidth={2.2} />
                <p className="mt-3 font-display text-4xl">{result.title}</p>
                <p className="mt-1 text-lg opacity-90">{result.note}</p>
                {result.overrideEntryCode && (
                  <button
                    type="button"
                    onClick={() => void handleManualCheckin()}
                    className="mt-4 rounded-full bg-background/20 px-6 py-2 text-sm font-bold"
                  >
                    Force override check-in
                  </button>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 rounded-2xl bg-card p-5 ring-1 ring-primary/25">
        <span className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
          <Keyboard className="h-5 w-5" /> Manual entry (fallback)
        </span>
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-3">
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="JN2026-00452 or signed payload"
            className="min-h-12 min-w-0 rounded-xl border-2 border-primary/30 bg-background px-4 outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={() => void handleManualCheckin()}
            disabled={scanning}
            className="min-h-12 shrink-0 rounded-xl bg-secondary px-5 font-bold text-secondary-foreground"
          >
            Check
          </button>
        </div>
      </div>
    </div>
  );
}
