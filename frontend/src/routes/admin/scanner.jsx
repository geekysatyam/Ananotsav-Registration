import { createFileRoute } from "@tanstack/react-router";
import { ScannerPanel } from "@/components/admin/scanner-panel";
import { loadAdminSession } from "@/lib/api";

export const Route = createFileRoute("/admin/scanner")({
  head: () => ({ meta: [{ title: "Scanner — Admin" }] }),
  component: AdminScannerPage,
});

function AdminScannerPage() {
  const token = loadAdminSession()?.token ?? null;
  if (!token) return null;
  return <ScannerPanel token={token} />;
}
