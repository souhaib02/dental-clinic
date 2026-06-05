import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    date: v.optional(v.string()),
    dentistId: v.optional(v.id("users")),
    status: v.optional(v.string()),
    patientId: v.optional(v.id("patients")),
  },
  handler: async (ctx, args) => {
    let appointments = await ctx.db.query("appointments").collect();

    if (args.date) {
      appointments = appointments.filter((a) => a.date === args.date);
    }
    if (args.dentistId) {
      appointments = appointments.filter((a) => a.dentistId === args.dentistId);
    }
    if (args.status) {
      appointments = appointments.filter((a) => a.status === args.status);
    }
    if (args.patientId) {
      appointments = appointments.filter((a) => a.patientId === args.patientId);
    }

    return appointments.sort((a, b) => a.startTime.localeCompare(b.startTime));
  },
});

export const getById = query({
  args: { id: v.id("appointments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    patientId: v.id("patients"),
    dentistId: v.id("users"),
    date: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    reason: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("scheduled"),
        v.literal("confirmed"),
        v.literal("pending"),
        v.literal("cancelled"),
        v.literal("completed")
      )
    ),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("appointments", {
      ...args,
      status: args.status ?? "scheduled",
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("appointments"),
    patientId: v.optional(v.id("patients")),
    dentistId: v.optional(v.id("users")),
    date: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("scheduled"),
        v.literal("confirmed"),
        v.literal("pending"),
        v.literal("cancelled"),
        v.literal("completed")
      )
    ),
    reason: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("appointments") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const getUpcoming = query({
  args: { dentistId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];
    let appointments = await ctx.db
      .query("appointments")
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), today),
          q.neq(q.field("status"), "cancelled"),
          q.neq(q.field("status"), "completed")
        )
      )
      .collect();

    if (args.dentistId) {
      appointments = appointments.filter((a) => a.dentistId === args.dentistId);
    }

    return appointments.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  },
});

export const getTodayAppointments = query({
  args: { dentistId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];
    let appointments = await ctx.db
      .query("appointments")
      .withIndex("by_date", (q) => q.eq("date", today))
      .collect();

    if (args.dentistId) {
      appointments = appointments.filter((a) => a.dentistId === args.dentistId);
    }

    return appointments.sort((a, b) => a.startTime.localeCompare(b.startTime));
  },
});

export const getByDateRange = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
    dentistId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let appointments = await ctx.db.query("appointments").collect();
    appointments = appointments.filter(
      (a) => a.date >= args.startDate && a.date <= args.endDate
    );
    if (args.dentistId) {
      appointments = appointments.filter((a) => a.dentistId === args.dentistId);
    }
    return appointments.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  },
});
