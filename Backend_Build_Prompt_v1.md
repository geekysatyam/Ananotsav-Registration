# Backend Build Prompt — Janmashtami Bhakta Registration Platform

You are a senior backend engineer building the complete Node.js/Express/MongoDB backend for this system. Everything you need is specified below. **Do not assume, guess, or invent behavior that isn't written here.** If something genuinely isn't covered, stop and flag it instead of picking your own default. Follow the folder structure exactly. Follow every field name exactly as written — the frontend depends on these exact names.

---

## 0. Stack

- Node.js + Express.js
- MongoDB Atlas via Mongoose ODM
- JWT for admin session (Scanner Page), no user accounts anywhere else
- No file storage of any kind — QR codes are generated/rendered client-side, backend only ever handles text/JSON
- No email, no SMS, no WhatsApp, no OTP anywhere in this system — do not add any of these

---

## 1. Folder Structure (exact — do not rename or reorganize)

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js                      # Mongoose connection setup
│   │   └── env.js                     # loads & validates process.env, exports typed config object
│   ├── models/
│   │   ├── Registration.model.js
│   │   ├── Counter.model.js
│   │   └── ReferralUsageLog.model.js
│   ├── controllers/
│   │   ├── registration.controller.js
│   │   ├── referral.controller.js
│   │   ├── leaderboard.controller.js
│   │   ├── lookup.controller.js
│   │   ├── scanner.controller.js
│   │   ├── admin.controller.js
│   │   └── stats.controller.js
│   ├── routes/
│   │   ├── registration.routes.js
│   │   ├── referral.routes.js
│   │   ├── leaderboard.routes.js
│   │   ├── lookup.routes.js
│   │   ├── scanner.routes.js
│   │   ├── admin.routes.js
│   │   ├── stats.routes.js
│   │   └── index.js                   # mounts all routers under /api
│   ├── middleware/
│   │   ├── adminAuth.middleware.js    # verifies JWT for Scanner Page routes
│   │   ├── rateLimiter.middleware.js  # exports configured limiters per route group
│   │   ├── validate.middleware.js     # generic Zod-schema validation middleware factory
│   │   └── errorHandler.middleware.js # centralized error formatter, mounted last
│   ├── services/
│   │   ├── entryCode.service.js       # atomic entryCode generation
│   │   ├── referralCode.service.js    # Krishna-name referral code generation
│   │   ├── hmac.service.js            # sign/verify entryCode payloads
│   │   ├── duplicateCheck.service.js  # phone+dob duplicate lookups
│   │   └── fraudCheck.service.js      # self-referral + rate-window flagging
│   ├── validators/
│   │   ├── registration.schema.js     # Zod schema for POST /api/register body
│   │   ├── lookup.schema.js
│   │   └── scanner.schema.js
│   ├── utils/
│   │   ├── krishnaNames.js            # exports the fixed 108-name array
│   │   ├── asyncHandler.js            # wraps async controllers, forwards errors to next()
│   │   ├── apiResponse.js             # exports success()/error() response shape helpers
│   │   └── logger.js
│   ├── app.js                         # express app: middleware, routes, error handler — no app.listen here
│   └── server.js                      # imports app.js, connects DB, calls app.listen
├── .env.example
├── package.json
└── README.md
```

Every controller function is thin: validate happens in middleware, business logic happens in services, controllers only orchestrate service calls and shape the HTTP response. Do not put business logic directly in route files or controllers.

---

## 2. Environment Variables (`.env.example` must list all of these, no others)

```
PORT=5000
NODE_ENV=development
MONGO_URI=
CORS_ORIGIN=http://localhost:5173
HMAC_SECRET=
JWT_SECRET=
JWT_EXPIRY=8h
ADMIN_USERNAME=
ADMIN_PASSWORD_HASH=
EVENT_YEAR=2026
```

- `ADMIN_PASSWORD_HASH` is a bcrypt hash, never a plaintext password in env. Provide a small one-off script or README note showing how to generate it (`bcrypt.hashSync(plaintext, 10)`), but the app itself never accepts a plaintext password from env.
- `HMAC_SECRET` and `JWT_SECRET` are separate secrets — do not reuse one for both.

---

## 3. Data Models

### 3.1 `Registration` (collection: `registrations`)

```js
{
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: function() { return this.isPrimaryRegistrant; }, trim: true },
  // required for primary registrant. Optional for family members — validated at the
  // request-schema level (registration.schema.js), not just at the Mongoose level.

  dob: { type: Date, required: true },
  city: { type: String, trim: true },
  // city is collected on the primary registrant only. Family members do not have their
  // own city field — do not add one.

  familyGroupId: { type: String, default: null, index: true },
  // null for a solo registration. Shared string (nanoid, 10 chars) across all documents
  // created from the same submission when family members are present, including the
  // primary registrant's own document.

  isPrimaryRegistrant: { type: Boolean, required: true, default: true },

  entryCode: { type: String, required: true, unique: true, index: true },

  wantsReferral: { type: Boolean, default: false },
  // ONLY ever true on a primary-registrant document. Family member documents always
  // have this false — enforce this in the service layer, do not trust client input
  // for family member entries; hardcode false when creating member sub-documents.

  referralCode: { type: String, default: null, unique: true, sparse: true },
  // only set when wantsReferral is true. `sparse: true` is required on the unique index
  // so multiple nulls don't collide.

  referredBy: { type: String, default: null },
  // set on the primary registrant's document only, if they arrived via ?ref=CODE and
  // the code passed validation (see Section 6). Family member documents leave this null
  // — the referral relationship lives on the primary document, not duplicated on members.

  referralCount: { type: Number, default: 0 },
  // only meaningful on documents where wantsReferral is true.

  checkedIn: { type: Boolean, default: false },
  checkInTime: { type: Date, default: null },
  verifiedBySignature: { type: Boolean, default: null },
  // null until a scan happens. true if HMAC check passed at scan time, false if staff
  // used the manual override.

  freebieClaimed: { type: Boolean, default: false },
  freebieClaimTime: { type: Date, default: null },

  registrationSource: {
    type: String,
    enum: ['web', 'referral-link', 'desk-manual'],
    default: 'web'
  },
  // 'referral-link' if this document's own referredBy was set at creation time.
  // 'desk-manual' is reserved for a future admin-created registration flow — not built
  // in this version, but the enum value must exist so it doesn't break later.

  createdAt: { type: Date, default: Date.now }
}
```

- No `email` field. Do not add one anywhere in this schema or any request/response shape.
- Compound index: `{ phone: 1, dob: 1 }` — used by duplicate check and Find My Registration lookup. Create this explicitly in the schema, not just relied on implicitly.

### 3.2 `Counter` (collection: `counters`)

```js
{
  _id: String,   // e.g. "entryCode"
  seq: { type: Number, default: 0 }
}
```

Used exclusively for atomic entry code numbering. See Section 5.1 for exact usage — this must use `findOneAndUpdate` with `$inc` and `upsert: true` so concurrent registrations never collide, never read-then-write in two steps.

### 3.3 `ReferralUsageLog` (collection: `referral_usage_logs`)

```js
{
  referralCode: { type: String, required: true, index: true },
  submissionId: { type: String, required: true },
  // one submissionId per POST /api/register call, shared by every log entry that call
  // produces. Use a fresh nanoid generated at the start of the request handler.
  memberCount: { type: Number, required: true },
  // how many people were credited to this code in this one submission (1 for solo).
  ip: { type: String, default: null },
  flaggedForAbuse: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, index: true }
}
```

This collection exists purely for fraud-window detection (Section 7) and later manual audit. It is never read by any user-facing endpoint.

---

## 4. Response Shape (every endpoint, no exceptions)

Success:
```json
{ "success": true, "data": { ... } }
```

Error:
```json
{ "success": false, "error": { "code": "SOME_ERROR_CODE", "message": "Human readable message" } }
```

`apiResponse.js` exports `success(res, data, statusCode = 200)` and `error(res, code, message, statusCode = 400)` helpers. Every controller uses these — never hand-roll `res.json({...})` differently in different controllers.

---

## 5. Core Generation Logic

### 5.1 Entry Code Generation (`entryCode.service.js`)

Format: `JN{EVENT_YEAR}-{5-digit zero-padded sequence}`, e.g. `JN2026-00452`.

Exact implementation:
```js
async function generateEntryCode() {
  const counter = await Counter.findOneAndUpdate(
    { _id: 'entryCode' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const padded = String(counter.seq).padStart(5, '0');
  return `JN${config.eventYear}-${padded}`;
}
```
This must be called once per person being created (primary + each family member), each call producing a distinct sequential code. Never generate entry codes client-side, never derive them from `_id`.

### 5.2 Referral Code Generation (`referralCode.service.js`)

Only called when `wantsReferral === true` on a primary registrant.

```
1. Pick a random name from KRISHNA_NAMES (108 entries).
2. Pick a random integer in [100, 999].
3. candidate = `${name}${number}`  e.g. "Murari219"
4. Check Registration.exists({ referralCode: candidate })
5. If it exists, retry from step 1 — maximum 5 attempts.
6. If all 5 attempts collide (should be near-impossible given ~97,200 combinations),
   do ONE more round of 3 attempts where the suffix is 4 digits instead of 3
   (range 1000–9999) to expand the space.
7. If still colliding after that, throw a 500 error with code
   "REFERRAL_CODE_GENERATION_FAILED" — do not silently fall back to a UUID or
   anything not in the Krishna-name format. This should never realistically happen;
   if it does, it needs a human to look at it, not a silent workaround.
```

### 5.3 HMAC Signing (`hmac.service.js`)

QR payload format (what actually gets encoded into the Entry QR by the frontend): `{entryCode}.{signature}`

```js
function sign(entryCode) {
  return crypto.createHmac('sha256', config.hmacSecret)
    .update(entryCode)
    .digest('hex');
}

function verify(entryCode, providedSignature) {
  const expected = sign(entryCode);
  // MUST use timing-safe comparison — do not use === on secrets/signatures
  return crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(providedSignature, 'hex')
  );
  // wrap in try/catch — a malformed/short signature will throw on Buffer.from
  // length mismatch; treat any thrown error here as verification failure (false),
  // not as a 500 server error.
}
```

The `POST /api/register` response includes, per created person, both the raw `entryCode` and the `signedPayload` string (`entryCode.signature`) — the frontend encodes `signedPayload` into the QR, not the raw entryCode alone.

---

## 6. Duplicate Check Logic (`duplicateCheck.service.js`)

Applies to the primary registrant always, and to each family member **only if that member provided a phone number**.

```
For each person to check (has both phone and dob):
  existing = Registration.findOne({ phone: person.phone, dob: person.dob })
  if existing:
    add to duplicates[] with { name: person.fullName/name, matchedRegistrationId: existing._id }

If duplicates[].length > 0:
  Reject the ENTIRE batch — do not partially create the non-duplicate members.
  Respond 409 with error code "DUPLICATE_REGISTRATION" and a data payload listing
  which submitted person(s) matched an existing registration, e.g.:
  { "success": false, "error": { "code": "DUPLICATE_REGISTRATION", "message": "..." },
    "data": { "duplicates": [{ "name": "Ravi Kumar", "suggestion": "use-find-my-registration" }] } }
```

Family members with no phone provided are never checked and can never trigger this — that's expected and correct, not a bug to fix later.

---

## 7. Referral Validation, Self-Referral Block, and Abuse Flagging (`fraudCheck.service.js`)

This runs only when the incoming request includes a `referredBy` code (i.e., the primary registrant came in via `?ref=CODE`).

**Step 1 — Code existence & eligibility check**
```
referrer = Registration.findOne({ referralCode: submittedCode, wantsReferral: true })
if !referrer:
  → do NOT reject the registration. Proceed with registration as if no referral code
    was given: set referredBy = null on the created document, registrationSource = 'web'.
    This mirrors the existing GET /api/validate-referral live-validation endpoint, which
    should have already told the user the code was invalid before they could submit —
    this server-side check is a safety net, not the primary UX gate.
```

**Step 2 — Self-referral check**
```
Collect every phone number present in this submission (primary's phone, plus any
family member phone that was provided).

if referrer.phone is in that set:
  → this is a self-referral attempt.
  → Proceed with registration, but SILENTLY drop the referral: set referredBy = null,
    do NOT increment referrer.referralCount, registrationSource = 'web'.
  → Do not return any error or warning to the client about this — the requirement is
    that the abuser is not alerted. The registration otherwise succeeds normally.
```

**Step 3 — If code is valid and not self-referral: apply the rate-window flag (informational only)**
```
submissionId = freshly generated nanoid for this request
memberCount = 1 + (family members in this submission).length

recentCount = ReferralUsageLog.countDocuments({
  referralCode: submittedCode,
  createdAt: { $gte: Date.now() - 2 minutes }
})
// recentCount counts DISTINCT PRIOR SUBMISSIONS (log entries), not individual people.
// A family of 5 registering together in one submission produces ONE log entry with
// memberCount: 5 — it must never inflate recentCount by 5. This is the specific
// bug to avoid: do not log one row per person, log exactly one row per POST /api/register
// call.

flaggedForAbuse = recentCount >= 5
// This is >= 5 PRIOR submissions in the last 2 minutes (i.e., this would be the 6th+).

Insert one ReferralUsageLog row: { referralCode: submittedCode, submissionId, memberCount, ip, flaggedForAbuse }

→ Regardless of flaggedForAbuse, the registration and the referral credit BOTH still
  succeed normally. Flagging is for later manual review only — it never blocks
  registration, never blocks referral credit, and is never shown to the end user.
  Do not build any UI-facing behavior around this flag in this version.
```

**Step 4 — Apply the credit**
```
If code was valid AND not self-referral:
  set on the primary document being created: referredBy = submittedCode,
  registrationSource = 'referral-link'
  Registration.updateOne({ referralCode: submittedCode }, { $inc: { referralCount: memberCount } })
  // memberCount = 1 + number of family members in this same submission — the referrer
  // gets credit for every person in the batch, not just the primary registrant.
```

---

## 8. `POST /api/register` — Full Request/Response Contract and Step-by-Step Flow

This is the most important endpoint. Follow this exactly, in this order, inside a single MongoDB transaction (`session.startTransaction()` / commit / abort on any failure — either everyone in the batch is created, or no one is).

**Request body:**
```json
{
  "primary": {
    "fullName": "string, required",
    "phone": "string, required",
    "dob": "ISO date string, required",
    "city": "string, required",
    "wantsReferral": "boolean, required",
    "referredBy": "string or null, optional — the ?ref= code if present"
  },
  "members": [
    { "fullName": "string, required", "dob": "ISO date string, required", "phone": "string, optional" }
  ]
}
```
`members` may be an empty array or omitted entirely for a solo registration.

**Step-by-step server logic:**
```
1. Validate request body against registration.schema.js (Zod). On failure → 400,
   code "VALIDATION_ERROR", list every field error, do not just return the first one.

2. Run duplicateCheck.service on primary + every member with a phone (Section 6).
   On any duplicate → abort before creating anything, 409 DUPLICATE_REGISTRATION.

3. Start Mongo transaction.

4. If primary.referredBy is present, run fraudCheck.service Steps 1–3 (Section 7)
   to resolve: finalReferredBy (string or null), finalRegistrationSource,
   whether to log a ReferralUsageLog row. Do NOT apply the $inc credit yet —
   do it after documents are successfully created (Step 7 below), so a mid-transaction
   failure can never increment a referrer's count for people who were never actually
   registered.

5. Generate entryCode.service for the primary → primaryEntryCode.
   If members present, generate one more entryCode.service call per member, in order.

6. If primary.wantsReferral === true, call referralCode.service to generate
   primaryReferralCode. If wantsReferral is false, referralCode stays null —
   never generate one that isn't used.

7. If members.length > 0, generate a familyGroupId (nanoid, 10 chars) and assign
   it to the primary document AND every member document. If no members, familyGroupId
   stays null on the primary document — do not generate one for solo registrations.

8. Build and insert (within the transaction):
   - One Registration document for primary: isPrimaryRegistrant: true, all fields
     from Section 3.1 populated as above.
   - One Registration document per member: isPrimaryRegistrant: false,
     wantsReferral: false (hardcoded, ignore any client input here),
     referralCode: null, referredBy: null, city: taken from primary
     (do not leave member city blank — copy primary's city onto every member document
     so the schema's required-ness is satisfied and the data is still meaningful),
     familyGroupId shared with primary, registrationSource matches the primary's
     resolved registrationSource from step 4.

9. If step 4 resolved a valid non-self-referral code: apply
   Registration.updateOne({ referralCode: finalReferredBy },
   { $inc: { referralCount: 1 + members.length } }) and insert the
   ReferralUsageLog row from step 4, both within the same transaction.

10. Commit transaction.

11. For every created document, compute signedPayload = hmac.service.sign(entryCode)
    (Section 5.3), and build the response.
```

**Success response (`201`):**
```json
{
  "success": true,
  "data": {
    "familyGroupId": "string or null",
    "registrations": [
      {
        "id": "mongo _id",
        "fullName": "...",
        "isPrimaryRegistrant": true,
        "entryCode": "JN2026-00452",
        "signedPayload": "JN2026-00452.<hmac-hex>",
        "wantsReferral": true,
        "referralCode": "Murari219",
        "referredBy": null
      }
    ]
  }
}
```
`registrations` array is ordered: primary first, then members in the order submitted. This ordering is what drives the Success Page carousel order — do not reorder or sort it.

**On any failure inside the transaction:** abort transaction fully, respond with the specific error code that caused it — never a generic 500 for validation-shaped failures.

---

## 9. Other Endpoints — Exact Contracts

### 9.1 `GET /api/validate-referral/:code`
- Rate-limited: 30 requests/minute per IP (`rateLimiter.middleware.js`).
- Looks up `Registration.findOne({ referralCode: req.params.code, wantsReferral: true })`.
- Response: `{ success: true, data: { valid: true } }` or `{ success: true, data: { valid: false } }`. This is a 200 either way — an invalid code is not a server error, it's a normal negative result.
- Does NOT run the self-referral or fraud-flag logic — that only happens at actual registration time (Section 7), since this endpoint doesn't know who is asking.

### 9.2 `GET /api/leaderboard`
- Query: `Registration.find({ wantsReferral: true }).sort({ referralCount: -1 })`.
- Response `data`: array of `{ rank, fullName, referralCode, referralCount }`. `rank` is computed server-side (1-indexed position after sorting), not left for the frontend to compute.
- No pagination in this version — return the full sorted list. If this needs pagination later that's a separate change, don't add it speculatively now.

### 9.3 `GET /api/registration/:id`
- Fetch by Mongo `_id`. Returns the same per-person shape as one entry in the `registrations` array from Section 8, including a freshly computed `signedPayload` (don't store the signature, always recompute it from `entryCode` at request time).
- 404 with code `NOT_FOUND` if no match.

### 9.4 `POST /api/find-registration`
**Request:** `{ "phone": "string", "dob": "ISO date string" }`
**Logic:** `Registration.findOne({ phone, dob })` using the compound index from Section 3.1.
- Match found → same response shape as 9.3, plus `data.familyGroupId`.
- No match → 200 (not 404 — this is an expected, normal outcome for this lookup form, not an error state) with `{ success: true, data: null }`. Frontend distinguishes "no match" by `data === null`.
- Rate-limited: 20 requests/minute per IP, to prevent this being used to enumerate registrations by brute-forcing DOBs against a known phone.

### 9.5 `GET /api/stats/count`
- Returns `{ success: true, data: { totalRegistrants: <count> } }` where count is `Registration.countDocuments({})` — every person counts individually, including family members, not just primary registrants or submissions.

### 9.6 `POST /api/admin/login`
**Request:** `{ "username": "string", "password": "string" }`
**Logic:**
```
if username !== config.adminUsername → 401 INVALID_CREDENTIALS
if !bcrypt.compareSync(password, config.adminPasswordHash) → 401 INVALID_CREDENTIALS
else → sign a JWT { role: 'admin' }, expiry = config.jwtExpiry, return it in response body
  as data.token. Frontend stores it (localStorage or similar) and sends it as
  Authorization: Bearer <token> on every Scanner Page request.
```
No refresh tokens, no rotating credentials, no rate-limit exemption — apply a stricter limiter here too (5 attempts/minute per IP) since it's a login endpoint.

### 9.7 `POST /api/scan/checkin` (protected by `adminAuth.middleware.js`)
**Request:** `{ "signedPayload": "JN2026-00452.<hex>" }` (from a successful camera scan)
**Logic:**
```
1. Split signedPayload on the LAST '.' into entryCode and signature.
   (Use lastIndexOf, not split('.')[1] — entryCode itself never contains a dot,
   but be defensive about parsing anyway.)
2. If format is malformed (missing dot, empty parts) → 400 MALFORMED_PAYLOAD.
3. registration = Registration.findOne({ entryCode })
   → not found → 404 NOT_FOUND.
4. verified = hmac.service.verify(entryCode, signature)
5. If !verified:
   → do NOT check in. Respond 409 with code "SIGNATURE_MISMATCH" and
     data: { requiresOverride: true, entryCode }. The frontend shows this as a
     distinct state prompting the staff member toward the manual override action
     (Section 9.8), it is NOT the same as "already checked in".
6. If verified:
   if registration.checkedIn === true → 409 ALREADY_CHECKED_IN, return existing
     checkInTime in data.
   else → set checkedIn: true, checkInTime: now, freebieClaimed: true,
     freebieClaimTime: now, verifiedBySignature: true. Save.
     → 200 with the updated registration's fullName + confirmation info.
   Note: checkedIn and freebieClaimed are always set together in this flow — there is
   no separate "claim freebie only" action in this version. If registration.freebieClaimed
   was somehow already true while checkedIn was false (shouldn't happen given this logic,
   but defensively), still respond success and leave freebieClaimTime as its original value.
```

### 9.8 `POST /api/scan/checkin/override` (protected by `adminAuth.middleware.js`)
**Request:** `{ "entryCode": "JN2026-00452", "reason": "string, optional free-text note" }`
**Logic:**
```
Used only after 9.7 returned SIGNATURE_MISMATCH, or if the camera is unavailable and
staff types the code manually and it isn't found via a normal scan attempt at all.
1. registration = Registration.findOne({ entryCode }) → 404 if not found.
2. if registration.checkedIn === true → 409 ALREADY_CHECKED_IN (same as 9.7).
3. else → set checkedIn: true, checkInTime: now, freebieClaimed: true,
   freebieClaimTime: now, verifiedBySignature: false (explicitly false, marking this
   as an unverified override — this is what later audit filters on). Save.
   → 200, same success shape as 9.7.
This endpoint never touches or checks HMAC signatures at all — that's the entire point
of it being the override path.
```

---

## 10. Middleware Details

### `adminAuth.middleware.js`
- Reads `Authorization: Bearer <token>` header, verifies JWT with `config.jwtSecret`.
- Missing/invalid/expired token → 401 `UNAUTHORIZED`, do not leak whether the token was expired vs malformed vs missing — same generic message for all three.

### `rateLimiter.middleware.js`
Export named limiters, applied per-route as specified above:
- `registerLimiter`: 10 requests/minute/IP → `/api/register`
- `validateReferralLimiter`: 30/minute/IP → `/api/validate-referral/:code`
- `findRegistrationLimiter`: 20/minute/IP → `/api/find-registration`
- `adminLoginLimiter`: 5/minute/IP → `/api/admin/login`
Use `express-rate-limit`, keyed on IP. Rate-limit rejections return `429` with code `RATE_LIMITED`, using the same `apiResponse.error` shape as everything else — not the library's default plain-text response.

### `errorHandler.middleware.js`
- Mounted last in `app.js`.
- Any thrown error not already handled with a specific status/code falls through to this and becomes `500 INTERNAL_ERROR` with a generic message — never leak stack traces or raw Mongo error text to the client. Log the real error server-side via `logger.js`.

### `validate.middleware.js`
- Factory function `validate(schema)` returning Express middleware that parses `req.body` (or `req.params`/`req.query` as specified per-schema) against a Zod schema, calling `next()` on success or responding `400 VALIDATION_ERROR` with every field's error message on failure.

---

## 11. Explicitly Out of Scope — Do Not Build Any Of This

- ❌ No email field, no email confirmation, anywhere.
- ❌ No OTP / phone verification (Twilio, MSG91, or otherwise).
- ❌ No WhatsApp Cloud API or any outbound messaging integration.
- ❌ No user accounts / signup / login for regular registrants — only the single hardcoded admin login for the Scanner Page.
- ❌ No file uploads, no image storage, no S3/Cloudinary integration — QR codes are never stored as images server-side.
- ❌ No pagination on the leaderboard in this version.
- ❌ No "claim freebie separately from check-in" flow — they are always set together via 9.7/9.8 in this version, per Section 9.7's note.
- ❌ No refresh tokens or credential rotation for the admin login.

If a requirement seems to call for any of the above, stop and ask rather than implementing it anyway.

---

## 12. Definition of Done

- Every endpoint in Section 9 plus `POST /api/register` implemented exactly as specified, using the exact response shape from Section 4.
- Folder structure matches Section 1 exactly.
- `.env.example` matches Section 2 exactly, and `env.js` throws a clear startup error if any required variable is missing (fail fast, don't run with undefined secrets).
- A `README.md` documenting: how to run locally, how to generate `ADMIN_PASSWORD_HASH`, and a short list of all endpoints with method + path (a one-line table is enough).
- No endpoint returns a bare Mongo document — always the shaped response from `apiResponse.js`.
- No logic duplicated between controllers — shared logic (entry codes, referral codes, HMAC, duplicate checks, fraud checks) lives only in `services/`, called from controllers.
