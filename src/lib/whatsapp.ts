// Números de WhatsApp en el proyecto se guardan como los tipea la persona
// (ej. "55 1234 5678", sin código de país) -- un link wa.me necesita el
// formato internacional en solo dígitos (ej. "525512345678"). Antepone 52
// (México) cuando el número parece un local de 10 dígitos sin código de
// país; si ya viene con código de país u otro formato, se deja tal cual.
export function toWhatsappHref(rawPhone: string, message?: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  const withCountryCode = digits.length === 10 ? `52${digits}` : digits;
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${withCountryCode}${query}`;
}
