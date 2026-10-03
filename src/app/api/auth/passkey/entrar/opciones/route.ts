import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { NextResponse } from "next/server";
import { PASSKEY_CHALLENGE_COOKIE, signPasswordlessPayload, webAuthnContext } from "@/lib/passwordless";

export async function POST(request: Request) {
  const { rpID } = webAuthnContext(request);
  const options = await generateAuthenticationOptions({ rpID, userVerification: "required" });
  const response = NextResponse.json(options);
  response.cookies.set(PASSKEY_CHALLENGE_COOKIE, signPasswordlessPayload({
    purpose: "authenticate-passkey", challenge: options.challenge, expiresAt: Date.now() + 5 * 60 * 1000,
  }), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 300, path: "/" });
  return response;
}

