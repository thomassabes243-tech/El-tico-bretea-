import nodemailer from "nodemailer";

// Envío de email vía SMTP de una cuenta de Gmail real (usuario + contraseña
// de aplicación, no la contraseña real de la cuenta) -- no requiere dar de
// alta ningún servicio nuevo ni verificar un dominio propio (a diferencia de
// Resend/SendGrid, que sin dominio verificado solo dejan enviar a la propia
// cuenta), y es gratis. A quién le llega el correo no depende de esto: sirve
// igual para un destinatario en Gmail, Outlook o cualquier otro proveedor.
function getTransport() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  return nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
}

/** true si se pudo enviar (o al menos encolar en el SMTP); false si faltan las credenciales. */
export async function sendPasswordResetEmail(to: string, code: string): Promise<boolean> {
  const transport = getTransport();
  if (!transport) return false;

  await transport.sendMail({
    from: `"El Mexa Chamba" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Tu código para restablecer tu contraseña",
    text:
      `Tu código para restablecer tu contraseña en El Mexa Chamba es: ${code}\n\n` +
      "Vence en 15 minutos. Si no pediste esto, podés ignorar este correo -- tu contraseña actual sigue funcionando.",
  });
  return true;
}
