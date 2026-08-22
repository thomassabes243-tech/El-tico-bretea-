// Huella de dispositivo débil (Sección 22): combina atributos del navegador
// disponibles sin permisos especiales. No identifica hardware real -- dos
// personas con el mismo modelo de teléfono pueden coincidir, y borrar datos
// del navegador la cambia. Sirve solo como señal adicional para detectar
// cuentas duplicadas obvias, nunca como prueba por sí sola.
export async function getDeviceFingerprint(): Promise<string> {
  if (typeof window === "undefined") return "";

  const raw = [
    navigator.userAgent,
    navigator.language,
    String(screen.width),
    String(screen.height),
    String(screen.colorDepth),
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    String(navigator.hardwareConcurrency ?? ""),
  ].join("|");

  if (!window.crypto?.subtle) return raw.slice(0, 200);

  const data = new TextEncoder().encode(raw);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
