// Números de WhatsApp en el proyecto se guardan como los tipea la persona
// (ej. "8888-8888", sin código de país) -- un link wa.me necesita el
// formato internacional en solo dígitos (ej. "50688888888"). Antepone 506
// (Costa Rica) cuando el número parece un local de 8 dígitos sin código de
// país; si ya viene con código de país u otro formato, se deja tal cual.
export function toWhatsappHref(rawPhone: string, message?: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  const withCountryCode = digits.length === 8 ? `506${digits}` : digits;
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${withCountryCode}${query}`;
}
