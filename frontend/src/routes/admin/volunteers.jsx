import { createFileRoute } from "@tanstack/react-router";
import { AdminOptInList } from "@/components/admin/opt-in-list";

export const Route = createFileRoute("/admin/volunteers")({
  head: () => ({ meta: [{ title: "Volunteers — Admin" }] }),
  component: () => (
    <AdminOptInList
      kind="volunteers"
      title="Youth Volunteers"
      subtitle="Bhaktas who opted to volunteer for Anandotsav prep"
      filename="volunteers.csv"
      columns={[
        { key: "fullName", label: "Name" },
        { key: "phone", label: "Phone" },
        { key: "city", label: "City" },
        { key: "entryCode", label: "Entry" },
        {
          key: "createdAt",
          label: "Registered",
          render: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN") : "—"),
        },
      ]}
    />
  ),
});
