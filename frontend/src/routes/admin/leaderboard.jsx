import { createFileRoute } from "@tanstack/react-router";
import { AdminOptInList } from "@/components/admin/opt-in-list";

export const Route = createFileRoute("/admin/leaderboard")({
  head: () => ({ meta: [{ title: "Referral Leaderboard — Admin" }] }),
  component: () => (
    <AdminOptInList
      kind="leaderboard"
      title="Referral Leaderboard"
      subtitle="Live ranks by referral count"
      filename="referral-leaderboard.csv"
      columns={[
        { key: "rank", label: "Rank" },
        { key: "fullName", label: "Name" },
        { key: "phone", label: "Phone" },
        { key: "referralCode", label: "Code" },
        { key: "referralCount", label: "Referrals" },
        { key: "city", label: "City" },
      ]}
    />
  ),
});
