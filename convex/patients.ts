import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let patients = await ctx.db.query("patients").collect();

    if (args.search) {
      const s = args.search.toLowerCase();
      patients = patients.filter(
        (p) =>
          p.lastName.toLowerCase().includes(s) ||
          p.firstName.toLowerCase().includes(s) ||
          p.phone.includes(s) ||
          (p.insuranceCompany && p.insuranceCompany.toLowerCase().includes(s))
      );
    }

    return patients.sort(
      (a, b) => (b._creationTime ?? 0) - (a._creationTime ?? 0)
    );
  },
});

export const getById = query({
  args: { id: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
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
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("patients", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("patients"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    profession: v.optional(v.string()),
    bloodGroup: v.optional(v.string()),
    allergies: v.optional(v.string()),
    medicalHistory: v.optional(v.string()),
    ongoingTreatments: v.optional(v.string()),
    insuranceCompany: v.optional(v.string()),
    insuranceNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("patients") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const count = query({
  handler: async (ctx) => {
    return (await ctx.db.query("patients").collect()).length;
  },
});
