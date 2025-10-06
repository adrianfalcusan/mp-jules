# Product Delivery Checklist

## Phase 0 — Foundation (Active)

- [ ] Bunny Pull Zone origin points to Storage Zone
- [ ] Token Authentication ENABLED with BUNNY_URL_TOKEN_KEY
- [ ] Hotlink protection OFF (referrer allowlist empty)
- [ ] Force HTTPS, Brotli ON, Edge TTL 7d, Logging ON
- [ ] Store videoKey (not raw URL) in DB
- [ ] Signed URL helper implemented
- [ ] Content endpoints return signed URLs after access check
- [ ] Proxy route disabled by default (debug only)

## Phase 1 — Streamlined creation & approval

- [ ] One-step create-with-video returns key/duration
- [ ] Admin approval gates publication
- [ ] Catalog shows only published

## Phase 2 — Subscriptions & cost protection

- [ ] Stripe prices per tier
- [ ] Entitlement middleware per request
- [ ] Cost/usage tracking + upgrade prompts

## Phase 3 — Instructor revenue

- [ ] Monthly aggregation, reports, CSV export

## Phase 4 — Playback & UX

- [ ] Resume progress, keyboard shortcuts
- [ ] Optional: migrate new uploads to Bunny Stream

## Phase 5 — Reliability, observability, security

- [ ] Health checks, retries, cleanup jobs
- [ ] Structured logs + dashboards
- [ ] Helmet, rate-limits, JWT rotation
