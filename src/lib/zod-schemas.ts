import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Minimum 6 caractères"),
});

export const patientSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  dateOfBirth: z.string().min(1, "Date de naissance requise"),
  gender: z.enum(["male", "female"]),
  phone: z.string().min(1, "Téléphone requis"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  profession: z.string().optional().or(z.literal("")),
  bloodGroup: z.string().optional().or(z.literal("")),
  allergies: z.string().optional().or(z.literal("")),
  medicalHistory: z.string().optional().or(z.literal("")),
  ongoingTreatments: z.string().optional().or(z.literal("")),
  insuranceCompany: z.string().optional().or(z.literal("")),
  insuranceNumber: z.string().optional().or(z.literal("")),
});

export const appointmentSchema = z.object({
  patientId: z.string().min(1, "Patient requis"),
  dentistId: z.string().min(1, "Dentiste requis"),
  date: z.string().min(1, "Date requise"),
  startTime: z.string().min(1, "Heure de début requise"),
  endTime: z.string().min(1, "Heure de fin requise"),
  reason: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description requise"),
  quantity: z.number().min(1, "Quantité minimale 1"),
  unitPrice: z.number().min(0, "Prix unitaire invalide"),
  total: z.number().min(0),
});

export const invoiceSchema = z.object({
  patientId: z.string().min(1, "Patient requis"),
  items: z.array(invoiceItemSchema).min(1, "Au moins un article"),
  dueDate: z.string().min(1, "Date d'échéance requise"),
  notes: z.string().optional().or(z.literal("")),
});

export const paymentSchema = z.object({
  invoiceId: z.string().min(1, "Facture requise"),
  amount: z.number().min(0.01, "Montant minimum 0.01"),
  method: z.enum(["cash", "card", "transfer", "insurance"]),
  date: z.string().min(1, "Date requise"),
  reference: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export const stockItemSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  reference: z.string().min(1, "Référence requise"),
  category: z.string().min(1, "Catégorie requise"),
  quantity: z.number().min(0, "Quantité invalide"),
  minThreshold: z.number().min(0, "Seuil invalide"),
  unitPrice: z.number().min(0, "Prix invalide"),
  supplierId: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
});

export const userSchema = z.object({
  email: z.string().email("Email invalide"),
  name: z.string().min(1, "Nom requis"),
  role: z.enum(["admin", "dentist", "secretary"]),
  phone: z.string().optional().or(z.literal("")),
  password: z.string().min(6, "Minimum 6 caractères"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type PatientFormData = z.infer<typeof patientSchema>;
export type AppointmentFormData = z.infer<typeof appointmentSchema>;
export type InvoiceFormData = z.infer<typeof invoiceSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;
export type StockItemFormData = z.infer<typeof stockItemSchema>;
export type UserFormData = z.infer<typeof userSchema>;
