import nodemailer from "nodemailer";

const SMTP_HOST = "mail.spacemail.com";
const SMTP_PORT = 465;
const SMTP_USER = process.env.SMTP_USER || "notification@quackapi.com";
const SMTP_PASS = process.env.SMTP_PASS;

function getTransporter() {
  if (!SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: true,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    tls: { rejectUnauthorized: false },
  });
}

async function sendEmail(to: string, subject: string, html: string) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[Email] SMTP not configured. Would send to ${to}: "${subject}"`);
    return;
  }
  try {
    await transporter.sendMail({ from: `"QuackAPI" <${SMTP_USER}>`, to, subject, html });
    console.log(`[Email] Sent "${subject}" to ${to}`);
  } catch (err) {
    console.error(`[Email] Failed to send to ${to}:`, err);
  }
}

const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f8f9fa; margin: 0; padding: 0;
`;

function emailWrapper(content: string) {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="${baseStyle}">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#6c47ff 0%,#8b5cf6 100%);padding:32px 40px;text-align:center;">
      <div style="display:inline-flex;align-items:center;gap:10px;">
        <span style="font-size:28px;">🦆</span>
        <span style="color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">QuackAPI</span>
      </div>
    </div>
    <div style="padding:40px;">
      ${content}
    </div>
    <div style="background:#f8f9fa;padding:24px 40px;border-top:1px solid #e9ecef;text-align:center;">
      <p style="color:#6c757d;font-size:13px;margin:0 0 8px 0;">
        You received this email from QuackAPI — the ultimate WhatsApp automation stack.
      </p>
      <p style="color:#adb5bd;font-size:12px;margin:0;">
        &copy; ${new Date().getFullYear()} QuackAPI. All rights reserved.
      </p>
    </div>
  </div>
</body></html>`;
}

export async function sendWelcomeEmail(to: string, name: string, apiKey: string) {
  const html = emailWrapper(`
    <h1 style="color:#1a1a2e;font-size:28px;font-weight:700;margin:0 0 8px 0;">Welcome aboard, ${name}! 🎉</h1>
    <p style="color:#6c757d;font-size:16px;margin:0 0 24px 0;">Your QuackAPI account is all set. Here's everything you need to get started.</p>

    <div style="background:#f0ebff;border:1px solid #d4c5ff;border-radius:12px;padding:20px 24px;margin:0 0 24px 0;">
      <p style="color:#6c47ff;font-size:12px;font-weight:600;margin:0 0 6px 0;text-transform:uppercase;letter-spacing:1px;">Your API Key</p>
      <code style="color:#1a1a2e;font-size:14px;font-family:monospace;word-break:break-all;">${apiKey}</code>
      <p style="color:#8b6fff;font-size:12px;margin:8px 0 0 0;">Keep this secret — it authenticates all your API requests.</p>
    </div>

    <h3 style="color:#1a1a2e;font-size:16px;font-weight:600;margin:0 0 12px 0;">Quick Start</h3>
    <ol style="color:#495057;font-size:14px;line-height:2;padding-left:20px;margin:0 0 24px 0;">
      <li>Go to <strong>Devices</strong> and create your first WhatsApp device</li>
      <li>Scan the QR code with your WhatsApp app</li>
      <li>Start sending messages via the REST API</li>
    </ol>

    <a href="https://quackapi.com/docs" style="display:inline-block;background:#6c47ff;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:15px;font-weight:600;">View API Documentation</a>
  `);
  await sendEmail(to, "Welcome to QuackAPI — Your account is ready! 🚀", html);
}

export async function sendEmailVerificationOTP(to: string, name: string, otp: string) {
  const html = emailWrapper(`
    <h1 style="color:#1a1a2e;font-size:26px;font-weight:700;margin:0 0 8px 0;">Verify your email</h1>
    <p style="color:#6c757d;font-size:15px;margin:0 0 32px 0;">Hi ${name}, use the code below to verify your QuackAPI account. It expires in <strong>10 minutes</strong>.</p>

    <div style="background:#f0ebff;border:2px solid #6c47ff;border-radius:16px;padding:32px;text-align:center;margin:0 0 28px 0;">
      <p style="color:#6c47ff;font-size:12px;font-weight:600;margin:0 0 12px 0;text-transform:uppercase;letter-spacing:2px;">Verification Code</p>
      <div style="letter-spacing:12px;font-size:42px;font-weight:700;color:#1a1a2e;font-family:monospace;">${otp}</div>
    </div>

    <p style="color:#6c757d;font-size:13px;margin:0;">If you didn't create a QuackAPI account, you can safely ignore this email.</p>
  `);
  await sendEmail(to, `${otp} is your QuackAPI verification code`, html);
}

export async function sendAdminRegistrationNotification(to: string, user: { name: string; email: string }) {
  const now = new Date().toLocaleString("en-US", {
    month: "long", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true, timeZone: "UTC",
  });
  const html = emailWrapper(`
    <div style="background:#f0ebff;border-left:4px solid #6c47ff;border-radius:8px;padding:16px 20px;margin:0 0 24px 0;">
      <p style="color:#6c47ff;font-size:13px;font-weight:600;margin:0;text-transform:uppercase;letter-spacing:1px;">New Registration Alert</p>
    </div>
    <h1 style="color:#1a1a2e;font-size:26px;font-weight:700;margin:0 0 8px 0;">New user signed up 🎉</h1>
    <p style="color:#6c757d;font-size:15px;margin:0 0 28px 0;">A new user just registered on QuackAPI.</p>

    <div style="background:#f8f9fa;border:1px solid #e9ecef;border-radius:12px;padding:20px 24px;margin:0 0 24px 0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;color:#6c757d;font-size:14px;width:100px;">Name</td>
          <td style="padding:8px 0;color:#1a1a2e;font-size:14px;font-weight:600;">${user.name}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6c757d;font-size:14px;border-top:1px solid #e9ecef;">Email</td>
          <td style="padding:8px 0;color:#1a1a2e;font-size:14px;font-weight:600;border-top:1px solid #e9ecef;">${user.email}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6c757d;font-size:14px;border-top:1px solid #e9ecef;">Time</td>
          <td style="padding:8px 0;color:#1a1a2e;font-size:14px;border-top:1px solid #e9ecef;">${now} UTC</td>
        </tr>
      </table>
    </div>

    <a href="https://quackapi.com/admin" style="display:inline-block;background:#6c47ff;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:10px;font-size:14px;font-weight:600;">View Admin Dashboard</a>
  `);
  await sendEmail(to, `New registration: ${user.name} (${user.email})`, html);
}

export async function sendPasswordResetOTP(to: string, name: string, otp: string) {
  const html = emailWrapper(`
    <h1 style="color:#1a1a2e;font-size:26px;font-weight:700;margin:0 0 8px 0;">Reset your password</h1>
    <p style="color:#6c757d;font-size:15px;margin:0 0 32px 0;">Hi ${name}, use the code below to reset your QuackAPI password. It expires in <strong>15 minutes</strong>.</p>

    <div style="background:#fff5f5;border:2px solid #e53e3e;border-radius:16px;padding:32px;text-align:center;margin:0 0 28px 0;">
      <p style="color:#e53e3e;font-size:12px;font-weight:600;margin:0 0 12px 0;text-transform:uppercase;letter-spacing:2px;">Reset Code</p>
      <div style="letter-spacing:12px;font-size:42px;font-weight:700;color:#1a1a2e;font-family:monospace;">${otp}</div>
    </div>

    <div style="background:#fffbeb;border:1px solid #f6ad55;border-radius:10px;padding:16px 20px;margin:0 0 20px 0;">
      <p style="color:#744210;font-size:13px;margin:0;">⚠️ If you didn't request a password reset, please ignore this email. Your account is safe.</p>
    </div>
  `);
  await sendEmail(to, `${otp} is your QuackAPI password reset code`, html);
}
