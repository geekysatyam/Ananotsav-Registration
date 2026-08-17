import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
  beforeLoad: () => {
    // AdminShell redirects to the first page the user can access.
    throw redirect({ to: "/admin/scanner" });
  },
});
