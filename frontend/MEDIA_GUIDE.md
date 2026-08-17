# Media guide — posters, gallery photos & carousels

How to replace placeholders and add new carousel slides. All paths are from the `frontend/` folder.

---

## Quick lookup

| What | Store file here | Update path here |
|------|-----------------|------------------|
| Competition poster | `public/competitions/` | `src/lib/site-config.js` → `competitions[].poster` |
| New competition slide | `public/competitions/` | Append object to `siteConfig.competitions` |
| Past-year photo | `public/gallery/` | `src/lib/site-config.js` → `event.gallery.photos` |
| New gallery slide | `public/gallery/` | Push object onto `event.gallery.photos` |
| Official invitation poster | `public/` | `src/lib/site-config.js` → `event.posterSrc` |

Public URL = filename under `public/`. Example: `public/competitions/referral.jpg` → `/competitions/referral.jpg`

---

## Sizes (use these exactly)

| Asset | Size | Ratio | Format |
|--------|------|--------|--------|
| **Competition posters** | **1024 × 1536 px** | Portrait 2:3 | JPG / PNG / WebP |
| **Past-year gallery photos** | **1600 × 900 px** | Landscape 16:9 | JPG / PNG / WebP |
| Official event poster (`posterSrc`) | **1024 × 1536 px** | Portrait 2:3 | PNG / JPG |

Export at 72–150 dpi is enough for web. Keep files under ~400 KB (WebP or compressed JPG).

Placeholders already match these sizes:

- `public/anandotsav-2026-poster.svg` (official invitation poster)
- `public/competitions/referral.svg`
- `public/competitions/fancy-dress.svg`
- `public/competitions/laddu-gopal.svg`
- `public/gallery/anandotsav-2025.svg` (and 2024, 2023, kirtan, prasadam)

---

## 1. Competition posters (home carousel + `/competitions`)

**Store files in:** `frontend/public/competitions/`

**Update paths in:** `frontend/src/lib/site-config.js` → `competitions` array → `poster`

```js
{
  id: "referral",
  title: "Referral Challenge",
  poster: "/competitions/referral.jpg",  // public URL, starts with /
  theme: { from: "#08495B", to: "#D89B24" },
  // ...
}
```

The URL is the filename under `public/`, so `public/competitions/referral.jpg` → `/competitions/referral.jpg`.

Suggested filenames:

| Competition | Path |
|-------------|------|
| Referral | `public/competitions/referral.jpg` |
| Fancy dress | `public/competitions/fancy-dress.jpg` |
| Laddu Gopal | `public/competitions/laddu-gopal.jpg` |

### Add a new competition (new carousel slide)

1. Save a **1024 × 1536** poster in `public/competitions/your-slug.jpg`
2. Append an object to `siteConfig.competitions` in `site-config.js`:

```js
{
  id: "your-slug",           // used in URL hash: /competitions#your-slug
  title: "Competition title",
  shortTitle: "Short",
  tagline: "One line",
  description: "Longer copy…",
  audience: "Who can join",
  timing: "When",
  venue: "Where (optional)",
  note: "Gentle reminder (optional)",
  poster: "/competitions/your-slug.jpg",
  theme: { from: "#08495B", to: "#D89B24" },
  howTo: ["Step 1", "Step 2", "Step 3"],
  primaryCta: { label: "Register", to: "/register" },
  secondaryCta: { label: "Event details", to: "/event-details" },
}
```

The home carousel (`CompetitionsCarousel`) and `/competitions` page both read this array — no extra code.

---

## 2. Past-year photos (home “Memories” carousel)

**Store files in:** `frontend/public/gallery/`

**Update paths in:** `frontend/src/lib/site-config.js` → `event.gallery.photos`

```js
{
  src: "/gallery/anandotsav-2025.jpg",
  alt: "Anandotsav 2025 celebrations at Sri Gokul Gaushala",
  caption: "Anandotsav 2025 — Bhakti & togetherness",
  year: "2025",                         // optional badge
  theme: { from: "#D89B24", to: "#08495B" },  // carousel background tint
}
```

### Add a new gallery slide

1. Save a **1600 × 900** landscape photo in `public/gallery/`
2. Push a new object onto `event.gallery.photos` (order = carousel order)

```js
{
  src: "/gallery/utsav-mandapam-2026.jpg",
  alt: "Utsav Mandapam during Anandotsav",
  caption: "Utsav Mandapam",
  year: "2026",
  theme: { from: "#126B82", to: "#D89B24" },
}
```

`AnandotsavGallery` on the home page picks this up automatically.

---

## 3. Official invitation poster (event details page)

**Store:** `frontend/public/anandotsav-2026-poster.jpg` (or `.png`)

**Update:** `siteConfig.event.posterSrc` in `site-config.js`

Current placeholder: `public/anandotsav-2026-poster.svg`

```js
posterSrc: "/anandotsav-2026-poster.jpg",
```

Use **1024 × 1536** so it matches the competition poster frame.

---

## After replacing files

1. Keep the same filename, **or** change `poster` / `src` / `posterSrc` to the new name.
2. Hard-refresh the browser (cache).
3. You can delete the old `.svg` placeholders once the JPG/PNG is live.

No rebuild of `public/` is needed for static files — just save and refresh in dev.
