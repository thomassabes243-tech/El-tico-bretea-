import webpush from "web-push";
import { prisma } from "@/lib/prisma";

// Web Push real (protocolo estándar del navegador, sin ningún servicio de
// terceros pago) -- las claves VAPID se generan una sola vez con
// `npx web-push generate-vapid-keys` y quedan fijas para siempre.
let configured = false;
function ensureConfigured() {
  if (configured) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    throw new Error("Falta configurar NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY");
  }
  webpush.setVapidDetails("mailto:contacto@mexicosinhambre.com", publicKey, privateKey);
  configured = true;
}

export function isPushConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

export async function notifyCompaniesOfNewRequest(
  companyIds: string[],
  payload: { title: string; body: string; url: string }
) {
  if (!isPushConfigured() || companyIds.length === 0) return;
  ensureConfigured();

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { companyId: { in: companyIds } },
  });

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload)
        );
      } catch (err) {
        // 404/410 = el navegador invalidó la suscripción (desinstaló la
        // app, borró datos, etc.) -- se borra, no es un error real.
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => undefined);
        }
      }
    })
  );
}
