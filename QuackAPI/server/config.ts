export const smtpConfig = {
  host: "mail.spacemail.com",
  port: 465,
  user: "notification@quackapi.com",
  pass: "Ayzel@2010",
  secure: true,
};

export const paypalConfig = {
  mode: "sandbox" as "sandbox" | "live",
  sandboxClientId: "AfYvzCU0raFhovIM43dOey3txoSTtv5nb8AfBBV17W6j_vcX9YEAkDOjRe-fwSDNkbrD5hw7g7C7XeHj",
  sandboxClientSecret: "EBDDSAboeZ4vHiu3eCY1qkbXKoFzqMUaoMpWNIwWtEco2GLmGvpmk7KkFzSIBgoq5jIo6X0Ud-Y2c3xw",
  liveClientId: "AXmQriRLkO_EconhM_MMfHYmqxg_xJb-BtuaVnkU6SmeJ9gKpjw_SGBBIGleLy30sbOTgXfiuMHHlO0q",
  liveClientSecret: "EAP07Y39ttpZaeygRsrkbmxlW1XSvd-orMWMX51EMmROpniWjfHMgase5zJBidN0TihW5Ija28SDjuyH",
};

export const notificationConfig = {
  email: "sarim.naeem2010@gmail.com",
};

export function getPayPalCredentials() {
  const mode = paypalConfig.mode;
  const clientId = mode === "live" ? paypalConfig.liveClientId : paypalConfig.sandboxClientId;
  const clientSecret = mode === "live" ? paypalConfig.liveClientSecret : paypalConfig.sandboxClientSecret;
  return { mode, clientId, clientSecret };
}
