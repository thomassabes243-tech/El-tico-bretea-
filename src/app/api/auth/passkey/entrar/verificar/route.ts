import { createHash, randomBytes } from "node:crypto";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import type { AuthenticationResponseJSON, AuthenticatorTransportFuture } from "@simplewebauthn/types";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { PASSKEY_CHALLENGE_COOKIE, readPasswordlessPayload, webAuthnContext } from "@/lib/passwordless";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const challenge = readPasswordlessPayload(cookieStore.get(PASSKEY_CHALLENGE_COOKIE)?.value || "", "authenticate-passkey");
  if (!challenge?.challenge) return NextResponse.json({ error: "La solicitud venció" }, { status: 400 });

  const responseBody = (await request.json()) as AuthenticationResponseJSON;
  const credential = await prisma.passkeyCredential.findUnique({
    where: { credentialId: responseBody.id }, include: { user: true },
  });
  if (!credential || credential.user.isBlocked) return NextResponse.json({ error: "Llave no reconocida" }, { status: 404 });

  const { rpID, origin } = webAuthnContext(request);
  try {
    const verification = await verifyAuthenticationResponse({
      response: responseBody,
      expectedChallenge: challenge.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
      authenticator: {
        credentialID: Buffer.from(credential.credentialId, "base64url"),
        credentialPublicKey: Buffer.from(credential.publicKey, "base64url"),
        counter: Number(credential.counter),
        transports: credential.transports as AuthenticatorTransportFuture[],
      },
    });
    if (!verification.verified) throw new Error("Verificación inválida");
    await prisma.passkeyCredential.update({
      where: { id: credential.id },
      data: { counter: BigInt(verification.authenticationInfo.newCounter), lastUsedAt: new Date() },
    });
    cookieStore.delete(PASSKEY_CHALLENGE_COOKIE);
    const ticket = randomBytes(32).toString("base64url");
    await prisma.passwordlessTicket.create({
      data: {
        userId: credential.userId,
        tokenHash: createHash("sha256").update(ticket).digest("hex"),
        expiresAt: new Date(Date.now() + 60 * 1000),
      },
    });
    return NextResponse.json({ ticket });
  } catch {
    return NextResponse.json({ error: "No se pudo verificar este teléfono" }, { status: 401 });
  }
}
