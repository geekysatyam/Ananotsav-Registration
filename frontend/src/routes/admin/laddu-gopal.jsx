import { createFileRoute } from "@tanstack/react-router";
import { AdminOptInList } from "@/components/admin/opt-in-list";

export const Route = createFileRoute("/admin/laddu-gopal")({
  head: () => ({ meta: [{ title: "Laddu Gopal — Admin" }] }),
  component: () => (
    <AdminOptInList
      kind="laddu-gopal"
      title="Laddu Gopal Shringar"
      subtitle="Pre-shringar murti entries with size"
      filename="laddu-gopal.csv"
      columns={[
        { key: "fullName", label: "Name" },
        { key: "phone", label: "Phone" },
        { key: "city", label: "City" },
        { key: "ladduGopalSize", label: "Size" },
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
