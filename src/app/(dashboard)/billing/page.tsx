"use client"

import { useState, useMemo, useEffect } from "react"
import { useForm, useFieldArray, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Plus,
  FileText,
  Search,
  CreditCard,
  Euro,
  Receipt,
  Banknote,
  ArrowUpRight,
  User as UserIcon,
  Calendar,
  X,
  Landmark,
  Shield,
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import type {
  Invoice,
  Payment,
  PaymentMethod,
  PaymentStatus,
  Patient,
} from "@/lib/types"
import {
  invoiceSchema,
  paymentSchema,
  type InvoiceFormData,
  type PaymentFormData,
} from "@/lib/zod-schemas"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/lib/toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const MOCK_PATIENTS: Patient[] = [
  { _id: "p1", _creationTime: Date.now() - 86400000 * 30, firstName: "Jean", lastName: "Dupont", dateOfBirth: "1985-03-15", gender: "male", phone: "0612345678", createdBy: "u1" },
  { _id: "p2", _creationTime: Date.now() - 86400000 * 25, firstName: "Marie", lastName: "Martin", dateOfBirth: "1990-07-22", gender: "female", phone: "0623456789", createdBy: "u1" },
  { _id: "p3", _creationTime: Date.now() - 86400000 * 20, firstName: "Pierre", lastName: "Bernard", dateOfBirth: "1978-11-08", gender: "male", phone: "0634567890", createdBy: "u1" },
  { _id: "p4", _creationTime: Date.now() - 86400000 * 15, firstName: "Sophie", lastName: "Petit", dateOfBirth: "1995-01-30", gender: "female", phone: "0645678901", createdBy: "u1" },
  { _id: "p5", _creationTime: Date.now() - 86400000 * 10, firstName: "Lucas", lastName: "Moreau", dateOfBirth: "2000-06-14", gender: "male", phone: "0656789012", createdBy: "u1" },
]

let mockInvoiceIdCounter = 10
let mockPaymentIdCounter = 10

function generateMockInvoices(): Invoice[] {
  const today = new Date()
  const d = (offset: number) => {
    const r = new Date(today)
    r.setDate(r.getDate() + offset)
    return r.toISOString().split("T")[0]
  }

  return [
    {
      _id: "inv-1", _creationTime: Date.now() - 86400000 * 5,
      patientId: "p1", invoiceNumber: "FACT-2026-0001",
      items: [
        { description: "Détartrage complet", quantity: 1, unitPrice: 500, total: 500 },
        { description: "Consultation", quantity: 1, unitPrice: 300, total: 300 },
      ],
      subtotal: 800, tax: 0, total: 800, paidAmount: 800,
      status: "paid", dueDate: d(15), issuedDate: d(-5),
      createdBy: "u1",
    },
    {
      _id: "inv-2", _creationTime: Date.now() - 86400000 * 3,
      patientId: "p2", invoiceNumber: "FACT-2026-0002",
      items: [
        { description: "Traitement canalaire", quantity: 1, unitPrice: 1500, total: 1500 },
        { description: "Anesthésie", quantity: 1, unitPrice: 200, total: 200 },
        { description: "Médicaments", quantity: 1, unitPrice: 150, total: 150 },
      ],
      subtotal: 1850, tax: 0, total: 1850, paidAmount: 1000,
      status: "partial", dueDate: d(20), issuedDate: d(-3),
      createdBy: "u1",
    },
    {
      _id: "inv-3", _creationTime: Date.now() - 86400000 * 7,
      patientId: "p3", invoiceNumber: "FACT-2026-0003",
      items: [
        { description: "Prothèse dentaire", quantity: 1, unitPrice: 3500, total: 3500 },
      ],
      subtotal: 3500, tax: 0, total: 3500, paidAmount: 0,
      status: "unpaid", dueDate: d(10), issuedDate: d(-7),
      notes: "Devis accepté le 15/05",
      createdBy: "u1",
    },
    {
      _id: "inv-4", _creationTime: Date.now() - 86400000 * 1,
      patientId: "p4", invoiceNumber: "FACT-2026-0004",
      items: [
        { description: "Extraction dent de sagesse", quantity: 2, unitPrice: 600, total: 1200 },
        { description: "Radio panoramique", quantity: 1, unitPrice: 400, total: 400 },
      ],
      subtotal: 1600, tax: 0, total: 1600, paidAmount: 1600,
      status: "paid", dueDate: d(30), issuedDate: d(-1),
      createdBy: "u1",
    },
    {
      _id: "inv-5", _creationTime: Date.now() - 86400000 * 2,
      patientId: "p5", invoiceNumber: "FACT-2026-0005",
      items: [
        { description: "Blanchiment dentaire", quantity: 1, unitPrice: 2500, total: 2500 },
      ],
      subtotal: 2500, tax: 0, total: 2500, paidAmount: 1500,
      status: "partial", dueDate: d(25), issuedDate: d(-2),
      createdBy: "u1",
    },
  ]
}

function generateMockPayments(): Payment[] {
  return [
    { _id: "pay-1", _creationTime: Date.now() - 86400000 * 5, invoiceId: "inv-1", patientId: "p1", amount: 800, method: "cash", date: new Date(Date.now() - 86400000 * 5).toISOString().split("T")[0], receivedBy: "u1" },
    { _id: "pay-2", _creationTime: Date.now() - 86400000 * 3, invoiceId: "inv-2", patientId: "p2", amount: 500, method: "card", date: new Date(Date.now() - 86400000 * 3).toISOString().split("T")[0], reference: "CARD-1234", receivedBy: "u1" },
    { _id: "pay-3", _creationTime: Date.now() - 86400000 * 1, invoiceId: "inv-2", patientId: "p2", amount: 500, method: "transfer", date: new Date(Date.now() - 86400000 * 1).toISOString().split("T")[0], reference: "VIREMENT-5678", receivedBy: "u1" },
    { _id: "pay-4", _creationTime: Date.now() - 86400000 * 1, invoiceId: "inv-4", patientId: "p4", amount: 1600, method: "cash", date: new Date(Date.now() - 86400000 * 1).toISOString().split("T")[0], receivedBy: "u1" },
    { _id: "pay-5", _creationTime: Date.now() - 86400000 * 2, invoiceId: "inv-5", patientId: "p5", amount: 1000, method: "card", date: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0], reference: "CARD-9012", receivedBy: "u1" },
    { _id: "pay-6", _creationTime: Date.now() - 86400000 * 0, invoiceId: "inv-5", patientId: "p5", amount: 500, method: "insurance", date: new Date().toISOString().split("T")[0], reference: "ASSUR-3456", notes: "Prise en charge assurance", receivedBy: "u1" },
  ]
}

let mockInvoices = generateMockInvoices()
let mockPayments = generateMockPayments()

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: "Payée",
  partial: "Partielle",
  unpaid: "Impayée",
}

const STATUS_STYLES: Record<PaymentStatus, string> = {
  paid: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border-transparent",
  partial: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 border-transparent",
  unpaid: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-transparent",
}

const METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Espèces",
  card: "Carte",
  transfer: "Virement",
  insurance: "Assurance",
}

const METHOD_STYLES: Record<PaymentMethod, string> = {
  cash: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border-transparent",
  card: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border-transparent",
  transfer: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 border-transparent",
  insurance: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 border-transparent",
}

function getPatientName(patients: Patient[], id: string) {
  const p = patients.find((x) => x._id === id)
  return p ? `${p.lastName} ${p.firstName}` : "—"
}

function getPatient(patients: Patient[], id: string) {
  return patients.find((x) => x._id === id)
}

// ---------------------------------------------------------------------------
// Status Badge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge className={STATUS_STYLES[status]} variant="outline">
      {STATUS_LABELS[status]}
    </Badge>
  )
}

// ---------------------------------------------------------------------------
// Method Badge
// ---------------------------------------------------------------------------

function MethodBadge({ method }: { method: PaymentMethod }) {
  return (
    <Badge className={METHOD_STYLES[method]} variant="outline">
      {method === "cash" && <Banknote className="mr-1 h-3 w-3" />}
      {method === "card" && <CreditCard className="mr-1 h-3 w-3" />}
      {method === "transfer" && <Landmark className="mr-1 h-3 w-3" />}
      {method === "insurance" && <Shield className="mr-1 h-3 w-3" />}
      {METHOD_LABELS[method]}
    </Badge>
  )
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-bold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: React.ElementType
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-12">
        <div className="rounded-full bg-muted p-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-lg font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {actionLabel && onAction && (
          <Button onClick={onAction}>
            <Plus className="mr-2 h-4 w-4" />
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Invoice Create Dialog
// ---------------------------------------------------------------------------

function InvoiceCreateDialog({
  open,
  onOpenChange,
  patients,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  patients: Patient[]
  onSubmit: (data: InvoiceFormData) => Promise<void>
}) {
  const { toast } = useToast()
  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      patientId: "",
      items: [{ description: "", quantity: 1, unitPrice: 0, total: 0 }],
      dueDate: "",
      notes: "",
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" })

  const rawWatchedItems = useWatch({ control: form.control, name: "items" })
  const watchedItems = useMemo(() => rawWatchedItems ?? [], [rawWatchedItems])
  const subtotal = useMemo(
    () => watchedItems.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0),
    [watchedItems]
  )

  useEffect(() => {
    if (!open) {
      form.reset({
        patientId: "",
        items: [{ description: "", quantity: 1, unitPrice: 0, total: 0 }],
        dueDate: "",
        notes: "",
      })
    }
  }, [open, form])

  async function handleSubmit(data: InvoiceFormData) {
    try {
      await onSubmit(data)
      onOpenChange(false)
      toast({ title: "Facture créée", description: "La facture a été créée avec succès.", variant: "success" })
    } catch {
      toast({ title: "Erreur", description: "Impossible de créer la facture.", variant: "destructive" })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nouvelle Facture</DialogTitle>
          <DialogDescription>
            Créez une nouvelle facture pour un patient.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un patient" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patients.map((p) => (
                        <SelectItem key={p._id} value={p._id}>
                          {p.lastName} {p.firstName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel className="text-base">Articles</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ description: "", quantity: 1, unitPrice: 0, total: 0 })}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Ajouter
                </Button>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2 rounded-lg border p-3">
                  <div className="flex-1 space-y-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                placeholder="Qté"
                                {...field}
                                onChange={(e) => {
                                  const qty = Number(e.target.value)
                                  field.onChange(qty)
                                  const unitPrice = form.getValues(`items.${index}.unitPrice`)
                                  form.setValue(`items.${index}.total`, qty * unitPrice)
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.unitPrice`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                step={0.01}
                                placeholder="Prix unit."
                                {...field}
                                onChange={(e) => {
                                  const price = Number(e.target.value)
                                  field.onChange(price)
                                  const qty = form.getValues(`items.${index}.quantity`)
                                  form.setValue(`items.${index}.total`, qty * price)
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex items-center justify-center rounded-md border bg-muted/30 px-3 py-2 text-sm font-medium">
                        {formatCurrency(
                          (watchedItems[index]?.quantity ?? 0) *
                            (watchedItems[index]?.unitPrice ?? 0)
                        )}
                      </div>
                    </div>
                  </div>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-1 shrink-0"
                      onClick={() => remove(index)}
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-4 rounded-lg bg-muted/30 px-4 py-3">
              <span className="text-sm text-muted-foreground">Sous-total:</span>
              <span className="text-lg font-bold">{formatCurrency(subtotal)}</span>
            </div>

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date d&apos;échéance</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Notes optionnelles..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit">
                Créer la facture
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Payment Create Dialog
// ---------------------------------------------------------------------------

function PaymentCreateDialog({
  open,
  onOpenChange,
  invoices,
  patients,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoices: Invoice[]
  patients: Patient[]
  onSubmit: (data: PaymentFormData & { patientId: string }) => Promise<void>
}) {
  const { toast } = useToast()

  const unpaidInvoices = useMemo(
    () => invoices.filter((inv) => inv.status !== "paid"),
    [invoices]
  )

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      invoiceId: "",
      amount: 0,
      method: "cash",
      date: new Date().toISOString().split("T")[0],
      reference: "",
      notes: "",
    },
  })

  const selectedInvoiceId = useWatch({ control: form.control, name: "invoiceId" })
  const selectedInvoice = useMemo(
    () => invoices.find((inv) => inv._id === selectedInvoiceId),
    [invoices, selectedInvoiceId]
  )
  const remainingBalance = useMemo(
    () => (selectedInvoice ? selectedInvoice.total - selectedInvoice.paidAmount : 0),
    [selectedInvoice]
  )

  useEffect(() => {
    if (!open) {
      form.reset({
        invoiceId: "",
        amount: 0,
        method: "cash",
        date: new Date().toISOString().split("T")[0],
        reference: "",
        notes: "",
      })
    }
  }, [open, form])

  async function handleSubmit(data: PaymentFormData) {
    if (!selectedInvoice) return
    if (data.amount > remainingBalance) {
      toast({
        title: "Montant invalide",
        description: `Le montant ne peut pas dépasser ${formatCurrency(remainingBalance)}.`,
        variant: "destructive",
      })
      return
    }
    try {
      await onSubmit({ ...data, patientId: selectedInvoice.patientId })
      onOpenChange(false)
      toast({ title: "Paiement enregistré", description: "Le paiement a été enregistré avec succès.", variant: "success" })
    } catch {
      toast({ title: "Erreur", description: "Impossible d'enregistrer le paiement.", variant: "destructive" })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouveau Paiement</DialogTitle>
          <DialogDescription>
            Enregistrez un nouveau paiement sur une facture.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="invoiceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facture</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une facture" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {unpaidInvoices.length === 0 ? (
                        <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                          Aucune facture impayée
                        </div>
                      ) : (
                        unpaidInvoices.map((inv) => {
                          const patient = getPatient(patients, inv.patientId)
                          const remaining = inv.total - inv.paidAmount
                          return (
                            <SelectItem key={inv._id} value={inv._id}>
                              {inv.invoiceNumber} — {patient ? `${patient.lastName} ${patient.firstName}` : "—"} ({formatCurrency(remaining)})
                            </SelectItem>
                          )
                        })
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedInvoice && (
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total facture:</span>
                  <span className="font-medium">{formatCurrency(selectedInvoice.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Déjà payé:</span>
                  <span className="font-medium">{formatCurrency(selectedInvoice.paidAmount)}</span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between font-semibold">
                  <span>Reste à payer:</span>
                  <span>{formatCurrency(remainingBalance)}</span>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0.01}
                      step={0.01}
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  {selectedInvoice && (
                    <FormDescription>
                      Maximum: {formatCurrency(remainingBalance)}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Méthode de paiement</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Espèces</SelectItem>
                      <SelectItem value="card">Carte</SelectItem>
                      <SelectItem value="transfer">Virement</SelectItem>
                      <SelectItem value="insurance">Assurance</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Référence</FormLabel>
                  <FormControl>
                    <Input placeholder="N° de chèque, transaction..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Notes optionnelles..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit">
                Enregistrer le paiement
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Invoice Detail Dialog
// ---------------------------------------------------------------------------

function InvoiceDetailDialog({
  open,
  onOpenChange,
  invoice,
  payments,
  patients,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: Invoice | null
  payments: Payment[]
  patients: Patient[]
}) {
  if (!invoice) return null

  const invoicePayments = payments.filter((p) => p.invoiceId === invoice._id)
  const remaining = invoice.total - invoice.paidAmount
  const patient = getPatient(patients, invoice.patientId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            {invoice.invoiceNumber}
          </DialogTitle>
          <DialogDescription>
            {patient ? `${patient.lastName} ${patient.firstName}` : "Patient inconnu"} · {formatDate(invoice.issuedDate)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient & Status */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {patient ? `${patient.lastName} ${patient.firstName}` : "—"}
              </span>
            </div>
            <StatusBadge status={invoice.status} />
          </div>

          {/* Items Table */}
          <div>
            <h4 className="mb-2 text-sm font-medium text-muted-foreground">Articles</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/2">Description</TableHead>
                  <TableHead className="text-right">Qté</TableHead>
                  <TableHead className="text-right">Prix unit.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Totals */}
          <div className="space-y-1 rounded-lg border bg-muted/30 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sous-total</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxe</span>
                <span>{formatCurrency(invoice.tax)}</span>
              </div>
            )}
            <Separator className="my-1" />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payé</span>
              <span className="text-green-600 dark:text-green-400">{formatCurrency(invoice.paidAmount)}</span>
            </div>
            {remaining > 0 && (
              <div className="flex justify-between text-sm font-medium">
                <span className="text-muted-foreground">Reste à payer</span>
                <span className="text-destructive">{formatCurrency(remaining)}</span>
              </div>
            )}
          </div>

          {/* Due Date */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Échéance:</span>
            <span className="font-medium">{formatDate(invoice.dueDate)}</span>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="rounded-lg border bg-muted/20 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
              <p className="text-sm">{invoice.notes}</p>
            </div>
          )}

          {/* Payment History */}
          <div>
            <h4 className="mb-2 text-sm font-medium text-muted-foreground">
              Historique des paiements ({invoicePayments.length})
            </h4>
            {invoicePayments.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Aucun paiement enregistré.</p>
            ) : (
              <div className="space-y-2">
                {invoicePayments.map((pay) => (
                  <div
                    key={pay._id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <Euro className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{formatCurrency(pay.amount)}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(pay.date)}</p>
                      </div>
                    </div>
                    <MethodBadge method={pay.method} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Invoices Tab
// ---------------------------------------------------------------------------

function InvoicesTab({
  invoices,
  patients,
  payments,
  onRefresh,
}: {
  invoices: Invoice[]
  patients: Patient[]
  payments: Payment[]
  onRefresh: () => void
}) {
  const { user } = useAuth()
  const [createOpen, setCreateOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all")
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    let r = invoices
    if (statusFilter !== "all") r = r.filter((inv) => inv.status === statusFilter)
    if (search.trim()) {
      const s = search.toLowerCase()
      r = r.filter((inv) => {
        const patient = getPatient(patients, inv.patientId)
        return (
          inv.invoiceNumber.toLowerCase().includes(s) ||
          (patient && `${patient.lastName} ${patient.firstName}`.toLowerCase().includes(s))
        )
      })
    }
    return r
  }, [invoices, statusFilter, search, patients])

  const stats = useMemo(() => {
    const totalBilled = invoices.reduce((sum, inv) => sum + inv.total, 0)
    const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0)
    const totalUnpaid = totalBilled - totalPaid
    return { totalBilled, totalPaid, totalUnpaid, count: invoices.length }
  }, [invoices])

  async function handleCreateInvoice(data: InvoiceFormData) {
    mockInvoiceIdCounter++
    const subtotal = data.items.reduce((s, item) => s + item.quantity * item.unitPrice, 0)
    const newInvoice: Invoice = {
      _id: `inv-mock-${mockInvoiceIdCounter}`,
      _creationTime: Date.now(),
      patientId: data.patientId,
      invoiceNumber: `FACT-2026-${String(mockInvoiceIdCounter).padStart(4, "0")}`,
      items: data.items,
      subtotal,
      tax: 0,
      total: subtotal,
      paidAmount: 0,
      status: "unpaid",
      dueDate: data.dueDate,
      issuedDate: new Date().toISOString().split("T")[0],
      notes: data.notes || undefined,
      createdBy: user?._id ?? "u1",
    }
    mockInvoices = [newInvoice, ...mockInvoices]
    onRefresh()
  }

  function openDetail(invoice: Invoice) {
    setSelectedInvoice(invoice)
    setDetailOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Euro} label="Total facturé" value={formatCurrency(stats.totalBilled)} />
        <StatCard icon="div" label="Total encaissé" value={formatCurrency(stats.totalPaid)} />
        <StatCard icon="div" label="Total impayé" value={formatCurrency(stats.totalUnpaid)} />
        <StatCard icon={Receipt} label="Nombre de factures" value={String(stats.count)} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par numéro ou patient..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as PaymentStatus | "all")}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="paid">Payée</SelectItem>
              <SelectItem value="partial">Partielle</SelectItem>
              <SelectItem value="unpaid">Impayée</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle facture
          </Button>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={search || statusFilter !== "all" ? "Aucun résultat" : "Aucune facture"}
          description={
            search || statusFilter !== "all"
              ? "Essayez de modifier vos filtres."
              : "Commencez par créer une nouvelle facture."
          }
          actionLabel={!search && statusFilter === "all" ? "Nouvelle facture" : undefined}
          onAction={!search && statusFilter === "all" ? () => setCreateOpen(true) : undefined}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="text-right">Payé</TableHead>
                  <TableHead className="text-right">Restant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((inv) => {
                  const remaining = inv.total - inv.paidAmount
                  return (
                    <TableRow
                      key={inv._id}
                      className="cursor-pointer"
                      onClick={() => openDetail(inv)}
                    >
                      <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                      <TableCell>{getPatientName(patients, inv.patientId)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(inv.total)}</TableCell>
                      <TableCell className="text-right text-green-600 dark:text-green-400">
                        {formatCurrency(inv.paidAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {remaining > 0 ? (
                          <span className="text-destructive">{formatCurrency(remaining)}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={inv.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(inv.issuedDate)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            openDetail(inv)
                          }}
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <InvoiceCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        patients={patients}
        onSubmit={handleCreateInvoice}
      />

      <InvoiceDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        invoice={selectedInvoice}
        payments={payments}
        patients={patients}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Payments Tab
// ---------------------------------------------------------------------------

function PaymentsTab({
  payments,
  invoices,
  patients,
  onRefresh,
}: {
  payments: Payment[]
  invoices: Invoice[]
  patients: Patient[]
  onRefresh: () => void
}) {
  const { user } = useAuth()
  const [createOpen, setCreateOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    if (!search.trim()) return payments
    const s = search.toLowerCase()
    return payments.filter((pay) => {
      const patient = getPatient(patients, pay.patientId)
      const invoice = invoices.find((inv) => inv._id === pay.invoiceId)
      return (
        (patient && `${patient.lastName} ${patient.firstName}`.toLowerCase().includes(s)) ||
        (invoice && invoice.invoiceNumber.toLowerCase().includes(s)) ||
        (pay.reference && pay.reference.toLowerCase().includes(s))
      )
    })
  }, [payments, search, patients, invoices])

  async function handleCreatePayment(data: PaymentFormData & { patientId: string }) {
    mockPaymentIdCounter++
    const newPayment: Payment = {
      _id: `pay-mock-${mockPaymentIdCounter}`,
      _creationTime: Date.now(),
      invoiceId: data.invoiceId,
      patientId: data.patientId,
      amount: data.amount,
      method: data.method,
      date: data.date,
      reference: data.reference || undefined,
      notes: data.notes || undefined,
      receivedBy: user?._id ?? "u1",
    }

    mockInvoices = mockInvoices.map((inv) => {
      if (inv._id === data.invoiceId) {
        const newPaid = inv.paidAmount + data.amount
        const newStatus: PaymentStatus =
          newPaid >= inv.total ? "paid" : newPaid > 0 ? "partial" : "unpaid"
        return { ...inv, paidAmount: newPaid, status: newStatus }
      }
      return inv
    })

    mockPayments = [newPayment, ...mockPayments]
    onRefresh()
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par patient, facture ou référence..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau paiement
        </Button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title={search ? "Aucun résultat" : "Aucun paiement"}
          description={
            search
              ? "Essayez de modifier votre recherche."
              : "Enregistrez votre premier paiement."
          }
          actionLabel={!search ? "Nouveau paiement" : undefined}
          onAction={!search ? () => setCreateOpen(true) : undefined}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Facture</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead>Méthode</TableHead>
                  <TableHead>Référence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((pay) => {
                  const invoice = invoices.find((inv) => inv._id === pay.invoiceId)
                  return (
                    <TableRow key={pay._id}>
                      <TableCell className="text-muted-foreground">
                        {formatDate(pay.date)}
                      </TableCell>
                      <TableCell>{getPatientName(patients, pay.patientId)}</TableCell>
                      <TableCell className="font-medium">
                        {invoice?.invoiceNumber ?? "—"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(pay.amount)}
                      </TableCell>
                      <TableCell>
                        <MethodBadge method={pay.method} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {pay.reference || "—"}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <PaymentCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        invoices={invoices}
        patients={patients}
        onSubmit={handleCreatePayment}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

function BillingUI() {
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    mockInvoices = generateMockInvoices()
    return mockInvoices
  })
  const [payments, setPayments] = useState<Payment[]>(() => {
    mockPayments = generateMockPayments()
    return mockPayments
  })
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS)

  function loadData() {
    mockInvoices = generateMockInvoices()
    mockPayments = generateMockPayments()
    setInvoices(mockInvoices)
    setPayments(mockPayments)
    setPatients(MOCK_PATIENTS)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Facturation</h2>
          <p className="text-sm text-muted-foreground">
            Gérez les factures et les paiements.
          </p>
        </div>
      </div>

      <Tabs defaultValue="invoices" className="w-full">
        <TabsList>
          <TabsTrigger value="invoices" className="gap-2">
            <FileText className="h-4 w-4" />
            Factures
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Paiements
          </TabsTrigger>
        </TabsList>
        <TabsContent value="invoices">
          <InvoicesTab
            invoices={invoices}
            patients={patients}
            payments={payments}
            onRefresh={loadData}
          />
        </TabsContent>
        <TabsContent value="payments">
          <PaymentsTab
            payments={payments}
            invoices={invoices}
            patients={patients}
            onRefresh={loadData}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function BillingPage() {
  return <BillingUI />
}
