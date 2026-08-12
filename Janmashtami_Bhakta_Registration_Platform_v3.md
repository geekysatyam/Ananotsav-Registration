# Janmashtami Bhakta Registration Platform
## Project Documentation — Frontend, Backend & System Logic (v3)

> **Changes from v2:** Removed WhatsApp Cloud API confirmation and OTP phone verification entirely. Added Family/Group Registration flow, "Find My Registration" recovery page, hardcoded admin auth for Scanner Page, and refined fraud/duplicate/HMAC logic based on the above.

---

## 1. Project Overview

A MERN-stack web application for registering Bhaktas (devotees) attending a Janmashtami festival event, with a gamified referral system. Each registrant receives:
1. A unique **Entry QR Code** (personal identity — used for physical check-in/entry verification at the venue, and freebie claim)
2. An optional **Referral QR Code** (only if the primary registrant opts in) — a shareable link that auto-fills the referral field for anyone who scans it and registers

The system tracks referral counts and displays them on a public leaderboard. Every registrant also receives a free physical Krishna keychain, claimed at the venue desk using their Entry QR.

---

## 2. Design Tone & Density — CRITICAL DIRECTIVE

**Current state problem:** The build so far (Lovable preview) is technically correct but visually flat — large dead whitespace (esp. Hero right side, Event Details section), thin/small monochrome icons, minimal color usage, static-feeling cards, no visible motion in most sections. It reads like a generic SaaS landing page, not a festival celebration site. "White theme" was never meant to mean "empty/blank" — it means white as a *canvas*, not the *content*.

**Non-negotiable fixes for every page:**
- **No empty real estate.** Every hero/section must be visually filled — illustration, pattern, gradient mesh, floating motifs, or textured background — never a plain white void beside text.
- **Icons must be bold, colored, and larger** — not thin 24px grey line icons. Filled/duotone icon style in gold/peacock-blue, minimum 40–48px, with soft colored circular backgrounds, festive/illustrative — not generic Lucide icons.
- **Backgrounds must carry texture/pattern** — faint mandala line-art, diya motifs, or a subtle repeating peacock-feather pattern at 3–5% opacity, alternating with soft gold-to-cream gradients between sections instead of hard white/cream cuts.
- **Real, visible animation on every section** — not just fade-up on scroll. Hero needs actual moving elements (floating feathers, glowing pulse, drifting particles) visible even in a static screenshot.
- **Cards need more visual weight** — gradient borders or colored top-accent bars, small decorative corner icon (feather/lotus), not a plain white box with a thin border.
- **Color used more generously** — gold/peacock-blue as section-background washes, colored dividers, colored section headers, not just accents on buttons and icons.
- **Illustration over icon-only** — Event Details and Competition Details should include an actual illustrated graphic (peacock, lotus, temple silhouette, diya cluster) filling empty space.
- **Typography scale more festive/grand** — larger hero heading, generous line-height, decorative flourish/divider SVG elements under headings rather than plain text-only headers.

Any future design prompt for Lovable (or any builder) must explicitly state: *"cheerful, festive, visually rich — no empty whitespace, no thin generic icons, no flat plain-white sections. Every section must feel decorated and alive, matching the vibrancy of a real Janmashtami celebration."*

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, Framer Motion |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| QR Generation | `qrcode.react` (client-side, dynamic, no storage) |
| QR Scanning | `html5-qrcode` or `react-qr-reader` (camera-based, browser) |
| Hosting (Frontend) | Vercel |
| Hosting (Backend) | Render |
| Hosting (DB) | MongoDB Atlas M0 (free tier) |

---

## 4. Frontend — Page Series

### 4.1 Navbar (persistent, all pages)
- Logo + site name
- Nav links: Home, Register, Leaderboard, Event Details, **Find My Registration**
- CTA "Register Now"
- Collapses to hamburger drawer on mobile
- Fully adaptive: breakpoints at 768px (tablet) and 480px (mobile)

### 4.2 Landing Page (single scrollable page, sectioned)

**Section A — Hero**
- Full first viewport (100vh), heading, subheading, animated CTA → Registration Page
- Scroll-down indicator revealing competition teaser below

**Section B — Competition Teaser**
- Live registrant counter (count-up animation), short hook copy on referral competition

**Section C — Krishna Keychain Freebie Promo** *(new placement, between B and D)*
- Illustrated keychain graphic, headline "Every Bhakta Gets a Free Krishna Keychain 🔑"
- Short line: collect it at the registration desk on event day

**Section D — Event Details**
- Card grid: Date, Venue, Timing — icon-based, illustrated background, 3-column → 1-column stack on mobile

**Section E — Competition Details**
- How referral system works (3-step: Register → Get Codes → Share)
- Countdown timer to competition end date, prize/recognition info block

**Section F — Leaderboard Preview**
- Top 5 referrers table, "View Full Leaderboard" CTA

**Section G — Footer**
- About, quick links, contact, social icons, copyright

All sections use scroll-triggered fade-up animations plus ambient/idle motion (see Section 2). Fully adaptive across breakpoints — grid columns collapse, font sizes scale via `clamp()`.

### 4.3 Registration Page

**Primary registrant fields:** Full Name, Phone, Email *(removed — not collected)* ~~Email~~, Date of Birth, City

> Note: Email has been dropped from the schema entirely per decision below — not collected anywhere in the flow.

**Referral toggle:**
- **Field 1:** "Do you have a referral code?" — Yes/No pill toggle, default No
- **Field 2:** Referral code input (conditional on Yes), live async validation against DB (green check / red X)

**Family / Group Quick-Add:**
- "Add a family member" button below the main form
- Each additional member requires only: **Name, Date of Birth**. **Phone is optional** (if left blank, no phone is stored for that member).
- Each quick-add produces its own independent Registration document — same phone number (if provided) can appear across multiple documents belonging to the same family.
- All family members registered in this batch count toward the primary registrant's referral (if `referredBy` was set) — each member = one increment on the referrer's `referralCount`.
- No per-member referral toggle — only the primary registrant can opt in to get their own shareable referral code.
- Submit → POST to backend as a single batch payload → on success, navigate to Success Page with an array of returned registrations.

**UX resilience (kept, no backend dependency):**
- Autosave form progress (including any added family members) to `localStorage` as the user types — survives accidental refresh, cleared on successful submit.
- "Takes less than 60 seconds" reassurance note near the top.
- Live social-proof ticker ("🔥 12 people registered in the last hour") near the submit button, sourced from `/api/stats/count`.

### 4.4 Registration Success Page

- If a **single registrant**: standard single-card layout as before.
- If a **family/group submission**: renders as a **carousel**, one card per registered member —
  - Each card: member name, **Entry QR (SVG)** with the name printed below the QR, confirmation ID
  - Carousel controls: swipe/arrow between members
  - **Download options:** download current QR individually, "Download All" (zips or sequentially triggers multiple SVG/PNG downloads), and a small counter/indicator showing how many of the set have been downloaded
- **Referral QR** (SVG) shown separately below the primary registrant's card only, if they opted in — with share buttons (WhatsApp, Instagram, SMS — these are just outbound share-intent links, not the removed WhatsApp Cloud API messaging feature)
- **Krishna Keychain "Your Free Gift" card** — gold-bordered, illustrated keychain image, appears below each member's Entry QR: *"Show this code at the Registration Desk to claim your Krishna keychain."* Reuses the same Entry QR — no separate QR issued.
- All QR codes downloadable as SVG/PNG (canvas export, client-side only — no server storage)

### 4.5 Find My Registration Page *(new)*

- Linked from navbar
- Simple form: **Phone Number + Date of Birth**
- On submit → backend looks up matching Registration document(s) by phone+DOB
- On match → redirect to Success Page rendering that registration's Entry QR (and Referral QR / keychain card if applicable) — same layout as a fresh success page, just rehydrated from stored data instead of a just-in submission
- On no match → clear "No registration found with these details" message, link back to Register

### 4.6 Leaderboard Page
- Ranked table: Rank, Name, Krishna Code, Referral Count
- Top 3 highlighted (gold/silver/bronze)
- Search by name/code, sticky "Your Rank" card on match

### 4.7 Scanner Page (Admin — Entry Verification & Freebie Claim)

- Route protected by a **hardcoded username/password** login (simple session-based auth — no user DB, no roles, single shared credential set in backend env vars)
- Camera-based QR scanner component (`html5-qrcode`)
- On scan: extracts payload (entryCode + HMAC signature) → sends to backend → backend verifies signature, looks up Mongo entry → marks `checkedIn: true`, `checkInTime`, `freebieClaimed: true`, `freebieClaimTime` in one request
- **Manual override:** if signature verification fails (damaged/edited QR) or camera is unavailable, staff can manually type the entryCode and force a check-in — HMAC is a deterrent, not a hard gate. Overridden check-ins are flagged with `registrationSource`/`verifiedBySignature: false` for later review, not silently allowed unlogged.
- UI feedback: green success card (name + confirmation) on valid unscanned entry, red error card if already checked in / already claimed / ID not found
- If already checked in and/or already claimed, shows "Already Checked In" / "Already Claimed" — never a raw error

---

## 5. Backend — Architecture & Logic

### 5.1 Database Schema (MongoDB — `Registration` collection)

```js
{
  _id: ObjectId,
  fullName: String,
  phone: String,             // required for primary registrant, optional for family quick-add members
  dob: Date,
  city: String,               // primary registrant only; family members inherit or omit
  familyGroupId: String,       // links quick-add members to the same submission batch (nullable for solo)
  isPrimaryRegistrant: Boolean,

  entryCode: String,          // unique, used in Entry QR
  wantsReferral: Boolean,     // primary registrant only
  referralCode: String,       // own generated code, only if wantsReferral = true (primary only)
  referredBy: String,         // code of the person who referred them (nullable)
  referralCount: Number,      // incremented per member registered under this user's code

  checkedIn: Boolean,         // default false
  checkInTime: Date,
  verifiedBySignature: Boolean, // false if staff manually overrode a failed HMAC check

  freebieClaimed: Boolean,    // default false
  freebieClaimTime: Date,

  registrationSource: String, // 'web' | 'referral-link' | 'desk-manual'
  createdAt: Date
}
```

> Email field removed entirely — not collected anywhere in this system.

### 5.2 Referral Code Generation Logic
1. Fixed backend array `KRISHNA_NAMES` of 108 names (Gopal, Govinda, Madhav, Murari, Kanha, Damodar, Banke Bihari, etc.)
2. On registration, if `wantsReferral = true` (primary registrant only):
   - Pick random name + random 3-digit number → `code = name + randomInt(100,999)`
   - Query DB for existing match → retry (max 5 attempts) → guarantees uniqueness
   - Save final code to the primary registrant's document

### 5.3 Entry Code Generation Logic
- Every registrant (primary and every family member, regardless of referral toggle) gets its own `entryCode` — e.g. `JN2026-00452`
- This is what the **Entry QR** encodes — used for both check-in and freebie claim

### 5.4 Referral Redemption Logic
1. User scans a Referral QR → lands on Registration Page at `?ref=MURARI219`
2. Frontend auto-selects Field 1 = "Yes", auto-fills Field 2 = `MURARI219`, triggers validation
3. On submit, backend receives `referredBy: "MURARI219"` on the **primary registrant's** document
4. Backend validates code exists → increments `referralCount` on the referrer's document **once per member in the batch** (so a family of 4 registering via one referral code = `referralCount += 4` in a single transaction)

### 5.5 Family / Group Registration Logic
1. Frontend submits one payload: `{ primary: {...}, members: [{ name, dob, phone? }, ...] }`
2. Backend generates a shared `familyGroupId`
3. Backend creates one Registration document per person (primary + each member), each with its own `entryCode`
4. Only the primary document carries `wantsReferral` / `referralCode`
5. If `referredBy` present on the primary, increment the referrer's `referralCount` by `1 + members.length`
6. Response returns the full array of created documents (with entryCodes) for the Success Page carousel

### 5.6 API Endpoints

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/register` | Create registration batch (primary + optional family members), generate entry codes (+ referral code if opted in), increment referrer's count |
| GET | `/api/validate-referral/:code` | Live validation while typing referral code |
| GET | `/api/leaderboard` | Sorted list by `referralCount` desc |
| GET | `/api/registration/:id` | Fetch single registration (Success Page) |
| POST | `/api/find-registration` | Body: `{ phone, dob }` → returns matching registration(s) for Find My Registration page |
| POST | `/api/scan/checkin` | Verifies HMAC signature, marks `checkedIn` + `freebieClaimed`; accepts manual-override flag if signature check bypassed by staff |
| GET | `/api/stats/count` | Live registrant counter for landing page teaser |
| POST | `/api/admin/login` | Hardcoded credential check → issues session/token for Scanner Page |

### 5.7 Validation & Edge Cases

**Duplicate registration**
- Check **phone + DOB combo** before allowing submit (applies per-person, including each family member that provided a phone)
- If a family member has no phone, duplicate check is skipped for that entry (nothing to key against)
- On match → "You're already registered" with option to be redirected via Find My Registration flow instead of resubmitting

**Referral integrity**
- Rate-limit: flag if the same referral code is used in **5+ distinct submissions within 2 minutes** — likely bot/self-abuse. A single family batch counts as **one submission** regardless of member count, so legitimate family referrals aren't false-flagged.
- Self-referral block: if `referredBy` code belongs to a registration sharing the same phone number as the new registrant (or any member in their batch), reject silently — mark invalid without alerting the abuser
- Rate-limit `/api/validate-referral` to prevent brute-force enumeration of codes

**Entry QR security**
- QR payload is `entryCode` signed with HMAC (`entryCode + secret`, hashed) — not plaintext — so it can't be trivially screenshotted/edited/faked
- Scanner verifies signature server-side before check-in
- **Not a hard dependency:** if verification fails, staff can manually override at the Scanner Page (see 4.7). Overrides are logged (`verifiedBySignature: false`) for post-event review rather than silently trusted

**Check-in / freebie idempotency**
- If already `checkedIn: true` → "Already Checked In", never a raw error
- If already `freebieClaimed: true` → "Already Claimed"
- Both fields updated together in the single desk scan action, but tracked independently in case check-in and freebie collection ever happen at separate points

**Analytics**
- `registrationSource` field (`web`, `referral-link`, `desk-manual`) retained for later analysis

---

## 6. Data Flow Summary

**Solo, non-referral registrant:**
Register → backend generates `entryCode` only → Success Page shows single Entry QR + freebie card → no referral QR

**Solo, referral-opted registrant:**
Register (Field 1 = Yes) → backend generates `entryCode` + `referralCode` → Success Page shows Entry QR, Referral QR, freebie card, share buttons

**Family/group registrant:**
Primary fills full form, adds N family members (name + DOB, phone optional) → single submit → backend creates N+1 documents under shared `familyGroupId`, each with own `entryCode` → if referred, referrer's count increases by N+1 → Success Page renders a carousel of N+1 QR cards (name below each QR), each with its own freebie card, plus one Referral QR/share block for the primary if opted in

**Referred registrant (solo or family):**
Lands on Registration Page with `?ref=CODE` → form auto-fills → submits → referrer's `referralCount` incremented once per person in the batch

**Recovering a lost QR:**
Navbar → Find My Registration → enter phone + DOB → backend matches → redirected to Success Page rehydrated with that registration's Entry QR (+ referral/freebie cards if applicable)

**At venue (check-in + freebie):**
Staff logs into Scanner Page (hardcoded credentials) → scans attendee's Entry QR → backend verifies HMAC signature → marks `checkedIn: true` + `freebieClaimed: true` → confirmation shown. If signature check fails, staff can manually override and force check-in (logged as unverified).

---

## 7. Hosting & Deployment (Free Tier)

- Frontend → Vercel (auto-deploy from GitHub)
- Backend → Render (Node/Express web service)
- Database → MongoDB Atlas M0 cluster
- No image/file storage needed — QR codes generated and scanned dynamically client-side/in-browser, never persisted as files

---

## 8. Fully Adaptive Design Notes

- Mobile-first breakpoints: 480px, 768px, 1024px, 1280px
- Fluid typography via `clamp()` for headings
- Grid layouts collapse from 3-column → 1-column on mobile across Event Details, Competition Details, and Leaderboard sections
- Touch-friendly tap targets (min 44px) on all buttons/toggles
- Scanner Page camera view scales to viewport width on mobile devices
- Success Page carousel: swipeable on mobile, arrow-navigated on desktop, cards stack/scale to viewport width

---

## 9. Explicitly Out of Scope (removed from earlier drafts)

- ❌ WhatsApp Cloud API confirmation messages
- ❌ OTP phone verification (Twilio/MSG91)
- ❌ Email collection or email-based confirmation/lookup
- ❌ Any hard-blocking dependency on HMAC signature verification at the gate (manual override always available)
