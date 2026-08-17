import { createFileRoute } from "@tanstack/react-router";
import { AdminOptInList } from "@/components/admin/opt-in-list";

export const Route = createFileRoute("/admin/abhishek")({
  head: () => ({ meta: [{ title: "Panchamrit Abhishek — Admin" }] }),
  component: () => (
    <AdminOptInList
      kind="abhishek"
      title="Panchamrit Abhishek"
      subtitle="Free Divya Panchamrit Abhishek of Nitai–Nimai"
      filename="panchamrit-abhishek.csv"
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
