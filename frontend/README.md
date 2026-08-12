# Krishna's Celebration Hub

Lovable Prompt — Janmashtami Bhakta Registration Platform (Frontend Only)

Copy everything below into Lovable as the project prompt.

Project Summary

Build the complete frontend (React + Vite + Tailwind CSS + Framer Motion) for a Janmashtami festival devotee registration website. This is a festive, celebratory event site — not a generic SaaS product. Every page must feel decorated, warm, and alive, like walking into an actual Janmashtami celebration, not like a corporate dashboard.

Use mock/dummy data and local component state for now — no real backend integration yet (I will wire up the API separately). Build every page listed below, fully responsive, with the exact visual direction described.

🎨 CRITICAL DESIGN DIRECTIVE — READ FIRST

This is the single most important instruction: do not build a plain, minimal, mostly-white layout. A flat "white theme with a few accent colors and thin icons" is explicitly the wrong result here. White is a canvas, not the content — every section must be visually filled and festive.

Non-negotiable rules for every single page:

No empty real estate, ever. No plain white or blank void next to a heading or beside text. Every section needs illustration, a gradient mesh, a textured background, or floating decorative motifs filling the space — especially hero sections and any area beside/behind headings.

Icons must be bold, colored, and large — minimum 40–48px, filled/duotone style in gold and peacock-blue, sitting on soft colored circular backgrounds. No thin 24px grey line icons, no generic default icon-library look. Icons should feel illustrative and festive (diyas, peacocks, lotuses, flutes, feathers) rather than generic UI icons.

Every background carries texture or pattern. Faint mandala line-art, diya motifs, or a subtle repeating peacock-feather pattern at 3–5% opacity behind sections. Alternate sections with soft gold-to-cream gradients instead of hard white/cream cuts between sections.

Real, visible animation everywhere, not just scroll-triggered fade-ups. The Hero especially needs actual moving elements visible even in a static screenshot — floating feathers, a soft glowing pulse behind the CTA, drifting particles, gentle parallax. Motion should feel ambient and alive, not just a one-time entrance animation.

Cards have visual weight. Gradient borders or a colored top-accent bar, a small decorative corner icon (feather/lotus), soft shadow with a warm tint — never a plain white box with a thin grey border.

Color is generous, not just accent. Use gold and peacock-blue as full section-background washes, colored dividers, colored section headers — not just small accents on buttons.

Illustration over icon-only. Event Details and Competition Details sections need an actual illustrated graphic (peacock, lotus, temple silhouette, diya cluster) filling empty space, not just three small icon cards floating in white.

Typography feels festive and grand. Large, generous hero heading, generous line-height, decorative SVG flourish/divider elements under section headings — not plain text-only headers.

If any generated page still has a large blank white area, thin monochrome icons, or feels like a generic SaaS landing page — that's a failed result. Redo it richer.

Design System

Color palette:

Primary gold: warm marigold/gold (#D4A017–#F0B429 range) for accents, CTAs, borders

Peacock blue: deep teal-blue (#0F6E7A–#1B8A96 range) for secondary accents, section washes

Cream/ivory base: #FFF8E7–#FDF6E3 instead of pure white, as the canvas tone

Deep maroon/red accent for festive contrast on select elements

Gradient combinations: gold-to-cream, peacock-to-deep-blue for section backgrounds

Typography:

Display/heading font: something with festive character — a serif or semi-decorative display face for H1/H2 (e.g. a warm serif), scaled with clamp() for fluid sizing

Body font: clean, readable sans-serif

Generous line-height and letter-spacing on headings

Small decorative SVG flourish/divider under major section headings

Iconography & motifs:

Filled/duotone icons, gold or peacock-blue, 40–48px minimum, soft circular colored backgrounds

Recurring motifs throughout: peacock feathers, diyas, lotus flowers, flute, mandala line-art, temple silhouettes

Use these motifs as background texture (low opacity), corner decorations on cards, and section dividers — not just in one hero image

Motion:

Framer Motion whileInView scroll-triggered fade-ups on section entry

Additional ambient motion independent of scroll: floating/drifting particles or feathers in the hero, soft pulsing glow behind CTA buttons, gentle icon micro-animations on hover

Count-up animations for live counters

Countdown timer with smooth digit transitions

Layout & responsiveness:

Mobile-first, breakpoints at 480px, 768px, 1024px, 1280px

Grids collapse 3-column → 1-column on mobile (Event Details, Competition Details, Leaderboard)

Touch targets minimum 44px

Fluid typography via clamp()

Pages to Build

1. Navbar (persistent across all pages)

Logo + site name on the left

Nav links: Home, Register, Leaderboard, Event Details, Find My Registration

"Register Now" CTA button, gold-filled, right-aligned

Collapses to a hamburger drawer below 768px — drawer should carry the same festive texture/background treatment, not a plain white slide-out panel

Sticky on scroll with subtle background blur/tint

2. Landing Page (single scrollable page, sectioned)

Section A — Hero

Full first viewport (100vh)

Large festive heading + subheading introducing the Janmashtami event and registration

Animated gold CTA button → links to Registration Page, with a soft pulsing glow behind it

Background: gradient mesh (gold/peacock) with floating feather/diya particles drifting continuously, plus a large illustrated motif (peacock feather fan, temple silhouette, or Krishna-flute motif) filling one side — not blank space beside the heading

Scroll-down indicator (animated) revealing the next section

Section B — Competition Teaser

Live registrant counter with count-up animation, set on a decorated card/banner (not floating bare numbers on white)

Short hook copy about the referral competition

Background wash (gold-to-cream gradient) with subtle pattern texture

Section C — Free Krishna Keychain Promo

Illustrated keychain graphic as a real visual centerpiece, not a small icon

Headline: "Every Bhakta Gets a Free Krishna Keychain 🔑"

Short supporting line about collecting it at the desk on event day

Card or banner treatment with gold border/accent, decorative corner motif

Section D — Event Details

Card grid: Date, Venue, Timing

Bold colored duotone icons (40–48px) with circular backgrounds, on cards with gradient border/top-accent bar and a corner decorative icon

Include an actual illustrated graphic (temple silhouette, diya cluster, or peacock) filling background/negative space of this section

3-column desktop → 1-column mobile

Section E — Competition Details

3-step "How It Works" explainer (Register → Get Codes → Share) using the bold icon-in-circle treatment

Countdown timer to competition end date — visually prominent, animated digit transitions

Prize/recognition info block, gold-accented

Section F — Leaderboard Preview

Top 5 referrers in a decorated table/card layout (not a bare plain table) — gold/silver/bronze visual treatment for top 3 even in preview

"View Full Leaderboard" CTA button

Section G — Footer

About blurb, quick links, contact info, social icons (styled to match the festive icon treatment, not default grey social icons)

Subtle background pattern (not flat solid color), copyright line

3. Registration Page

Festive-but-functional form layout — form itself should stay clean/usable, but the page background/frame around it must carry the same texture/illustration treatment as other pages, not a plain white form floating on white

Fields: Full Name, Phone, Date of Birth, City

Referral toggle: "Do you have a referral code?" — Yes/No pill toggle (default No); if Yes, reveals a referral code input with live validation state (green check / red X)

"Add a Family Member" quick-add section: expandable rows below the main form, each with just Name + DOB + optional Phone; visually distinct add-button (gold, icon-forward), each added member shown as a small dismissible card

"Takes less than 60 seconds" reassurance microcopy near the top

Small live social-proof ticker near the submit button ("🔥 12 people registered in the last hour")

Submit button: prominent, gold, festive

4. Registration Success Page

Single registrant: one large celebratory card — Entry QR code (SVG) prominently displayed, confirmation ID, event reminder, festive congratulatory framing (confetti/particle burst animation on load)

Family/group registrant: a carousel — one card per family member, each showing their Entry QR (SVG) with their name printed below it, swipe/arrow navigation between members, and a small counter/progress indicator

Download controls: download current QR, "Download All", with a small indicator of how many have been downloaded

Referral QR block (primary registrant only, if opted in): separate QR shown below, with WhatsApp / Instagram / SMS share buttons, gold/peacock styled

"Your Free Gift" keychain card: gold-bordered, illustrated keychain graphic, appears under each member's Entry QR: "Show this code at the Registration Desk to claim your Krishna keychain"

Overall page should feel like a celebratory reveal moment, not a plain confirmation screen

5. Find My Registration Page

Simple, focused form: Phone Number + Date of Birth

Same festive background/texture treatment as the rest of the site around the form

On "no match" state: friendly illustrated empty-state (not a bare error message) with a link back to Register

On match: redirects/renders the Success Page layout for that registration

6. Leaderboard Page

Full ranked table: Rank, Name, Krishna Code, Referral Count

Top 3 rows visually highlighted with gold/silver/bronze treatment (medal icon, colored row background/border)

Search bar to find by name/code

Sticky "Your Rank" card that appears on match, styled distinctly (gold-accented, floating card)

Table should have alternating subtle row texture, not a bare plain white table

7. Scanner Page (Admin — separate, not in public nav)

Login screen first: username + password fields, simple centered card, still on-brand (festive background) but calmer/more utilitarian than public pages

After login: full-width camera scanner view (html5-qrcode-style component), scales to viewport width on mobile

Feedback states: green success card (name + confirmation) on valid scan, red error card for "Already Checked In" / "Already Claimed" / "Not Found" — clear, high-contrast, glanceable at a glance from arm's length (this page will be used quickly by staff at a busy desk)

Manual entry fallback input, clearly available but secondary to the camera view

What NOT to do

❌ No plain white/blank hero with text on one side and nothing on the other

❌ No thin 24px grey line icons anywhere

❌ No flat, texture-less white or solid-color section backgrounds

❌ No motion that only triggers once on scroll and then disappears — need ambient/idle motion too

❌ No plain bordered white boxes for cards — every card needs visual weight (gradient border, accent bar, or corner motif)

❌ Don't make this look like a generic SaaS/startup landing page template — it should look and feel like a festival

Build all pages now, fully responsive, using dummy/mock data where real data would come from the backend.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ae266ad7-8bfc-496f-a127-f1289f1158d9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
