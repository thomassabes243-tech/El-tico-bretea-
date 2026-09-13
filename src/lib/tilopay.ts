import "server-only";
import type { TilopayTransaction } from "@/lib/tilopay-validation";

const TILOPAY_API_URL = "https://app.tilopay.com/api/v1";

function getCredentials() {
  const apiUser = process.env.TILOPAY_API_USER;
  const password = process.env.TILOPAY_API_PASSWORD;
  const key = process.env.TILOPAY_API_KEY;
  if (!apiUser || !password || !key) {
    throw new Error("Tilopay no está configurado");
  }
  return { apiUser, password, key };
}

export function isTilopayConfigured() {
  return Boolean(
    process.env.TILOPAY_API_USER &&
      process.env.TILOPAY_API_PASSWORD &&
      process.env.TILOPAY_API_KEY
  );
}

export function tilopayMustUseTestMode() {
  return process.env.TILOPAY_REQUIRE_TEST_MODE !== "false";
}

async function postTilopay<T>(
  path: string,
  body: Record<string, unknown>,
  token?: string
): Promise<T> {
  const response = await fetch(`${TILOPAY_API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const payload = (await response.json().catch(() => null)) as T | null;
  if (!response.ok || !payload) {
    throw new Error(`Tilopay respondió con HTTP ${response.status}`);
  }
  return payload;
}

export async function getTilopaySdkToken() {
  const { apiUser, password, key } = getCredentials();
  const payload = await postTilopay<{ access_token?: string; message?: string }>(
    "/loginSdk",
    { apiuser: apiUser, password, key }
  );
  if (!payload.access_token) {
    throw new Error(payload.message || "Tilopay no entregó el token del checkout");
  }
  return payload.access_token;
}

async function getTilopayApiToken() {
  const { apiUser, password } = getCredentials();
  const payload = await postTilopay<{ access_token?: string; message?: string }>(
    "/login",
    { apiuser: apiUser, password }
  );
  if (!payload.access_token) {
    throw new Error(payload.message || "Tilopay no entregó el token del API");
  }
  return payload.access_token;
}

export async function consultTilopayOrder(orderNumber: string) {
  const { key } = getCredentials();
  const token = await getTilopayApiToken();
  const payload = await postTilopay<{
    type?: string;
    message?: string;
    response?: TilopayTransaction[];
  }>("/consult", { key, orderNumber, merchantId: "" }, token);
  return payload.response?.find((item) => item.orderNumber === orderNumber);
}
