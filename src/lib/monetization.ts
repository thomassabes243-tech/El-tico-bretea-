/**
 * Interruptores de lanzamiento. Permanecen apagados por defecto para que la
 * interfaz pueda revisarse sin aceptar cobros ni mostrar publicidad.
 *
 * Cuando el negocio esté listo, se activan en Vercel con:
 *   PAYMENTS_ENABLED=true
 *   NEXT_PUBLIC_ADS_ENABLED=true
 */
export const PAYMENTS_ENABLED = process.env.PAYMENTS_ENABLED === "true";
export const ADS_ENABLED = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";

