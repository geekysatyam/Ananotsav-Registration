# Anandotsav 2026 — Frontend

Public website and staff admin UI for Bhakta registration.

Stack: **React 19**, **TanStack Start / Router**, **Vite**, **Tailwind CSS 4**, **Framer Motion**.

The API lives in `../backend`. This app never stores registrations permanently — it talks to the backend and keeps QR results in `sessionStorage` for the current tab.

---

## Run locally

```bash
cp .env.example .env
# VITE_API_URL=http://localhost:5000
# VITE_PUBLIC_URL=http://localhost:5173
npm install
npm run dev
```

Start the backend first (`cd ../backend && npm run dev`).

| Script | |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

---

## Environment

| Variable | Local | Production (Vercel) |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:5000` | **Unset** — `vercel.json` proxies `/api` to Railway |
| `VITE_PUBLIC_URL` | Vite origin (e.g. `http://localhost:5173`) | Public site URL, no trailing slash |

Vite inlines `VITE_*` at **build** time. After changing Vercel env, redeploy.

See `vercel-env.txt` for the production checklist.

---

## Edit content (no backend change)

| What | Where |
| --- | --- |
| Date, venue, copy, contact, competitions | `src/lib/site-config.js` — [SITE_CONFIG.md](./SITE_CONFIG.md) |
| Posters & gallery photos | [MEDIA_GUIDE.md](./MEDIA_GUIDE.md) |
| API helpers | `src/lib/api.js` |

---

## Routes

File-based routing under `src/routes/` (`.jsx` files). Do not add Next.js-style `pages/` or `app/` folders. `routeTree.gen.js` is generated — do not edit it.

| URL | File |
| --- | --- |
| `/` | `index.jsx` |
| `/register` | `register.jsx` |
| `/success` | `success.jsx` |
| `/find` | `find.jsx` |
| `/leaderboard` | `leaderboard.jsx` |
| `/event-details` | `event-details.jsx` |
| `/competitions` | `competitions.jsx` |
| `/scanner` | `scanner.jsx` (staff, noindex) |
| `/admin/*` | `admin/` (RBAC shell) |

Staff: sign in at `/admin`. Desk users can also use `/scanner`.

---

## Deploy

Vercel. `vercel.json` rewrites `/api/:path*` and `/health` to the Railway backend. Do **not** set `VITE_API_URL` to `*.railway.app` in production.

Full platform docs: [../PROJECT_DOCUMENTATION.txt](../PROJECT_DOCUMENTATION.txt) and [../README.md](../README.md).
