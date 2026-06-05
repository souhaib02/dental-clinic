import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByPatient = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("medicalRecords")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("medicalRecords", args);
  },
});

export const getOdontogram = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("odontogramEntries")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .collect();
  },
});

export const upsertOdontogramEntry = mutation({
  args: {
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
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("odontogramEntries")
      .withIndex("by_patient_tooth", (q) =>
        q.eq("patientId", args.patientId).eq("toothNumber", args.toothNumber)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        notes: args.notes,
        treatment: args.treatment,
        date: new Date().toISOString(),
      });
      return existing._id;
    }

    return await ctx.db.insert("odontogramEntries", {
      ...args,
      date: new Date().toISOString(),
    });
  },
});

export const listTreatments = query({
  args: {
    patientId: v.optional(v.id("patients")),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let treatments = await ctx.db.query("treatments").collect();

    if (args.patientId) {
      treatments = treatments.filter((t) => t.patientId === args.patientId);
    }
    if (args.status) {
      treatments = treatments.filter((t) => t.status === args.status);
    }

    return treatments.sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  },
});

export const createTreatment = mutation({
  args: {
    patientId: v.id("patients"),
    name: v.string(),
    description: v.optional(v.string()),
    toothNumber: v.optional(v.number()),
    cost: v.number(),
    doctorId: v.id("users"),
    startDate: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("treatments", {
      ...args,
      status: "planned",
    });
  },
});

export const updateTreatment = mutation({
  args: {
    id: v.id("treatments"),
    status: v.optional(
      v.union(
        v.literal("planned"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
    endDate: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const listPrescriptions = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("prescriptions")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();
  },
});

export const createPrescription = mutation({
  args: {
    patientId: v.id("patients"),
    doctorId: v.id("users"),
    medication: v.string(),
    dosage: v.string(),
    frequency: v.string(),
    duration: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("prescriptions", {
      ...args,
      date: new Date().toISOString(),
    });
  },
});
