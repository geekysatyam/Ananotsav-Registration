import { createFileRoute } from "@tanstack/react-router";
import { AdminOptInList } from "@/components/admin/opt-in-list";

export const Route = createFileRoute("/admin/fancy-dress")({
  head: () => ({ meta: [{ title: "Fancy Dress — Admin" }] }),
  component: () => (
    <AdminOptInList
      kind="fancy-dress"
      title="Fancy Dress for Kids"
      subtitle="Child entries with parent contact"
      filename="fancy-dress.csv"
      columns={[
        { key: "childName", label: "Child" },
        { key: "childDob", label: "Child DOB" },
        { key: "getupDetail", label: "Getup" },
        { key: "parentName", label: "Parent" },
        { key: "parentPhone", label: "Phone" },
        { key: "city", label: "City" },
        { key: "entryCode", label: "Entry" },
      ]}
    />
  ),
});
