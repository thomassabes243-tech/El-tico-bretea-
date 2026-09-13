import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { consultTilopayOrder, tilopayMustUseTestMode } from "@/lib/tilopay";
import { validateCvPaymentTransaction } from "@/lib/tilopay-validation";

function cvRedirect(request: Request, result: string) {
  const url = new URL("/cv", request.url);
  url.searchParams.set("pago", result);
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") {
    return NextResponse.redirect(new URL("/iniciar-sesion", request.url));
  }

  const paymentId = new URL(request.url).searchParams.get("paymentId");
  if (!paymentId) return cvRedirect(request, "error");

  const payment = await prisma.cvCardPayment.findFirst({
    where: { id: paymentId, worker: { userId: session.user.id } },
  });
  if (!payment) return cvRedirect(request, "error");
  if (payment.status === "APPROVED") return cvRedirect(request, "aprobado");

  try {
    let transaction;
    for (let attempt = 0; attempt < 3 && !transaction; attempt += 1) {
      if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, 700));
      transaction = await consultTilopayOrder(payment.orderNumber);
    }

    const validation = validateCvPaymentTransaction(transaction, {
      orderNumber: payment.orderNumber,
      amountColones: payment.amountColones,
      requireTestMode: tilopayMustUseTestMode(),
    });

    if (!validation.ok) {
      await prisma.cvCardPayment.update({
        where: { id: payment.id },
        data: {
          status: transaction?.code && transaction.code !== "1" ? "REJECTED" : "ERROR",
          environment: transaction?.environment,
          failureReason: validation.reason.slice(0, 500),
          completedAt: new Date(),
        },
      });
      return cvRedirect(request, transaction?.code && transaction.code !== "1" ? "rechazado" : "error");
    }

    await prisma.$transaction([
      prisma.cvCardPayment.update({
        where: { id: payment.id },
        data: {
          status: "APPROVED",
          tilopayTransactionId: String(validation.transaction.id_tilopay || ""),
          authorizationCode: validation.transaction.auth,
          environment: validation.transaction.environment,
          failureReason: null,
          completedAt: new Date(),
        },
      }),
      prisma.workerProfile.update({
        where: { id: payment.workerId },
        data: { cvUnlocked: true },
      }),
    ]);
    return cvRedirect(request, "aprobado");
  } catch {
    await prisma.cvCardPayment.update({
      where: { id: payment.id },
      data: { status: "ERROR", failureReason: "No se pudo verificar el pago con Tilopay" },
    }).catch(() => undefined);
    return cvRedirect(request, "error");
  }
}
