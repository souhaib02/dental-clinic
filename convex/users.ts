import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "dental-clinic-salt");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByRole = query({
  args: { role: v.union(v.literal("admin"), v.literal("dentist"), v.literal("secretary")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), args.role))
      .collect();
  },
});

export const create = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("dentist"), v.literal("secretary")),
    phone: v.optional(v.string()),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const passwordHash = await hashPassword(args.password);

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) throw new Error("Un utilisateur avec cet email existe déjà");

    return await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      role: args.role,
      phone: args.phone,
      isActive: true,
      passwordHash,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("users"),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("dentist"), v.literal("secretary"))),
    phone: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    password: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, password, ...fields } = args;
    const updateData: Record<string, unknown> = { ...fields };
    if (password) {
      updateData.passwordHash = await hashPassword(password);
    }
    await ctx.db.patch(id, updateData);
  },
});

export const remove = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isActive: false });
  },
});

export const getActiveDentists = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.and(
        q.eq(q.field("role"), "dentist"),
        q.eq(q.field("isActive"), true)
      ))
      .collect();
  },
});
