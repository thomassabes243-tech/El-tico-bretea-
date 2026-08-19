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
] as const;

const jobTypeValues = [
  "TIEMPO_COMPLETO",
  "MEDIO_TIEMPO",
  "TEMPORAL",
  "POR_HORAS",
  "FREELANCE",
] as const;

const availabilityValues = [
  "INMEDIATA",
  "UNA_SEMANA",
  "DOS_SEMANAS",
  "UN_MES",
  "A_CONVENIR",
] as const;

const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres");

const referenceSchema = z.object({
  name: z.string().min(1, "El nombre de la referencia es requerido"),
  company: z.string().min(1, "La empresa de la referencia es requerida"),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("Correo inválido").optional().or(z.literal("")),
});

export const workerRegistrationSchema = z.object({
  // Cuenta
  email: z.string().email("Correo inválido"),
  password: passwordSchema,

  // Identidad (Sección 2)
  fullName: z.string().min(2, "El nombre completo es requerido"),
  formalPhotoUrl: z.string().optional().or(z.literal("")),
  age: z.coerce.number().int().min(15, "Edad mínima 15 años").max(100),
  residence: z.string().min(2, "El lugar de residencia es requerido"),
  phone: z.string().optional().or(z.literal("")),
  whatsapp: z.string().optional().or(z.literal("")),

  // Profesión
  profession: z.string().min(2, "La profesión es requerida"),
  laborCategory: z.enum(laborCategoryValues),
  yearsExperience: z.coerce.number().int().min(0).max(60),
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
  availability: z.enum(availabilityValues),
  willingToRelocate: z.boolean().default(false),
  jobTypeSought: z.enum(jobTypeValues),
  salaryExpectation: z.string().optional().or(z.literal("")),

  // Referencias laborales
  references: z.array(referenceSchema).max(5).optional().default([]),
});

export type WorkerRegistrationInput = z.infer<typeof workerRegistrationSchema>;
export type WorkerRegistrationFormValues = z.input<typeof workerRegistrationSchema>;

export const companyRegistrationSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: passwordSchema,

  commercialName: z.string().min(2, "El nombre comercial es requerido"),
  legalId: z.string().min(2, "La identificación es requerida"),
  responsibleName: z.string().min(2, "El nombre del responsable es requerido"),
  contactPhone: z.string().optional().or(z.literal("")),
  contactEmail: z.string().email("Correo de contacto inválido"),
  location: z.string().min(2, "La ubicación es requerida"),
  activity: z.string().min(2, "La actividad comercial es requerida"),
  logoUrl: z.string().optional().or(z.literal("")),
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
    // Alias público opcional para el canal de alertas de estafas (Sección 21).
    alias: z.string().trim().max(60).optional().or(z.literal("")),
  });

export type WorkerProfileUpdateInput = z.infer<typeof workerProfileUpdateSchema>;
export type WorkerProfileUpdateFormValues = z.input<typeof workerProfileUpdateSchema>;

export const companyProfileUpdateSchema = companyRegistrationSchema
  .omit({ email: true, password: true })
  .extend({
    // Alias público opcional para el canal de alertas de estafas (Sección 21).
    alias: z.string().trim().max(60).optional().or(z.literal("")),
  });

export type CompanyProfileUpdateInput = z.infer<typeof companyProfileUpdateSchema>;

export const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const jobPostingSchema = z.object({
  title: z.string().min(3, "El título es requerido"),
  description: z.string().min(10, "Agregá una descripción del puesto"),
  laborCategory: z.enum(laborCategoryValues),
  location: z.string().min(2, "La ubicación es requerida"),
  contractType: z.enum(jobTypeValues),
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
});

export type ReportInput = z.infer<typeof reportSchema>;

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
