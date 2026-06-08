"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useMutation } from "convex/react"
import { api } from "convex/_generated/api"
import {
  Plus,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Loader2,
  AlertCircle,
  Shield,
  User as UserIcon,
  Search,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useToast } from "@/lib/toast"
import { userSchema, type UserFormData } from "@/lib/zod-schemas"
import type { User, Role } from "@/lib/types"
import { cn, formatDate } from "@/lib/utils"

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

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "admin", label: "Administrateur" },
  { value: "dentist", label: "Dentiste" },
  { value: "secretary", label: "Secrétaire" },
]

const ROLE_STYLES: Record<Role, string> = {
  admin:
    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
  dentist:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  secretary:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
}

const ROLE_PERMISSIONS: Record<Role, { label: string; permissions: string[] }> =
  {
    admin: {
      label: "Administrateur",
      permissions: ["Accès complet à toutes les fonctionnalités"],
    },
    dentist: {
      label: "Dentiste",
      permissions: [
        "Patients",
        "Rendez-vous",
        "Dossiers médicaux",
        "Traitements",
        "Prescriptions",
        "Statistiques",
      ],
    },
    secretary: {
      label: "Secrétaire",
      permissions: [
        "Rendez-vous",
        "Patients",
        "Encaissements",
        "Facturation",
        "Consultation dossiers",
      ],
    },
  }

function RoleBadge({ role }: { role: Role }) {
  const label = ROLE_OPTIONS.find((o) => o.value === role)?.label ?? role
  return (
    <Badge
      variant="outline"
      className={cn("border font-medium", ROLE_STYLES[role])}
    >
      {label}
    </Badge>
  )
}

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge
      variant="outline"
      className="border-green-200 bg-green-100 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400"
    >
      Actif
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="border-gray-200 bg-gray-100 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
    >
      Inactif
    </Badge>
  )
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function UserFormDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  isSubmitting,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: UserFormData) => Promise<void>
  defaultValues?: UserFormData
  isSubmitting: boolean
}) {
  const isEdit = !!defaultValues

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: defaultValues ?? {
      email: "",
      name: "",
      role: "dentist",
      phone: "",
      password: "",
    },
  })

  useEffect(() => {
    if (open) {
      form.reset(
        defaultValues ?? {
          email: "",
          name: "",
          role: "dentist",
          phone: "",
          password: "",
        }
      )
    }
  }, [open, defaultValues, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifiez les informations de l'utilisateur."
              : "Remplissez les informations pour créer un nouvel utilisateur."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom complet</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom et prénom" {...field} />
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
                    <Input
                      type="email"
                      placeholder="email@clinique.fr"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rôle</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ROLE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
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
                    <Input placeholder="+212 6 XX XX XX XX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isEdit ? "Nouveau mot de passe (laisser vide pour conserver)" : "Mot de passe"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Minimum 6 caractères"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {isEdit ? "Modifier" : "Créer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function PermissionCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="h-4 w-4 text-primary" />
          Permissions par rôle
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          {ROLE_OPTIONS.map((role) => {
            const info = ROLE_PERMISSIONS[role.value]
            return (
              <div
                key={role.value}
                className="rounded-lg border p-4"
              >
                <div className="mb-2">
                  <RoleBadge role={role.value} />
                </div>
                <ul className="space-y-1">
                  {info.permissions.map((perm) => (
                    <li
                      key={perm}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                      {perm}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default function ConvexUsersPage() {
  const { toast } = useToast()

  const convexUsers = useQuery(api.users.list)
  const createUser = useMutation(api.users.create)
  const updateUser = useMutation(api.users.update)
  const removeUser = useMutation(api.users.remove)

  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all")

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [toggleOpen, setToggleOpen] = useState(false)
  const [togglingUser, setTogglingUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const users = convexUsers ?? []

  const filtered = useMemo(() => {
    let result = users
    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter)
    }
    if (search.trim()) {
      const s = search.toLowerCase()
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s) ||
          (u.phone && u.phone.toLowerCase().includes(s))
      )
    }
    return result
  }, [users, search, roleFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, currentPage, pageSize])

  const handleCreate = useCallback(
    async (data: UserFormData) => {
      setIsSubmitting(true)
      try {
        await createUser({
          email: data.email,
          name: data.name,
          role: data.role,
          phone: data.phone || undefined,
          password: data.password,
        })
        setCreateOpen(false)
        toast({
          title: "Utilisateur créé",
          description: `${data.name} a été ajouté avec succès.`,
          variant: "success",
        })
      } catch {
        toast({
          title: "Erreur",
          description: "Impossible de créer l'utilisateur.",
          variant: "destructive",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [createUser, toast]
  )

  const handleUpdate = useCallback(
    async (data: UserFormData) => {
      if (!editingUser) return
      setIsSubmitting(true)
      try {
        await updateUser({
          id: editingUser._id as any,
          email: data.email,
          name: data.name,
          role: data.role,
          phone: data.phone || undefined,
          password: data.password || undefined,
        })
        setEditOpen(false)
        setEditingUser(null)
        toast({
          title: "Utilisateur modifié",
          description: "Les informations ont été mises à jour.",
          variant: "success",
        })
      } catch {
        toast({
          title: "Erreur",
          description: "Impossible de modifier l'utilisateur.",
          variant: "destructive",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [editingUser, updateUser, toast]
  )

  const handleToggleActive = useCallback(async () => {
    if (!togglingUser) return
    try {
      await updateUser({ id: togglingUser._id as any, isActive: !togglingUser.isActive })
      setToggleOpen(false)
      setTogglingUser(null)
      toast({
        title: togglingUser.isActive
          ? "Utilisateur désactivé"
          : "Utilisateur activé",
        description: togglingUser.isActive
          ? `${togglingUser.name} ne peut plus se connecter.`
          : `${togglingUser.name} peut maintenant se connecter.`,
        variant: "default",
      })
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut.",
        variant: "destructive",
      })
    }
  }, [togglingUser, updateUser, toast])

  const openEdit = useCallback((user: User) => {
    setEditingUser(user)
    setEditOpen(true)
  }, [])

  const openToggle = useCallback((user: User) => {
    setTogglingUser(user)
    setToggleOpen(true)
  }, [])

  if (convexUsers === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gestion des Utilisateurs
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gérez les comptes et les accès au système.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Nouvel utilisateur
        </Button>
      </div>

      <PermissionCard />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email ou téléphone..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(v) => {
            setRoleFilter(v as Role | "all")
            setCurrentPage(1)
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Tous les rôles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            {ROLE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 && (search || roleFilter !== "all") ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Search className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <p className="text-lg font-medium">Aucun résultat</p>
              <p className="text-sm text-muted-foreground">
                Aucun utilisateur ne correspond à vos critères.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearch("")
                setRoleFilter("all")
              }}
            >
              Effacer les filtres
            </Button>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <div className="rounded-full bg-muted p-4">
              <UserIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium">Aucun utilisateur</p>
              <p className="text-sm text-muted-foreground">
                Commencez par ajouter votre premier utilisateur.
              </p>
            </div>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Nouvel utilisateur
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="px-6 py-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {filtered.length} utilisateur
              {filtered.length > 1 ? "s" : ""}
              {(search || roleFilter !== "all") && " (filtrés)"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-[120px] text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          {user.lastLogin && (
                            <p className="text-xs text-muted-foreground">
                              Dernière connexion :{" "}
                              {formatDate(user.lastLogin)}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={user.role} />
                    </TableCell>
                    <TableCell>
                      {user.phone ? (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm">{user.phone}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          —
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge active={user.isActive} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(user)}
                          title="Modifier"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openToggle(user)}
                          title={
                            user.isActive
                              ? "Désactiver"
                              : "Activer"
                          }
                        >
                          {user.isActive ? (
                            <ToggleRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          )}
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
                  onClick={() =>
                    setCurrentPage((p) => Math.max(1, p - 1))
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(totalPages, p + 1)
                    )
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      <UserFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
      />

      {editingUser && (
        <UserFormDialog
          open={editOpen}
          onOpenChange={(open) => {
            if (!open) {
              setEditOpen(false)
              setEditingUser(null)
            }
          }}
          onSubmit={handleUpdate}
          defaultValues={{
            email: editingUser.email,
            name: editingUser.name,
            role: editingUser.role,
            phone: editingUser.phone ?? "",
            password: "",
          }}
          isSubmitting={isSubmitting}
        />
      )}

      <AlertDialog open={toggleOpen} onOpenChange={setToggleOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {togglingUser?.isActive
                ? "Désactiver l'utilisateur"
                : "Activer l'utilisateur"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {togglingUser?.isActive
                ? `Êtes-vous sûr de vouloir désactiver ${togglingUser?.name} ? Cet utilisateur ne pourra plus se connecter.`
                : `Êtes-vous sûr de vouloir activer ${togglingUser?.name} ? Cet utilisateur pourra à nouveau se connecter.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleActive}>
              {togglingUser?.isActive ? "Désactiver" : "Activer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
