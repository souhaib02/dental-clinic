import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    patientId: v.optional(v.id("patients")),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let invoices = await ctx.db.query("invoices").collect();

    if (args.patientId) {
      invoices = invoices.filter((i) => i.patientId === args.patientId);
    }
    if (args.status) {
      invoices = invoices.filter((i) => i.status === args.status);
    }

    return invoices.sort(
      (a, b) => new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime()
    );
  },
});

export const getById = query({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    patientId: v.id("patients"),
    items: v.array(
      v.object({
        description: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
        total: v.number(),
      })
    ),
    dueDate: v.string(),
    notes: v.optional(v.string()),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const subtotal = args.items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.0;
    const total = subtotal + tax;

    const count = (await ctx.db.query("invoices").collect()).length;
    const invoiceNumber = `FAC-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    return await ctx.db.insert("invoices", {
      patientId: args.patientId,
      invoiceNumber,
      items: args.items,
      subtotal,
      tax,
      total,
      paidAmount: 0,
      status: "unpaid",
      dueDate: args.dueDate,
      issuedDate: new Date().toISOString(),
      notes: args.notes,
      createdBy: args.createdBy,
    });
  },
});

export const getUnpaidInvoices = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("invoices")
      .filter((q) => q.neq(q.field("status"), "paid"))
      .collect();
  },
});

export const getInvoiceStats = query({
  handler: async (ctx) => {
    const invoices = await ctx.db.query("invoices").collect();
    const totalDue = invoices
      .filter((i) => i.status !== "paid")
      .reduce((sum, i) => sum + (i.total - i.paidAmount), 0);
    const totalBilled = invoices.reduce((sum, i) => sum + i.total, 0);
    const totalPaid = invoices.reduce((sum, i) => sum + i.paidAmount, 0);

    return { totalDue, totalBilled, totalPaid, count: invoices.length };
  },
});
