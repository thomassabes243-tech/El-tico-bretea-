// Section 13: 10 categorías laborales para búsqueda y perfiles de trabajador.
export const LABOR_CATEGORIES = [
  { value: "CONSTRUCCION", label: "Construcción" },
  { value: "HOTELES_TURISMO", label: "Hoteles y turismo" },
  { value: "RESTAURANTES", label: "Restaurantes" },
  { value: "LIMPIEZA", label: "Limpieza" },
  { value: "TRANSPORTE", label: "Transporte" },
  { value: "SEGURIDAD", label: "Seguridad" },
  { value: "OFICINAS_ADMINISTRACION", label: "Oficinas y administración" },
  { value: "VENTAS_COMERCIO", label: "Ventas y comercio" },
  { value: "TECNOLOGIA", label: "Tecnología" },
  { value: "PROFESIONALES", label: "Profesionales" },
  { value: "SIN_ESPECIFICAR", label: "Sin especificar" },
] as const;

// Emojis para los chips de categoría de Inicio (referencia visual de
// Stitch) -- Seguridad queda afuera a propósito, sigue con el ícono de
// Lucide (ShieldCheck), tal como pide esa misma referencia.
export const CATEGORY_EMOJI: Partial<Record<string, string>> = {
  CONSTRUCCION: "🏗️",
  HOTELES_TURISMO: "🏨",
  RESTAURANTES: "🍴",
  LIMPIEZA: "🧹",
  TRANSPORTE: "🚚",
  OFICINAS_ADMINISTRACION: "🗂️",
  VENTAS_COMERCIO: "🛒",
  TECNOLOGIA: "💻",
  PROFESIONALES: "👔",
};

// Fotos reales (Adobe Stock, licenciadas para esta app) para las tarjetas de
// categoría de /buscar. SIN_ESPECIFICAR queda sin foto a propósito -- no hay
// una categoría real que fotografiar, sigue mostrando solo el ícono.
export const CATEGORY_PHOTOS: Partial<Record<string, string>> = {
  CONSTRUCCION: "/categorias/construccion.jpg",
  HOTELES_TURISMO: "/categorias/hoteles_turismo.jpg",
  RESTAURANTES: "/categorias/restaurantes.jpg",
  LIMPIEZA: "/categorias/limpieza.jpg",
  TRANSPORTE: "/categorias/transporte.jpg",
  SEGURIDAD: "/categorias/seguridad.jpg",
  OFICINAS_ADMINISTRACION: "/categorias/oficinas_administracion.jpg",
  VENTAS_COMERCIO: "/categorias/ventas_comercio.jpg",
  TECNOLOGIA: "/categorias/tecnologia.jpg",
  PROFESIONALES: "/categorias/profesionales.jpg",
};

export const JOB_TYPES = [
  { value: "TIEMPO_COMPLETO", label: "Tiempo completo" },
  { value: "MEDIO_TIEMPO", label: "Medio tiempo" },
  { value: "TEMPORAL", label: "Temporal" },
  { value: "POR_HORAS", label: "Por horas" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "SIN_ESPECIFICAR", label: "Sin especificar" },
] as const;

export const AVAILABILITY_OPTIONS = [
  { value: "INMEDIATA", label: "Inmediata" },
  { value: "UNA_SEMANA", label: "En una semana" },
  { value: "DOS_SEMANAS", label: "En dos semanas" },
  { value: "UN_MES", label: "En un mes" },
  { value: "A_CONVENIR", label: "A convenir" },
  { value: "SIN_ESPECIFICAR", label: "Sin especificar" },
] as const;

// Cotizaciones: categorías de servicio puntual, independientes de
// LABOR_CATEGORIES (esas son de la bolsa de empleo, estas de servicios).
export const SERVICE_CATEGORIES = [
  { value: "ELECTRICISTAS", label: "Electricistas", emoji: "⚡" },
  { value: "PLOMEROS", label: "Plomeros", emoji: "🔧" },
  { value: "ALBANILES", label: "Albañiles", emoji: "🧱" },
  { value: "PINTORES", label: "Pintores", emoji: "🎨" },
  { value: "JARDINEROS", label: "Jardineros", emoji: "🌳" },
  { value: "LIMPIEZA", label: "Limpieza", emoji: "🧹" },
  { value: "AIRE_ACONDICIONADO", label: "Aire acondicionado", emoji: "❄️" },
  { value: "MECANICOS", label: "Mecánicos", emoji: "🚗" },
  { value: "CARPINTEROS", label: "Carpinteros", emoji: "🪚" },
  { value: "TECNICOS_CELULARES", label: "Técnicos de celulares", emoji: "📱" },
  { value: "TECNICOS_COMPUTADORAS", label: "Técnicos de computadoras", emoji: "💻" },
  { value: "MUDANZAS", label: "Mudanzas", emoji: "🚚" },
  { value: "REPARACIONES", label: "Reparaciones", emoji: "👨‍🔧" },
  { value: "BELLEZA", label: "Belleza", emoji: "💇" },
  { value: "CUIDADO_MASCOTAS", label: "Cuidado de mascotas", emoji: "🐕" },
  { value: "CUIDADO_NINOS", label: "Cuidado de niños", emoji: "👶" },
  { value: "CLASES", label: "Clases", emoji: "📚" },
  { value: "FOTOGRAFIA", label: "Fotografía", emoji: "📸" },
  { value: "EVENTOS", label: "Eventos", emoji: "🎉" },
] as const;

export const CONTACT_EMAIL = "contacto@mexicosinhambre.com";

// Monetización: "Destacar oferta" (Etapa 2) -- pago único de la empresa vía
// PayPal para aparecer primero en los listados por FEATURED_DAYS días.
export const FEATURED_PRICE_USD = 2;
export const FEATURED_DAYS = 7;

// WhatsApp del creador de la app, para quien quiera escribirle directo.
export const CREATOR_WHATSAPP_HREF =
  "https://wa.me/5066322902?text=" +
  encodeURIComponent("Hola, quiero comunicarme con el creador de El Mexa Chamba.");

// Section 21: canal de alertas de estafas.
export const SCAM_ALERT_MODALITIES = [
  { value: "PRESENCIAL", label: "Presencial" },
  { value: "REMOTO", label: "Remoto" },
  { value: "AMBOS", label: "Presencial y remoto" },
] as const;

export const SCAM_ALERT_STATUS_LABELS: Record<string, string> = {
  SIN_VERIFICAR: "Sin verificar",
  VERIFICADO: "Verificado por moderación",
  DESCARTADO: "Descartado",
};
