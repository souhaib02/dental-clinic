"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  User as UserIcon,
  AlertCircle,
  Phone,
  Mail,
  Shield,
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { patientSchema, type PatientFormData } from "@/lib/zod-schemas"
import type { Patient } from "@/lib/types"
import { useToast } from "@/lib/toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
import { Textarea } from "@/components/ui/textarea"

const MOCK_PATIENTS: Patient[] = [
  {
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
  },
  {
    _id: "p2",
    _creationTime: Date.now() - 86400000 * 5,
    firstName: "Fatima",
    lastName: "Benali",
    dateOfBirth: "1990-07-22",
    gender: "female",
    phone: "+212 6 98 76 54 32",
    email: "fatima.benali@email.com",
    address: "45 Avenue Hassan II, Rabat",
    profession: "Médecin",
    bloodGroup: "O-",
    allergies: "",
    insuranceCompany: "CNSS",
    insuranceNumber: "CNSS-98765",
    createdBy: "u1",
  },
  {
    _id: "p3",
    _creationTime: Date.now() - 86400000 * 2,
    firstName: "Mohamed",
    lastName: "Idrissi",
    dateOfBirth: "1978-11-08",
    gender: "male",
    phone: "+212 6 55 44 33 22",
    email: "m.idrissi@email.com",
    address: "8 Rue Atlas, Marrakech",
    profession: "Commerçant",
    bloodGroup: "B+",
    allergies: "Aspirine, Ibuprofène",
    insuranceCompany: "FAR",
    insuranceNumber: "FAR-45678",
    createdBy: "u2",
  },
  {
    _id: "p4",
    _creationTime: Date.now() - 86400000 * 1,
    firstName: "Sara",
    lastName: "El Amrani",
    dateOfBirth: "1995-02-14",
    gender: "female",
    phone: "+212 6 11 22 33 44",
    email: "sara.elamrani@email.com",
    address: "23 Rue des Orangers, Fès",
    profession: "Enseignante",
    bloodGroup: "AB+",
    allergies: "Latex",
    insuranceCompany: "MAMDA",
    insuranceNumber: "MAMDA-23456",
    createdBy: "u1",
  },
  {
    _id: "p5",
    _creationTime: Date.now() - 86400000 * 0.5,
    firstName: "Hassan",
    lastName: "Ouazzani",
    dateOfBirth: "1965-09-30",
    gender: "male",
    phone: "+212 6 77 88 99 00",
    email: "",
    address: "5 Boulevard Mohammed V, Tanger",
    profession: "Retraité",
    bloodGroup: "O+",
    allergies: "",
    insuranceCompany: "",
    insuranceNumber: "",
    createdBy: "u2",
  },
]

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

function PatientForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  defaultValues?: PatientFormData
  onSubmit: (data: PatientFormData) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
}) {
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: defaultValues ?? {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "male",
      phone: "",
      email: "",
      address: "",
      profession: "",
      bloodGroup: "",
      allergies: "",
      medicalHistory: "",
      ongoingTreatments: "",
      insuranceCompany: "",
      insuranceNumber: "",
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
                  <Input placeholder="Nom" {...field} />
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
                  <Input placeholder="Prénom" {...field} />
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
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
                  <Input placeholder="+212 6 XX XX XX XX" {...field} />
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
                  <Input type="email" placeholder="email@example.com" {...field} />
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
                <Input placeholder="Adresse complète" {...field} />
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
                  <Input placeholder="Profession" {...field} />
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
                <Textarea placeholder="Allergies connues" {...field} />
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
                <Textarea placeholder="Antécédents médicaux" {...field} />
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
                <Textarea placeholder="Traitements en cours" {...field} />
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
                  <Input placeholder="Assurance" {...field} />
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
                  <Input placeholder="Numéro d'assurance" {...field} />
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
            {defaultValues ? "Modifier" : "Créer"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-9 w-36 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-10 w-72 animate-pulse rounded bg-muted" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-12 w-full animate-pulse rounded bg-muted"
          />
        ))}
      </div>
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-12">
        <div className="rounded-full bg-muted p-4">
          <UserIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-lg font-medium">Aucun patient</p>
          <p className="text-sm text-muted-foreground">
            Commencez par ajouter votre premier patient.
          </p>
        </div>
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4" />
          Nouveau Patient
        </Button>
      </CardContent>
    </Card>
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

function PatientsUI() {
  const router = useRouter()
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const filtered = useMemo(() => {
    if (!search.trim()) return patients
    const s = search.toLowerCase()
    return patients.filter(
      (p) =>
        p.lastName.toLowerCase().includes(s) ||
        p.firstName.toLowerCase().includes(s) ||
        p.phone.toLowerCase().includes(s) ||
        (p.insuranceCompany &&
          p.insuranceCompany.toLowerCase().includes(s))
    )
  }, [patients, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, currentPage, pageSize])

  const handleCreate = useCallback(
    async (data: PatientFormData) => {
      setIsSubmitting(true)
      try {
        const newPatient: Patient = {
          _id: `p${Date.now()}`,
          _creationTime: Date.now(),
          ...data,
          createdBy: "u1",
        }
        setPatients((prev) => [newPatient, ...prev])
        setCreateOpen(false)
        toast({ title: "Patient créé", description: "Le patient a été ajouté avec succès.", variant: "success" })
      } catch {
        toast({ title: "Erreur", description: "Impossible de créer le patient.", variant: "destructive" })
      } finally {
        setIsSubmitting(false)
      }
    },
    [toast]
  )

  const handleUpdate = useCallback(
    async (data: PatientFormData) => {
      if (!editingPatient) return
      setIsSubmitting(true)
      try {
        setPatients((prev) =>
          prev.map((p) =>
            p._id === editingPatient._id ? { ...p, ...data } : p
          )
        )
        setEditOpen(false)
        setEditingPatient(null)
        toast({ title: "Patient modifié", description: "Les informations ont été mises à jour.", variant: "success" })
      } catch {
        toast({ title: "Erreur", description: "Impossible de modifier le patient.", variant: "destructive" })
      } finally {
        setIsSubmitting(false)
      }
    },
    [editingPatient, toast]
  )

  const handleDelete = useCallback(() => {
    if (!deletingPatient) return
    setPatients((prev) => prev.filter((p) => p._id !== deletingPatient._id))
    setDeleteOpen(false)
    setDeletingPatient(null)
    toast({ title: "Patient supprimé", description: "Le patient a été supprimé.", variant: "default" })
  }, [deletingPatient, toast])

  const openEdit = useCallback((patient: Patient) => {
    setEditingPatient(patient)
    setEditOpen(true)
  }, [])

  const openDelete = useCallback((patient: Patient) => {
    setDeletingPatient(patient)
    setDeleteOpen(true)
  }, [])

  if (error) {
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
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
          <p className="text-sm text-muted-foreground">
            Gérez vos patients et leurs informations.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Nouveau Patient
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom, téléphone ou assurance..."
          className="pl-9"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setCurrentPage(1)
          }}
        />
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : filtered.length === 0 ? (
        search ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <Search className="h-8 w-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-lg font-medium">Aucun résultat</p>
                <p className="text-sm text-muted-foreground">
                  Aucun patient ne correspond à votre recherche.
                </p>
              </div>
              <Button variant="outline" onClick={() => setSearch("")}>
                Effacer la recherche
              </Button>
            </CardContent>
          </Card>
        ) : (
          <EmptyState onAdd={() => setCreateOpen(true)} />
        )
      ) : (
        <Card>
          <CardHeader className="px-6 py-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {filtered.length} patient{filtered.length > 1 ? "s" : ""}
              {search && ` (filtrés)`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Assurance</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead className="w-[100px] text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((patient) => (
                  <TableRow
                    key={patient._id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/patients/${patient._id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                          {getInitials(patient.firstName, patient.lastName)}
                        </div>
                        <div>
                          <p className="font-medium">
                            {patient.lastName} {patient.firstName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {patient.gender === "male" ? "Homme" : "Femme"} ·{" "}
                            {patient.profession || "—"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">{patient.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {patient.email ? (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm">{patient.email}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {patient.insuranceCompany ? (
                        <div className="flex items-center gap-2">
                          <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm">
                            {patient.insuranceCompany}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(patient._creationTime)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            openEdit(patient)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            openDelete(patient)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-6 py-3">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouveau Patient</DialogTitle>
            <DialogDescription>
              Ajoutez un nouveau patient à la base de données.
            </DialogDescription>
          </DialogHeader>
          <PatientForm
            onSubmit={handleCreate}
            onCancel={() => setCreateOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le Patient</DialogTitle>
            <DialogDescription>
              Modifiez les informations du patient.
            </DialogDescription>
          </DialogHeader>
          {editingPatient && (
            <PatientForm
              defaultValues={{
                firstName: editingPatient.firstName,
                lastName: editingPatient.lastName,
                dateOfBirth: editingPatient.dateOfBirth,
                gender: editingPatient.gender,
                phone: editingPatient.phone,
                email: editingPatient.email ?? "",
                address: editingPatient.address ?? "",
                profession: editingPatient.profession ?? "",
                bloodGroup: editingPatient.bloodGroup ?? "",
                allergies: editingPatient.allergies ?? "",
                medicalHistory: editingPatient.medicalHistory ?? "",
                ongoingTreatments: editingPatient.ongoingTreatments ?? "",
                insuranceCompany: editingPatient.insuranceCompany ?? "",
                insuranceNumber: editingPatient.insuranceNumber ?? "",
              }}
              onSubmit={handleUpdate}
              onCancel={() => {
                setEditOpen(false)
                setEditingPatient(null)
              }}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le patient</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer{" "}
              <strong>
                {deletingPatient?.lastName} {deletingPatient?.firstName}
              </strong>
              ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function PatientsPage() {
  return <PatientsUI />
}
