import { query } from "./_generated/server";

export const getStats = query({
  handler: async (ctx) => {
    const today = new Date().toISOString().split("T")[0];
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const todayAppointments = await ctx.db
      .query("appointments")
      .withIndex("by_date", (q) => q.eq("date", today))
      .collect();

    const patientsToday = todayAppointments.filter(
      (a) => a.status === "completed"
    ).length;

    const allAppointments = await ctx.db.query("appointments").collect();
    const upcomingAppointments = allAppointments.filter(
      (a) => a.date >= today && a.status !== "cancelled" && a.status !== "completed"
    ).length;

    const cancelledAppointments = todayAppointments.filter(
      (a) => a.status === "cancelled"
    ).length;

    const todayPayments = await ctx.db
      .query("payments")
      .withIndex("by_date", (q) => q.eq("date", today))
      .collect();
    const dailyRevenue = todayPayments.reduce((sum, p) => sum + p.amount, 0);

    const monthPayments = await ctx.db
      .query("payments")
      .filter((q) => q.gte(q.field("_creationTime"), new Date(firstDayOfMonth).getTime()))
      .collect();
    const monthlyRevenue = monthPayments.reduce((sum, p) => sum + p.amount, 0);

    const stockItems = await ctx.db.query("stockItems").collect();
    const lowStockItems = stockItems.filter((i) => i.quantity <= i.minThreshold).length;

    const allPayments = await ctx.db.query("payments").collect();
    const recentPayments = allPayments
      .sort((a, b) => (b._creationTime ?? 0) - (a._creationTime ?? 0))
      .slice(0, 5);

    return {
      todayAppointments: todayAppointments.length,
      patientsToday,
      upcomingAppointments,
      dailyRevenue,
      monthlyRevenue,
      lowStockItems,
      cancelledAppointments,
      recentPayments,
    };
  },
});

export const getRevenueData = query({
  handler: async (ctx) => {
    const payments = await ctx.db.query("payments").collect();
    const monthlyMap: Record<string, number> = {};

    payments.forEach((p) => {
      const month = p.date.substring(0, 7);
      monthlyMap[month] = (monthlyMap[month] || 0) + p.amount;
    });

    return Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => ({ month, revenue }));
  },
});

export const getAppointmentStats = query({
  handler: async (ctx) => {
    const appointments = await ctx.db.query("appointments").collect();
    const total = appointments.length;
    const completed = appointments.filter((a) => a.status === "completed").length;
    const cancelled = appointments.filter((a) => a.status === "cancelled").length;
    const noShow = appointments.filter((a) => a.status === "cancelled").length;

    return {
      total,
      completed,
      cancelled,
      noShow,
      attendanceRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  },
});

export const getTreatmentStats = query({
  handler: async (ctx) => {
    const treatments = await ctx.db.query("treatments").collect();
    const treatmentCounts: Record<string, number> = {};
    const treatmentRevenue: Record<string, number> = {};

    treatments
      .filter((t) => t.status === "completed")
      .forEach((t) => {
        treatmentCounts[t.name] = (treatmentCounts[t.name] || 0) + 1;
        treatmentRevenue[t.name] = (treatmentRevenue[t.name] || 0) + t.cost;
      });

    const topTreatments = Object.entries(treatmentCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(10)
      .map(([name, count]) => ({ name, count, revenue: treatmentRevenue[name] || 0 }));

    return topTreatments;
  },
});
