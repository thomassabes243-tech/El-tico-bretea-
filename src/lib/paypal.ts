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
  if (!res.ok) {
    // PayPal devuelve el motivo real acá (ej. "invalid_client" cuando las
    // credenciales no corresponden al entorno configurado en PAYPAL_ENV) --
    // antes se descartaba y siempre se veía el mismo mensaje genérico, sin
    // forma de saber si era credencial mala, entorno equivocado, etc.
    const errBody = await res.json().catch(() => ({}) as { error?: string; error_description?: string });
    const detail = errBody.error_description || errBody.error || `HTTP ${res.status}`;
    throw new Error(`No se pudo autenticar con PayPal: ${detail} (entorno: ${process.env.PAYPAL_ENV === "live" ? "live" : "sandbox"})`);
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export async function createPaypalOrder(
  amount: number,
  currencyCode: "MXN" | "USD",
  description: string
) {
  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: { currency_code: currencyCode, value: amount.toFixed(2) },
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

// --- Suscripciones (Premium trabajador, Plan Profesional de Cotizaciones) ---
// Mismo Client ID/Secret que las órdenes de arriba -- no es una cuenta ni
// una integración nueva, es la misma API REST de PayPal, otro producto de
// su catálogo (Subscriptions en vez de Orders).

async function createPaypalProduct(name: string, description: string): Promise<string> {
  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_API_BASE}/v1/catalogs/products`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name, description, type: "SERVICE", category: "SOFTWARE" }),
  });
  const data = (await res.json()) as { id?: string; message?: string };
  if (!res.ok || !data.id) throw new Error(data.message || "No se pudo crear el producto en PayPal");
  return data.id;
}

export async function createPaypalMonthlyPlan(
  productName: string,
  productDescription: string,
  planName: string,
  amountPesos: number
): Promise<string> {
  const productId = await createPaypalProduct(productName, productDescription);
  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_API_BASE}/v1/billing/plans`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      product_id: productId,
      name: planName,
      billing_cycles: [
        {
          frequency: { interval_unit: "MONTH", interval_count: 1 },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: { value: amountPesos.toFixed(2), currency_code: "MXN" },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        payment_failure_threshold: 2,
      },
    }),
  });
  const data = (await res.json()) as { id?: string; message?: string };
  if (!res.ok || !data.id) throw new Error(data.message || "No se pudo crear el plan en PayPal");
  return data.id;
}

type PaypalSubscription = {
  id: string;
  status: string;
  subscriber?: { email_address?: string };
};

export async function getPaypalSubscription(subscriptionId: string): Promise<PaypalSubscription> {
  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json()) as PaypalSubscription & { message?: string };
  if (!res.ok) throw new Error(data.message || "No se pudo consultar la suscripción");
  return data;
}

export async function cancelPaypalSubscription(subscriptionId: string, reason: string): Promise<void> {
  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok && res.status !== 422) {
    // 422 = ya estaba cancelada, no es un error real para nuestro flujo.
    throw new Error("No se pudo cancelar la suscripción");
  }
}
