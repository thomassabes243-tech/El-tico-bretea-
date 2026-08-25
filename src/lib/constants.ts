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

// Section 9: comunidad de chat -- una sola sala general para todos los
// gremios (antes eran 3 salas separadas por rubro). El valor interno sigue
// siendo CONSTRUCCION (así queda el ChatRoom en la base), pero ya no se
// muestra como tal en ningún lado -- ver migración single_community_room.
export const COMMUNITY_CATEGORIES = [
  { value: "CONSTRUCCION", label: "Comunidad Tica" },
] as const;

// Foto real por categoría laboral (Adobe Stock, licenciadas), usada como
// fondo de las tarjetas de categoría en Inicio, Buscar y Comunidad.
// SIN_ESPECIFICAR no tiene foto -- esas tarjetas siguen mostrando solo el
// ícono, porque no hay una categoría real que fotografiar.
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

export const CONTACT_EMAIL = "tg321920@gmail.com";
