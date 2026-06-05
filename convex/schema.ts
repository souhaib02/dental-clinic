import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("dentist"), v.literal("secretary")),
    phone: v.optional(v.string()),
    isActive: v.boolean(),
    lastLogin: v.optional(v.number()),
    passwordHash: v.string(),
  }).index("by_email", ["email"]),

  patients: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.string(),
    gender: v.union(v.literal("male"), v.literal("female")),
    phone: v.string(),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    profession: v.optional(v.string()),
    bloodGroup: v.optional(v.string()),
    allergies: v.optional(v.string()),
    medicalHistory: v.optional(v.string()),
    ongoingTreatments: v.optional(v.string()),
    insuranceCompany: v.optional(v.string()),
    insuranceNumber: v.optional(v.string()),
    avatar: v.optional(v.id("_storage")),
    createdBy: v.id("users"),
  })
    .index("by_name", ["lastName", "firstName"])
    .index("by_phone", ["phone"])
    .index("by_createdBy", ["createdBy"]),

  appointments: defineTable({
    patientId: v.id("patients"),
    dentistId: v.id("users"),
    date: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    status: v.union(
      v.literal("scheduled"),
      v.literal("confirmed"),
      v.literal("pending"),
      v.literal("cancelled"),
      v.literal("completed")
    ),
    reason: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdBy: v.id("users"),
  })
    .index("by_date", ["date"])
    .index("by_patient", ["patientId"])
    .index("by_dentist", ["dentistId"])
    .index("by_status", ["status"])
    .index("by_dentist_date", ["dentistId", "date"]),

  odontogramEntries: defineTable({
    patientId: v.id("patients"),
    toothNumber: v.number(),
    status: v.union(
      v.literal("healthy"),
      v.literal("decayed"),
      v.literal("filled"),
      v.literal("crowned"),
      v.literal("extracted"),
      v.literal("root_canal"),
      v.literal("implant"),
      v.literal("bridge"),
      v.literal("missing")
    ),
    notes: v.optional(v.string()),
    treatment: v.optional(v.string()),
    date: v.string(),
    createdBy: v.id("users"),
  })
    .index("by_patient", ["patientId"])
    .index("by_patient_tooth", ["patientId", "toothNumber"]),

  medicalRecords: defineTable({
    patientId: v.id("patients"),
    type: v.union(
      v.literal("diagnosis"),
      v.literal("clinical_note"),
      v.literal("prescription"),
      v.literal("treatment_plan")
    ),
    title: v.string(),
    description: v.optional(v.string()),
    doctorId: v.id("users"),
    date: v.string(),
    attachments: v.optional(v.array(v.id("_storage"))),
  })
    .index("by_patient", ["patientId"])
    .index("by_patient_date", ["patientId", "date"]),

  treatments: defineTable({
    patientId: v.id("patients"),
    name: v.string(),
    description: v.optional(v.string()),
    toothNumber: v.optional(v.number()),
    cost: v.number(),
    status: v.union(
      v.literal("planned"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    doctorId: v.id("users"),
    notes: v.optional(v.string()),
  })
    .index("by_patient", ["patientId"])
    .index("by_doctor", ["doctorId"])
    .index("by_status", ["status"]),

  prescriptions: defineTable({
    patientId: v.id("patients"),
    doctorId: v.id("users"),
    medication: v.string(),
    dosage: v.string(),
    frequency: v.string(),
    duration: v.string(),
    notes: v.optional(v.string()),
    date: v.string(),
  })
    .index("by_patient", ["patientId"])
    .index("by_doctor", ["doctorId"]),

  invoices: defineTable({
    patientId: v.id("patients"),
    invoiceNumber: v.string(),
    items: v.array(
      v.object({
        description: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
        total: v.number(),
      })
    ),
    subtotal: v.number(),
    tax: v.number(),
    total: v.number(),
    paidAmount: v.number(),
    status: v.union(v.literal("partial"), v.literal("paid"), v.literal("unpaid")),
    dueDate: v.string(),
    issuedDate: v.string(),
    notes: v.optional(v.string()),
    createdBy: v.id("users"),
  })
    .index("by_patient", ["patientId"])
    .index("by_status", ["status"])
    .index("by_number", ["invoiceNumber"])
    .index("by_issuedDate", ["issuedDate"]),

  payments: defineTable({
    invoiceId: v.id("invoices"),
    patientId: v.id("patients"),
    amount: v.number(),
    method: v.union(
      v.literal("cash"),
      v.literal("card"),
      v.literal("transfer"),
      v.literal("insurance")
    ),
    date: v.string(),
    reference: v.optional(v.string()),
    notes: v.optional(v.string()),
    receivedBy: v.id("users"),
  })
    .index("by_invoice", ["invoiceId"])
    .index("by_patient", ["patientId"])
    .index("by_date", ["date"]),

  insuranceClaims: defineTable({
    patientId: v.id("patients"),
    invoiceId: v.id("invoices"),
    insuranceCompany: v.string(),
    claimAmount: v.number(),
    coveredAmount: v.number(),
    remainingAmount: v.number(),
    status: v.union(
      v.literal("submitted"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("paid")
    ),
    submissionDate: v.string(),
    approvalDate: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index("by_patient", ["patientId"])
    .index("by_status", ["status"]),

  stockItems: defineTable({
    name: v.string(),
    reference: v.string(),
    category: v.string(),
    quantity: v.number(),
    minThreshold: v.number(),
    unitPrice: v.number(),
    supplierId: v.optional(v.id("suppliers")),
    description: v.optional(v.string()),
  })
    .index("by_reference", ["reference"])
    .index("by_category", ["category"])
    .index("by_quantity", ["quantity"]),

  stockMovements: defineTable({
    itemId: v.id("stockItems"),
    type: v.union(
      v.literal("purchase"),
      v.literal("return"),
      v.literal("consumption"),
      v.literal("loss")
    ),
    quantity: v.number(),
    date: v.string(),
    notes: v.optional(v.string()),
    userId: v.id("users"),
  })
    .index("by_item", ["itemId"])
    .index("by_date", ["date"]),

  suppliers: defineTable({
    name: v.string(),
    contact: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
  }),

  notifications: defineTable({
    type: v.union(
      v.literal("stock_alert"),
      v.literal("payment"),
      v.literal("appointment"),
      v.literal("system")
    ),
    title: v.string(),
    message: v.string(),
    read: v.boolean(),
    userId: v.optional(v.id("users")),
    link: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_read", ["read"])
    .index("by_type", ["type"]),

  auditLogs: defineTable({
    userId: v.id("users"),
    action: v.string(),
    resource: v.string(),
    resourceId: v.optional(v.string()),
    details: v.optional(v.string()),
    ip: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_action", ["action"])
    .index("by_resource", ["resource"]),
});
