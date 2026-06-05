"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Pencil,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Droplets,
  AlertTriangle,
  Pill,
  Shield,
  Calendar,
  Clock,
  Stethoscope,
  FileText,
  Syringe,
  Loader2,
  AlertCircle,
  User as UserIcon,
} from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"
import type {
  Patient,
  Appointment,
  Invoice,
  MedicalRecord,
  Treatment,
} from "@/lib/types"
import { useToast } from "@/lib/toast"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { patientSchema, type PatientFormData } from "@/lib/zod-schemas"

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_PATIENT: Patient = {
  _id: "p1",
  _creationTime: Date.now() - 86400000 * 10,
  firstName: "Jean",
  lastName: "Dupont",
  dateOfBirth: "1985-03-15",
  gender: "male",
  phone: "+212 6 12 34 56 78",
  email: "jean.dupont@email.com",
  address: "12 Rue de la Liberté, Casablanca",
  profession: "Ingénieur",
  bloodGroup: "A+",
  allergies: "Pénicilline",
  insuranceCompany: "CNOPS",
  insuranceNumber: "CNOPS-12345",
  createdBy: "u1",
}

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    _id: "a1",
    _creationTime: Date.now() - 86400000 * 2,
    patientId: "p1",
    dentistId: "u2",
    date: "2026-06-05",
    startTime: "09:00",
    endTime: "09:30",
    status: "scheduled",
    reason: "Détartrage",
    createdBy: "u1",
  },
  {
    _id: "a2",
    _creationTime: Date.now() - 86400000 * 5,
    patientId: "p1",
    dentistId: "u2",
    date: "2026-05-20",
    startTime: "14:00",
    endTime: "14:45",
    status: "completed",
    reason: "Carie dent 26",
    createdBy: "u1",
  },
  {
    _id: "a3",
    _creationTime: Date.now() - 86400000 * 15,
    patientId: "p1",
    dentistId: "u2",
    date: "2026-04-10",
    startTime: "10:00",
    endTime: "10:30",
    status: "cancelled",
    reason: "Contrôle",
    notes: "Annulé par le patient",
    createdBy: "u1",
  },
]

const MOCK_INVOICES: Invoice[] = [
  {
    _id: "i1",
    _creationTime: Date.now() - 86400000 * 5,
    patientId: "p1",
    invoiceNumber: "FAC-2026-0001",
    items: [
      { description: "Détartrage", quantity: 1, unitPrice: 300, total: 300 },
    ],
    subtotal: 300,
    tax: 0,
    total: 300,
    paidAmount: 300,
    status: "paid",
    dueDate: "2026-05-20",
    issuedDate: "2026-05-20",
    createdBy: "u1",
  },
  {
    _id: "i2",
    _creationTime: Date.now() - 86400000 * 2,
    patientId: "p1",
    invoiceNumber: "FAC-2026-0005",
    items: [
      {
        description: "Traitement carie dent 26",
        quantity: 1,
        unitPrice: 600,
        total: 600,
      },
      { description: "Anesthésie", quantity: 1, unitPrice: 100, total: 100 },
    ],
    subtotal: 700,
    tax: 0,
    total: 700,
    paidAmount: 200,
    status: "partial",
    dueDate: "2026-06-15",
    issuedDate: "2026-05-25",
    createdBy: "u1",
  },
]

const MOCK_RECORDS: MedicalRecord[] = [
  {
    _id: "r1",
    _creationTime: Date.now() - 86400000 * 10,
    patientId: "p1",
    type: "diagnosis",
    title: "Carie dentaire",
    description: "Carie profonde sur dent 26 nécessitant un traitement",
    doctorId: "u2",
    date: "2026-05-20",
  },
  {
    _id: "r2",
    _creationTime: Date.now() - 86400000 * 8,
    patientId: "p1",
    type: "treatment_plan",
    title: "Plan de traitement",
    description:
      "Détartrage + traitement carie dent 26 + contrôle dans 6 mois",
    doctorId: "u2",
    date: "2026-05-20",
  },
  {
    _id: "r3",
    _creationTime: Date.now() - 86400000 * 3,
    patientId: "p1",
    type: "clinical_note",
    title: "Note de suivi",
    description: "Patient répond bien au traitement. Prochain rdv dans 3 mois.",
    doctorId: "u2",
    date: "2026-05-25",
  },
]

const MOCK_TREATMENTS: Treatment[] = [
  {
    _id: "t1",
    _creationTime: Date.now() - 86400000 * 8,
    patientId: "p1",
    name: "Détartrage",
    description: "Détartrage complet",
    cost: 300,
    status: "completed",
    startDate: "2026-05-20",
    endDate: "2026-05-20",
    doctorId: "u2",
  },
  {
    _id: "t2",
    _creationTime: Date.now() - 86400000 * 5,
    patientId: "p1",
    name: "Traitement carie",
    description: "Traitement carie dent 26",
    toothNumber: 26,
    cost: 600,
    status: "in_progress",
    startDate: "2026-05-25",
    doctorId: "u2",
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  scheduled: { label: "Planifié", variant: "outline" },
  confirmed: { label: "Confirmé", variant: "default" },
  pending: { label: "En attente", variant: "secondary" },
  cancelled: { label: "Annulé", variant: "destructive" },
  completed: { label: "Terminé", variant: "secondary" },
  paid: { label: "Payée", variant: "default" },
  partial: { label: "Partielle", variant: "secondary" },
  unpaid: { label: "Impayée", variant: "destructive" },
  planned: { label: "Planifié", variant: "outline" },
  in_progress: { label: "En cours", variant: "default" },
  diagnosis: { label: "Diagnostic", variant: "default" },
  clinical_note: { label: "Note clinique", variant: "secondary" },
  prescription: { label: "Ordonnance", variant: "outline" },
  treatment_plan: { label: "Plan de traitement", variant: "default" },
}

function statusBadge(status: string) {
  const s = STATUS_LABELS[status] ?? { label: status, variant: "outline" as const }
  return <Badge variant={s.variant}>{s.label}</Badge>
}

// ---------------------------------------------------------------------------
// Tab components
// ---------------------------------------------------------------------------

function InfoTab({
  patient,
  onEdit,
}: {
  patient: Patient
  onEdit: () => void
}) {
  const rows = [
    { icon: UserIcon, label: "Genre", value: patient.gender === "male" ? "Masculin" : "Féminin" },
    { icon: Calendar, label: "Date de naissance", value: formatDate(patient.dateOfBirth) },
    { icon: Phone, label: "Téléphone", value: patient.phone },
    { icon: Mail, label: "Email", value: patient.email || "—" },
    { icon: MapPin, label: "Adresse", value: patient.address || "—" },
    { icon: Briefcase, label: "Profession", value: patient.profession || "—" },
    { icon: Droplets, label: "Groupe sanguin", value: patient.bloodGroup || "—" },
    { icon: AlertTriangle, label: "Allergies", value: patient.allergies || "—" },
    { icon: Pill, label: "Antécédents médicaux", value: patient.medicalHistory || "—" },
    { icon: Syringe, label: "Traitements en cours", value: patient.ongoingTreatments || "—" },
    { icon: Shield, label: "Assurance", value: patient.insuranceCompany || "—" },
    { icon: Shield, label: "N° assurance", value: patient.insuranceNumber || "—" },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Informations complètes</h3>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
          Modifier
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-4">
              <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium truncate">{value}</p>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}

function AppointmentsTab({ patientId }: { patientId: string }) {
  const appointments = useMemo(
    () => MOCK_APPOINTMENTS.filter((a) => a.patientId === patientId),
    [patientId]
  )

  if (appointments.length === 0) {
    return <EmptyTab icon={Calendar} message="Aucun rendez-vous trouvé." />
  }

  return (
    <div className="space-y-3">
      {appointments.map((apt) => (
        <Card key={apt._id}>
          <CardContent className="flex items-start gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{apt.reason || "Consultation"}</p>
                {statusBadge(apt.status)}
              </div>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(apt.date)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {apt.startTime} - {apt.endTime}
                </span>
              </div>
              {apt.notes && (
                <p className="mt-1 text-sm text-muted-foreground">{apt.notes}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function InvoicesTab({ patientId }: { patientId: string }) {
  const invoices = useMemo(
    () => MOCK_INVOICES.filter((i) => i.patientId === patientId),
    [patientId]
  )

  if (invoices.length === 0) {
    return <EmptyTab icon={FileText} message="Aucune facture trouvée." />
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>N° Facture</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Payé</TableHead>
            <TableHead>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((inv) => (
            <TableRow key={inv._id}>
              <TableCell className="font-medium">
                {inv.invoiceNumber}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(inv.issuedDate)}
              </TableCell>
              <TableCell>{formatCurrency(inv.total)}</TableCell>
              <TableCell>{formatCurrency(inv.paidAmount)}</TableCell>
              <TableCell>{statusBadge(inv.status)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

function MedicalRecordsTab({ patientId }: { patientId: string }) {
  const records = useMemo(
    () => MOCK_RECORDS.filter((r) => r.patientId === patientId),
    [patientId]
  )

  if (records.length === 0) {
    return <EmptyTab icon={Stethoscope} message="Aucun dossier médical trouvé." />
  }

  return (
    <div className="space-y-3">
      {records.map((record) => (
        <Card key={record._id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{record.title}</p>
                  {statusBadge(record.type)}
                </div>
                {record.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {record.description}
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatDate(record.date)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function TreatmentsTab({ patientId }: { patientId: string }) {
  const treatments = useMemo(
    () => MOCK_TREATMENTS.filter((t) => t.patientId === patientId),
    [patientId]
  )

  if (treatments.length === 0) {
    return <EmptyTab icon={Stethoscope} message="Aucun traitement trouvé." />
  }

  return (
    <div className="space-y-3">
      {treatments.map((t) => (
        <Card key={t._id}>
          <CardContent className="flex items-start gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Stethoscope className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{t.name}</p>
                {statusBadge(t.status)}
              </div>
              {t.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {t.description}
                </p>
              )}
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span>Coût: {formatCurrency(t.cost)}</span>
                <span>Début: {formatDate(t.startDate)}</span>
                {t.endDate && <span>Fin: {formatDate(t.endDate)}</span>}
                {t.toothNumber && <span>Dent: {t.toothNumber}</span>}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function EmptyTab({
  icon: Icon,
  message,
}: {
  icon: React.ElementType
  message: string
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-12">
        <div className="rounded-full bg-muted p-3">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Loading / Error states
// ---------------------------------------------------------------------------

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-9 w-9 animate-pulse rounded bg-muted" />
        <div className="space-y-2">
          <div className="h-6 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="h-10 w-full animate-pulse rounded bg-muted" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  )
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-12">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <div className="text-center">
          <p className="text-lg font-medium">Erreur</p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            Réessayer
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Edit dialog form
// ---------------------------------------------------------------------------

function EditPatientForm({
  patient,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  patient: Patient
  onSubmit: (data: PatientFormData) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
}) {
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email ?? "",
      address: patient.address ?? "",
      profession: patient.profession ?? "",
      bloodGroup: patient.bloodGroup ?? "",
      allergies: patient.allergies ?? "",
      medicalHistory: patient.medicalHistory ?? "",
      ongoingTreatments: patient.ongoingTreatments ?? "",
      insuranceCompany: patient.insuranceCompany ?? "",
      insuranceNumber: patient.insuranceNumber ?? "",
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de naissance</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Genre</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Masculin</SelectItem>
                    <SelectItem value="female">Féminin</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="profession"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profession</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bloodGroup"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Groupe sanguin</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="allergies"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Allergies</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="medicalHistory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Antécédents médicaux</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ongoingTreatments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Traitements en cours</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="insuranceCompany"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Compagnie d'assurance</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="insuranceNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>N° d'assurance</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Enregistrer
          </Button>
        </div>
      </form>
    </Form>
  )
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export default function PatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const patientId = params.id as string

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const patient = useMemo(
    () => (MOCK_PATIENT._id === patientId ? MOCK_PATIENT : null),
    [patientId]
  )

  const handleUpdate = async (data: PatientFormData) => {
    setIsSubmitting(true)
    try {
      await new Promise((r) => setTimeout(r, 500))
      toast({
        title: "Patient modifié",
        description: "Les informations ont été mises à jour.",
        variant: "success",
      })
      setEditOpen(false)
      router.refresh()
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le patient.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <LoadingSkeleton />
  if (error)
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          setError(null)
          setLoading(true)
          setTimeout(() => setLoading(false), 500)
        }}
      />
    )
  if (!patient) {
    return (
      <ErrorState message="Patient introuvable. Vérifiez l'identifiant et réessayez." />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/patients">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <span className="text-xl font-semibold text-primary">
              {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {patient.lastName} {patient.firstName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {patient.gender === "male" ? "Homme" : "Femme"} · {patient.profession || "—"} ·{" "}
              {formatDate(patient.dateOfBirth)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="w-full flex-wrap">
          <TabsTrigger value="info" className="flex-1">
            Informations
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex-1">
            Rendez-vous
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex-1">
            Factures
          </TabsTrigger>
          <TabsTrigger value="records" className="flex-1">
            Dossier Médical
          </TabsTrigger>
          <TabsTrigger value="treatments" className="flex-1">
            Traitements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <InfoTab patient={patient} onEdit={() => setEditOpen(true)} />
        </TabsContent>

        <TabsContent value="appointments" className="mt-6">
          <AppointmentsTab patientId={patientId} />
        </TabsContent>

        <TabsContent value="invoices" className="mt-6">
          <InvoicesTab patientId={patientId} />
        </TabsContent>

        <TabsContent value="records" className="mt-6">
          <MedicalRecordsTab patientId={patientId} />
        </TabsContent>

        <TabsContent value="treatments" className="mt-6">
          <TreatmentsTab patientId={patientId} />
        </TabsContent>
      </Tabs>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le Patient</DialogTitle>
            <DialogDescription>
              Modifiez les informations du patient.
            </DialogDescription>
          </DialogHeader>
          <EditPatientForm
            patient={patient}
            onSubmit={handleUpdate}
            onCancel={() => setEditOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
