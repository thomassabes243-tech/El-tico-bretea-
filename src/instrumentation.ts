// Se ejecuta una sola vez, al arrancar el servidor (funciona igual en
// Vercel). Falla rápido y con un mensaje claro si falta una variable de
// entorno crítica, en vez de dejar que la app arranque y se rompa de
// forma confusa en la primera petición real.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const required = ["DATABASE_URL", "DIRECT_URL", "AUTH_SECRET"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno requeridas: ${missing.join(", ")}. ` +
        `Revisá .env.example para ver qué debe llevar cada una.`
    );
  }
}
