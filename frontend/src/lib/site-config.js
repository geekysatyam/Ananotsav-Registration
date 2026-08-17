/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SITE CONFIG — edit this file to update website content across the app
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Sri Gokul Gaushala, Amritsar
 * Sri Krishna Janmashtami Anandotsav 2026
 */

export const siteConfig = {
  // ── Brand ────────────────────────────────────────────────────────────────
  brand: {
    /** Main event name shown in headings & QR pass */
    name: "Anandotsav 2026",

    /** Shorter name for navbar / tight spaces */
    shortName: "Anandotsav",

    /** Line under logo in navbar */
    tagline: "Sri Krishna Janmashtami",

    /** Emoji or single character for logo icon until you add an image */
    logoEmoji: "🦚",
  },

  // ── Organisation ────────────────────────────────────────────────────────
  organization: {
    name: "Sri Gokul Gaushala, Amritsar",
    copyrightYear: 2026,

    /** Footer “about” paragraph */
    about:
      "Sri Gokul Gaushala is a spiritual and cultural community on the outskirts of Amritsar, home to Gauvansh, Sri Sri Gaur-Nitai Temple and Srila Prabhupada Vedic Gurukul. Anandotsav celebrates the divine appearance of Sri Krishna through bhakti, kirtan, culture and seva.",

    footerTagline: "Where Gokul comes alive 🦚",
  },

  // ── Event details ────────────────────────────────────────────────────────
  event: {
    /** Full event name */
    fullName: "Sri Krishna Janmashtami Anandotsav 2026",

    /** Full date line */
    date: "Sunday, 6 September 2026",

    /** Timing range */
    timing: "5:00 PM onwards",

    /** Google Calendar event window (IST) */
    calendarStart: "2026-09-06T17:00:00+05:30",
    calendarEnd: "2026-09-06T23:00:00+05:30",

    /** Venue name */
    venue: "Sri Gokul Gaushala, Amritsar",

    /** Short venue label for home page cards */
    venueShort: "Sri Gokul Gaushala",

    /** Full postal / location description */
    address:
      "Sri Gokul Gaushala, Birbalpura, Fatehgarh Churian Road, Amritsar, Punjab",

    city: "Amritsar",

    /**
     * ISO datetime — update when the final registration/referral deadline
     * is officially announced.
     */
    competitionEnds: "2026-09-05T23:59:59",

  /** Home page hero subtitle */
    heroTagline: "A celebration of Krishna, devotion, culture & joy",

    /**
     * Previous Anandotsav photo carousel (home page, after hero).
     * Landscape 16:9 — 1600 × 900 px. See frontend/MEDIA_GUIDE.md
     */
    gallery: {
      title: "Memories from Anandotsav",
      subtitle: "Glimpses from past celebrations at Sri Gokul Gaushala, Amritsar",
      photos: [
        {
          src: "/gallery/anandotsav-2025.svg",
          alt: "Anandotsav 2025 celebrations at Sri Gokul Gaushala",
          caption: "Anandotsav 2025 — Bhakti & togetherness",
          year: "2025",
          theme: { from: "#D89B24", to: "#08495B" },
        },
        {
          src: "/gallery/anandotsav-2024.svg",
          alt: "Anandotsav 2024 kirtan and cultural celebrations",
          caption: "Anandotsav 2024 — Kirtan & celebrations",
          year: "2024",
          theme: { from: "#FFF8E7", to: "#126B82" },
        },
        {
          src: "/gallery/anandotsav-2023.svg",
          alt: "Anandotsav 2023 Janmashtami celebrations",
          caption: "Anandotsav 2023 — Janmashtami utsav",
          year: "2023",
          theme: { from: "#08495B", to: "#D89B24" },
        },
        {
          src: "/gallery/kirtan-evening.svg",
          alt: "Kirtan evening at Anandotsav",
          caption: "Kirtan evening",
          theme: { from: "#126B82", to: "#083F54" },
        },
        {
          src: "/gallery/prasadam-seva.svg",
          alt: "Prasadam and seva at Anandotsav",
          caption: "Prasadam & seva",
          theme: { from: "#FFFDF7", to: "#D89B24" },
        },
      ],
    },

    /** Programme schedule */
    programme: [
      "5:00 PM · Anandotsav celebrations begin",
      "· Krishna bhakti & devotional celebrations",
      "· Soulful kirtan & divine katha",
      "· Spiritual dance & cultural offerings",
      "· 56 bhoga offering to Sri Krishna",
      "· Pushp abhishek — 551 kg flowers",
      "· Darshan & devotional activities",
      "· Delicious prasadam & dinner prasadam",
      "· Janmashtami celebrations",
    ],

    /** Poster invitation copy */
    invitation: {
      lead: "You are cordially invited to",
      tagline: "A divine celebration of Lord Krishna's divine appearance",
      body:
        "We kindly invite you and your family & friends to join us in this joyful celebration and seek the pleasure of Lord Krishna.",
      closing:
        "Come with your family and friends to celebrate Lord Krishna's Divine Appearance with full energy and devotion!",
      footerBanner:
        "Your presence and support will make this celebration truly special.",
    },

    /** Poster feature grid — A Divine Celebration Featuring */
    celebrationFeatures: [
      {
        title: "56 Bhoga Offering",
        emoji: "🪔",
        copy: "Fifty-six sacred bhog preparations offered to Sri Krishna with devotion.",
      },
      {
        title: "Spiritual Dance",
        emoji: "🪷",
        copy: "Devotional dance performances celebrating Krishna's divine pastimes.",
      },
      {
        title: "Soulful Kirtan & Divine Katha",
        emoji: "🎵",
        copy: "Congregational chanting, spiritual discourse and Krishna katha.",
      },
      {
        title: "Pushp Abhishek — 551 kg Flowers",
        emoji: "🌸",
        copy: "A magnificent flower abhishek with over five hundred kilograms of blossoms.",
      },
      {
        title: "Delicious Prasadam",
        emoji: "🍛",
        copy: "Sattvik Krishna prasadam served with love throughout the celebration.",
      },
      {
        title: "Dinner Prasadam",
        emoji: "🙏",
        copy: "Communal dinner prasadam for all Bhaktas and families attending the utsav.",
      },
    ],

    /** Official poster — 1024 × 1536. Replace SVG placeholder via MEDIA_GUIDE.md */
    posterSrc: "/anandotsav-2026-poster.svg",

    // ── Festival highlights ──────────────────────────────────────────────
    highlights: [
      {
        title: "Krishna Bhakti",
        copy:
          "Immerse yourself in the devotion, chanting and spiritual atmosphere of Sri Krishna Janmashtami.",
      },
      {
        title: "Kirtan",
        copy:
          "Experience the joy of congregational chanting, devotional music and Krishna consciousness.",
      },
      {
        title: "Gau Seva",
        copy:
          "Celebrate the spirit of Gokul through seva and the sacred connection between Sri Krishna and Gauvansh.",
      },
      {
        title: "Cultural Celebration",
        copy:
          "Experience the colours, music and traditions surrounding the celebration of Lord Sri Krishna.",
      },
      {
        title: "Prasadam",
        copy:
          "Come together with family and devotees to honour Krishna prasadam in a spirit of gratitude and devotion.",
      },
      {
        title: "Family & Children",
        copy:
          "A joyful Janmashtami experience designed to bring families and the younger generation closer to Krishna culture.",
      },
    ],

    // ── About the venue ───────────────────────────────────────────────────
    venueInfo: {
      title: "Sri Gokul Gaushala",
      description:
        "Sri Gokul Gaushala is a holistic spiritual community in Birbalpura on the outskirts of Amritsar. The campus includes a Gaushala with 125+ Gauvansh, the beautiful Sri Sri Gaur-Nitai Temple and Srila Prabhupada Vedic Gurukul.",
      cows:
        "The Gaushala began in 2019 with seven Sahiwal cows and has grown into a community of 125+ Gauvansh.",
      temple:
        "Sri Sri Gaur-Nitai Temple is the spiritual centre of the community and hosts regular worship and spiritual celebrations.",
      gurukul:
        "Srila Prabhupada Vedic Gurukul provides Vedic as well as modern education to children in a residential setting.",
    },

    // ── Travel / logistics cards ─────────────────────────────────────────
    logistics: [
      {
        title: "Venue",
        copy:
          "ISKCON Sri Gokul Gaushala, Birbalpura, Fatehgarh Churian Road, on the outskirts of Amritsar.",
      },
      {
        title: "Parking",
        copy:
          "On-campus parking available at Sri Gokul Gaushala. Please follow seva volunteer directions on arrival.",
      },
      {
        title: "Prasadam",
        copy:
          "Delicious prasadam and dinner prasadam served during the celebration — sattvik, no onion or garlic.",
      },
    ],
  },

  // ── Contact & seva desk ──────────────────────────────────────────────────
  contact: {
    deskHeading: "Reach the Seva Desk",

    /**
     * Replace these with the official Anandotsav contact details once
     * confirmed by the organizers.
     */
    phone: "+91-9509509698",
    phoneHref: "tel:+919509509698",

    email: "srigokulgaushala@gmail.com",
    emailHref: "mailto:srigokulgaushala@gmail.com",

    /** Short location line in footer */
    location: "Birbalpura, Amritsar",

    /** Registration desk note */
    giftDeskNote:
      "Show your registration pass at the Seva Desk for event assistance.",
  },

  // ── Social links ─────────────────────────────────────────────────────────
  social: {
    instagram: "",
    facebook: "",
    youtube: "",
  },

  // ── Registration defaults ────────────────────────────────────────────────
  registration: {
    defaultCityPlaceholder: "Amritsar",
    defaultPhonePlaceholder: "9876543210",
  },

  // ── Referral / participation prizes ─────────────────────────────────────
  /**
   * Keep empty until official 2026 Anandotsav prizes are confirmed.
   */
  prizes: [],

  // ── Competitions (home carousel + /competitions page) ───────────────────
  /**
   * Competition posters: 1024 × 1536 px (portrait).
   * Past-year gallery photos: 1600 × 900 px (landscape 16:9).
   * See frontend/MEDIA_GUIDE.md
   */
  competitions: [
    {
      id: "referral",
      title: "Referral Challenge",
      shortTitle: "Referral",
      tagline: "Register. Share. Spread the joy.",
      description:
        "Opt into a personal Krishna referral code when you register. Every friend who joins with your code lifts you up the live leaderboard.",
      audience: "All registered bhaktas",
      timing: "Ends 5 September 2026",
      endsAt: "2026-09-05T23:59:59",
      poster: "/competitions/referral.svg",
      theme: { from: "#08495B", to: "#D89B24" },
      howTo: [
        "Complete Bhakta registration in under 60 seconds.",
        "Choose Yes for your own Krishna referral code.",
        "Share your code or QR — every verified registration moves you up.",
      ],
      primaryCta: { label: "Join the challenge", to: "/register" },
      secondaryCta: { label: "View leaderboard", to: "/leaderboard" },
    },
    {
      id: "fancy-dress",
      title: "Fancy Dress for Kids",
      shortTitle: "Fancy Dress",
      tagline: "Little Krishnas, Radhas & Gokul friends",
      description:
        "A joyful costume competition for children. Dress should be related to Sanatan Dharma — Krishna, Radha, Ram, Sita, or any bhakta from our tradition.",
      audience: "Children under 12 years",
      timing: "Event day — 6 September 2026",
      poster: "/competitions/fancy-dress.svg",
      theme: { from: "#D89B24", to: "#126B82" },
      categories: [
        {
          label: "Below 6 years",
          detail: "Parents can accompany on the stage walk.",
        },
        {
          label: "6–12 years",
          detail: "1 minute on the ramp — walk the stage or perform something.",
        },
      ],
      howTo: [
        "Register your child when you register online.",
        "Arrive in costume on Anandotsav day.",
        "Report to the kids desk before the fancy dress segment begins.",
      ],
      venue: "Kids desk · event day",
      primaryCta: { label: "Register your family", to: "/register" },
      secondaryCta: { label: "Event details", to: "/event-details" },
    },
    {
      id: "laddu-gopal",
      title: "Laddu Gopal Shringar",
      shortTitle: "Laddu Gopal",
      tagline: "Adorn the Lord with love",
      description:
        "Bring your Laddu Gopal and offer festive shringar — flowers, clothes, and ornaments — in a spirit of devotion and celebration.",
      audience: "Families & devotees",
      timing: "Event day — 6 September 2026 · Utsav Mandapam",
      poster: "/competitions/laddu-gopal.svg",
      theme: { from: "#126B82", to: "#F7D98A" },
      venue: "Utsav Mandapam",
      note: "Please bring your Laddu Gopal before 6:00 PM. Entry for the competition closes after that.",
      howTo: [
        "Bring your Laddu Gopal murti pre-shringar or decorated from your house.",
        "Arrive at Utsav Mandapam before 6:00 PM — no competition entry after that.",
        "Check in at the Seva Desk and place your Laddu Gopal at the designated segment.",
      ],
      primaryCta: { label: "Event details", to: "/event-details" },
      secondaryCta: { label: "Register to attend", to: "/register" },
    },
  ],

  // ── SEO defaults ─────────────────────────────────────────────────────────
  seo: {
    siteTitle:
      "Anandotsav 2026 — Sri Krishna Janmashtami | Sri Gokul Gaushala Amritsar",

    description:
      "Celebrate Sri Krishna Janmashtami at Anandotsav 2026, Sri Gokul Gaushala, Amritsar. Join a joyful celebration of Krishna bhakti, kirtan, culture, Gau Seva and togetherness.",

    author: "Sri Gokul Gaushala, Amritsar",
  },
};

/** @deprecated Prefer siteConfig — kept for existing imports */
export const eventInfo = {
  name: siteConfig.brand.name,
  date: siteConfig.event.date,
  timing: siteConfig.event.timing,
  venue: siteConfig.event.venue,
  competitionEnds: siteConfig.event.competitionEnds,
};

// Use VITE_PUBLIC_URL if set (recommended for production), otherwise fall back
// to window.location.origin on the client or a relative path on the server.
// Set VITE_PUBLIC_URL=https://yourdomain.com in your production environment.
export const REFERRAL_LINK_BASE =
  import.meta.env.VITE_PUBLIC_URL
    ? `${import.meta.env.VITE_PUBLIC_URL}/register`
    : typeof window !== "undefined"
      ? `${window.location.origin}/register`
      : "/register";

/** Replace `{name}` in gift desk copy */
export function giftDeskMessage(fullName) {
  return siteConfig.contact.giftDeskNote.replace("{name}", fullName.trim());
}

function formatGoogleCalendarUtc(iso) {
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`;
}

/** Event description with each bhakta’s entry / registration number */
export function buildCalendarEventDescription(registrations = []) {
  const { timing } = siteConfig.event;
  const lines = [
    `Janmashtami Anandotsav — ${timing}.`,
    "",
    "Bring your entry QR at the gate. Collect your Divine Gifts at the registration desk.",
  ];

  if (registrations.length > 0) {
    lines.push("", "Entry passes (registration numbers):");
    for (const reg of registrations) {
      lines.push(`• ${reg.fullName} — ${reg.entryCode}`);
    }
  }

  return lines.join("\n");
}

/** Opens Google Calendar “create event” with utsav details and entry codes pre-filled */
export function getGoogleCalendarEventUrl(registrations = []) {
  const { fullName, calendarStart, calendarEnd, address } = siteConfig.event;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: fullName,
    dates: `${formatGoogleCalendarUtc(calendarStart)}/${formatGoogleCalendarUtc(calendarEnd)}`,
    details: buildCalendarEventDescription(registrations),
    location: address,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}