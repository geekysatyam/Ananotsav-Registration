import { createFileRoute } from "@tanstack/react-router";

// REFERRAL DISABLED — original AdminOptInList leaderboard kept below (commented)
export const Route = createFileRoute("/admin/leaderboard")({
  head: () => ({ meta: [{ title: "Referral Leaderboard — Admin" }] }),
  component: () => (
    <div className="mx-auto max-w-2xl rounded-2xl bg-card p-6 ring-1 ring-primary/20">
      <h2 className="font-display text-2xl">Referral leaderboard paused</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        The referral competition is currently disabled. Uncomment the original list to restore it.
      </p>
    </div>
  ),
});

/*
import { AdminOptInList } from "@/components/admin/opt-in-list";

export const RouteOriginal = createFileRoute("/admin/leaderboard")({
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
*/
