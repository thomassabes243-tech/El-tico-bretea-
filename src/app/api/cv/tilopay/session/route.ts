import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAppSettings } from "@/lib/settings";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  getTilopaySdkToken,
  isTilopayConfigured,
  tilopayMustUseTestMode,
} from "@/lib/tilopay";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  if (!isTilopayConfigured()) {
    return NextResponse.json({ error: "El pago con tarjeta no está disponible" }, { status: 503 });
  }

  const { allowed } = await checkRateLimit(
    `cv-card-payment:${session.user.id}`,
    5,
    60 * 60 * 1000
  );
  if (!allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos. Volvé a intentarlo más tarde." },
      { status: 429 }
    );
  }

  const [worker, settings] = await Promise.all([
    prisma.workerProfile.findUnique({ where: { userId: session.user.id } }),
    getAppSettings(),
  ]);
  if (!worker) {
    return NextResponse.json({ error: "Completá tu perfil primero" }, { status: 400 });
  }
  if (worker.cvUnlocked) {
    return NextResponse.json({ error: "Tu CV ya está desbloqueado" }, { status: 409 });
  }

  const orderNumber = `ETB-CV-${Date.now()}-${randomUUID().slice(0, 8)}`;
  const [sdkToken, payment] = await Promise.all([
    getTilopaySdkToken(),
    prisma.cvCardPayment.create({
      data: {
        workerId: worker.id,
        orderNumber,
        amountColones: settings.cvPriceColones,
      },
    }),
  ]);

  const names = worker.fullName.trim().split(/\s+/);
  const firstName = names.shift() || "Cliente";
  const lastName = names.join(" ") || "El Tico Bretea";
  const redirect = new URL("/api/cv/tilopay/confirm", request.url);
  redirect.searchParams.set("paymentId", payment.id);

  return NextResponse.json({
    checkout: {
      token: sdkToken,
      currency: "CRC",
      language: "es",
      amount: settings.cvPriceColones,
      billToEmail: session.user.email || worker.email,
      orderNumber,
      billToFirstName: firstName,
      billToLastName: lastName,
      billToAddress: worker.residence || "Costa Rica",
      billToCity: worker.residence || "Costa Rica",
      billToCountry: "CR",
      billToTelephone: worker.phone || worker.whatsapp || "",
      capture: 1,
      redirect: redirect.toString(),
      subscription: 0,
      returnData: payment.id,
      hashVersion: "V2",
    },
    requireTestMode: tilopayMustUseTestMode(),
  });
}
