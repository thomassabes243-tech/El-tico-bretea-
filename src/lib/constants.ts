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

// Section 9: comunidades de chat por gremio.
export const COMMUNITY_CATEGORIES = [
  { value: "CONSTRUCCION", label: "Construcción" },
  { value: "HOTELES_TURISMO", label: "Hoteles y turismo" },
  { value: "PROFESIONALES", label: "Profesionales" },
] as const;

export const CONTACT_EMAIL = "contacto@mexicosinhambre.com";

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
