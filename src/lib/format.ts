// Formatea montos en colones con coma como separador de miles. Usamos
// "en-US" a propósito: el estándar es-CR usa espacio como separador
// (₡1 500), pero el resto de la copy de la app usa comas (₡350,000), así
// que mantenemos esa convención para que todos los precios se vean iguales.
export function formatColones(amount: number): string {
  return amount.toLocaleString("en-US");
}
