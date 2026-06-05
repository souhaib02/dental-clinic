"use client"

import { useState, useMemo, useCallback } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/lib/toast"
import { formatDate, formatCurrency, cn } from "@/lib/utils"
import type { Patient, MedicalRecord, Treatment, Prescription, OdontogramEntry, ToothStatus } from "@/lib/types"
import { Odontogram } from "@/components/medical/odontogram"
import {
  Search,
  Plus,
  Loader2,
  Stethoscope,
  Pill,
  Activity,
  AlertCircle,
  FileText,
  Calendar,
  DollarSign,
  User as UserIcon,
  ChevronDown,
  X,
  Cross,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

const MOCK_PATIENTS: Patient[] = [
  { _id: "p1", _creationTime: Date.now() - 864e5 * 10, firstName: "Jean", lastName: "Dupont", dateOfBirth: "1985-03-15", gender: "male", phone: "+212 6 12 34 56 78", email: "jean.dupont@email.com", createdBy: "u1" },
  { _id: "p2", _creationTime: Date.now() - 864e5 * 5, firstName: "Fatima", lastName: "Benali", dateOfBirth: "1990-07-22", gender: "female", phone: "+212 6 98 76 54 32", email: "fatima.benali@email.com", createdBy: "u1" },
  { _id: "p3", _creationTime: Date.now() - 864e5 * 2, firstName: "Mohamed", lastName: "Idrissi", dateOfBirth: "1978-11-08", gender: "male", phone: "+212 6 55 44 33 22", email: "m.idrissi@email.com", createdBy: "u2" },
  { _id: "p4", _creationTime: Date.now() - 864e5, firstName: "Sara", lastName: "El Amrani", dateOfBirth: "1995-02-14", gender: "female", phone: "+212 6 11 22 33 44", email: "sara.elamrani@email.com", createdBy: "u1" },
  { _id: "p5", _creationTime: Date.now() - 864e5 * 0.5, firstName: "Hassan", lastName: "Ouazzani", dateOfBirth: "1965-09-30", gender: "male", phone: "+212 6 77 88 99 00", createdBy: "u2" },
]

function mockRecords(pid: string): MedicalRecord[] {
  const d = (days: number) => new Date(Date.now() - 864e5 * days).toISOString()
  return [
    { _id: "mr1", _creationTime: Date.parse(d(30)), patientId: pid, type: "diagnosis", title: "Carie dentaire multiple", description: "Présence de caries sur les dents 16, 26 et 36. Nécessite traitement restaurateur.", doctorId: "d1", date: d(30) },
    { _id: "mr2", _creationTime: Date.parse(d(25)), patientId: pid, type: "clinical_note", title: "Détartrage complet", description: "Détartrage supra-gingival et surfaçage radiculaire effectués.", doctorId: "d1", date: d(25) },
    { _id: "mr3", _creationTime: Date.parse(d(20)), patientId: pid, type: "treatment_plan", title: "Plan de traitement prothétique", description: "Couronne sur dent 26, bridge sur 24-26.", doctorId: "d1", date: d(20) },
    { _id: "mr4", _creationTime: Date.parse(d(15)), patientId: pid, type: "diagnosis", title: "Parodontite chronique", description: "Saignement au sondage, poches de 5mm sur les molaires.", doctorId: "d2", date: d(15) },
    { _id: "mr5", _creationTime: Date.parse(d(10)), patientId: pid, type: "clinical_note", title: "Suivi orthodontique", description: "Contrôle mensuel. Bonne évolution du traitement.", doctorId: "d2", date: d(10) },
  ]
}

function mockTreatments(pid: string): Treatment[] {
  const d = (days: number) => new Date(Date.now() - 864e5 * days).toISOString()
  return [
    { _id: "t1", _creationTime: Date.parse(d(30)), patientId: pid, name: "Détartrage", description: "Détartrage complet supra et sous-gingival", cost: 300, status: "completed", startDate: d(30), endDate: d(28), doctorId: "d1" },
    { _id: "t2", _creationTime: Date.parse(d(20)), patientId: pid, name: "Traitement carie 16", description: "Restaurer la dent 16 avec composite", toothNumber: 16, cost: 600, status: "completed", startDate: d(20), endDate: d(18), doctorId: "d1" },
    { _id: "t3", _creationTime: Date.parse(d(10)), patientId: pid, name: "Couronne dent 26", description: "Couronne céramique sur dent 26", toothNumber: 26, cost: 2500, status: "in_progress", startDate: d(10), doctorId: "d1" },
    { _id: "t4", _creationTime: Date.parse(d(5)), patientId: pid, name: "Bridge 24-26", description: "Bridge 3 éléments", toothNumber: 24, cost: 4500, status: "planned", startDate: d(30), doctorId: "d1" },
    { _id: "t5", _creationTime: Date.parse(d(2)), patientId: pid, name: "Dévitalisation 36", description: "Traitement canalaire dent 36", toothNumber: 36, cost: 1800, status: "planned", startDate: d(14), doctorId: "d2" },
  ]
}

function mockPrescriptions(pid: string): Prescription[] {
  const d = (days: number) => new Date(Date.now() - 864e5 * days).toISOString()
  return [
    { _id: "rx1", _creationTime: Date.parse(d(30)), patientId: pid, doctorId: "d1", medication: "Amoxicilline", dosage: "500mg", frequency: "3 fois/jour", duration: "7 jours", notes: "Prendre après les repas", date: d(30) },
    { _id: "rx2", _creationTime: Date.parse(d(20)), patientId: pid, doctorId: "d1", medication: "Ibuprofène", dosage: "400mg", frequency: "2 fois/jour", duration: "5 jours", notes: "Si douleur", date: d(20) },
    { _id: "rx3", _creationTime: Date.parse(d(15)), patientId: pid, doctorId: "d2", medication: "Paracétamol", dosage: "1000mg", frequency: "3 fois/jour", duration: "3 jours", notes: "Ne pas dépasser 3g par jour", date: d(15) },
    { _id: "rx4", _creationTime: Date.parse(d(5)), patientId: pid, doctorId: "d1", medication: "Chlorhexidine 0.12%", dosage: "15ml", frequency: "2 fois/jour", duration: "14 jours", notes: "Bain de bouche après brossage", date: d(5) },
  ]
}

function mockOdontogram(pid: string): OdontogramEntry[] {
  const d = (days: number) => new Date(Date.now() - 864e5 * days).toISOString()
  return [
    { _id: "oe1", _creationTime: Date.parse(d(30)), patientId: pid, toothNumber: 16, status: "decayed", notes: "Carie profonde", date: d(30), createdBy: "d1" },
    { _id: "oe2", _creationTime: Date.parse(d(25)), patientId: pid, toothNumber: 11, status: "filled", date: d(25), createdBy: "d1" },
    { _id: "oe3", _creationTime: Date.parse(d(20)), patientId: pid, toothNumber: 26, status: "crowned", date: d(20), createdBy: "d1" },
    { _id: "oe4", _creationTime: Date.parse(d(10)), patientId: pid, toothNumber: 36, status: "extracted", date: d(10), createdBy: "d1" },
    { _id: "oe5", _creationTime: Date.parse(d(5)), patientId: pid, toothNumber: 46, status: "root_canal", date: d(5), createdBy: "d1" },
    { _id: "oe6", _creationTime: Date.parse(d(2)), patientId: pid, toothNumber: 14, status: "implant", date: d(2), createdBy: "d1" },
    { _id: "oe7", _creationTime: Date.parse(d(1)), patientId: pid, toothNumber: 24, status: "bridge", date: d(1), createdBy: "d1" },
    { _id: "oe8", _creationTime: Date.parse(d(15)), patientId: pid, toothNumber: 18, status: "missing", date: d(15), createdBy: "d1" },
  ]
}

const DOCTOR_NAMES: Record<string, string> = {
  d1: "Dr. Sarah Ahmed",
  d2: "Dr. Karim Benzema",
  d3: "Dr. Leila Mokhtar",
}

const RECORD_TYPE_STYLES: Record<MedicalRecord["type"], { badge: string; label: string }> = {
  diagnosis: { badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300", label: "Diagnostic" },
  clinical_note: { badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", label: "Note clinique" },
  prescription: { badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", label: "Ordonnance" },
  treatment_plan: { badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", label: "Plan de traitement" },
}

const TREATMENT_STATUS_STYLES: Record<Treatment["status"], { badge: string; label: string }> = {
  planned: { badge: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300", label: "Planifié" },
  in_progress: { badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300", label: "En cours" },
  completed: { badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", label: "Terminé" },
  cancelled: { badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300", label: "Annulé" },
}

const TOOTH_STATUS_CONFIG: Record<ToothStatus, { bg: string; label: string }> = {
  healthy: { bg: "bg-green-500 dark:bg-green-600", label: "Sain" },
  decayed: { bg: "bg-red-500 dark:bg-red-600", label: "Carie" },
  filled: { bg: "bg-blue-500 dark:bg-blue-600", label: "Plombé" },
  crowned: { bg: "bg-purple-500 dark:bg-purple-600", label: "Couronné" },
  extracted: { bg: "bg-gray-400 dark:bg-gray-500", label: "Extrait" },
  root_canal: { bg: "bg-yellow-500 dark:bg-yellow-600", label: "Dévitalisé" },
  implant: { bg: "bg-cyan-500 dark:bg-cyan-600", label: "Implant" },
  bridge: { bg: "bg-pink-500 dark:bg-pink-600", label: "Pont" },
  missing: { bg: "bg-gray-700 dark:bg-gray-600", label: "Absent" },
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="h-10 w-full animate-pulse rounded bg-muted" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 w-full animate-pulse rounded bg-muted" />
        ))}
      </div>
    </div>
  )
}

function EmptyState({ icon: Icon, title, description, action }: {
  icon: React.ElementType
  title: string
  description: string
  action?: { label: string; onClick: () => void }
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
        {action && (
          <Button onClick={action.onClick}>
            <Plus className="h-4 w-4" />
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function PatientSearchSelect({
  patients,
  value,
  onChange,
}: {
  patients: Patient[]
  value: string
  onChange: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    if (!search.trim()) return patients
    const s = search.toLowerCase()
    return patients.filter(
      (p) =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(s) ||
        `${p.lastName} ${p.firstName}`.toLowerCase().includes(s) ||
        p.phone.toLowerCase().includes(s)
    )
  }, [patients, search])

  const selected = patients.find((p) => p._id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {selected ? (
            <span>
              {selected.lastName} {selected.firstName}
            </span>
          ) : (
            <span className="text-muted-foreground">Sélectionner un patient...</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            placeholder="Rechercher un patient..."
            className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="shrink-0 rounded-sm p-1 hover:bg-accent"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <ScrollArea className="max-h-72">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Aucun patient trouvé
            </div>
          ) : (
            filtered.map((p) => (
              <button
                key={p._id}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors",
                  p._id === value && "bg-accent"
                )}
                onClick={() => {
                  onChange(p._id)
                  setOpen(false)
                }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {getInitials(p.firstName, p.lastName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">
                    {p.lastName} {p.firstName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {p.phone} {p.email ? `· ${p.email}` : ""}
                  </p>
                </div>
              </button>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

function ToothStatusDialog({
  open,
  onOpenChange,
  toothNumber,
  currentStatus,
  currentNotes,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  toothNumber: number | null
  currentStatus: ToothStatus
  currentNotes?: string
  onSave: (status: ToothStatus, notes: string) => void
}) {
  const [status, setStatus] = useState<ToothStatus>(currentStatus)
  const [notes, setNotes] = useState(currentNotes ?? "")

  const entries = Object.entries(TOOTH_STATUS_CONFIG) as [ToothStatus, typeof TOOTH_STATUS_CONFIG[ToothStatus]][]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cross className="h-5 w-5" />
            Dent {toothNumber}
          </DialogTitle>
          <DialogDescription>
            Modifier l&apos;état de la dent
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {entries.map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setStatus(key)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-xs font-medium transition-all hover:scale-105",
                  status === key
                    ? "border-ring bg-accent"
                    : "border-transparent hover:border-border"
                )}
              >
                <div className={cn("h-5 w-5 rounded", cfg.bg)} />
                {cfg.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tooth-notes">Notes</Label>
            <Textarea
              id="tooth-notes"
              placeholder="Notes optionnelles..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={() => onSave(status, notes)}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CreateRecordDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { type: MedicalRecord["type"]; title: string; description: string; date: string }) => void
}) {
  const [type, setType] = useState<MedicalRecord["type"]>("clinical_note")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])

  const handleSubmit = () => {
    if (!title.trim()) return
    onSubmit({ type, title: title.trim(), description: description.trim(), date })
    onOpenChange(false)
    setTitle("")
    setDescription("")
    setType("clinical_note")
    setDate(new Date().toISOString().split("T")[0])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouvelle note clinique</DialogTitle>
          <DialogDescription>
            Ajouter une note au dossier médical du patient
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="record-type">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as MedicalRecord["type"])}>
              <SelectTrigger id="record-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clinical_note">Note clinique</SelectItem>
                <SelectItem value="diagnosis">Diagnostic</SelectItem>
                <SelectItem value="treatment_plan">Plan de traitement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="record-title">Titre</Label>
            <Input
              id="record-title"
              placeholder="Titre de la note"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="record-date">Date</Label>
            <Input
              id="record-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="record-desc">Description</Label>
            <Textarea
              id="record-desc"
              placeholder="Description détaillée..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            Créer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CreateTreatmentDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { name: string; description: string; toothNumber?: number; cost: number; startDate: string; notes: string }) => void
}) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [toothNumber, setToothNumber] = useState("")
  const [cost, setCost] = useState("")
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])
  const [notes, setNotes] = useState("")

  const handleSubmit = () => {
    if (!name.trim()) return
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      toothNumber: toothNumber ? parseInt(toothNumber, 10) : undefined,
      cost: parseFloat(cost) || 0,
      startDate,
      notes: notes.trim(),
    })
    onOpenChange(false)
    setName("")
    setDescription("")
    setToothNumber("")
    setCost("")
    setStartDate(new Date().toISOString().split("T")[0])
    setNotes("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouveau traitement</DialogTitle>
          <DialogDescription>
            Ajouter un nouveau traitement pour ce patient
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="treatment-name">Nom du traitement</Label>
            <Input
              id="treatment-name"
              placeholder="Ex: Détartrage, Couronne..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatment-desc">Description</Label>
            <Textarea
              id="treatment-desc"
              placeholder="Description du traitement..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="treatment-tooth">Dent (optionnel)</Label>
              <Input
                id="treatment-tooth"
                type="number"
                min={11}
                max={48}
                placeholder="Ex: 16"
                value={toothNumber}
                onChange={(e) => setToothNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="treatment-cost">Coût (DH)</Label>
              <Input
                id="treatment-cost"
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatment-start">Date de début</Label>
            <Input
              id="treatment-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatment-notes">Notes</Label>
            <Textarea
              id="treatment-notes"
              placeholder="Notes supplémentaires..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            Créer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CreatePrescriptionDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { medication: string; dosage: string; frequency: string; duration: string; notes: string }) => void
}) {
  const [medication, setMedication] = useState("")
  const [dosage, setDosage] = useState("")
  const [frequency, setFrequency] = useState("")
  const [duration, setDuration] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = () => {
    if (!medication.trim() || !dosage.trim() || !frequency.trim() || !duration.trim()) return
    onSubmit({
      medication: medication.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      duration: duration.trim(),
      notes: notes.trim(),
    })
    onOpenChange(false)
    setMedication("")
    setDosage("")
    setFrequency("")
    setDuration("")
    setNotes("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouvelle ordonnance</DialogTitle>
          <DialogDescription>
            Prescrire un médicament pour ce patient
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rx-medication">Médicament</Label>
            <Input
              id="rx-medication"
              placeholder="Nom du médicament"
              value={medication}
              onChange={(e) => setMedication(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rx-dosage">Dosage</Label>
              <Input
                id="rx-dosage"
                placeholder="Ex: 500mg"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rx-frequency">Fréquence</Label>
              <Input
                id="rx-frequency"
                placeholder="Ex: 3 fois/jour"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rx-duration">Durée</Label>
            <Input
              id="rx-duration"
              placeholder="Ex: 7 jours"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rx-notes">Notes</Label>
            <Textarea
              id="rx-notes"
              placeholder="Instructions supplémentaires..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!medication.trim() || !dosage.trim() || !frequency.trim() || !duration.trim()}
          >
            Créer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function useMedicalData(patientId: string | null) {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [odontogram, setOdontogram] = useState<OdontogramEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  const loadData = useCallback((pid: string) => {
    setLoading(true)
    setError(null)
    try {
      setRecords(mockRecords(pid))
      setTreatments(mockTreatments(pid))
      setPrescriptions(mockPrescriptions(pid))
      setOdontogram(mockOdontogram(pid))
    } catch {
      setError("Erreur lors du chargement des données")
    } finally {
      setLoading(false)
    }
  }, [])

  const addRecord = useCallback((data: { type: MedicalRecord["type"]; title: string; description: string; date: string }) => {
    if (!patientId || !user) return
    const newRecord: MedicalRecord = {
      _id: `mr${Date.now()}`,
      _creationTime: Date.now(),
      patientId,
      type: data.type,
      title: data.title,
      description: data.description,
      doctorId: user._id,
      date: new Date(data.date).toISOString(),
    }
    setRecords((prev) => [newRecord, ...prev])
    toast({ title: "Note créée", variant: "success" })
  }, [patientId, user, toast])

  const addTreatment = useCallback((data: { name: string; description: string; toothNumber?: number; cost: number; startDate: string; notes: string }) => {
    if (!patientId || !user) return
    const newTreatment: Treatment = {
      _id: `t${Date.now()}`,
      _creationTime: Date.now(),
      patientId,
      name: data.name,
      description: data.description,
      toothNumber: data.toothNumber,
      cost: data.cost,
      status: "planned",
      startDate: new Date(data.startDate).toISOString(),
      doctorId: user._id,
      notes: data.notes,
    }
    setTreatments((prev) => [newTreatment, ...prev])
    toast({ title: "Traitement créé", variant: "success" })
  }, [patientId, user, toast])

  const addPrescription = useCallback((data: { medication: string; dosage: string; frequency: string; duration: string; notes: string }) => {
    if (!patientId || !user) return
    const newPrescription: Prescription = {
      _id: `rx${Date.now()}`,
      _creationTime: Date.now(),
      patientId,
      doctorId: user._id,
      medication: data.medication,
      dosage: data.dosage,
      frequency: data.frequency,
      duration: data.duration,
      notes: data.notes,
      date: new Date().toISOString(),
    }
    setPrescriptions((prev) => [newPrescription, ...prev])
    toast({ title: "Ordonnance créée", variant: "success" })
  }, [patientId, user, toast])

  const updateOdontogramEntry = useCallback((toothNumber: number, status: ToothStatus, notes: string) => {
    if (!patientId || !user) return
    setOdontogram((prev) => {
      const existing = prev.findIndex((e) => e.toothNumber === toothNumber)
      const newEntry: OdontogramEntry = {
        _id: existing >= 0 ? prev[existing]._id : `oe${Date.now()}`,
        _creationTime: existing >= 0 ? prev[existing]._creationTime : Date.now(),
        patientId,
        toothNumber,
        status,
        notes: notes || undefined,
        date: new Date().toISOString(),
        createdBy: user._id,
      }
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = newEntry
        return updated
      }
      return [...prev, newEntry]
    })
    toast({ title: "Dent mise à jour", description: `Dent ${toothNumber}: ${TOOTH_STATUS_CONFIG[status].label}`, variant: "success" })
  }, [patientId, user, toast])

  return {
    records, treatments, prescriptions, odontogram,
    loading, error, loadData,
    addRecord, addTreatment, addPrescription, updateOdontogramEntry,
  }
}

function MedicalRecordsUI() {
  const { user } = useAuth()
  const [selectedPatientId, setSelectedPatientId] = useState<string>("")
  const [tab, setTab] = useState("odontogramme")
  const [recordTypeFilter, setRecordTypeFilter] = useState<MedicalRecord["type"] | "all">("all")

  const [toothDialogOpen, setToothDialogOpen] = useState(false)
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null)
  const [recordDialogOpen, setRecordDialogOpen] = useState(false)
  const [treatmentDialogOpen, setTreatmentDialogOpen] = useState(false)
  const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false)

  const {
    records, treatments, prescriptions, odontogram,
    loading, error, loadData,
    addRecord, addTreatment, addPrescription, updateOdontogramEntry,
  } = useMedicalData(selectedPatientId || null)

  const selectedPatient = useMemo(
    () => MOCK_PATIENTS.find((p) => p._id === selectedPatientId),
    [selectedPatientId]
  )

  const handlePatientChange = useCallback((id: string) => {
    setSelectedPatientId(id)
    loadData(id)
  }, [loadData])

  const handleToothClick = useCallback((toothNumber: number) => {
    setSelectedTooth(toothNumber)
    setToothDialogOpen(true)
  }, [])

  const handleToothSave = useCallback((status: ToothStatus, notes: string) => {
    if (selectedTooth === null) return
    updateOdontogramEntry(selectedTooth, status, notes)
    setToothDialogOpen(false)
    setSelectedTooth(null)
  }, [selectedTooth, updateOdontogramEntry])

  const currentToothEntry = selectedTooth
    ? odontogram.find((e) => e.toothNumber === selectedTooth)
    : null

  const filteredRecords = useMemo(
    () =>
      recordTypeFilter === "all"
        ? records
        : records.filter((r) => r.type === recordTypeFilter),
    [records, recordTypeFilter]
  )

  const filterButtons = [
    { key: "all", label: "Tous" },
    { key: "diagnosis" as MedicalRecord["type"], label: RECORD_TYPE_STYLES.diagnosis.label },
    { key: "clinical_note" as MedicalRecord["type"], label: RECORD_TYPE_STYLES.clinical_note.label },
    { key: "treatment_plan" as MedicalRecord["type"], label: RECORD_TYPE_STYLES.treatment_plan.label },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dossier Médical</h1>
          <p className="text-sm text-muted-foreground">
            Gérez les dossiers médicaux, odontogrammes, traitements et prescriptions
          </p>
        </div>
      </div>

      <div className="max-w-xl">
        <Label className="mb-1.5 block text-sm font-medium">Patient</Label>
        <PatientSearchSelect
          patients={MOCK_PATIENTS}
          value={selectedPatientId}
          onChange={handlePatientChange}
        />
      </div>

      {error && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={() => selectedPatientId && loadData(selectedPatientId)}>
              Réessayer
            </Button>
          </CardContent>
        </Card>
      )}

      {!selectedPatientId && !error && (
        <EmptyState
          icon={UserIcon}
          title="Sélectionnez un patient"
          description="Recherchez et sélectionnez un patient pour voir son dossier médical."
        />
      )}

      {selectedPatientId && loading && <LoadingSkeleton />}

      {selectedPatientId && !loading && !error && (
        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="odontogramme" className="flex items-center gap-1.5">
              <Cross className="h-4 w-4" />
              Odontogramme
            </TabsTrigger>
            <TabsTrigger value="dossier" className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              Dossier clinique
            </TabsTrigger>
            <TabsTrigger value="traitements" className="flex items-center gap-1.5">
              <Activity className="h-4 w-4" />
              Traitements
            </TabsTrigger>
            <TabsTrigger value="prescriptions" className="flex items-center gap-1.5">
              <Pill className="h-4 w-4" />
              Prescriptions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="odontogramme" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Cross className="h-5 w-5 text-muted-foreground" />
                  Odontogramme
                </CardTitle>
                <CardDescription>
                  Cliquez sur une dent pour modifier son état
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Odontogram entries={odontogram} onToothClick={handleToothClick} />
              </CardContent>
            </Card>

            {selectedPatient && (
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Légende
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-3">
                    <span>Sain: <span className="text-green-600 dark:text-green-400">Vert</span></span>
                    <span>Carie: <span className="text-red-600 dark:text-red-400">Rouge</span></span>
                    <span>Plombé: <span className="text-blue-600 dark:text-blue-400">Bleu</span></span>
                    <span>Couronné: <span className="text-purple-600 dark:text-purple-400">Violet</span></span>
                    <span>Extrait: <span className="text-gray-500">Gris (✕)</span></span>
                    <span>Dévitalisé: <span className="text-yellow-600 dark:text-yellow-400">Jaune</span></span>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="dossier" className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-1.5">
                {filterButtons.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setRecordTypeFilter(key as MedicalRecord["type"] | "all")}
                    className={cn(
                      "px-2.5 py-1 text-xs font-medium rounded-full border transition-colors",
                      recordTypeFilter === key
                        ? key === "all"
                          ? "bg-primary text-primary-foreground border-primary"
                          : `${RECORD_TYPE_STYLES[key as MedicalRecord["type"]].badge} border-transparent`
                        : "bg-background text-muted-foreground border-input hover:border-foreground"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <Button size="sm" onClick={() => setRecordDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Nouvelle note
              </Button>
            </div>

            {filteredRecords.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Aucune note clinique"
                description="Aucun dossier médical trouvé pour ce patient."
                action={{ label: "Nouvelle note", onClick: () => setRecordDialogOpen(true) }}
              />
            ) : (
              <div className="space-y-3">
                {filteredRecords.map((record) => (
                  <Card key={record._id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium truncate">{record.title}</h3>
                            <span
                              className={cn(
                                "inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                RECORD_TYPE_STYLES[record.type].badge
                              )}
                            >
                              {RECORD_TYPE_STYLES[record.type].label}
                            </span>
                          </div>
                          {record.description && (
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                              {record.description}
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(record.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Stethoscope className="h-3 w-3" />
                              {DOCTOR_NAMES[record.doctorId] || "Médecin"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="traitements" className="space-y-4">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setTreatmentDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Nouveau traitement
              </Button>
            </div>

            {treatments.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="Aucun traitement"
                description="Aucun traitement planifié pour ce patient."
                action={{ label: "Nouveau traitement", onClick: () => setTreatmentDialogOpen(true) }}
              />
            ) : (
              <div className="space-y-3">
                {treatments.map((treatment) => {
                  const statusStyle = TREATMENT_STATUS_STYLES[treatment.status]
                  return (
                    <Card key={treatment._id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{treatment.name}</h3>
                              <span
                                className={cn(
                                  "inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                  statusStyle.badge
                                )}
                              >
                                {statusStyle.label}
                              </span>
                            </div>
                            {treatment.description && (
                              <p className="mt-1 text-sm text-muted-foreground">
                                {treatment.description}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              {treatment.toothNumber && (
                                <span className="flex items-center gap-1">
                                  <Cross className="h-3 w-3" />
                                  Dent {treatment.toothNumber}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {formatCurrency(treatment.cost)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(treatment.startDate)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Stethoscope className="h-3 w-3" />
                                {DOCTOR_NAMES[treatment.doctorId] || "Médecin"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-4">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setPrescriptionDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Nouvelle ordonnance
              </Button>
            </div>

            {prescriptions.length === 0 ? (
              <EmptyState
                icon={Pill}
                title="Aucune prescription"
                description="Aucune ordonnance pour ce patient."
                action={{ label: "Nouvelle ordonnance", onClick: () => setPrescriptionDialogOpen(true) }}
              />
            ) : (
              <div className="space-y-3">
                {prescriptions.map((rx) => (
                  <Card key={rx._id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Pill className="h-4 w-4 text-muted-foreground shrink-0" />
                            <h3 className="font-medium">{rx.medication}</h3>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
                            <div>
                              <span className="text-xs text-muted-foreground">Dosage</span>
                              <p className="font-medium">{rx.dosage}</p>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground">Fréquence</span>
                              <p className="font-medium">{rx.frequency}</p>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground">Durée</span>
                              <p className="font-medium">{rx.duration}</p>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground">Date</span>
                              <p className="font-medium">{formatDate(rx.date)}</p>
                            </div>
                          </div>
                          {rx.notes && (
                            <p className="mt-2 text-xs text-muted-foreground italic">
                              {rx.notes}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-muted-foreground">
                            {DOCTOR_NAMES[rx.doctorId] || "Médecin"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      <ToothStatusDialog
        open={toothDialogOpen}
        onOpenChange={setToothDialogOpen}
        toothNumber={selectedTooth}
        currentStatus={currentToothEntry?.status ?? "healthy"}
        currentNotes={currentToothEntry?.notes}
        onSave={handleToothSave}
      />

      <CreateRecordDialog
        open={recordDialogOpen}
        onOpenChange={setRecordDialogOpen}
        onSubmit={addRecord}
      />

      <CreateTreatmentDialog
        open={treatmentDialogOpen}
        onOpenChange={setTreatmentDialogOpen}
        onSubmit={addTreatment}
      />

      <CreatePrescriptionDialog
        open={prescriptionDialogOpen}
        onOpenChange={setPrescriptionDialogOpen}
        onSubmit={addPrescription}
      />
    </div>
  )
}

export default function MedicalRecordsPage() {
  return <MedicalRecordsUI />
}
