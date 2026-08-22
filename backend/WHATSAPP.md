# WhatsApp (Baileys) — Anandotsav Registration
#
# Non-blocking transactional confirmation for PUBLIC registrations only
# (POST /api/register). Desk register does not send WhatsApp.
#
# QR image uses the SAME signed payload as the website:
#   buildSignedPayload(entryCode) from backend/src/services/hmac.service.js
#
## Persistent outbound queue
# WhatsAppMessage in MongoDB is the queue (pending → processing → sent | failed | cancelled).
# Survives Railway / Node restarts. Stuck "processing" jobs are recovered to pending on boot.
# Offline (disconnected / logged_out / connecting / not_configured): jobs stay pending —
# worker does not claim them; they resume automatically when connected.
#
# Delivery controls (env):
#   WHATSAPP_MAX_CONCURRENT_SENDS=1   (always sequential)
#   WHATSAPP_MIN_DELAY_MS / WHATSAPP_MAX_DELAY_MS  (random gap between sends)
#   WHATSAPP_MAX_CONSECUTIVE_FAILURES + WHATSAPP_COOLDOWN_MS  (circuit breaker)
# These are for controlled transactional delivery — not a claimed WhatsApp-safe rate limit.
#
# No bulk / broadcast / marketing endpoints.
#
## Local setup
# 1. Copy backend/.env.example → backend/.env and set secrets.
# 2. npm install (in backend/)
# 3. Set WHATSAPP_ENABLED=true and PUBLIC_APP_URL
# 4. Pair once:
#      npm run whatsapp:login
#    Scan the terminal QR with WhatsApp → Linked devices
# 5. Check status:
#      npm run whatsapp:status
# 6. Start API:
#      npm run dev
#
## Disable
# WHATSAPP_ENABLED=false  → no Baileys, no queue processing; registration unchanged
#
## Railway
# - Add a persistent Volume
# - Mount it (e.g. /data/whatsapp-session)
# - Set WHATSAPP_SESSION_DIR to that path
# - Set WHATSAPP_ENABLED=true and PUBLIC_APP_URL to the Vercel origin
# - Re-pair with whatsapp:login if session is invalid / logged_out
# - MongoDB queue + session volume: restart resumes pending messages
#
## Admin UI
# Super admin → /admin/whatsapp
# - Status + queue counts + worker (running / paused / next send)
# - Offline banner when messages are queued while disconnected
# - Connect (QR or pairing code)
# - Reconnect / Disconnect / Change number
# - Message history (queued / processing / sent / failed) + Retry
# - Registrations list shows WA delivery + Retry
#
# APIs (super_admin JWT, rate-limited):
# GET  /api/admin/whatsapp/status   → includes queue{} + worker{}
# POST /api/admin/whatsapp/pair
# GET  /api/admin/whatsapp/pair/qr
# POST /api/admin/whatsapp/pairing-code
# POST /api/admin/whatsapp/pair/cancel
# POST /api/admin/whatsapp/change-number
# POST /api/admin/whatsapp/reconnect
# POST /api/admin/whatsapp/disconnect
# POST /api/admin/whatsapp/ack-alert
# GET  /api/admin/whatsapp/messages
# POST /api/admin/whatsapp/messages/:id/retry
# POST /api/admin/whatsapp/registrations/:id/retry
#
# Logout alert: logged to server + admin banner (no email provider in this repo).
# Change number cancels pending WhatsAppMessage jobs (status=cancelled).
#
## Message example
# Image: Entry QR PNG (signedPayload)
# Caption:
#   Hare Krishna {{fullName}}
#   Entry Code: JN2026-xxxxx
#   Date / Venue …
#   (+ family count + /find link when totalPeople > 1)
#
## Re-pair / clear session
# 1. Stop the API
# 2. Delete WHATSAPP_SESSION_DIR contents (or archive the volume folder)
# 3. npm run whatsapp:login
# 4. Start API
#
## Failures
# Registration always returns 201 on DB success.
# WhatsAppMessage retries with exponential backoff up to WHATSAPP_MAX_ATTEMPTS then status=failed.
# Circuit breaker pauses the worker after consecutive failures, then resumes when healthy.
# Registration.whatsapp mirrors a lightweight sent/pending/failed snapshot.
