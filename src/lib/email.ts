// Envío de email vía la API REST de Resend -- un solo API key, sin
// contraseña ni verificación en 2 pasos que configurar (a diferencia de una
// contraseña de aplicación de Gmail). Mismo patrón que src/lib/paypal.ts:
// fetch directo a la API, sin SDK nuevo.
//
// Ojo con esto: sin verificar un dominio propio en resend.com/domains, Resend
// solo entrega a la propia casilla con la que te registraste -- no a
// cualquier usuario real todavía. Verificar un dominio (gratis, solo agregar
// unos registros DNS) es lo que habilita mandarle el código a cualquier
// correo real.
const RESEND_API_BASE = "https://api.resend.com";

function getApiKey(): string | null {
  return process.env.RESEND_API_KEY || null;
}

/** true si Resend aceptó el envío; false si falta RESEND_API_KEY. */
export async function sendPasswordResetEmail(to: string, code: string): Promise<boolean> {
  const apiKey = getApiKey();
  if (!apiKey) return false;

  const res = await fetch(`${RESEND_API_BASE}/emails`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || "El Mexa Chamba <onboarding@resend.dev>",
      to,
      subject: "Tu código para restablecer tu contraseña",
      text:
        `Tu código para restablecer tu contraseña en El Mexa Chamba es: ${code}\n\n` +
        "Vence en 15 minutos. Si no pediste esto, podés ignorar este correo -- tu contraseña actual sigue funcionando.",
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend rechazó el envío (${res.status}): ${body}`);
  }
  return true;
}
