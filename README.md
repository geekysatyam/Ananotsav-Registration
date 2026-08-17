# Anandotsav 2026 — Bhakta Registration

Registration, referral competition, and event-day check-in for **Sri Krishna Janmashtami Anandotsav 2026** at Sri Gokul Gaushala, Amritsar (Sunday, 6 September 2026).

This repo is a **full-stack** app: a React website plus a Node.js API on MongoDB.

| | |
| --- | --- |
| Public site | Registration, QR passes, competitions, leaderboard |
| Staff | Scanner, desk walk-ins, opt-in lists, CSV export |
| Super admin | Create desk / admin users and assign pages |

For a full walkthrough of pages, flows, and APIs, see [PROJECT_DOCUMENTATION.txt](./PROJECT_DOCUMENTATION.txt).

---

## Repo layout

```
Ananotsav-Registration/
├── frontend/     React 19 + TanStack Start + Vite (Vercel)
├── backend/      Express + MongoDB API (Railway)
└── PROJECT_DOCUMENTATION.txt
```

---

## Local setup

You need **Node.js 20+**, **npm**, and a **MongoDB** URI (local or Atlas).

### 1. Backend

```bash
cd backend
cp .env.example .env   # then fill HMAC_SECRET, JWT_SECRET, MONGO_URI, etc.
npm install
npm run seed:super-admin -- yourUsername yourSecurePassword
npm run dev            # http://localhost:5000
```

Health check: `GET http://localhost:5000/health` → `{ "ok": true }`

### 2. Frontend

```bash
cd frontend
cp .env.example .env   # VITE_API_URL=http://localhost:5000
npm install
npm run dev            # typically http://localhost:5173
```

Sign in at `/admin` with the super-admin you seeded, then create desk / admin users under **Team access**.

---

## Environment

**Backend** (`backend/.env`) — required: `PORT`, `NODE_ENV`, `MONGO_URI`, `CORS_ORIGIN`, `HMAC_SECRET`, `JWT_SECRET`, `JWT_EXPIRY`, `EVENT_YEAR`. Optional: `TRUST_PROXY`.

Admins are **not** in env. They live in MongoDB (`Admin` collection).

**Frontend** (`frontend/.env`):

| Variable | Local | Production (Vercel) |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:5000` | Leave unset — `vercel.json` proxies `/api` to Railway |
| `VITE_PUBLIC_URL` | `http://localhost:5173` | Public site URL, no trailing slash |

See `frontend/vercel-env.txt` for the production checklist.

---

## Content & media

| Task | File |
| --- | --- |
| Event copy, date, venue, prizes, competitions | `frontend/src/lib/site-config.js` ([SITE_CONFIG.md](./frontend/SITE_CONFIG.md)) |
| Posters & gallery photos | [MEDIA_GUIDE.md](./frontend/MEDIA_GUIDE.md) |

---

## Scripts

**Backend**

| Command | |
| --- | --- |
| `npm run dev` | Watch mode |
| `npm start` | Production |
| `npm run seed:super-admin -- user pass` | Create first super admin |
| `npm run seed:super-admin -- user pass --reset-password` | Reset existing super-admin password |

**Frontend**

| Command | |
| --- | --- |
| `npm run dev` | Vite + TanStack Start |
| `npm run build` | Production build |
| `npm run preview` | Preview the build |
| `npm run lint` | ESLint |

---

## Deploy

- **Frontend:** Vercel. `frontend/vercel.json` rewrites `/api/*` and `/health` to the Railway backend.
- **Backend:** Railway (or any Node host) with MongoDB Atlas.

Do **not** set `VITE_API_URL` to a `*.railway.app` host in production — some ISPs block it. Leave it empty so the site calls same-origin `/api`.

---

## Roles (staff)

| Role | Access |
| --- | --- |
| `super_admin` | Every admin page, including user management |
| `admin` | Only the pages assigned by super admin |
| `desk` | Scanner + desk register only |
