import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  Loader2,
  MessageCircle,
  RefreshCw,
  Link2,
  Unlink,
  Smartphone,
} from "lucide-react";
import { api, ADMIN_TOKEN_KEY, adminTokenStore } from "@/lib/api";
import { GoldButton } from "@/components/festive";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminPagination, ADMIN_PAGE_SIZE } from "@/components/admin/admin-pagination";

export const Route = createFileRoute("/admin/whatsapp")({
  head: () => ({
    meta: [
      { title: "WhatsApp — Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminWhatsAppPage,
});

const STATUS_COPY = {
  connected: "WhatsApp is connected and ready to send messages.",
  connecting: "Connecting to WhatsApp…",
  pairing: "Waiting for WhatsApp pairing…",
  disconnected: "WhatsApp is temporarily disconnected.",
  logged_out: "WhatsApp has been logged out. Pair the account again.",
  not_configured: "No WhatsApp number is connected.",
  error: "WhatsApp encountered an error. Check the connection.",
};

function statusDot(status) {
  if (status === "connected") return "bg-emerald-500";
  if (status === "connecting" || status === "pairing") return "bg-amber-400 animate-pulse";
  if (status === "logged_out" || status === "error") return "bg-destructive";
  return "bg-muted-foreground";
}

function formatWhen(v) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString("en-IN");
  } catch {
    return "—";
  }
}

function formatNextProcess(nextProcessAt) {
  if (!nextProcessAt) return "—";
  const ms = new Date(nextProcessAt).getTime() - Date.now();
  if (Number.isNaN(ms)) return "—";
  if (ms <= 0) return "now";
  if (ms < 60_000) return `~${Math.ceil(ms / 1000)} seconds`;
  return `~${Math.ceil(ms / 60_000)} min`;
}

function workerLabel(worker, connected) {
  if (!worker?.running) return { text: "Stopped", className: "text-muted-foreground" };
  if (worker.pauseReason === "circuit") {
    return { text: "Paused (circuit breaker)", className: "text-amber-700" };
  }
  if (!connected || worker.pauseReason === "disconnected") {
    return { text: "Waiting for connection", className: "text-amber-700" };
  }
  if (worker.paused) {
    return { text: "Paused", className: "text-amber-700" };
  }
  return { text: "Running", className: "text-emerald-700" };
}

function AdminWhatsAppPage() {
  const token = adminTokenStore.get(ADMIN_TOKEN_KEY);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [pairOpen, setPairOpen] = useState(false);
  const [pairMode, setPairMode] = useState(null); // qr | phone
  const [pairQrDataUrl, setPairQrDataUrl] = useState(null);
  const [pairPhone, setPairPhone] = useState("");
  const [pairCode, setPairCode] = useState(null);
  const [pairMsg, setPairMsg] = useState(null);

  const [messages, setMessages] = useState([]);
  const [msgTotal, setMsgTotal] = useState(0);
  const [msgPage, setMsgPage] = useState(1);
  const [msgStatus, setMsgStatus] = useState("");
  const [msgSearch, setMsgSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const loadStatus = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.whatsappStatus(token);
      setStatus(data);
      setError(null);
      if (data.connected && pairOpen) {
        setPairOpen(false);
        setPairMode(null);
        setPairQrDataUrl(null);
        setPairCode(null);
        setPairMsg("WhatsApp connected successfully");
      }
    } catch {
      setError("Unable to retrieve WhatsApp status.");
    } finally {
      setLoading(false);
    }
  }, [token, pairOpen]);

  const loadMessages = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.whatsappListMessages(token, {
        page: msgPage,
        limit: showAll ? ADMIN_PAGE_SIZE : 8,
        status: msgStatus || undefined,
        search: msgSearch || undefined,
      });
      setMessages(data.rows);
      setMsgTotal(data.total);
    } catch {
      /* ignore */
    }
  }, [token, msgPage, msgStatus, msgSearch, showAll]);

  useEffect(() => {
    void loadStatus();
    const t = setInterval(() => void loadStatus(), 12_000);
    return () => clearInterval(t);
  }, [loadStatus]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  // Poll pairing QR while modal open in QR mode
  useEffect(() => {
    if (!pairOpen || pairMode !== "qr" || !token) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const data = await api.whatsappPairQr(token);
        if (cancelled) return;
        if (data.connected) {
          void loadStatus();
          return;
        }
        if (data.qr) {
          const url = await QRCode.toDataURL(data.qr, { width: 280, margin: 2 });
          if (!cancelled) setPairQrDataUrl(url);
        }
      } catch {
        /* ignore */
      }
    };
    void tick();
    const id = setInterval(tick, 2500);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [pairOpen, pairMode, token, loadStatus]);

  const run = async (fn) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      await loadStatus();
      await loadMessages();
    } catch (err) {
      setError(err?.message || "Operation failed");
    } finally {
      setBusy(false);
    }
  };

  const openConnect = async () => {
    setPairOpen(true);
    setPairMode(null);
    setPairQrDataUrl(null);
    setPairCode(null);
    setPairMsg(null);
  };

  const startQrPair = async () => {
    setPairMode("qr");
    setPairMsg(null);
    await run(async () => {
      await api.whatsappPairStart(token);
    });
  };

  const startPhonePair = async () => {
    setPairMode("phone");
    setPairCode(null);
    setPairMsg(null);
    await run(async () => {
      await api.whatsappPairStart(token);
    });
  };

  const generatePairCode = async () => {
    setBusy(true);
    try {
      const data = await api.whatsappPairingCode(token, pairPhone);
      setPairCode(data.pairingCode);
      setPairMsg(null);
    } catch (err) {
      setPairMsg(err?.message || "Unable to pair WhatsApp. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const cancelPair = async () => {
    await run(async () => {
      await api.whatsappPairCancel(token);
    });
    setPairOpen(false);
    setPairMode(null);
  };

  if (!token) return null;

  const st = status?.status || "not_configured";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">WhatsApp</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Send registration Entry Passes. Pairing stays on the server — never in the browser.
          </p>
        </div>
        <GoldButton onClick={() => void loadStatus()} disabled={loading || busy} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </GoldButton>
      </div>

      {status?.adminAlert?.message && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-destructive/10 px-4 py-3 text-sm ring-1 ring-destructive/30">
          <p className="font-semibold text-destructive">{status.adminAlert.message}</p>
          <button
            type="button"
            className="text-xs font-bold uppercase tracking-wide text-destructive"
            onClick={() => void run(() => api.whatsappAckAlert(token))}
          >
            Dismiss
          </button>
        </div>
      )}

      {error && <p className="text-sm font-semibold text-destructive">{error}</p>}
      {pairMsg && <p className="text-sm font-semibold text-secondary">{pairMsg}</p>}

      {!status?.connected && (status?.queue?.pending > 0 || status?.pendingMessages > 0) && (
        <div className="rounded-2xl bg-amber-50 px-4 py-4 text-sm ring-1 ring-amber-200 sm:px-5">
          <p className="font-semibold text-amber-900">⚠ WhatsApp disconnected</p>
          <p className="mt-1 text-amber-800/90">
            {status?.queue?.pending ?? status?.pendingMessages ?? 0} messages are safely queued and
            will be sent automatically after reconnection.
          </p>
          {(st === "disconnected" || st === "logged_out" || st === "error" || st === "not_configured") && (
            <div className="mt-3">
              {st === "disconnected" ? (
                <GoldButton
                  disabled={busy}
                  onClick={() =>
                    void run(async () => {
                      await api.whatsappReconnect(token);
                    })
                  }
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" /> Reconnect
                </GoldButton>
              ) : (
                <GoldButton disabled={busy} onClick={() => void openConnect()} className="gap-2">
                  <Link2 className="h-4 w-4" /> Connect WhatsApp
                </GoldButton>
              )}
            </div>
          )}
        </div>
      )}

      <div className="rounded-2xl bg-card p-5 ring-1 ring-primary/20 sm:p-6">
        <div className="flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${statusDot(st)}`} />
          <h3 className="font-display text-xl capitalize">{st.replace("_", " ")}</h3>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{STATUS_COPY[st] || STATUS_COPY.error}</p>

        {!status?.enabled && (
          <p className="mt-3 text-sm font-semibold text-amber-700">
            Backend has WHATSAPP_ENABLED=false. Enable it in Railway / .env to connect.
          </p>
        )}

        <div className="mt-4 grid gap-1 text-sm">
          <p>
            <span className="text-muted-foreground">Number:</span>{" "}
            <span className="font-semibold">{status?.phoneNumber || "—"}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Name:</span>{" "}
            <span className="font-semibold">{status?.displayName || "—"}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Last connected:</span>{" "}
            {formatWhen(status?.lastConnectedAt)}
          </p>
        </div>

        <div className="mt-5">
          <h4 className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Queue</h4>
          <div className="mt-2 grid grid-cols-2 gap-3 text-center sm:grid-cols-5">
            <div className="rounded-xl bg-primary/10 py-3">
              <div className="text-2xl font-bold text-secondary">{status?.queue?.pending ?? 0}</div>
              <div className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                Pending
              </div>
            </div>
            <div className="rounded-xl bg-amber-500/10 py-3">
              <div className="text-2xl font-bold text-amber-800">
                {status?.queue?.processing ?? 0}
              </div>
              <div className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                Processing
              </div>
            </div>
            <div className="rounded-xl bg-secondary/10 py-3">
              <div className="text-2xl font-bold text-secondary">{status?.sentToday ?? 0}</div>
              <div className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                Sent today
              </div>
            </div>
            <div className="rounded-xl bg-destructive/10 py-3">
              <div className="text-2xl font-bold text-destructive">{status?.queue?.failed ?? 0}</div>
              <div className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                Failed
              </div>
            </div>
            <div className="rounded-xl bg-muted/60 py-3">
              <div className="text-2xl font-bold text-secondary">{status?.queue?.cancelled ?? 0}</div>
              <div className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                Cancelled
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-secondary/5 px-4 py-3 ring-1 ring-primary/10">
          <h4 className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Worker</h4>
          {(() => {
            const w = workerLabel(status?.worker, status?.connected);
            return (
              <div className="mt-2 grid gap-1 text-sm">
                <p className={`font-semibold ${w.className}`}>
                  ● {w.text}
                  {status?.worker?.consecutiveFailures > 0
                    ? ` · ${status.worker.consecutiveFailures} consecutive failure(s)`
                    : ""}
                </p>
                <p>
                  <span className="text-muted-foreground">Last message:</span>{" "}
                  {formatWhen(status?.worker?.lastProcessedAt || status?.lastMessageSentAt)}
                </p>
                <p>
                  <span className="text-muted-foreground">Next message:</span>{" "}
                  {formatNextProcess(status?.worker?.nextProcessAt)}
                </p>
              </div>
            );
          })()}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {(st === "not_configured" || st === "logged_out" || st === "error") && (
            <GoldButton disabled={busy} onClick={() => void openConnect()} className="gap-2">
              <Link2 className="h-4 w-4" />
              {st === "logged_out" ? "Pair Again" : "Connect WhatsApp"}
            </GoldButton>
          )}
          {st === "disconnected" && (
            <GoldButton
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  await api.whatsappReconnect(token);
                })
              }
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Reconnect
            </GoldButton>
          )}
          {st === "connected" && (
            <>
              <GoldButton
                disabled={busy}
                onClick={() => {
                  if (
                    !window.confirm(
                      `Current WhatsApp:\n${status?.phoneNumber || "—"}\n\nChanging the WhatsApp number will disconnect the current account and require pairing a new number.\n\nExisting pending messages will not automatically be sent from the new number.`,
                    )
                  ) {
                    return;
                  }
                  void run(async () => {
                    await api.whatsappChangeNumber(token);
                    setPairOpen(true);
                    setPairMode(null);
                  });
                }}
              >
                Change Number
              </GoldButton>
              <button
                type="button"
                disabled={busy}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border-2 border-primary/25 px-4 text-sm font-semibold text-secondary"
                onClick={() => {
                  if (
                    !window.confirm(
                      "Disconnect WhatsApp?\n\nNew registration messages will remain queued until WhatsApp is connected again.",
                    )
                  ) {
                    return;
                  }
                  void run(() => api.whatsappDisconnect(token));
                }}
              >
                <Unlink className="h-4 w-4" /> Disconnect
              </button>
            </>
          )}
          <button
            type="button"
            className="inline-flex min-h-10 items-center gap-2 rounded-full border-2 border-primary/25 px-4 text-sm font-semibold"
            onClick={() => setShowAll(true)}
          >
            <MessageCircle className="h-4 w-4" /> View Messages
          </button>
        </div>
      </div>

      {/* Pairing modal */}
      {pairOpen && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-5 shadow-xl ring-1 ring-primary/20">
            <h3 className="font-display text-xl">Connect WhatsApp</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              This pairing QR is only for linking the Anandotsav WhatsApp account — not an entry pass.
            </p>

            {!pairMode && (
              <div className="mt-4 flex flex-col gap-2">
                <GoldButton disabled={busy} onClick={() => void startQrPair()} className="gap-2">
                  Scan QR
                </GoldButton>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void startPhonePair()}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-primary/30 text-sm font-semibold"
                >
                  <Smartphone className="h-4 w-4" /> Use Phone Number
                </button>
              </div>
            )}

            {pairMode === "qr" && (
              <div className="mt-4 text-center">
                {pairQrDataUrl ? (
                  <img
                    src={pairQrDataUrl}
                    alt="WhatsApp pairing QR"
                    className="mx-auto rounded-xl ring-1 ring-primary/20"
                  />
                ) : (
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-secondary" />
                )}
                <p className="mt-3 text-sm text-muted-foreground">
                  Open WhatsApp → Linked devices → Link a device
                </p>
              </div>
            )}

            {pairMode === "phone" && (
              <div className="mt-4 space-y-3">
                <p className="text-xs text-muted-foreground">Country: India (+91)</p>
                <input
                  value={pairPhone}
                  onChange={(e) => setPairPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="9876543210"
                  className="min-h-11 w-full rounded-xl border-2 border-primary/30 px-3 outline-none focus:border-primary"
                />
                <GoldButton disabled={busy || pairPhone.length < 10} onClick={() => void generatePairCode()}>
                  Generate Pairing Code
                </GoldButton>
                {pairCode && (
                  <div className="rounded-xl bg-secondary/10 p-4 text-center">
                    <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                      Pairing code
                    </p>
                    <p className="mt-2 font-display text-3xl tracking-widest">{pairCode}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      WhatsApp → Linked devices → Link with phone number
                    </p>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              className="mt-4 w-full text-sm font-semibold text-muted-foreground"
              onClick={() => void cancelPair()}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <h3 className="font-display text-xl">
            {showAll ? "Message history" : "Recent messages"}
          </h3>
          {showAll && (
            <div className="flex flex-wrap gap-2">
              <select
                value={msgStatus}
                onChange={(e) => {
                  setMsgStatus(e.target.value);
                  setMsgPage(1);
                }}
                className="min-h-10 rounded-xl border-2 border-primary/25 bg-background px-3 text-sm"
              >
                <option value="">All statuses</option>
                <option value="sent">Sent</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <input
                value={msgSearch}
                onChange={(e) => {
                  setMsgSearch(e.target.value);
                  setMsgPage(1);
                }}
                placeholder="Search entry / phone…"
                className="min-h-10 rounded-xl border-2 border-primary/25 bg-background px-3 text-sm"
              />
            </div>
          )}
        </div>

        <div className="overflow-x-auto rounded-2xl ring-1 ring-primary/20">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Registration</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Queued</TableHead>
                <TableHead>Processing</TableHead>
                <TableHead>Sent / Failed</TableHead>
                <TableHead>Last error</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                    No messages yet
                  </TableCell>
                </TableRow>
              ) : (
                messages.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="font-medium">{m.entryCode}</div>
                      <div className="max-w-[10rem] truncate text-[10px] text-muted-foreground">
                        {m.fullName}
                      </div>
                    </TableCell>
                    <TableCell>{m.phone}</TableCell>
                    <TableCell className="capitalize">{m.status}</TableCell>
                    <TableCell>{m.attempts ?? 0}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatWhen(m.queuedAt)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatWhen(m.processingAt)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {m.sentAt
                        ? `Sent ${formatWhen(m.sentAt)}`
                        : m.failedAt
                          ? `Failed ${formatWhen(m.failedAt)}`
                          : "—"}
                    </TableCell>
                    <TableCell
                      className="max-w-[12rem] truncate text-xs text-muted-foreground"
                      title={m.lastError || ""}
                    >
                      {m.lastError || "—"}
                    </TableCell>
                    <TableCell>
                      {(m.status === "failed" || m.status === "cancelled" || m.status === "pending") && (
                        <button
                          type="button"
                          disabled={busy}
                          className="text-xs font-bold text-secondary"
                          onClick={() =>
                            void run(async () => {
                              await api.whatsappRetryMessage(token, m.id);
                            })
                          }
                        >
                          Retry
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {showAll && (
          <AdminPagination
            page={msgPage}
            total={msgTotal}
            onPageChange={setMsgPage}
            disabled={busy}
          />
        )}
      </div>
    </div>
  );
}
