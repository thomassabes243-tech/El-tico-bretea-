// Integración con la API REST de PayPal (Orders v2) -- pagos únicos.
// PAYPAL_ENV controla si se habla con el entorno de pruebas (dinero falso)
// o el real; sin la variable se asume sandbox para no arriesgar cobros
// reales por accidente en desarrollo.
const PAYPAL_API_BASE =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

function requireCredentials() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Falta configurar NEXT_PUBLIC_PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET");
  }
  return { clientId, clientSecret };
}

async function getAccessToken(): Promise<string> {
  const { clientId, clientSecret } = requireCredentials();
  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error("No se pudo autenticar con PayPal");
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export async function createPaypalOrder(amountPesos: number, description: string) {
  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: { currency_code: "MXN", value: amountPesos.toFixed(2) },
          description,
        },
      ],
    }),
  });
  const data = (await res.json()) as { id?: string; message?: string };
  if (!res.ok || !data.id) throw new Error(data.message || "No se pudo crear la orden de PayPal");
  return data.id;
}

type PaypalCaptureResult = {
  status: string;
  payer?: { email_address?: string };
};

export async function capturePaypalOrder(orderId: string): Promise<PaypalCaptureResult> {
  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  const data = (await res.json()) as PaypalCaptureResult & { message?: string };
  if (!res.ok) throw new Error(data.message || "No se pudo confirmar el pago con PayPal");
  return data;
}
