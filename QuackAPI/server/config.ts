export const smtpConfig = {
  host: process.env.SMTP_HOST || "mail.spacemail.com",
  port: parseInt(process.env.SMTP_PORT || "465", 10),
  user: process.env.SMTP_USER || "notification@quackapi.com",
  pass: process.env.SMTP_PASS || "",
  secure: process.env.SMTP_SECURE !== "false",
};

export const paypalConfig = {
  mode: (process.env.PAYPAL_MODE || "sandbox") as "sandbox" | "live",
  sandboxClientId: process.env.PAYPAL_SANDBOX_CLIENT_ID || "",
  sandboxClientSecret: process.env.PAYPAL_SANDBOX_SECRET || "",
  liveClientId: process.env.PAYPAL_LIVE_CLIENT_ID || "",
  liveClientSecret: process.env.PAYPAL_LIVE_SECRET || "",
};

export const notificationConfig = {
  email: process.env.NOTIFICATION_EMAIL || "",
};

export function getPayPalCredentials() {
  const mode = paypalConfig.mode;
  const clientId = mode === "live" ? paypalConfig.liveClientId : paypalConfig.sandboxClientId;
  const clientSecret = mode === "live" ? paypalConfig.liveClientSecret : paypalConfig.sandboxClientSecret;
  return { mode, clientId, clientSecret };
}
