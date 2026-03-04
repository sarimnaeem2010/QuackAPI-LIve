const PAYPAL_SANDBOX_URL = "https://api-m.sandbox.paypal.com";
const PAYPAL_LIVE_URL = "https://api-m.paypal.com";

export function getPayPalBaseUrl(mode: string): string {
  return mode === "live" ? PAYPAL_LIVE_URL : PAYPAL_SANDBOX_URL;
}

export async function getPayPalAccessToken(
  clientId: string,
  clientSecret: string,
  mode: string
): Promise<string> {
  const base = getPayPalBaseUrl(mode);
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal auth failed: ${err}`);
  }

  const data = await res.json() as { access_token: string };
  return data.access_token;
}

export async function createPayPalOrder(
  clientId: string,
  clientSecret: string,
  mode: string,
  amountUSD: string,
  description: string,
  returnUrl: string,
  cancelUrl: string
): Promise<{ orderId: string; approvalUrl: string }> {
  const base = getPayPalBaseUrl(mode);
  const accessToken = await getPayPalAccessToken(clientId, clientSecret, mode);

  const res = await fetch(`${base}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: { currency_code: "USD", value: amountUSD },
          description,
        },
      ],
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
        brand_name: "QuackAPI",
        landing_page: "BILLING",
        user_action: "PAY_NOW",
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    try {
      const errJson = JSON.parse(errText);
      const detail = errJson.details?.[0]?.description || errJson.details?.[0]?.issue || errJson.message;
      throw new Error(detail || errText);
    } catch (parseErr: any) {
      if (parseErr.message && !parseErr.message.startsWith("{")) throw parseErr;
      throw new Error(errText);
    }
  }

  const order = await res.json() as {
    id: string;
    links: Array<{ rel: string; href: string }>;
  };

  const approvalUrl = order.links.find((l) => l.rel === "approve")?.href;
  if (!approvalUrl) throw new Error("No approval URL from PayPal");

  return { orderId: order.id, approvalUrl };
}

export async function capturePayPalOrder(
  clientId: string,
  clientSecret: string,
  mode: string,
  orderId: string
): Promise<{ status: string; transactionId: string }> {
  const base = getPayPalBaseUrl(mode);
  const accessToken = await getPayPalAccessToken(clientId, clientSecret, mode);

  const res = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    try {
      const errJson = JSON.parse(errText);
      const detail = errJson.details?.[0]?.description || errJson.details?.[0]?.issue || errJson.message;
      throw new Error(detail || errText);
    } catch (parseErr: any) {
      if (parseErr.message && !parseErr.message.startsWith("{")) throw parseErr;
      throw new Error(errText);
    }
  }

  const captured = await res.json() as {
    status: string;
    purchase_units: Array<{
      payments: { captures: Array<{ id: string }> };
    }>;
  };

  const transactionId = captured.purchase_units?.[0]?.payments?.captures?.[0]?.id || orderId;
  return { status: captured.status, transactionId };
}
