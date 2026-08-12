# Site content configuration

Edit **`src/lib/site-config.js`** to change event details, organisation info, contact, and other website copy in one place.

## Quick reference

| Section | What you can change |
|--------|----------------------|
| `brand` | Event name, navbar title, tagline, logo emoji |
| `organization` | Samiti name, copyright year, footer about text |
| `event` | Date, timing, venue, address, programme, logistics, competition end date |
| `contact` | Phone, email, desk heading, location, gift desk message |
| `social` | Instagram / Facebook / YouTube URLs (leave `""` to hide) |
| `registration` | Form placeholders (city, phone) |
| `prizes` | Referral competition prizes on home page |
| `seo` | Default site title & description |

## Examples

**Change venue & date:**
```js
event: {
  date: "Saturday, 16 August 2026",
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
giftDeskNote: "Show this pass at the Registration Desk to collect {name}'s free Krishna keychain.",
```

**Add social link:**
```js
social: {
  instagram: "https://instagram.com/yourpage",
  facebook: "",
  youtube: "",
}
```

After saving, refresh the browser. No backend changes needed for content-only updates.
