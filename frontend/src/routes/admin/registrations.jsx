import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Download, Loader2, RefreshCw, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GoldButton } from "@/components/festive";
import { api, ADMIN_TOKEN_KEY, adminTokenStore } from "@/lib/api";
import { AdminPagination, ADMIN_PAGE_SIZE } from "@/components/admin/admin-pagination";

export const Route = createFileRoute("/admin/registrations")({
  head: () => ({ meta: [{ title: "Registrations — Admin" }] }),
  component: AdminRegistrationsPage,
});

function WhatsAppStatusBadge({ whatsapp, registrationId, registrationSource, onRetry }) {
  if (registrationSource === "desk-manual") {
    return (
      <span className="text-xs text-muted-foreground" title="Desk register — no WhatsApp QR">
        Desk
      </span>
    );
  }
  if (!whatsapp?.status) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  if (whatsapp.status === "sent") {
    return (
      <span className="inline-flex flex-col gap-0.5">
        <span className="inline-flex rounded-full bg-secondary/20 px-2.5 py-0.5 text-xs font-bold text-secondary">
          ✓ Sent
        </span>
        {whatsapp.sentAt ? (
          <span className="text-[10px] text-muted-foreground">
            {new Date(whatsapp.sentAt).toLocaleString("en-IN")}
          </span>
        ) : null}
      </span>
    );
  }
  if (whatsapp.status === "failed") {
    return (
      <span className="inline-flex flex-col gap-0.5">
        <span className="inline-flex rounded-full bg-destructive/15 px-2.5 py-0.5 text-xs font-bold text-destructive">
          ✕ Failed
        </span>
        {whatsapp.lastError ? (
          <span className="max-w-[10rem] truncate text-[10px] text-muted-foreground" title={whatsapp.lastError}>
            {whatsapp.lastError}
          </span>
        ) : null}
        {registrationId && onRetry ? (
          <button
            type="button"
            className="text-left text-[10px] font-bold text-secondary"
            onClick={() => onRetry(registrationId)}
          >
            Retry
          </button>
        ) : null}
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-bold text-secondary">
      ⏳ Pending
    </span>
  );
}

function AdminRegistrationsPage() {
  const token = adminTokenStore.get(ADMIN_TOKEN_KEY);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [checkedIn, setCheckedIn] = useState("all");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.listRegistrations(token, {
        search,
        checkedIn,
        page,
        limit: ADMIN_PAGE_SIZE,
      });
      setRows(data.rows);
      setTotal(data.total);
      const maxPage = Math.max(1, Math.ceil((data.total ?? 0) / ADMIN_PAGE_SIZE));
      if (page > maxPage) setPage(maxPage);
    } catch {
      setError("Failed to load registrations");
    } finally {
      setLoading(false);
    }
  }, [token, search, checkedIn, page]);

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const handleExport = async () => {
    if (!token) return;
    setExporting(true);
    try {
      const res = await api.exportRegistrations(token, { search, checkedIn });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "registrations.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Export failed");
    } finally {
      setExporting(false);
    }
  };

  if (!token) return null;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl">Registrations</h2>
          <p className="mt-1 text-sm text-muted-foreground">{total.toLocaleString("en-IN")} total bhaktas</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <GoldButton onClick={() => void load()} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </GoldButton>
          <GoldButton onClick={() => void handleExport()} disabled={exporting} className="gap-2">
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export Excel
          </GoldButton>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search name, phone, city…"
            className="min-h-11 w-full rounded-xl border-2 border-primary/25 bg-background pl-10 pr-4 outline-none focus:border-primary"
          />
        </div>
        <select
          value={checkedIn}
          onChange={(e) => {
            setCheckedIn(e.target.value);
            setPage(1);
          }}
          className="min-h-11 rounded-xl border-2 border-primary/25 bg-background px-4 outline-none focus:border-primary"
        >
          <option value="all">All attendance</option>
          <option value="true">Attended</option>
          <option value="false">Not attended</option>
        </select>
      </div>

      {error && <p className="mt-3 text-sm font-semibold text-destructive">{error}</p>}

      <div className="mt-4 overflow-x-auto rounded-2xl bg-card ring-1 ring-primary/20">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>DOB</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Attended</TableHead>
              <TableHead>WhatsApp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No registrations found
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.fullName}</TableCell>
                  <TableCell>{row.phone}</TableCell>
                  <TableCell>{row.dob}</TableCell>
                  <TableCell>{row.city}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        row.checkedIn
                          ? "bg-secondary/20 text-secondary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {row.checkedIn ? "Yes" : "No"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <WhatsAppStatusBadge
                      whatsapp={row.whatsapp}
                      registrationId={row.id}
                      registrationSource={row.registrationSource}
                      onRetry={(id) => {
                        void (async () => {
                          try {
                            await api.whatsappRetryRegistration(token, id);
                            await load();
                          } catch {
                            setError("WhatsApp retry failed");
                          }
                        })();
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AdminPagination
        page={page}
        total={total}
        onPageChange={setPage}
        disabled={loading}
      />
    </div>
  );
}
