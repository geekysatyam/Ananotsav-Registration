# Anandotsav 2026 — Backend

Node.js / Express / MongoDB API for Bhakta registration, referral codes, QR check-in, and the staff admin panel.

---

## Setup

```bash
cp .env.example .env   # fill HMAC_SECRET, JWT_SECRET, MONGO_URI, CORS_ORIGIN, …
npm install
npm run seed:super-admin -- yourUsername yourSecurePassword
npm run dev            # http://localhost:5000  (watch mode)
```

Reset an existing super-admin password:

```bash
npm run seed:super-admin -- yourUsername yourSecurePassword --reset-password
```

Then sign in at the frontend `/admin` and create desk / admin users under **Team access**.

`GET /health` → `{ "ok": true }`

---

## Environment

| Variable | Notes |
| --- | --- |
| `PORT`, `NODE_ENV`, `MONGO_URI`, `CORS_ORIGIN` | Required. `CORS_ORIGIN` is comma-separated. |
| `HMAC_SECRET` | Signs entry QR payloads. Do not rotate mid-event. |
| `JWT_SECRET`, `JWT_EXPIRY` | Required. Use `2h`. |
| `EVENT_YEAR` | Used in entry codes (`JN2026-00001`). |
| `TRUST_PROXY` | Optional; only behind a reverse proxy when `NODE_ENV` is not `production`. |

**Not in env:** `ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH`. Admins live in the MongoDB `Admin` collection.

In development, CORS also allows any `http://localhost:<port>` origin (Vite may use 5173, 8082, …).

---

## Roles

| Role | Access |
| --- | --- |
| `super_admin` | All pages + manage users |
| `admin` | Only assigned pages (cannot include `admins`) |
| `desk` | Scanner + desk register only |

Page keys: `scanner`, `register`, `registrations`, `volunteers`, `abhishek`, `fancy-dress`, `laddu-gopal`, `leaderboard`, `admins`.

JWT includes `role`, `pages`, and `tokenVersion`. Disabling a user or changing their password bumps `tokenVersion` and invalidates old tokens.

---

## API

Envelope: `{ success: true, data }` or `{ success: false, error: { code, message } }`.

**Public**

| Method | Path | |
| --- | --- | --- |
| POST | `/api/register` | Family registration (rate limit 10/min) |
| GET | `/api/validate-referral/:code` | Live code check (30/min) |
| GET | `/api/leaderboard` | Top 50: name + count only |
| GET | `/api/stats/count` | `{ totalRegistrants }` |
| POST | `/api/find-registration` | Phone + primary DOB (20/min) |

**Staff** (`Authorization: Bearer <jwt>`)

| Method | Path | |
| --- | --- | --- |
| POST | `/api/admin/login` | 5/min |
| GET | `/api/admin/me` | Current role + pages |
| GET/POST/PATCH | `/api/admin/users` | Super admin only |
| POST | `/api/admin/register` | Desk walk-in |
| GET | `/api/admin/registrations` (+ `/export`) | Page-gated |
| GET | `/api/admin/volunteers\|abhishek\|fancy-dress\|laddu-gopal\|leaderboard` (+ `/export`) | Page-gated |
| POST | `/api/scan/checkin` | `{ signedPayload }` |
| POST | `/api/scan/checkin/override` | `{ entryCode, reason }` |

Removed: `GET /api/registration/:id` (unauthenticated QR leak).

JSON body limit: 64kb.

---

## Scripts

| Command | |
| --- | --- |
| `npm run dev` | `node --watch src/server.js` |
| `npm start` | Production |
| `npm run seed:super-admin -- user pass` | Create first super admin |
| `npm run seed:super-admin -- user pass --reset-password` | Reset password + bump tokenVersion |

---

Full platform docs: [../PROJECT_DOCUMENTATION.txt](../PROJECT_DOCUMENTATION.txt) and [../README.md](../README.md).
