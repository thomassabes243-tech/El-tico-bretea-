// Todos los formularios de registro, edición de perfil y publicar vacante son
// opcionales salvo correo/contraseña. La base de datos igual necesita un
// valor válido en columnas de texto/número/categoría -- estas funciones
// convierten "campo vacío" en un valor de respaldo neutro, sin bloquear el
// envío del formulario ni inventar datos que parezcan reales.
export const NOT_SPECIFIED_TEXT = "Sin especificar";
export const NOT_SPECIFIED_ENUM = "SIN_ESPECIFICAR";

export function textOrDefault(value: string | undefined | null): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : NOT_SPECIFIED_TEXT;
}

export function enumOrDefault<T extends string>(value: T | "" | undefined | null): T {
  return (value ? value : NOT_SPECIFIED_ENUM) as T;
}

export function numberOrDefault(value: number | undefined | null, fallback = 0): number {
  return value ?? fallback;
}
