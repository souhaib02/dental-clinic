import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    patientId: v.optional(v.id("patients")),
    invoiceId: v.optional(v.id("invoices")),
  },
  handler: async (ctx, args) => {
    let payments = await ctx.db.query("payments").collect();

    if (args.patientId) {
      payments = payments.filter((p) => p.patientId === args.patientId);
    }
    if (args.invoiceId) {
      payments = payments.filter((p) => p.invoiceId === args.invoiceId);
    }

    return payments.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },
});

export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const paymentId = await ctx.db.insert("payments", args);
    const invoice = await ctx.db.get(args.invoiceId);
    if (!invoice) throw new Error("Facture introuvable");

    const newPaidAmount = invoice.paidAmount + args.amount;
    const newStatus = newPaidAmount >= invoice.total ? "paid" : "partial";

    await ctx.db.patch(args.invoiceId, {
      paidAmount: newPaidAmount,
      status: newStatus,
    });

    return paymentId;
  },
});
