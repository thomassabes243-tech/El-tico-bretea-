import { createHmac, timingSafeEqual } from "node:crypto";

type SignedPayload = {
  purpose: "register-passkey" | "authenticate-passkey";
  challenge?: string;
  userId?: string;
  expiresAt: number;
};

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET no está configurado");
  return value;
}

function signature(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function signPasswordlessPayload(payload: SignedPayload): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${signature(encoded)}`;
}

export function readPasswordlessPayload(token: string, purpose: SignedPayload["purpose"]): SignedPayload | null {
  const [encoded, receivedSignature] = token.split(".");
  if (!encoded || !receivedSignature) return null;
  const expectedSignature = signature(encoded);
  const received = Buffer.from(receivedSignature);
  const expected = Buffer.from(expectedSignature);
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SignedPayload;
    if (payload.purpose !== purpose || payload.expiresAt < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function webAuthnContext(request: Request) {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProtocol = request.headers.get("x-forwarded-proto");
  const host = forwardedHost || url.host;
  const protocol = forwardedProtocol || url.protocol.replace(":", "");
  return {
    rpID: process.env.WEBAUTHN_RP_ID || host.split(":")[0],
    origin: process.env.WEBAUTHN_ORIGIN || `${protocol}://${host}`,
  };
}

export const PASSKEY_CHALLENGE_COOKIE = "mexa-passkey-challenge";
