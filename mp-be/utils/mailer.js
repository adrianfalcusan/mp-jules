// utils/mailer.js
const nodemailer = require("nodemailer");

function createTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } =
    process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

const transporter = createTransport();

async function sendMail({ to, subject, html, text }) {
  if (!transporter) {
    console.log("[MAIL:DEV] To:", to);
    console.log("[MAIL:DEV] Subject:", subject);
    console.log("[MAIL:DEV] Text:", text || "");
    if (html) console.log("[MAIL:DEV] HTML:", html);
    return { dev: true };
  }
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
  return transporter.sendMail({ from, to, subject, html, text });
}

module.exports = { sendMail };
