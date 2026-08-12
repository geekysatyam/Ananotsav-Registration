import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { EventDetailsSection } from "@/components/event-details-section";
import { GoldButton, SectionHeading, Reveal, FestiveCard, FestiveIcon } from "@/components/festive";
import { FloatingMotifs, GradientMesh } from "@/components/ambient";
import { PatternBackdrop, PeacockFan, Diya } from "@/components/motifs";
import { Bus, CircleParking, HandPlatter } from "lucide-react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Route = createFileRoute("/event-details")({
  head: () => ({
    meta: [{
      title: "Event Details — Janmashtami Utsav 2026, Pune"
    }, {
      name: "description",
      content: "Date, timings, venue, programme and travel details for Janmashtami Utsav 2026 at Shri Radha Krishna Mandir, Pune."
    }, {
      property: "og:title",
      content: "Event Details — Janmashtami Utsav 2026, Pune"
    }, {
      property: "og:description",
      content: "Jhula darshan, bhajan sandhya, dahi handi and the midnight abhishek."
    }]
  }),
  component: EventDetailsPage
});
function EventDetailsPage() {
  return /*#__PURE__*/_jsxs(SiteShell, {
    children: [/*#__PURE__*/_jsxs("section", {
      className: "relative overflow-hidden bg-gradient-festive py-16",
      children: [/*#__PURE__*/_jsx(GradientMesh, {}), /*#__PURE__*/_jsx(PatternBackdrop, {
        variant: "mandala",
        className: "text-secondary opacity-[0.07]"
      }), /*#__PURE__*/_jsx(FloatingMotifs, {
        count: 9
      }), /*#__PURE__*/_jsxs("div", {
        className: "relative mx-auto max-w-5xl px-4 text-center sm:px-6",
        children: [/*#__PURE__*/_jsx(SectionHeading, {
          eyebrow: "Utsav 2026",
          title: "Everything about the night",
          subtitle: "From the sandhya aarti to the midnight abhishek \u2014 here is how the celebration unfolds."
        }), /*#__PURE__*/_jsx(PeacockFan, {
          className: "mx-auto mt-8 h-56 w-56 opacity-90"
        }), /*#__PURE__*/_jsx(Link, {
          to: "/register",
          className: "mt-4 inline-block",
          children: /*#__PURE__*/_jsxs(GoldButton, {
            glow: true,
            children: [/*#__PURE__*/_jsx(Diya, {
              className: "h-6 w-6"
            }), " Register Now"]
          })
        })]
      })]
    }), /*#__PURE__*/_jsx(EventDetailsSection, {}), /*#__PURE__*/_jsxs("section", {
      className: "relative overflow-hidden bg-gradient-peacock py-20 text-secondary-foreground",
      children: [/*#__PURE__*/_jsx(PatternBackdrop, {
        variant: "feather",
        className: "text-primary opacity-[0.1]"
      }), /*#__PURE__*/_jsx("div", {
        className: "relative mx-auto max-w-6xl px-4 sm:px-6",
        children: /*#__PURE__*/_jsx("div", {
          className: "grid gap-6 md:grid-cols-3",
          children: [{
            Icon: Bus,
            title: "Getting there",
            copy: "Free shuttle from Sector 12 metro every 15 minutes, 4 PM–1 AM."
          }, {
            Icon: CircleParking,
            title: "Parking",
            copy: "Ground parking behind the mandir; two-wheelers at Gate 3."
          }, {
            Icon: HandPlatter,
            title: "Mahaprasad",
            copy: "Served from midnight — sattvik, no onion or garlic."
          }].map((c, i) => /*#__PURE__*/_jsx(Reveal, {
            delay: i * 0.1,
            children: /*#__PURE__*/_jsxs(FestiveCard, {
              tone: i === 1 ? "gold" : "peacock",
              className: "h-full",
              children: [/*#__PURE__*/_jsx(FestiveIcon, {
                tone: i === 1 ? "gold" : "peacock",
                size: "lg",
                children: /*#__PURE__*/_jsx(c.Icon, {
                  className: "h-12 w-12",
                  strokeWidth: 2.2
                })
              }), /*#__PURE__*/_jsx("h3", {
                className: "mt-5 font-display text-2xl text-foreground",
                children: c.title
              }), /*#__PURE__*/_jsx("p", {
                className: "mt-2 leading-relaxed text-muted-foreground",
                children: c.copy
              })]
            })
          }, c.title))
        })
      })]
    })]
  });
}