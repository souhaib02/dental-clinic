export type Role = "admin" | "dentist" | "secretary";

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "pending"
  | "cancelled"
  | "completed";

export type PaymentMethod = "cash" | "card" | "transfer" | "insurance";

export type PaymentStatus = "partial" | "paid" | "unpaid";

export type StockMovementType = "purchase" | "return" | "consumption" | "loss";

export type ToothStatus =
  | "healthy"
  | "decayed"
  | "filled"
  | "crowned"
  | "extracted"
  | "root_canal"
  | "implant"
  | "bridge"
  | "missing";

export interface User {
  _id: string;
  _creationTime: number;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  isActive: boolean;
  lastLogin?: number;
}

export interface Patient {
  _id: string;
  _creationTime: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "male" | "female";
  phone: string;
  email?: string;
  address?: string;
  profession?: string;
  bloodGroup?: string;
  allergies?: string;
  medicalHistory?: string;
  ongoingTreatments?: string;
  insuranceCompany?: string;
  insuranceNumber?: string;
  avatar?: string;
  createdBy: string;
}

export interface Appointment {
  _id: string;
  _creationTime: number;
  patientId: string;
  dentistId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  createdBy: string;
}

export interface OdontogramEntry {
  _id: string;
  _creationTime: number;
  patientId: string;
  toothNumber: number;
  status: ToothStatus;
  notes?: string;
  treatment?: string;
  date: string;
  createdBy: string;
}

export interface MedicalRecord {
  _id: string;
  _creationTime: number;
  patientId: string;
  type: "diagnosis" | "clinical_note" | "prescription" | "treatment_plan";
  title: string;
  description?: string;
  doctorId: string;
  date: string;
  attachments?: string[];
}

export interface Treatment {
  _id: string;
  _creationTime: number;
  patientId: string;
  name: string;
  description?: string;
  toothNumber?: number;
  cost: number;
  status: "planned" | "in_progress" | "completed" | "cancelled";
  startDate: string;
  endDate?: string;
  doctorId: string;
  notes?: string;
}

export interface Prescription {
  _id: string;
  _creationTime: number;
  patientId: string;
  doctorId: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
  date: string;
}

export interface Invoice {
  _id: string;
  _creationTime: number;
  patientId: string;
  invoiceNumber: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  paidAmount: number;
  status: PaymentStatus;
  dueDate: string;
  issuedDate: string;
  notes?: string;
  createdBy: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Payment {
  _id: string;
  _creationTime: number;
  invoiceId: string;
  patientId: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  reference?: string;
  notes?: string;
  receivedBy: string;
}

export interface InsuranceClaim {
  _id: string;
  _creationTime: number;
  patientId: string;
  invoiceId: string;
  insuranceCompany: string;
  claimAmount: number;
  coveredAmount: number;
  remainingAmount: number;
  status: "submitted" | "approved" | "rejected" | "paid";
  submissionDate: string;
  approvalDate?: string;
  notes?: string;
}

export interface StockItem {
  _id: string;
  _creationTime: number;
  name: string;
  reference: string;
  category: string;
  quantity: number;
  minThreshold: number;
  unitPrice: number;
  supplierId?: string;
  description?: string;
}

export interface StockMovement {
  _id: string;
  _creationTime: number;
  itemId: string;
  type: StockMovementType;
  quantity: number;
  date: string;
  notes?: string;
  userId: string;
}

export interface Supplier {
  _id: string;
  _creationTime: number;
  name: string;
  contact: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface Notification {
  _id: string;
  _creationTime: number;
  type: "stock_alert" | "payment" | "appointment" | "system";
  title: string;
  message: string;
  read: boolean;
  userId?: string;
  link?: string;
}

export interface AuditLog {
  _id: string;
  _creationTime: number;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  ip?: string;
}

export interface DashboardStats {
  todayAppointments: number;
  patientsToday: number;
  upcomingAppointments: number;
  dailyRevenue: number;
  monthlyRevenue: number;
  lowStockItems: number;
  cancelledAppointments: number;
  recentPayments: Payment[];
}
