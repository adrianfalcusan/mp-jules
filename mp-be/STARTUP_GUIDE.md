# 🚀 Music Platform Startup Guide

This guide explains how to start both the backend (API server) and frontend (React app) for local development.

---

## Prerequisites

- **Node.js** (v16+ recommended)
- **npm** (v8+ recommended)
- **MongoDB** (running locally or accessible remotely)
- **AWS S3 bucket** (for file uploads)
- **Stripe account** (for payments)
- **.env files** for both backend and frontend (see below)

---

## 1. Clone the Repository

```sh
git clone <your-repo-url>
cd music-platform-backend
```

---

## 2. Environment Variables

- Ensure you have a `.env` file in both `music-platform-backend` and `music-platform-frontend`.
- Example backend `.env`:

  ```env
  PORT=8080
  DB_URI=mongodb://localhost:27017/music-platform
  JWT_SECRET=your_jwt_secret
  STRIPE_SECRET_KEY=your_stripe_secret
  STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
  FRONTEND_URL=http://localhost:3000
  AWS_REGION=your-region
  AWS_ACCESS_KEY_ID=your-access-key
  AWS_SECRET_ACCESS_KEY=your-secret-key
  AWS_S3_BUCKET=your-bucket-name

  # Email (SMTP) - used for password reset and email verification
  SMTP_HOST=smtp.yourprovider.com
  SMTP_PORT=587
  SMTP_USER=no-reply@yourdomain.com
  SMTP_PASS=replace_with_smtp_password
  SMTP_SECURE=false
  EMAIL_FROM="Your Brand <no-reply@yourdomain.com>"
  ```

- Example frontend `.env`:
  ```env
  REACT_APP_API_BASE_URL=http://localhost:8080/api
  ```

Where to find these values:

- SMTP_HOST/PORT/USER/PASS/SECURE, EMAIL_FROM: from your email service (e.g., Gmail SMTP, SendGrid, Mailgun).
- STRIPE\_\*: Stripe dashboard → Developers → API keys and Webhooks.
- AWS\_\*: IAM user credentials with S3 permissions; S3 bucket name and region.

---

## 3. Install Dependencies

### Backend

```sh
cd music-platform-backend
npm install
```

### Frontend

```sh
cd ../music-platform-frontend
npm install
```

---

## 4. Start the Application

### Start MongoDB

- Make sure MongoDB is running locally (or update `DB_URI` for remote DB).

### Start Backend

```sh
cd music-platform-backend
npm start
```

- The backend will run on the port specified in `.env` (default: 8080).

### Start Frontend

Open a new terminal window/tab:

```sh
cd music-platform-frontend
npm start
```

- The frontend will run on [http://localhost:3000](http://localhost:3000).

---

## 5. Access the App

- Open [http://localhost:3000](http://localhost:3000) in your browser.
- The frontend will communicate with the backend API at [http://localhost:8080/api](http://localhost:8080/api).

---

## 6. Troubleshooting

- **Port in use?** Change the `PORT` in `.env` or stop the conflicting process.
- **MongoDB connection error?** Make sure MongoDB is running and `DB_URI` is correct.
- **AWS/Stripe errors?** Double-check your credentials in `.env`.
- **CORS issues?** Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL.

---

## 7. Useful Scripts

- **Seed test data:**
  ```sh
  node scripts/create-test-tutorial.js
  node scripts/enroll-test-tutorial.js
  ```
- **Check enrollments:**
  ```sh
  node scripts/check-enrollment.js
  ```

---

## 8. Stopping the App

- Press `Ctrl+C` in each terminal to stop the servers.

---

## 9. Need Help?

- Check `PROJECT_DOCUMENTATION.md` for more details.
- Or contact the project maintainer.
