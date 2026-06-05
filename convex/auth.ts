import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "dental-clinic-salt");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const login = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) throw new Error("Email ou mot de passe incorrect");
    if (!user.isActive) throw new Error("Compte désactivé");

    const hash = await hashPassword(args.password);
    if (hash !== user.passwordHash) throw new Error("Email ou mot de passe incorrect");

    await ctx.db.patch(user._id, { lastLogin: Date.now() });

    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      isActive: user.isActive,
    };
  },
});

export const getCurrentUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
    };
  },
});
