import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { EventDetailsSection } from "@/components/event-details-section";
import { siteConfig } from "@/lib/site-config";

export const Route = createFileRoute("/event-details")({
  head: () => ({
    meta: [
      { title: `Event Details — ${siteConfig.event.fullName}` },
      {
        name: "description",
        content: `Date, timings, venue and programme for ${siteConfig.event.fullName} at ${siteConfig.event.venue}, Amritsar.`,
      },
      { property: "og:title", content: `Event Details — ${siteConfig.event.fullName}` },
      {
        property: "og:description",
        content:
          "56 bhoga offering, kirtan, pushp abhishek, prasadam and Janmashtami celebrations at Sri Gokul Gaushala.",
      },
    ],
  }),
  component: EventDetailsPage,
});

function EventDetailsPage() {
  return (
    <SiteShell>
      <EventDetailsSection />
    </SiteShell>
  );
}
