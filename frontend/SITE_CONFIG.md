# Site content configuration

Edit **`src/lib/site-config.js`** to change event details, organisation info, contact, competitions, and other website copy in one place. No backend change is needed for content-only updates.

After saving, refresh the browser.

## Quick reference

| Section | What you can change |
|--------|----------------------|
| `brand` | Event name, navbar title, tagline, logo emoji |
| `organization` | Samiti name, copyright year, footer about text |
| `event` | Date, timing, venue, address, programme, logistics, competition end date, gallery, poster |
| `contact` | Phone, email, desk heading, location, gift desk message |
| `social` | Instagram / Facebook / YouTube URLs (leave `""` to hide) |
| `registration` | Form placeholders (city, phone) |
| `prizes` | Referral prizes on the home page (currently empty until official list) |
| `competitions` | Home carousel + `/competitions` slides (referral, fancy dress, Laddu Gopal) |
| `seo` | Default site title & description |

Poster images are **Vite imports** at the top of `site-config.js` (files in `src/assets/posters/`). Gallery photos are public URLs under `public/gallery/`. See [MEDIA_GUIDE.md](./MEDIA_GUIDE.md).

## Examples

**Change venue & date:**
```js
event: {
  date: "Sunday, 6 September 2026",
  venue: "Your Mandir Name, Your Area, Your City",
  address: "Full address for maps / footer",
  // ...
}
```

**Change seva desk contact:**
```js
contact: {
  phone: "+91 98765 43210",
  phoneHref: "tel:+919876543210",
  email: "help@yourorganisation.org",
  emailHref: "mailto:help@yourorganisation.org",
  location: "Your area, City",
}
```

**Gift note on downloaded pass** — use `{name}` for the bhakta's name:
```js
giftDeskNote: "Show this pass at the Registration Desk to collect {name}'s Divine Gift.",
```

**Add social link:**
```js
social: {
  instagram: "https://instagram.com/yourpage",
  facebook: "",
  youtube: "",
}
```

**Add or edit a competition slide** — append to `competitions` and add a poster import:

```js
import yourPoster from "@/assets/posters/your-slug.svg?url";

{
  id: "your-slug",           // /competitions#your-slug
  title: "Competition title",
  shortTitle: "Short",
  tagline: "One line",
  description: "Longer copy…",
  audience: "Who can join",
  timing: "When",
  poster: yourPoster,
  theme: { from: "#08495B", to: "#D89B24" },
  howTo: ["Step 1", "Step 2", "Step 3"],
  primaryCta: { label: "Register", to: "/register" },
  secondaryCta: { label: "Event details", to: "/event-details" },
}
```

The home carousel (`CompetitionsCarousel`) and `/competitions` both read this array.
