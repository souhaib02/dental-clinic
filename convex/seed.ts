import { mutation } from "./_generated/server";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "dental-clinic-salt");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const seed = mutation({
  handler: async (ctx) => {
    const existingUsers = await ctx.db.query("users").collect();
    if (existingUsers.length > 0) return { message: "Data already seeded" };

    const hash = await hashPassword("admin123");

    const adminId = await ctx.db.insert("users", {
      email: "admin@cabinet.com",
      name: "Dr. Admin",
      role: "admin",
      phone: "+212600000000",
      isActive: true,
      passwordHash: hash,
    });

    const dentist1Id = await ctx.db.insert("users", {
      email: "dentist@cabinet.com",
      name: "Dr. Karim Benali",
      role: "dentist",
      phone: "+212600000001",
      isActive: true,
      passwordHash: hash,
    });

    const dentist2Id = await ctx.db.insert("users", {
      email: "dentiste2@cabinet.com",
      name: "Dr. Sarah El Idrissi",
      role: "dentist",
      phone: "+212600000002",
      isActive: true,
      passwordHash: hash,
    });

    await ctx.db.insert("users", {
      email: "secretaire@cabinet.com",
      name: "Fatima Zahra Alaoui",
      role: "secretary",
      phone: "+212600000003",
      isActive: true,
      passwordHash: hash,
    });

    const patients = [
      { firstName: "Ahmed", lastName: "Bennani", phone: "+212611111111", gender: "male" as const, dateOfBirth: "1985-03-15", profession: "Ingénieur", insuranceCompany: "CNSS", insuranceNumber: "CNSS-12345", email: "ahmed.bennani@email.com" },
      { firstName: "Sara", lastName: "Fassi", phone: "+212622222222", gender: "female" as const, dateOfBirth: "1990-07-22", profession: "Enseignante", insuranceCompany: "CMIM", insuranceNumber: "CMIM-67890", email: "sara.fassi@email.com" },
      { firstName: "Mohamed", lastName: "Tazi", phone: "+212633333333", gender: "male" as const, dateOfBirth: "1978-11-08", profession: "Médecin", insuranceCompany: "CIMR", email: "mohamed.tazi@email.com" },
      { firstName: "Fatima", lastName: "Zahra", phone: "+212644444444", gender: "female" as const, dateOfBirth: "1995-05-30", profession: "Avocate", email: "fatima.zahra@email.com" },
      { firstName: "Youssef", lastName: "El Amrani", phone: "+212655555555", gender: "male" as const, dateOfBirth: "2000-01-14", profession: "Étudiant", insuranceCompany: "CNSS", email: "youssef.amrani@email.com" },
      { firstName: "Amina", lastName: "Berrada", phone: "+212666666666", gender: "female" as const, dateOfBirth: "1982-09-19", profession: "Architecte", email: "amina.berrada@email.com" },
      { firstName: "Hassan", lastName: "Ouazzani", phone: "+212677777777", gender: "male" as const, dateOfBirth: "1970-12-05", profession: "Commerçant", insuranceCompany: "CMIM", email: "hassan.ouazzani@email.com" },
      { firstName: "Nadia", lastName: "Chafik", phone: "+212688888888", gender: "female" as const, dateOfBirth: "2002-08-16", profession: "Étudiante", email: "nadia.chafik@email.com" },
      { firstName: "Omar", lastName: "Idrissi", phone: "+212699999999", gender: "male" as const, dateOfBirth: "1965-04-25", profession: "Retraité", insuranceCompany: "CIMR", insuranceNumber: "CIMR-54321", email: "omar.idrissi@email.com" },
      { firstName: "Leila", lastName: "Mansouri", phone: "+212610101010", gender: "female" as const, dateOfBirth: "1993-10-10", profession: "Pharmacienne", email: "leila.mansouri@email.com" },
    ];

    const patientIds: string[] = [];
    for (const p of patients) {
      const id = await ctx.db.insert("patients", {
        ...p,
        address: `${Math.floor(Math.random() * 100) + 1} Rue ${["Mohamed V", "Hassan II", "La liberté", "Fès", "Marrakech", "Rabat"][Math.floor(Math.random() * 6)]}, Casablanca`,
        bloodGroup: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"][Math.floor(Math.random() * 8)],
        allergies: Math.random() > 0.7 ? "Pénicilline" : undefined,
        createdBy: adminId,
      });
      patientIds.push(id);
    }

    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    for (let i = 0; i < 5; i++) {
      await ctx.db.insert("appointments", {
        patientId: patientIds[i] as any,
        dentistId: i % 2 === 0 ? dentist1Id : dentist2Id,
        date: today,
        startTime: `${9 + i}:00`,
        endTime: `${9 + i + 1}:00`,
        status: i < 3 ? "confirmed" : "scheduled",
        reason: ["Détartrage", "Carie", "Contrôle", "Prothèse", "Extraction"][i],
        createdBy: adminId,
      });
    }

    for (let i = 0; i < 3; i++) {
      await ctx.db.insert("appointments", {
        patientId: patientIds[i + 5] as any,
        dentistId: dentist1Id,
        date: tomorrow,
        startTime: `${10 + i}:00`,
        endTime: `${11 + i}:00`,
        status: "scheduled",
        reason: ["Détartrage", "Carie", "Contrôle"][i],
        createdBy: adminId,
      });
    }

    await ctx.db.insert("appointments", {
      patientId: patientIds[9] as any,
      dentistId: dentist1Id,
      date: yesterday,
      startTime: "14:00",
      endTime: "15:00",
      status: "completed",
      reason: "Extraction dent de sagesse",
      createdBy: adminId,
    });

    await ctx.db.insert("appointments", {
      patientId: patientIds[0] as any,
      dentistId: dentist2Id,
      date: today,
      startTime: "11:00",
      endTime: "12:00",
      status: "cancelled",
      reason: "Urgence",
      createdBy: adminId,
    });

    const toothNumbers = Array.from({ length: 32 }, (_, i) => i + 11).filter(n => n % 10 <= 8 || n > 100);
    const allTeeth = [11, 12, 13, 14, 15, 16, 17, 18, 21, 22, 23, 24, 25, 26, 27, 28, 31, 32, 33, 34, 35, 36, 37, 38, 41, 42, 43, 44, 45, 46, 47, 48];
    for (const pid of patientIds.slice(0, 3)) {
      for (let i = 0; i < 5; i++) {
        await ctx.db.insert("odontogramEntries", {
          patientId: pid as any,
          toothNumber: allTeeth[Math.floor(Math.random() * allTeeth.length)],
          status: ["healthy", "filled", "decayed", "crowned", "missing"][Math.floor(Math.random() * 5)] as any,
          date: new Date().toISOString(),
          createdBy: dentist1Id,
        });
      }
    }

    await ctx.db.insert("medicalRecords", {
      patientId: patientIds[0] as any,
      type: "diagnosis",
      title: "Carie dentaire multiple",
      description: "Présence de caries sur les molaires inférieures nécessitant un traitement",
      doctorId: dentist1Id,
      date: yesterday,
    });

    await ctx.db.insert("treatments", {
      patientId: patientIds[0] as any,
      name: "Traitement de carie",
      description: "Traitement des caries sur 36 et 37",
      cost: 800,
      status: "completed",
      startDate: yesterday,
      endDate: yesterday,
      doctorId: dentist1Id,
      toothNumber: 36,
    });

    await ctx.db.insert("treatments", {
      patientId: patientIds[0] as any,
      name: "Dévitalisation",
      cost: 1500,
      status: "planned",
      startDate: tomorrow,
      doctorId: dentist1Id,
      toothNumber: 26,
    });

    await ctx.db.insert("prescriptions", {
      patientId: patientIds[0] as any,
      doctorId: dentist1Id,
      medication: "Amoxicilline 500mg",
      dosage: "1 gélule",
      frequency: "3 fois par jour",
      duration: "7 jours",
      notes: "Prendre après les repas",
      date: yesterday,
    });

    await ctx.db.insert("prescriptions", {
      patientId: patientIds[1] as any,
      doctorId: dentist2Id,
      medication: "Ibuprofène 400mg",
      dosage: "1 comprimé",
      frequency: "Si douleur",
      duration: "5 jours max",
      date: yesterday,
    });

    for (let i = 0; i < 5; i++) {
      const total = Math.floor(Math.random() * 2000) + 500;
      const paid = i < 3 ? total : Math.floor(total * 0.3);
      await ctx.db.insert("invoices", {
        patientId: patientIds[i] as any,
        invoiceNumber: `FAC-${new Date().getFullYear()}-${String(i + 1).padStart(4, "0")}`,
        items: [
          { description: ["Consultation", "Détartrage", "Extraction", "Traitement carie", "Prothèse"][i], quantity: 1, unitPrice: total, total },
        ],
        subtotal: total,
        tax: 0,
        total,
        paidAmount: paid,
        status: i < 3 ? "paid" : "partial",
        dueDate: new Date(Date.now() + 30 * 86400000 * (i + 1)).toISOString().split("T")[0],
        issuedDate: new Date(Date.now() - i * 86400000).toISOString().split("T")[0],
        createdBy: adminId,
      });
    }

    await ctx.db.insert("payments", {
      invoiceId: (await ctx.db.query("invoices").collect())[0]._id,
      patientId: patientIds[0] as any,
      amount: 800,
      method: "cash",
      date: yesterday,
      receivedBy: adminId,
    });

    await ctx.db.insert("payments", {
      invoiceId: (await ctx.db.query("invoices").collect())[0]._id,
      patientId: patientIds[0] as any,
      amount: 200,
      method: "card",
      date: today,
      receivedBy: adminId,
    });

    const stockData = [
      { name: "Gants latex (boîte de 100)", reference: "GL-001", category: "Protection", quantity: 5, minThreshold: 10, unitPrice: 80 },
      { name: "Masques chirurgicaux (boîte 50)", reference: "MC-001", category: "Protection", quantity: 3, minThreshold: 10, unitPrice: 45 },
      { name: "Anesthésie locale (Lidocaïne)", reference: "AL-001", category: "Médicaments", quantity: 20, minThreshold: 5, unitPrice: 35 },
      { name: "Compresses stériles", reference: "CS-001", category: "Consommables", quantity: 50, minThreshold: 20, unitPrice: 12 },
      { name: "Bavettes (paquet 100)", reference: "BV-001", category: "Protection", quantity: 15, minThreshold: 10, unitPrice: 25 },
      { name: "Ciment dentaire", reference: "CD-001", category: "Matériaux", quantity: 2, minThreshold: 3, unitPrice: 120 },
      { name: "Aiguilles dentaires (boîte 100)", reference: "AD-001", category: "Consommables", quantity: 8, minThreshold: 5, unitPrice: 90 },
    ];

    for (const s of stockData) {
      await ctx.db.insert("stockItems", s);
    }

    await ctx.db.insert("suppliers", {
      name: "Dental Plus",
      contact: "M. Hassan",
      phone: "+212520101010",
      email: "contact@dentalplus.ma",
    });

    await ctx.db.insert("suppliers", {
      name: "MediDent",
      contact: "Mme. Nadia",
      phone: "+212520202020",
      email: "commandes@medident.ma",
    });

    await ctx.db.insert("notifications", {
      type: "stock_alert",
      title: "Stock faible",
      message: "Les gants latex sont en dessous du seuil minimum",
      read: false,
    });

    await ctx.db.insert("notifications", {
      type: "stock_alert",
      title: "Stock faible",
      message: "Les masques chirurgicaux sont en dessous du seuil minimum",
      read: false,
    });

    return {
      message: "Seed data created successfully",
      patients: patientIds.length,
      users: 4,
    };
  },
});
