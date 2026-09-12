import { verifyRegistrationResponse } from "@simplewebauthn/server";
import type { RegistrationResponseJSON } from "@simplewebauthn/types";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PASSKEY_CHALLENGE_COOKIE, readPasswordlessPayload, webAuthnContext } from "@/lib/passwordless";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const cookieStore = await cookies();
  const challenge = readPasswordlessPayload(cookieStore.get(PASSKEY_CHALLENGE_COOKIE)?.value || "", "register-passkey");
  if (!challenge?.challenge || challenge.userId !== session.user.id) {
    return NextResponse.json({ error: "La solicitud venció. Volvé a intentarlo." }, { status: 400 });
  }

  const responseBody = (await request.json()) as RegistrationResponseJSON;
  const { rpID, origin } = webAuthnContext(request);
  try {
    const verification = await verifyRegistrationResponse({
      response: responseBody,
      expectedChallenge: challenge.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
    });
    if (!verification.verified || !verification.registrationInfo) throw new Error("Verificación inválida");
    const info = verification.registrationInfo;
    const credentialId = Buffer.from(info.credentialID).toString("base64url");
    const existing = await prisma.passkeyCredential.findUnique({ where: { credentialId } });
    if (existing && existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Esta llave ya pertenece a otra cuenta" }, { status: 409 });
    }
    await prisma.passkeyCredential.upsert({
      where: { credentialId },
      update: { counter: BigInt(info.counter), lastUsedAt: new Date() },
      create: {
        userId: session.user.id,
        credentialId,
        publicKey: Buffer.from(info.credentialPublicKey).toString("base64url"),
        counter: BigInt(info.counter),
        transports: responseBody.response.transports ?? [],
        deviceType: info.credentialDeviceType,
        backedUp: info.credentialBackedUp,
      },
    });
    cookieStore.delete(PASSKEY_CHALLENGE_COOKIE);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "El teléfono no pudo registrar la llave de acceso" }, { status: 400 });
  }
}

