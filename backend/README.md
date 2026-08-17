# Janmashtami Bhakta Registration — Backend

Node.js / Express / MongoDB API for the Janmashtami Bhakta Registration Platform.

## Setup

1. Copy `.env.example` to `.env` and fill in all values.
2. `npm install`
3. Create or reset the super admin:

```bash
# First time
npm run seed:super-admin -- yourUsername yourSecurePassword

# If user already exists but login fails — reset password
npm run seed:super-admin -- yourUsername yourSecurePassword --reset-password
```

4. Start: `npm run dev` (or `npm start` in production)

Then sign in at `/admin` and create desk / admin users under **Admins**.

## Environment variables

| Variable | Notes |
|----------|--------|
| `PORT`, `NODE_ENV`, `MONGO_URI`, `CORS_ORIGIN` | Required |
| `HMAC_SECRET`, `JWT_SECRET`, `JWT_EXPIRY` | Required (`JWT_EXPIRY` recommended `2h`) |
| `EVENT_YEAR` | Required |
| `TRUST_PROXY` | Optional; only if behind a reverse proxy and `NODE_ENV` is not `production` |

**Removed from env:** `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` — admins live in MongoDB.

## Roles

| Role | Access |
|------|--------|
| `super_admin` | All pages + manage users |
| `admin` | Only assigned pages |
| `desk` | Scanner + desk register only |

## API (summary)

Public: register, find-registration, leaderboard (name+count), stats, validate-referral.  
Staff: `/api/admin/*` and `/api/scan/*` (JWT + page permissions).  
Removed: `GET /api/registration/:id`.
