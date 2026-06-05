"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/lib/toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { stockItemSchema } from "@/lib/zod-schemas"
import type { StockItem, StockMovement, StockMovementType, Supplier } from "@/lib/types"
import { cn, formatCurrency, formatDate, formatDateTime } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertTriangle,
  Package,
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  PackageOpen,
  ArrowDownUp,
  Truck,
  AlertCircle,
} from "lucide-react"

// ───── Mock Data ─────

const MOCK_PRODUCTS: StockItem[] = [
  { _id: "s1", _creationTime: Date.now(), name: "Gants latex (boîte 100)", reference: "GAN-001", category: "Protection", quantity: 15, minThreshold: 20, unitPrice: 8.5, description: "Gants latex sans poudre" },
  { _id: "s2", _creationTime: Date.now(), name: "Masques chirurgicaux (boîte 50)", reference: "MAS-001", category: "Protection", quantity: 5, minThreshold: 10, unitPrice: 4.2, description: "" },
  { _id: "s3", _creationTime: Date.now(), name: "Anesthésique lidocaïne", reference: "ANE-001", category: "Médicaments", quantity: 0, minThreshold: 5, unitPrice: 12.0, description: "Cartouche 1.8ml" },
  { _id: "s4", _creationTime: Date.now(), name: "Composite dentaire A3", reference: "COM-001", category: "Consommables", quantity: 25, minThreshold: 3, unitPrice: 45.0, description: "Syringe 4g" },
  { _id: "s5", _creationTime: Date.now(), name: "Bavettes jetables (paquet 500)", reference: "BAV-001", category: "Protection", quantity: 200, minThreshold: 50, unitPrice: 6.0, description: "" },
  { _id: "s6", _creationTime: Date.now(), name: "Alcool médical 70° (1L)", reference: "ALC-001", category: "Hygiène", quantity: 8, minThreshold: 5, unitPrice: 3.5, description: "" },
  { _id: "s7", _creationTime: Date.now(), name: "Aiguilles dentaires (boîte 100)", reference: "AIG-001", category: "Consommables", quantity: 3, minThreshold: 10, unitPrice: 15.0, description: "30G courte" },
  { _id: "s8", _creationTime: Date.now(), name: "Empreinte silicone", reference: "EMP-001", category: "Prothèse", quantity: 12, minThreshold: 4, unitPrice: 22.0, description: "Kit base + catalyseur" },
]

const MOCK_CATEGORIES = ["Protection", "Médicaments", "Consommables", "Hygiène", "Prothèse"]

const MOCK_SUPPLIERS: Supplier[] = [
  { _id: "su1", _creationTime: Date.now(), name: "DentalPlus", contact: "Marc Dupont", phone: "0145678910", email: "contact@dentalplus.fr", address: "15 Rue de la Santé, 75012 Paris" },
  { _id: "su2", _creationTime: Date.now(), name: "MediDent", contact: "Sophie Bernard", phone: "0145678920", email: "commandes@medident.fr", address: "8 Avenue Pasteur, 69003 Lyon" },
  { _id: "su3", _creationTime: Date.now(), name: "OrthoSupply", contact: "Lucas Martin", phone: "0145678930", email: "info@orthosupply.fr" },
]

const MOVEMENT_TYPES: { value: StockMovementType; label: string }[] = [
  { value: "purchase", label: "Achat" },
  { value: "return", label: "Retour" },
  { value: "consumption", label: "Consommation" },
  { value: "loss", label: "Perte" },
]

function generateMockMovements(items: StockItem[]): StockMovement[] {
  const today = new Date()
  return [
    { _id: "m1", _creationTime: Date.now(), itemId: "s1", type: "purchase", quantity: 50, date: new Date(today.getTime() - 86400000 * 5).toISOString(), userId: "u1", notes: "Réapprovisionnement mensuel" },
    { _id: "m2", _creationTime: Date.now(), itemId: "s1", type: "consumption", quantity: 10, date: new Date(today.getTime() - 86400000 * 3).toISOString(), userId: "u1" },
    { _id: "m3", _creationTime: Date.now(), itemId: "s3", type: "purchase", quantity: 20, date: new Date(today.getTime() - 86400000 * 10).toISOString(), userId: "u1" },
    { _id: "m4", _creationTime: Date.now(), itemId: "s3", type: "consumption", quantity: 5, date: new Date(today.getTime() - 86400000 * 7).toISOString(), userId: "u1" },
    { _id: "m5", _creationTime: Date.now(), itemId: "s3", type: "consumption", quantity: 8, date: new Date(today.getTime() - 86400000 * 4).toISOString(), userId: "u1" },
    { _id: "m6", _creationTime: Date.now(), itemId: "s3", type: "consumption", quantity: 7, date: new Date(today.getTime() - 86400000 * 2).toISOString(), userId: "u1", notes: "Urgence patient" },
  ]
}

let mockItems = [...MOCK_PRODUCTS]
let mockMovements = generateMockMovements(MOCK_PRODUCTS)
let mockSuppliers = [...MOCK_SUPPLIERS]
let mockItemIdCounter = MOCK_PRODUCTS.length
let mockMovementIdCounter = mockMovements.length
let mockSupplierIdCounter = MOCK_SUPPLIERS.length

const supplierFormSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  contact: z.string().min(1, "Contact requis"),
  phone: z.string().min(1, "Téléphone requis"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
})

const movementFormSchema = z.object({
  itemId: z.string().min(1, "Produit requis"),
  type: z.enum(["purchase", "return", "consumption", "loss"]),
  quantity: z.number().min(1, "Quantité minimale 1"),
  notes: z.string().optional().or(z.literal("")),
})

// ───── Stock Status Helpers ─────

type StockStatus = "ok" | "low" | "rupture"

function getStockStatus(item: StockItem): StockStatus {
  if (item.quantity <= 0) return "rupture"
  if (item.quantity <= item.minThreshold) return "low"
  return "ok"
}

const STATUS_CONFIG: Record<StockStatus, { label: string; variant: "default" | "secondary" | "destructive"; className: string }> = {
  ok: { label: "Stock OK", variant: "default", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800" },
  low: { label: "Stock faible", variant: "secondary", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800" },
  rupture: { label: "Rupture", variant: "destructive", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800" },
}

const MOVEMENT_STYLES: Record<StockMovementType, { label: string; className: string }> = {
  purchase: { label: "Achat", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800" },
  return: { label: "Retour", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
  consumption: { label: "Consommation", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800" },
  loss: { label: "Perte", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800" },
}

// ───── Hook ─────

function useStockData() {
  const [items, setItems] = useState<StockItem[]>([])
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    try {
      setItems(mockItems)
      setMovements(mockMovements)
      setSuppliers(mockSuppliers)
    } catch {
      setError("Erreur lors du chargement des données")
    } finally {
      setLoading(false)
    }
  }, [])

  const lowStockItems = useMemo(() => items.filter((i) => i.quantity <= i.minThreshold), [items])

  const addItem = useCallback(async (data: z.infer<typeof stockItemSchema>) => {
    mockItemIdCounter++
    const newItem: StockItem = {
      _id: `s${mockItemIdCounter}`,
      _creationTime: Date.now(),
      ...data,
    }
    mockItems = [...mockItems, newItem]
    setItems(mockItems)
    toast({ title: "Produit créé", description: `${data.name} ajouté au stock`, variant: "success" })
  }, [toast])

  const updateItem = useCallback(async (id: string, data: Partial<StockItem>) => {
    mockItems = mockItems.map((i) => i._id === id ? { ...i, ...data } : i)
    setItems(mockItems)
    toast({ title: "Produit mis à jour", variant: "success" })
  }, [toast])

  const deleteItem = useCallback(async (id: string) => {
    const item = mockItems.find((i) => i._id === id)
    mockItems = mockItems.filter((i) => i._id !== id)
    setItems(mockItems)
    toast({ title: "Produit supprimé", description: item?.name, variant: "success" })
  }, [toast])

  const recordMovement = useCallback(async (data: z.infer<typeof movementFormSchema>) => {
    mockMovementIdCounter++
    const movement: StockMovement = {
      _id: `m${mockMovementIdCounter}`,
      _creationTime: Date.now(),
      itemId: data.itemId,
      type: data.type,
      quantity: data.quantity,
      date: new Date().toISOString(),
      notes: data.notes || undefined,
      userId: "u1",
    }
    mockMovements = [...mockMovements, movement]
    setMovements(mockMovements)

    const item = mockItems.find((i) => i._id === data.itemId)
    if (item) {
      let delta = data.quantity
      if (data.type === "consumption" || data.type === "loss") delta = -delta
      updateItem(data.itemId, { quantity: Math.max(0, item.quantity + delta) })
    }
    toast({ title: "Mouvement enregistré", variant: "success" })
  }, [toast, updateItem])

  const addSupplier = useCallback(async (data: z.infer<typeof supplierFormSchema>) => {
    mockSupplierIdCounter++
    const supplier: Supplier = {
      _id: `su${mockSupplierIdCounter}`,
      _creationTime: Date.now(),
      name: data.name,
      contact: data.contact,
      phone: data.phone,
      email: data.email || undefined,
      address: data.address || undefined,
    }
    mockSuppliers = [...mockSuppliers, supplier]
    setSuppliers(mockSuppliers)
    toast({ title: "Fournisseur créé", description: data.name, variant: "success" })
  }, [toast])

  const updateSupplier = useCallback(async (id: string, data: Partial<Supplier>) => {
    mockSuppliers = mockSuppliers.map((s) => s._id === id ? { ...s, ...data } : s)
    setSuppliers(mockSuppliers)
    toast({ title: "Fournisseur mis à jour", variant: "success" })
  }, [toast])

  const deleteSupplier = useCallback(async (id: string) => {
    mockSuppliers = mockSuppliers.filter((s) => s._id !== id)
    setSuppliers(mockSuppliers)
    toast({ title: "Fournisseur supprimé", variant: "success" })
  }, [toast])

  return {
    items, movements, suppliers, lowStockItems, loading, error,
    addItem, updateItem, deleteItem, recordMovement,
    addSupplier, updateSupplier, deleteSupplier,
  }
}

// ───── Sub-components ─────

function StockStatusBadge({ status }: { status: StockStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", cfg.className)}>
      {cfg.label}
    </span>
  )
}

function MovementTypeBadge({ type }: { type: StockMovementType }) {
  const cfg = MOVEMENT_STYLES[type]
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", cfg.className)}>
      {cfg.label}
    </span>
  )
}

function LowStockBanner({ items }: { items: StockItem[] }) {
  if (items.length === 0) return null
  const rupture = items.filter((i) => i.quantity <= 0)
  const low = items.filter((i) => i.quantity > 0 && i.quantity <= i.minThreshold)
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/50">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            Alertes de stock
          </p>
          <div className="mt-1 space-y-0.5">
            {rupture.map((i) => (
              <p key={i._id} className="text-sm text-red-600 dark:text-red-400">
                {i.name} — en rupture (0 unité)
              </p>
            ))}
            {low.map((i) => (
              <p key={i._id} className="text-sm text-amber-700 dark:text-amber-400">
                {i.name} — stock faible ({i.quantity}/{i.minThreshold})
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductFormDialog({
  open,
  onOpenChange,
  item,
  suppliers,
  categories,
  onSubmit,
  submitting,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: StockItem | null
  suppliers: Supplier[]
  categories: string[]
  onSubmit: (data: z.infer<typeof stockItemSchema>) => Promise<void>
  submitting: boolean
}) {
  const form = useForm<z.infer<typeof stockItemSchema>>({
    resolver: zodResolver(stockItemSchema),
    defaultValues: item
      ? { ...item, supplierId: item.supplierId ?? "", description: item.description ?? "" }
      : { name: "", reference: "", category: "", quantity: 0, minThreshold: 0, unitPrice: 0, supplierId: "", description: "" },
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data)
    form.reset()
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{item ? "Modifier le produit" : "Nouveau produit"}</DialogTitle>
          <DialogDescription>
            {item ? "Modifiez les informations du produit." : "Ajoutez un nouveau produit au stock."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nom du produit" />
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
                      <Input {...field} placeholder="REF-001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fournisseur</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Aucun" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Aucun</SelectItem>
                          {suppliers.map((s) => (
                            <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantité</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seuil min</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix unitaire (€)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="0.01" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Description optionnelle" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {item ? "Modifier" : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function MovementFormDialog({
  open,
  onOpenChange,
  items,
  onSubmit,
  submitting,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: StockItem[]
  onSubmit: (data: z.infer<typeof movementFormSchema>) => Promise<void>
  submitting: boolean
}) {
  const form = useForm<z.infer<typeof movementFormSchema>>({
    resolver: zodResolver(movementFormSchema),
    defaultValues: { itemId: "", type: "purchase", quantity: 1, notes: "" },
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data)
    form.reset()
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau mouvement</DialogTitle>
          <DialogDescription>
            Enregistrez une entrée ou sortie de stock.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="itemId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produit</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un produit" />
                      </SelectTrigger>
                      <SelectContent>
                        {items.map((i) => (
                          <SelectItem key={i._id} value={i._id}>
                            {i.name} ({i.reference}) — Stock: {i.quantity}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MOVEMENT_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantité</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} value={field.value} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Notes optionnelles" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function SupplierFormDialog({
  open,
  onOpenChange,
  supplier,
  onSubmit,
  submitting,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier?: Supplier | null
  onSubmit: (data: z.infer<typeof supplierFormSchema>) => Promise<void>
  submitting: boolean
}) {
  const form = useForm<z.infer<typeof supplierFormSchema>>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: supplier
      ? { name: supplier.name, contact: supplier.contact, phone: supplier.phone, email: supplier.email ?? "", address: supplier.address ?? "" }
      : { name: "", contact: "", phone: "", email: "", address: "" },
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data)
    form.reset()
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{supplier ? "Modifier le fournisseur" : "Nouveau fournisseur"}</DialogTitle>
          <DialogDescription>
            {supplier ? "Modifiez les informations du fournisseur." : "Ajoutez un nouveau fournisseur."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nom du fournisseur" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nom du contact" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="0123456789" />
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
                      <Input {...field} placeholder="contact@fournisseur.fr" />
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
                    <Textarea {...field} placeholder="Adresse optionnelle" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {supplier ? "Modifier" : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// ───── Tab: Produits ─────

function ProductsTab({
  items,
  suppliers,
  categories,
  onAdd,
  onUpdate,
  onDelete,
}: {
  items: StockItem[]
  suppliers: Supplier[]
  categories: string[]
  onAdd: (data: z.infer<typeof stockItemSchema>) => Promise<void>
  onUpdate: (id: string, data: Partial<StockItem>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<StockItem | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let r = items
    if (search) r = r.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.reference.toLowerCase().includes(search.toLowerCase()))
    if (categoryFilter !== "all") r = r.filter((i) => i.category === categoryFilter)
    return r
  }, [items, search, categoryFilter])

  const selectedItem = useMemo(() => items.find((i) => i._id === selectedItemId), [items, selectedItemId])

  async function handleFormSubmit(data: z.infer<typeof stockItemSchema>) {
    setSubmitting(true)
    try {
      if (editingItem) {
        await onUpdate(editingItem._id, data)
      } else {
        await onAdd(data)
      }
      setDialogOpen(false)
      setEditingItem(null)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Supprimer ce produit ?")) {
      await onDelete(id)
      if (selectedItemId === id) setSelectedItemId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="w-56 pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => { setEditingItem(null); setDialogOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau produit
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead className="text-right">Quantité</TableHead>
                <TableHead className="text-right">Seuil</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <PackageOpen className="h-8 w-8" />
                      <p className="text-sm">Aucun produit trouvé</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item) => {
                  const status = getStockStatus(item)
                  return (
                    <TableRow
                      key={item._id}
                      className={cn(
                        "cursor-pointer",
                        selectedItemId === item._id && "bg-muted/50"
                      )}
                      onClick={() => setSelectedItemId(selectedItemId === item._id ? null : item._id)}
                    >
                      <TableCell className="font-mono text-xs">{item.reference}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className={cn("text-right font-medium", item.quantity <= 0 && "text-destructive")}>
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">{item.minThreshold}</TableCell>
                      <TableCell>
                        <StockStatusBadge status={status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); setEditingItem(item); setDialogOpen(true) }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={(e) => { e.stopPropagation(); handleDelete(item._id) }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedItem && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{selectedItem.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Référence:</span> {selectedItem.reference}
              </div>
              <div>
                <span className="text-muted-foreground">Catégorie:</span> {selectedItem.category}
              </div>
              <div>
                <span className="text-muted-foreground">Prix unitaire:</span> {formatCurrency(selectedItem.unitPrice)}
              </div>
              <div>
                <span className="text-muted-foreground">Fournisseur:</span>{" "}
                {selectedItem.supplierId ? suppliers.find((s) => s._id === selectedItem.supplierId)?.name ?? "—" : "—"}
              </div>
              {selectedItem.description && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Description:</span> {selectedItem.description}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={(open) => { if (!open) { setDialogOpen(false); setEditingItem(null) } }}
        item={editingItem}
        suppliers={suppliers}
        categories={categories}
        onSubmit={handleFormSubmit}
        submitting={submitting}
      />
    </div>
  )
}

// ───── Tab: Mouvements ─────

function MovementsTab({
  movements,
  items,
  onRecord,
}: {
  movements: StockMovement[]
  items: StockItem[]
  onRecord: (data: z.infer<typeof movementFormSchema>) => Promise<void>
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const getItemName = (id: string) => items.find((i) => i._id === id)?.name ?? "—"

  async function handleFormSubmit(data: z.infer<typeof movementFormSchema>) {
    setSubmitting(true)
    try {
      await onRecord(data)
      setDialogOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setDialogOpen(true)}>
          <ArrowDownUp className="mr-2 h-4 w-4" />
          Nouveau mouvement
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Quantité</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ArrowDownUp className="h-8 w-8" />
                      <p className="text-sm">Aucun mouvement enregistré</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                movements.map((m) => (
                  <TableRow key={m._id}>
                    <TableCell className="text-muted-foreground text-xs">{formatDateTime(m.date)}</TableCell>
                    <TableCell className="font-medium">{getItemName(m.itemId)}</TableCell>
                    <TableCell><MovementTypeBadge type={m.type} /></TableCell>
                    <TableCell className="text-right font-medium">
                      <span className={cn(
                        (m.type === "purchase" || m.type === "return") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      )}>
                        {(m.type === "purchase" || m.type === "return") ? "+" : "-"}{m.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-48 truncate">{m.notes ?? "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <MovementFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        items={items}
        onSubmit={handleFormSubmit}
        submitting={submitting}
      />
    </div>
  )
}

// ───── Tab: Fournisseurs ─────

function SuppliersTab({
  suppliers,
  onAdd,
  onUpdate,
  onDelete,
}: {
  suppliers: Supplier[]
  onAdd: (data: z.infer<typeof supplierFormSchema>) => Promise<void>
  onUpdate: (id: string, data: Partial<Supplier>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleFormSubmit(data: z.infer<typeof supplierFormSchema>) {
    setSubmitting(true)
    try {
      if (editingSupplier) {
        await onUpdate(editingSupplier._id, data)
      } else {
        await onAdd(data)
      }
      setDialogOpen(false)
      setEditingSupplier(null)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Supprimer ce fournisseur ?")) {
      await onDelete(id)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setEditingSupplier(null); setDialogOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau fournisseur
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Truck className="h-8 w-8" />
                      <p className="text-sm">Aucun fournisseur</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                suppliers.map((s) => (
                  <TableRow key={s._id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.contact}</TableCell>
                    <TableCell>{s.phone}</TableCell>
                    <TableCell className="text-muted-foreground">{s.email ?? "—"}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setEditingSupplier(s); setDialogOpen(true) }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(s._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <SupplierFormDialog
        open={dialogOpen}
        onOpenChange={(open) => { if (!open) { setDialogOpen(false); setEditingSupplier(null) } }}
        supplier={editingSupplier}
        onSubmit={handleFormSubmit}
        submitting={submitting}
      />
    </div>
  )
}

// ───── Main Page ─────

export default function StockPage() {
  const { user } = useAuth()
  const {
    items, movements, suppliers, lowStockItems, loading, error,
    addItem, updateItem, deleteItem, recordMovement,
    addSupplier, updateSupplier, deleteSupplier,
  } = useStockData()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-destructive font-medium">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>Réessayer</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold tracking-tight">Gestion de Stock</h2>
          <Badge variant="secondary" className="ml-1">{items.length}</Badge>
        </div>
      </div>

      <LowStockBanner items={lowStockItems} />

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">
            <Package className="mr-2 h-4 w-4" />
            Produits
          </TabsTrigger>
          <TabsTrigger value="movements">
            <ArrowDownUp className="mr-2 h-4 w-4" />
            Mouvements
          </TabsTrigger>
          <TabsTrigger value="suppliers">
            <Truck className="mr-2 h-4 w-4" />
            Fournisseurs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <ProductsTab
            items={items}
            suppliers={suppliers}
            categories={MOCK_CATEGORIES}
            onAdd={addItem}
            onUpdate={updateItem}
            onDelete={deleteItem}
          />
        </TabsContent>

        <TabsContent value="movements">
          <MovementsTab
            movements={movements}
            items={items}
            onRecord={recordMovement}
          />
        </TabsContent>

        <TabsContent value="suppliers">
          <SuppliersTab
            suppliers={suppliers}
            onAdd={addSupplier}
            onUpdate={updateSupplier}
            onDelete={deleteSupplier}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
