import { generateRegistrationOptions } from "@simplewebauthn/server";
import type { AuthenticatorTransportFuture } from "@simplewebauthn/types";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PASSKEY_CHALLENGE_COOKIE, signPasswordlessPayload, webAuthnContext } from "@/lib/passwordless";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const credentials = await prisma.passkeyCredential.findMany({ where: { userId: session.user.id } });
  const { rpID } = webAuthnContext(request);
  const options = await generateRegistrationOptions({
    rpName: "El Mexa Chamba",
    rpID,
    userID: session.user.id,
    userName: session.user.email || session.user.id,
    userDisplayName: session.user.email || "Usuario Mexa Chamba",
    attestationType: "none",
    excludeCredentials: credentials.map((item) => ({
      id: Buffer.from(item.credentialId, "base64url"),
      type: "public-key",
      transports: item.transports as AuthenticatorTransportFuture[],
    })),
    authenticatorSelection: { residentKey: "required", userVerification: "required" },
  });

  const response = NextResponse.json(options);
  response.cookies.set(PASSKEY_CHALLENGE_COOKIE, signPasswordlessPayload({
    purpose: "register-passkey", challenge: options.challenge, userId: session.user.id, expiresAt: Date.now() + 5 * 60 * 1000,
  }), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 300, path: "/" });
  return response;
}
