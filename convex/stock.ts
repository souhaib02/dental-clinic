import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listItems = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let items = await ctx.db.query("stockItems").collect();
    if (args.category) {
      items = items.filter((i) => i.category === args.category);
    }
    return items.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const getItem = query({
  args: { id: v.id("stockItems") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createItem = mutation({
  args: {
    name: v.string(),
    reference: v.string(),
    category: v.string(),
    quantity: v.number(),
    minThreshold: v.number(),
    unitPrice: v.number(),
    supplierId: v.optional(v.id("suppliers")),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("stockItems", args);
  },
});

export const updateItem = mutation({
  args: {
    id: v.id("stockItems"),
    name: v.optional(v.string()),
    reference: v.optional(v.string()),
    category: v.optional(v.string()),
    quantity: v.optional(v.number()),
    minThreshold: v.optional(v.number()),
    unitPrice: v.optional(v.number()),
    supplierId: v.optional(v.id("suppliers")),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const deleteItem = mutation({
  args: { id: v.id("stockItems") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const getLowStockItems = query({
  handler: async (ctx) => {
    const items = await ctx.db.query("stockItems").collect();
    return items.filter((i) => i.quantity <= i.minThreshold);
  },
});

export const recordMovement = mutation({
  args: {
    itemId: v.id("stockItems"),
    type: v.union(
      v.literal("purchase"),
      v.literal("return"),
      v.literal("consumption"),
      v.literal("loss")
    ),
    quantity: v.number(),
    notes: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Produit introuvable");

    let newQuantity = item.quantity;
    if (args.type === "purchase" || args.type === "return") {
      newQuantity += args.quantity;
    } else {
      newQuantity -= args.quantity;
    }

    await ctx.db.patch(args.itemId, { quantity: Math.max(0, newQuantity) });

    return await ctx.db.insert("stockMovements", {
      ...args,
      date: new Date().toISOString(),
    });
  },
});

export const listMovements = query({
  args: { itemId: v.optional(v.id("stockItems")) },
  handler: async (ctx, args) => {
    let movements = await ctx.db.query("stockMovements").collect();
    if (args.itemId) {
      movements = movements.filter((m) => m.itemId === args.itemId);
    }
    return movements.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },
});
