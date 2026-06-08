"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useMutation } from "convex/react"
import { api } from "convex/_generated/api"
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
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { patientSchema, type PatientFormData } from "@/lib/zod-schemas"
import type { Patient } from "@/lib/types"
import { useAuth } from "@/hooks/use-auth"
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
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
                <FormLabel>Sexe</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input placeholder="+212600000000" {...field} />
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
                  <Input type="email" placeholder="email@exemple.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Adresse</FormLabel>
                <FormControl>
                  <Input placeholder="Adresse complète" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Informations médicales
          </h3>
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
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Assurance
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="insuranceCompany"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organisme assureur</FormLabel>
                  <FormControl>
                    <Input placeholder="CNSS, CMIM, CIMR..." {...field} />
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
                  <FormLabel>N° d'adhérent</FormLabel>
                  <FormControl>
                    <Input placeholder="Numéro d'affiliation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {defaultValues ? "Modifier" : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default function ConvexPatientsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const convexPatients = useQuery(api.patients.list, {})
  const createPatient = useMutation(api.patients.create)
  const updatePatient = useMutation(api.patients.update)
  const deletePatient = useMutation(api.patients.remove)

  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const patients = convexPatients ?? []

  const filtered = useMemo(() => {
    if (!search.trim()) return patients
    const s = search.toLowerCase()
    return patients.filter(
      (p) =>
        p.lastName.toLowerCase().includes(s) ||
        p.firstName.toLowerCase().includes(s) ||
        p.phone.toLowerCase().includes(s) ||
        (p.insuranceCompany && p.insuranceCompany.toLowerCase().includes(s))
    )
  }, [patients, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleCreate = useCallback(
    async (data: PatientFormData) => {
      if (!user) return
      setIsSubmitting(true)
      try {
        await createPatient({ ...data, createdBy: user._id as any })
        setCreateOpen(false)
        toast({ title: "Patient créé", description: "Le patient a été ajouté avec succès.", variant: "success" })
      } catch {
        toast({ title: "Erreur", description: "Impossible de créer le patient.", variant: "destructive" })
      } finally {
        setIsSubmitting(false)
      }
    },
    [user, createPatient, toast]
  )

  const handleUpdate = useCallback(
    async (data: PatientFormData) => {
      if (!editingPatient) return
      setIsSubmitting(true)
      try {
        await updatePatient({ id: editingPatient._id as any, ...data })
        setEditOpen(false)
        setEditingPatient(null)
        toast({ title: "Patient modifié", description: "Les informations ont été mises à jour.", variant: "success" })
      } catch {
        toast({ title: "Erreur", description: "Impossible de modifier le patient.", variant: "destructive" })
      } finally {
        setIsSubmitting(false)
      }
    },
    [editingPatient, updatePatient, toast]
  )

  const handleDelete = useCallback(async () => {
    if (!deletingPatient) return
    try {
      await deletePatient({ id: deletingPatient._id as any })
      setDeleteOpen(false)
      setDeletingPatient(null)
      toast({ title: "Patient supprimé", description: "Le patient a été supprimé.", variant: "success" })
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer le patient.", variant: "destructive" })
    }
  }, [deletingPatient, deletePatient, toast])

  const openEdit = useCallback((patient: Patient) => {
    setEditingPatient(patient)
    setEditOpen(true)
  }, [])

  const openDelete = useCallback((patient: Patient) => {
    setDeletingPatient(patient)
    setDeleteOpen(true)
  }, [])

  if (convexPatients === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Rechercher par nom, téléphone ou assurance..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Nouveau Patient
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            Patients {filtered.length > 0 && <span className="text-sm font-normal text-gray-500">({filtered.length})</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <UserIcon className="h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {search ? "Aucun patient trouvé" : "Aucun patient"}
              </p>
              {!search && (
                <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Ajouter un patient
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead className="hidden md:table-cell">Téléphone</TableHead>
                      <TableHead className="hidden lg:table-cell">Email</TableHead>
                      <TableHead className="hidden lg:table-cell">Assurance</TableHead>
                      <TableHead className="hidden sm:table-cell">Date d'ajout</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
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
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                              {patient.firstName[0]}{patient.lastName[0]}
                            </div>
                            <div>
                              <p className="font-medium">
                                {patient.lastName} {patient.firstName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                {patient.gender === "male" ? "Homme" : "Femme"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1.5 text-sm">
                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                            {patient.phone}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1.5 text-sm">
                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                            {patient.email || "—"}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {patient.insuranceCompany ? (
                            <Badge variant="outline" className="text-xs">
                              {patient.insuranceCompany}
                            </Badge>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-gray-500">
                          {formatDate(patient._creationTime)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" onClick={() => openEdit(patient)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openDelete(patient)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t px-4 py-3">
                  <p className="text-sm text-gray-500">
                    Page {currentPage} sur {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouveau Patient</DialogTitle>
            <DialogDescription>Ajoutez un nouveau patient à la base de données.</DialogDescription>
          </DialogHeader>
          <PatientForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} isSubmitting={isSubmitting} />
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le Patient</DialogTitle>
            <DialogDescription>Modifiez les informations du patient.</DialogDescription>
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
              onCancel={() => { setEditOpen(false); setEditingPatient(null) }}
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
              Êtes-vous sûr de vouloir supprimer <strong>{deletingPatient?.lastName} {deletingPatient?.firstName}</strong> ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
