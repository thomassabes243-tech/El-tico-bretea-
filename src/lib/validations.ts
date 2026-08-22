import { z } from "zod";

const laborCategoryValues = [
  "CONSTRUCCION",
  "HOTELES_TURISMO",
  "RESTAURANTES",
  "LIMPIEZA",
  "TRANSPORTE",
  "SEGURIDAD",
  "OFICINAS_ADMINISTRACION",
  "VENTAS_COMERCIO",
  "TECNOLOGIA",
  "PROFESIONALES",
  "SIN_ESPECIFICAR",
] as const;

const jobTypeValues = [
  "TIEMPO_COMPLETO",
  "MEDIO_TIEMPO",
  "TEMPORAL",
  "POR_HORAS",
  "FREELANCE",
  "SIN_ESPECIFICAR",
] as const;

const availabilityValues = [
  "INMEDIATA",
  "UNA_SEMANA",
  "DOS_SEMANAS",
  "UN_MES",
  "A_CONVENIR",
  "SIN_ESPECIFICAR",
] as const;

const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres");

// Casilla numérica opcional: "" o undefined pasan como "sin llenar" en vez
// de fallar la validación por no ser un número.
function optionalInt(min: number, max: number) {
  return z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : val),
    z.coerce.number().int().min(min).max(max).optional()
  );
}

const referenceSchema = z.object({
  name: z.string().min(1, "El nombre de la referencia es requerido"),
  company: z.string().min(1, "La empresa de la referencia es requerida"),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("Correo inválido").optional().or(z.literal("")),
});

export const workerRegistrationSchema = z.object({
  // Cuenta -- lo único obligatorio: sin esto no hay forma de volver a
  // entrar a la cuenta.
  email: z.string().email("Correo inválido"),
  password: passwordSchema,

  // Huella de dispositivo (Sección 22, opcional): hash calculado en el
  // navegador para detectar cuentas duplicadas obvias -- ver src/lib/safety.ts.
  deviceFingerprint: z.string().max(200).optional().or(z.literal("")),

  // Identidad (Sección 2) -- todo opcional, se puede completar después.
  fullName: z.string().optional().or(z.literal("")),
  age: optionalInt(15, 100),
  residence: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  whatsapp: z.string().optional().or(z.literal("")),

  // Profesión
  profession: z.string().optional().or(z.literal("")),
  laborCategory: z.enum(laborCategoryValues).optional().or(z.literal("")),
  yearsExperience: optionalInt(0, 60),
  workExperience: z.string().optional().or(z.literal("")),
  companiesWorkedAt: z.string().optional().or(z.literal("")),
  previousPositions: z.string().optional().or(z.literal("")),

  // Estudios
  education: z.string().optional().or(z.literal("")),
  degrees: z.string().optional().or(z.literal("")),
  courses: z.string().optional().or(z.literal("")),
  certifications: z.string().optional().or(z.literal("")),

  // Habilidades
  skills: z.string().optional().or(z.literal("")),
  languages: z.string().optional().or(z.literal("")),

  // Disponibilidad
  availability: z.enum(availabilityValues).optional().or(z.literal("")),
  willingToRelocate: z.boolean().default(false),
  jobTypeSought: z.enum(jobTypeValues).optional().or(z.literal("")),
  salaryExpectation: z.string().optional().or(z.literal("")),

  // Referencias laborales
  references: z.array(referenceSchema).max(5).optional().default([]),
});

export type WorkerRegistrationInput = z.infer<typeof workerRegistrationSchema>;
export type WorkerRegistrationFormValues = z.input<typeof workerRegistrationSchema>;

export const companyRegistrationSchema = z.object({
  // Lo único obligatorio: sin esto no hay forma de volver a entrar a la
  // cuenta. Todo el resto del perfil de empresa es opcional.
  email: z.string().email("Correo inválido"),
  password: passwordSchema,

  deviceFingerprint: z.string().max(200).optional().or(z.literal("")),

  commercialName: z.string().optional().or(z.literal("")),
  legalId: z.string().optional().or(z.literal("")),
  responsibleName: z.string().optional().or(z.literal("")),
  contactPhone: z.string().optional().or(z.literal("")),
  contactEmail: z.string().email("Correo de contacto inválido").optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  activity: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
});

export type CompanyRegistrationInput = z.infer<typeof companyRegistrationSchema>;

export const workerProfileUpdateSchema = workerRegistrationSchema
  .omit({ email: true, password: true })
  .extend({
    isPublic: z.boolean().default(true),
    showPhone: z.boolean().default(false),
    showWhatsapp: z.boolean().default(false),
    showEmail: z.boolean().default(false),
    showSalaryExpectation: z.boolean().default(false),
    chatAlias: z.string().max(40, "Máximo 40 caracteres").optional().or(z.literal("")),
  });

export type WorkerProfileUpdateInput = z.infer<typeof workerProfileUpdateSchema>;
export type WorkerProfileUpdateFormValues = z.input<typeof workerProfileUpdateSchema>;

export const companyProfileUpdateSchema = companyRegistrationSchema
  .omit({
    email: true,
    password: true,
  })
  .extend({
    chatAlias: z.string().max(40, "Máximo 40 caracteres").optional().or(z.literal("")),
  });

export type CompanyProfileUpdateInput = z.infer<typeof companyProfileUpdateSchema>;

export const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const jobPostingSchema = z.object({
  // Todo opcional -- se puede completar o corregir después de publicar.
  title: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  laborCategory: z.enum(laborCategoryValues).optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  contractType: z.enum(jobTypeValues).optional().or(z.literal("")),
  quantity: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : val),
    z.coerce
      .number("Ingresá un número válido")
      .int()
      .min(1, "Debe ser al menos 1")
      .max(999, "Máximo 999")
      .optional()
  ),
  salary: z.string().optional().or(z.literal("")),
  schedule: z.string().optional().or(z.literal("")),
  experienceRequired: z.string().optional().or(z.literal("")),
  educationRequired: z.string().optional().or(z.literal("")),
  requirements: z.string().optional().or(z.literal("")),
  whatsapp: z.string().optional().or(z.literal("")),
  contactEmail: z.string().email("Correo inválido").optional().or(z.literal("")),
  deadline: z.string().optional().or(z.literal("")),
});

export type JobPostingInput = z.infer<typeof jobPostingSchema>;
export type JobPostingFormValues = z.input<typeof jobPostingSchema>;

export const chatMessageSchema = z.object({
  content: z.string().trim().min(1).max(2000),
});

export const reportSchema = z.object({
  targetUserId: z.string().min(1),
  targetType: z.enum(["USER", "COMPANY", "JOB_POSTING"]),
  reason: z.string().trim().min(5, "Contanos brevemente el motivo").max(500),
  severity: z.enum(["NORMAL", "GRAVE"]).default("NORMAL"),
});

export type ReportInput = z.infer<typeof reportSchema>;

// Sección 22: contactos de confianza, ubicación y botón de pánico.
export const trustedContactSchema = z.object({
  name: z.string().trim().min(2, "Ingresá un nombre").max(80),
  phone: z.string().trim().min(7, "Ingresá un teléfono válido").max(20),
});

export type TrustedContactInput = z.infer<typeof trustedContactSchema>;

export const locationShareSchema = z.object({
  trustedContactId: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().min(0).optional(),
});

export type LocationShareInput = z.infer<typeof locationShareSchema>;

export const panicAlertSchema = z.object({
  trustedContactId: z.string().min(1).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export type PanicAlertInput = z.infer<typeof panicAlertSchema>;

// No se valida el "tono" del título ni de los campos de texto acá a
// propósito: frases de alerta como "⚠️ Estafa" tienen que poder publicarse
// tal cual, es el propósito del canal. Solo se valida longitud mínima/máxima.
export const scamAlertSchema = z.object({
  title: z.string().trim().min(3, "El título es requerido").max(120),
  offerDescription: z.string().trim().min(10, "Describí la oferta o empresa").max(1000),
  suspicionReason: z.string().trim().min(10, "Contanos por qué sospechás").max(1000),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  modality: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : val),
    z.enum(["PRESENCIAL", "REMOTO", "AMBOS"]).optional()
  ),
});

export type ScamAlertInput = z.infer<typeof scamAlertSchema>;
export type ScamAlertFormValues = z.input<typeof scamAlertSchema>;

export const scamAlertFlagSchema = z.object({
  reason: z.string().trim().min(5, "Contanos brevemente el motivo").max(500),
});

export type ScamAlertFlagInput = z.infer<typeof scamAlertFlagSchema>;
