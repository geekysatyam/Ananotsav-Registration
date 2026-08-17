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

/**
 * Generic admin opt-in list with search + CSV export.
 * @param {{ kind: string, title: string, subtitle: string, columns: { key: string, label: string }[], filename: string }} props
 */
export function AdminOptInList({ kind, title, subtitle, columns, filename }) {
  const token = adminTokenStore.get(ADMIN_TOKEN_KEY);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.listOptIn(token, kind, { search, limit: 500 });
      setRows(data.rows);
      setTotal(data.total);
    } catch {
      setError("Failed to load");
    } finally {
      setLoading(false);
    }
  }, [token, kind, search]);

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const handleExport = async () => {
    if (!token) return;
    setExporting(true);
    try {
      const res = await api.exportOptIn(token, kind, { search });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
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
          <h2 className="font-display text-2xl">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {subtitle ?? `${total.toLocaleString("en-IN")} entries`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <GoldButton onClick={() => void load()} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </GoldButton>
          <GoldButton onClick={() => void handleExport()} disabled={exporting} className="gap-2">
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export CSV
          </GoldButton>
        </div>
      </div>

      <div className="relative mt-5">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, phone, city…"
          className="min-h-11 w-full rounded-xl border-2 border-primary/25 bg-card py-2 pr-4 pl-10 text-sm outline-none focus:border-primary"
        />
      </div>

      {error && <p className="mt-3 text-sm font-semibold text-destructive">{error}</p>}

      <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-primary/20">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={c.key}>{c.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-10 text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-10 text-center text-muted-foreground">
                  No entries yet
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id ?? `${r.fullName}-${r.entryCode}-${r.rank ?? ""}`}>
                  {columns.map((c) => (
                    <TableCell key={c.key}>{c.render ? c.render(r) : (r[c.key] ?? "—")}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{total.toLocaleString("en-IN")} total</p>
    </div>
  );
}
