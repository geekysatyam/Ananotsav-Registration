import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/admin-shell";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Panel — Janmashtami Utsav" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminShell,
});
