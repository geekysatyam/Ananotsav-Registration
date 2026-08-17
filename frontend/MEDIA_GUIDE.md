# Media guide — posters, gallery photos & carousels

How to replace placeholders and add new carousel slides. All paths are from the `frontend/` folder.

On Vercel, files under `public/` for **posters** can 500 when the SSR handler catches the path. Invitation and competition posters are therefore **imported from `src/assets/posters/`** so Vite bundles them. Gallery photos stay in `public/gallery/`.

---

## Quick lookup

| What | Store file here | Update path here |
|------|-----------------|------------------|
| Competition poster | `src/assets/posters/` | Import at top of `src/lib/site-config.js`, then `competitions[].poster` |
| New competition slide | `src/assets/posters/` | Import + append object to `siteConfig.competitions` |
| Past-year photo | `public/gallery/` | `src/lib/site-config.js` → `event.gallery.photos` |
| New gallery slide | `public/gallery/` | Push object onto `event.gallery.photos` |
| Official invitation poster | `src/assets/posters/` | Import + `siteConfig.event.posterSrc` |

Gallery public URL = filename under `public/`. Example: `public/gallery/anandotsav-2025.jpg` → `/gallery/anandotsav-2025.jpg`

---

## Sizes (use these exactly)

| Asset | Size | Ratio | Format |
|--------|------|--------|--------|
| **Competition posters** | **1024 × 1536 px** | Portrait 2:3 | JPG / PNG / WebP (or SVG placeholder) |
| **Past-year gallery photos** | **1600 × 900 px** | Landscape 16:9 | JPG / PNG / WebP |
| Official event poster (`posterSrc`) | **1024 × 1536 px** | Portrait 2:3 | PNG / JPG / SVG |

Export at 72–150 dpi is enough for web. Keep files under ~400 KB (WebP or compressed JPG).

Current bundled posters:

- `src/assets/posters/anandotsav-2026-poster.svg`
- `src/assets/posters/referral.svg`
- `src/assets/posters/fancy-dress.svg`
- `src/assets/posters/laddu-gopal.svg`

Gallery placeholders:

- `public/gallery/anandotsav-2025.svg` (and 2024, 2023, kirtan, prasadam)

---

## 1. Competition posters (home carousel + `/competitions`)

**Store files in:** `frontend/src/assets/posters/`

**Wire them in:** `frontend/src/lib/site-config.js`

```js
import referralPoster from "@/assets/posters/referral.jpg?url";

{
  id: "referral",
  title: "Referral Challenge",
  poster: referralPoster,
  theme: { from: "#08495B", to: "#D89B24" },
  // ...
}
```

Suggested filenames:

| Competition | Path |
|-------------|------|
| Referral | `src/assets/posters/referral.jpg` |
| Fancy dress | `src/assets/posters/fancy-dress.jpg` |
| Laddu Gopal | `src/assets/posters/laddu-gopal.jpg` |

### Add a new competition (new carousel slide)

1. Save a **1024 × 1536** poster in `src/assets/posters/your-slug.jpg`
2. Add an import and append an object to `siteConfig.competitions` (see [SITE_CONFIG.md](./SITE_CONFIG.md))

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

`AnandotsavGallery` on the home page picks this up automatically.

---

## 3. Official invitation poster (event details page)

**Store:** `frontend/src/assets/posters/anandotsav-2026-poster.jpg` (or `.png`)

**Update:** import + `siteConfig.event.posterSrc` in `site-config.js`

```js
import anandotsavPoster from "@/assets/posters/anandotsav-2026-poster.jpg?url";

posterSrc: anandotsavPoster,
```

Use **1024 × 1536** so it matches the competition poster frame.

---

## After replacing files

1. Keep the same filename, **or** change the import / `src` / `posterSrc`.
2. Hard-refresh the browser (cache).
3. You can delete old `.svg` placeholders once the JPG/PNG is live.

`public/` gallery files need no rebuild in local `vite dev` — save and refresh. Poster files under `src/assets/` are bundled; the dev server picks them up on save.
