import { createFileRoute } from "@tanstack/react-router";
import { ScannerPanel } from "@/components/admin/scanner-panel";
import { ADMIN_TOKEN_KEY, adminTokenStore } from "@/lib/api";

export const Route = createFileRoute("/admin/scanner")({
  head: () => ({ meta: [{ title: "Scanner — Admin" }] }),
  component: AdminScannerPage,
});

function AdminScannerPage() {
  const token = adminTokenStore.get(ADMIN_TOKEN_KEY);
  if (!token) return null;
  return <ScannerPanel token={token} />;
}
