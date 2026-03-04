export const smtpConfig = {
  host: "mail.spacemail.com",
  port: 465,
  user: "notification@quackapi.com",
  pass: process.env.SMTP_PASS || "",
  secure: true,
};

export const paypalConfig = {
  mode: "sandbox" as "sandbox" | "live",
  sandboxClientId: "",
  sandboxClientSecret: "",
  liveClientId: "",
  liveClientSecret: "",
};

export const notificationConfig = {
  email: "",
};

export function getPayPalCredentials() {
  const mode = paypalConfig.mode;
  const clientId = mode === "live" ? paypalConfig.liveClientId : paypalConfig.sandboxClientId;
  const clientSecret = mode === "live" ? paypalConfig.liveClientSecret : paypalConfig.sandboxClientSecret;
  return { mode, clientId, clientSecret };
}
