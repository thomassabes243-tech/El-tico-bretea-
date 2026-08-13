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
  phone: z.string().min(8, "Teléfono inválido"),
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
  contactPhone: z.string().min(8, "Teléfono inválido"),
  contactEmail: z.string().email("Correo de contacto inválido"),
  location: z.string().min(2, "La ubicación es requerida"),
  activity: z.string().min(2, "La actividad comercial es requerida"),
  logoUrl: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
});

export type CompanyRegistrationInput = z.infer<typeof companyRegistrationSchema>;

export const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export type LoginInput = z.infer<typeof loginSchema>;
