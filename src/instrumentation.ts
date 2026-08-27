// Se ejecuta una sola vez, al arrancar el servidor (funciona igual en
// Vercel). Falla rápido y con un mensaje claro si falta una variable de
// entorno crítica, en vez de dejar que la app arranque y se rompa de
// forma confusa en la primera petición real.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const required = ["DATABASE_URL", "DIRECT_URL", "AUTH_SECRET"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    // Diagnóstico: por qué esto no alcanza con "no está la variable" --
    // ya se confirmó varias veces en el dashboard de Vercel que sí está
    // cargada, y sigue fallando. Se listan (solo nombres, nunca valores)
    // las claves de process.env que contengan "AUTH" o "SECRET" para ver
    // si Vercel está inyectando algo con un nombre ligeramente distinto
    // al esperado (typo, mayúsculas, sufijo) en vez de asumir a ciegas.
    const relatedKeys = Object.keys(process.env).filter((k) => /auth|secret/i.test(k));
    throw new Error(
      `Faltan variables de entorno requeridas: ${missing.join(", ")}. ` +
        `Revisá .env.example para ver qué debe llevar cada una. ` +
        `[Diagnóstico: claves presentes que contienen "auth" o "secret": ${
          relatedKeys.length > 0 ? relatedKeys.join(", ") : "ninguna"
        }]`
    );
  }
}
