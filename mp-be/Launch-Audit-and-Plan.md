## Music Platform — Launch Audit, Plan, and Monetization Strategy

### Executive Summary

This document audits the current codebase (backend and frontend), outlines what already works end-to-end, identifies blockers to launch, and provides a concrete production launch plan with monetization strategy, roadmap, and compliance checklist.

### What Works Today

- **Auth & Accounts**: Login, Signup, Logout, Email Verification (link + redirect), Forgot/Reset Password, Role-based guards (`student`, `teacher`, `admin`).
- **Content**: Courses and Tutorials listing/detail; signed URLs via S3; local `/uploads` fallback for development.
- **Payments**: Stripe Checkout session creation; webhook creates `Enrollment` and sends receipt email.
- **Enrollment & Access**: Purchased content unlocked via `Enrollment`; access controlled in protected content endpoints.
- **Reviews & Testimonials**: Unified reviews by item (course/tutorial) with CRUD; testimonials listing and admin CRUD.
- **Progress & Analytics**: Progress sessions, update (% and last position), streaks, per-user statistics, achievement unlocks.
- **Achievements**: Seeded on startup; unlocks evaluated on activity; APIs for summaries and per-category progress.
- **Dashboards**:
  - Student dashboard: enrolled content + progress, analytics, achievements, recommendations.
  - Teacher analytics: students/revenue summary, monthly chart, top content, “my-courses” / “my-tutorials”.
  - Admin APIs: users CRUD, platform analytics, content approval queues, platform stats.
- **Frontend**: React + MUI, protected/public routing, pages for landing, catalog, course detail, tutorial, auth, profile, dashboards; Axios service with JWT bearer and 401 handling; env-based API base URL.

### Critical Blockers (Fix Before Launch)

1. **Admin route security gaps**

   - Some endpoints in `routes/admin.js` lack `auth` and `role(["admin"])`, and there are duplicated handlers (e.g., `PUT/DELETE /users/:id`) without protection. Apply consistent `auth` + `role(["admin"])` to all admin routes and remove duplicates.

2. **Enrollment check bug**

   - In `routes/courses.js` `POST /:id/progress`, the enrollment query uses a non-existent `course` field. It should use `{ student, itemType: "course", itemId: courseId }` to match the `Enrollment` schema.

3. **Stripe webhook requirement blocks startup**

   - Backend exits if `STRIPE_WEBHOOK_SECRET` is missing. Provide a test secret via Stripe CLI or make this check optional in development.

4. **Upload placeholder missing**

   - `tutorials.js` `signPut` returns `/api/tutorials/upload-placeholder` when S3 isn’t configured; this route does not exist. Implement a dev upload placeholder or require S3-only uploads.

5. **Missing refresh token endpoint**

   - Frontend constants reference `AUTH.REFRESH`, but there’s no `/auth/refresh` route. Either implement refresh tokens or remove this reference.

6. **Teacher highlights aggregation**
   - `teachers.js` aggregation uses `foreignField: "course"` (field doesn’t exist). Switch to using `Enrollment` with `itemType/itemId` for accurate totals.

### Quick Start (Local Development)

- **Backend `.env`** (required at startup):

```env
PORT=8080
DB_URI=mongodb://localhost:27017/music-platform
JWT_SECRET=change_me
FRONTEND_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your-bucket
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=no-reply@example.com
SMTP_PASS=...
SMTP_SECURE=false
EMAIL_FROM="Your Brand <no-reply@example.com>"
```

- **Frontend `.env`**:

```env
REACT_APP_API_BASE_URL=http://localhost:8080/api
```

- **Install & Run**:

```bash
# Backend
cd music-platform-backend
npm install
npm start

# Frontend
cd ../music-platform-frontend
npm install
npm start
```

- **Stripe Webhook (test mode)**:

```bash
stripe listen --forward-to http://localhost:8080/api/payments/webhook
```

Copy the `whsec_...` to `STRIPE_WEBHOOK_SECRET` and restart the backend.

### Production Launch Plan

- **Hosting**

  - Backend: Render/Railway/Fly.io/EC2, Node 18+, HTTPS, custom domain.
  - Database: MongoDB Atlas (M10+), backup policy enabled.
  - Storage/Delivery: S3 + CloudFront; remove local `/uploads` in prod.
  - Frontend: Vercel/Netlify or S3+CloudFront; set `REACT_APP_API_BASE_URL=https://api.yourdomain.com/api`.
  - Stripe: Live keys and live webhook to `https://api.yourdomain.com/api/payments/webhook`.

- **Security & Reliability**

  - Lock down all admin routes with `auth` + `role(["admin"])` and rate limit auth/payments.
  - Replace `console.log` with structured logging; add request IDs; redact secrets.
  - Sentry (frontend + backend), CORS whitelist, health checks and uptime monitoring.

- **Observability**

  - Centralized logs (Logtail/Datadog), alerts on webhook failures and 5xx spikes.

- **Data & Compliance**
  - Atlas backups; Terms, Privacy, Refund, Cookies; cookie notice; branded email templates.

### Monetization & Pricing

- **Model**

  - One-off purchases for tutorials and mini-courses (current Stripe Checkout).
  - Subscriptions (Stripe Billing) to unlock bundles/full catalog.
  - Bundles and coupons (Stripe Coupons/Promotions).
  - Teacher payouts via Stripe Connect Standard (60–80% share).
  - Upsells: paid coaching sessions; B2B licensing for studios/schools.

- **Growth**
  - Referral program (give/get credits) via promo codes; affiliate attribution with UTM + coupons.
  - Lifecycle email: welcome, abandoned checkout, win-back, achievement unlock.

### Product Roadmap

- **Pre-launch (must-fix)**

  - Secure all admin endpoints; remove duplicates.
  - Fix course progress enrollment query.
  - Implement upload placeholder or enforce S3-only uploads.
  - Add post-checkout polling to reflect enrollment even if webhook is delayed.
  - Add coupons and basic order history page.
  - Remove unused refresh token constant or implement refresh tokens.

- **Near-term (2–4 weeks)**

  - Stripe Connect payouts and teacher revenue dashboard.
  - Subscriptions (Stripe Billing) with gated access checks.
  - Search/filters/tags; SEO meta for pages, sitemap/robots.
  - HTML email templates for verification, reset, receipt, achievements.
  - Admin UI for content moderation/approval.
  - Frontend analytics (GA4) + events for checkout/content usage.

- **Later (4–8 weeks)**
  - Recommendations; community features (Q&A/comments); announcements.
  - Responsive polish; streaming via HLS; DRM with short-lived signed URLs/watermarking.
  - Localization and multi-currency.

### Compliance & Ops Checklist

- Policies: Terms, Privacy, Refund, Cookies (link in footer), support email.
- Stripe Tax/VAT for international sales; invoicing for B2B.
- Data export/delete pathways; DPA if required.
- Branded emails with address/unsubscribe; status page.

### Risks & Mitigations

- Purchases rely on webhooks to unlock content; add client polling + manual refresh access button.
- Local uploads fail without S3; either add dev placeholder route or require S3.
- Admin analytics currently public in places; secure before launch.
- Mixed legacy fields (`isPublished` vs `status`); standardize for scale.

### Next Actions (Owner-ready)

- Secure admin routes and remove duplicates in `routes/admin.js`.
- Fix course progress enrollment query in `routes/courses.js`.
- Implement dev upload placeholder or enforce S3-only uploads.
- Add frontend post-checkout polling; optional coupon support.
- Remove/implement refresh tokens.
- Deploy: Backend (Render/Railway), DB (Atlas), Storage (S3/CloudFront), Frontend (Vercel), Stripe live keys + webhook.
- Seed initial catalog (5–10 tutorials) and publish landing content.
