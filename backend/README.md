# Janmashtami Bhakta Registration — Backend

Node.js / Express / MongoDB API for the Janmashtami Bhakta Registration Platform.

## Setup

1. Copy `.env.example` to `.env` and fill in all values.
2. Install dependencies:

```bash
npm install
```

3. Generate an admin password hash:

```bash
npm run hash-password -- yourSecurePassword
```

Paste the output into `ADMIN_PASSWORD_HASH` in `.env`.

4. Seed sample data (optional):

```bash
npm run seed
```

This clears existing registrations and inserts 19 test records (16 solo + 1 family of 3). Test lookup: phone `9876543213`, dob `1994-03-12` (Ram Sharma).

5. Start the server:

```bash
npm run dev
```

The API listens on `PORT` (default `5000`).

## Environment variables

See `.env.example` for the full list. All variables are required — the app fails fast on startup if any are missing.

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/register` | Create registration batch (primary + family) |
| GET | `/api/validate-referral/:code` | Validate a referral code |
| GET | `/api/leaderboard` | Referral leaderboard |
| GET | `/api/registration/:id` | Fetch one registration by ID |
| POST | `/api/find-registration` | Lookup by phone + DOB |
| GET | `/api/stats/count` | Total registrant count |
| POST | `/api/admin/login` | Admin login (JWT) |
| POST | `/api/scan/checkin` | QR scan check-in (auth required) |
| POST | `/api/scan/checkin/override` | Manual check-in override (auth required) |

All responses use `{ success, data }` or `{ success, error }`.
