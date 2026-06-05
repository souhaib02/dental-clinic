"use client"

import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import type { EventClickArg, DateSelectArg, EventDropArg } from "@fullcalendar/core"
import frLocale from "@fullcalendar/core/locales/fr"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/lib/toast"
import type { Appointment, AppointmentStatus, User, Patient } from "@/lib/types"
import { cn } from "@/lib/utils"
import { AppointmentForm } from "@/components/appointments/appointment-form"
import type { AppointmentFormData } from "@/lib/zod-schemas"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  CalendarPlus,
  CalendarDays,
  Loader2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const STATUS_STYLES: Record<AppointmentStatus, { bg: string; text: string; dot: string; hex: string }> = {
  scheduled: {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-800 dark:text-gray-200",
    dot: "bg-gray-500",
    hex: "#6b7280",
  },
  confirmed: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-800 dark:text-blue-200",
    dot: "bg-blue-500",
    hex: "#3b82f6",
  },
  pending: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-800 dark:text-yellow-200",
    dot: "bg-yellow-500",
    hex: "#eab308",
  },
  cancelled: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-800 dark:text-red-200",
    dot: "bg-red-500",
    hex: "#ef4444",
  },
  completed: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-800 dark:text-green-200",
    dot: "bg-green-500",
    hex: "#22c55e",
  },
}

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: "Planifi\u00e9",
  confirmed: "Confirm\u00e9",
  pending: "En attente",
  cancelled: "Annul\u00e9",
  completed: "Termin\u00e9",
}

type ViewType = "dayGridDay" | "dayGridWeek" | "dayGridMonth"

// ---------- Mock Data ----------

const MOCK_DENTISTS: User[] = [
  { _id: "d1", _creationTime: Date.now(), email: "sarah.ahmed@clinique.fr", name: "Dr. Sarah Ahmed", role: "dentist", phone: "0123456789", isActive: true },
  { _id: "d2", _creationTime: Date.now(), email: "karim.benzema@clinique.fr", name: "Dr. Karim Benzema", role: "dentist", phone: "0123456790", isActive: true },
  { _id: "d3", _creationTime: Date.now(), email: "leila.mokhtar@clinique.fr", name: "Dr. Leila Mokhtar", role: "dentist", phone: "0123456791", isActive: true },
]

const MOCK_PATIENTS: Patient[] = [
  { _id: "p1", _creationTime: Date.now(), firstName: "Jean", lastName: "Dupont", dateOfBirth: "1985-03-15", gender: "male", phone: "0612345678", createdBy: "u1" },
  { _id: "p2", _creationTime: Date.now(), firstName: "Marie", lastName: "Martin", dateOfBirth: "1990-07-22", gender: "female", phone: "0623456789", createdBy: "u1" },
  { _id: "p3", _creationTime: Date.now(), firstName: "Pierre", lastName: "Bernard", dateOfBirth: "1978-11-08", gender: "male", phone: "0634567890", createdBy: "u1" },
  { _id: "p4", _creationTime: Date.now(), firstName: "Sophie", lastName: "Petit", dateOfBirth: "1995-01-30", gender: "female", phone: "0645678901", createdBy: "u1" },
  { _id: "p5", _creationTime: Date.now(), firstName: "Lucas", lastName: "Moreau", dateOfBirth: "2000-06-14", gender: "male", phone: "0656789012", createdBy: "u1" },
  { _id: "p6", _creationTime: Date.now(), firstName: "Emma", lastName: "Laurent", dateOfBirth: "1982-09-05", gender: "female", phone: "0667890123", createdBy: "u1" },
  { _id: "p7", _creationTime: Date.now(), firstName: "Hugo", lastName: "Lefebvre", dateOfBirth: "1975-12-25", gender: "male", phone: "0678901234", createdBy: "u1" },
  { _id: "p8", _creationTime: Date.now(), firstName: "Camille", lastName: "Dubois", dateOfBirth: "1998-04-18", gender: "female", phone: "0689012345", createdBy: "u1" },
]

function generateMockAppointments(): Appointment[] {
  const today = new Date()
  const todayStr = today.toISOString().split("T")[0]
  const addDays = (d: Date, n: number) => {
    const r = new Date(d)
    r.setDate(r.getDate() + n)
    return r.toISOString().split("T")[0]
  }

  const pIds = MOCK_PATIENTS.map((p) => p._id)
  const dIds = MOCK_DENTISTS.map((d) => d._id)

  return [
    { _id: "a1", _creationTime: Date.now(), patientId: pIds[0], dentistId: dIds[0], date: todayStr, startTime: "09:00", endTime: "09:30", status: "confirmed", reason: "D\u00e9tartrage", createdBy: "u1" },
    { _id: "a2", _creationTime: Date.now(), patientId: pIds[1], dentistId: dIds[0], date: todayStr, startTime: "10:00", endTime: "10:45", status: "confirmed", reason: "Carie", notes: "Patient anxieux", createdBy: "u1" },
    { _id: "a3", _creationTime: Date.now(), patientId: pIds[2], dentistId: dIds[1], date: todayStr, startTime: "11:00", endTime: "12:00", status: "scheduled", reason: "Proth\u00e8se", createdBy: "u1" },
    { _id: "a4", _creationTime: Date.now(), patientId: pIds[3], dentistId: dIds[2], date: todayStr, startTime: "14:00", endTime: "14:30", status: "pending", reason: "Contr\u00f4le", notes: "Nouveau patient", createdBy: "u1" },
    { _id: "a5", _creationTime: Date.now(), patientId: pIds[4], dentistId: dIds[0], date: addDays(today, 1), startTime: "09:00", endTime: "09:30", status: "scheduled", reason: "D\u00e9tartrage", createdBy: "u1" },
    { _id: "a6", _creationTime: Date.now(), patientId: pIds[5], dentistId: dIds[1], date: addDays(today, 1), startTime: "10:00", endTime: "11:00", status: "confirmed", reason: "Extraction", createdBy: "u1" },
    { _id: "a7", _creationTime: Date.now(), patientId: pIds[6], dentistId: dIds[2], date: addDays(today, 2), startTime: "15:00", endTime: "15:45", status: "scheduled", reason: "Orthodontie", notes: "Premi\u00e8re consultation", createdBy: "u1" },
    { _id: "a8", _creationTime: Date.now(), patientId: pIds[7], dentistId: dIds[0], date: addDays(today, -1), startTime: "08:30", endTime: "09:00", status: "completed", reason: "D\u00e9tartrage", createdBy: "u1" },
    { _id: "a9", _creationTime: Date.now(), patientId: pIds[0], dentistId: dIds[1], date: addDays(today, -1), startTime: "09:30", endTime: "10:00", status: "cancelled", reason: "Urgence", notes: "Annul\u00e9 par le patient", createdBy: "u1" },
    { _id: "a10", _creationTime: Date.now(), patientId: pIds[2], dentistId: dIds[2], date: addDays(today, 3), startTime: "11:00", endTime: "12:00", status: "pending", reason: "Traitement canalaire", createdBy: "u1" },
  ]
}

let mockAppointments = generateMockAppointments()
let mockIdCounter = 10

// ---------- Data Hook ----------

function useAppointmentsData() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [dentists, setDentists] = useState<User[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    try {
      setDentists(MOCK_DENTISTS)
      setPatients(MOCK_PATIENTS)
      setAppointments(mockAppointments)
    } catch {
      setError("Erreur lors du chargement des donn\u00e9es")
    } finally {
      setLoading(false)
    }
  }, [])

  const addAppointment = useCallback(async (data: AppointmentFormData & { status?: AppointmentStatus; createdBy: string }) => {
    mockIdCounter++
    const newAppt: Appointment = {
      _id: `a${mockIdCounter}`,
      _creationTime: Date.now(),
      patientId: data.patientId,
      dentistId: data.dentistId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      status: data.status ?? "scheduled",
      reason: data.reason || undefined,
      notes: data.notes || undefined,
      createdBy: data.createdBy,
    }
    mockAppointments = [...mockAppointments, newAppt]
    setAppointments(mockAppointments)
    toast({ title: "Rendez-vous cr\u00e9\u00e9", description: `Le ${data.date} de ${data.startTime} \u00e0 ${data.endTime}`, variant: "success" })
  }, [toast])

  const updateAppointment = useCallback(async (id: string, data: Partial<Appointment>) => {
    mockAppointments = mockAppointments.map((a) => a._id === id ? { ...a, ...data } : a)
    setAppointments(mockAppointments)
    toast({ title: "Rendez-vous mis \u00e0 jour", variant: "success" })
  }, [toast])

  const removeAppointment = useCallback(async (id: string) => {
    mockAppointments = mockAppointments.filter((a) => a._id !== id)
    setAppointments(mockAppointments)
    toast({ title: "Rendez-vous supprim\u00e9", variant: "success" })
  }, [toast])

  return { appointments, dentists, patients, loading, error, addAppointment, updateAppointment, removeAppointment }
}

// ---------- Status Badge ----------

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const s = STATUS_STYLES[status]
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", s.bg, s.text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {STATUS_LABELS[status]}
    </span>
  )
}

// ---------- Main Page ----------

export default function AppointmentsPage() {
  const { user } = useAuth()
  const { appointments, dentists, patients, loading, error, addAppointment, updateAppointment, removeAppointment } = useAppointmentsData()

  const calendarRef = useRef<FullCalendar>(null)
  const [currentView, setCurrentView] = useState<ViewType>("dayGridMonth")
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">("all")
  const [dentistFilter, setDentistFilter] = useState<string>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [prefillDate, setPrefillDate] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const filteredAppointments = useMemo(() => {
    let r = appointments
    if (statusFilter !== "all") r = r.filter((a) => a.status === statusFilter)
    if (dentistFilter !== "all") r = r.filter((a) => a.dentistId === dentistFilter)
    return r
  }, [appointments, statusFilter, dentistFilter])

  const calendarEvents = useMemo(() =>
    filteredAppointments.map((a) => {
      const patient = patients.find((p) => p._id === a.patientId)
      const hex = STATUS_STYLES[a.status].hex
      return {
        id: a._id,
        title: patient ? `${patient.lastName} ${patient.firstName}${a.reason ? ` - ${a.reason}` : ""}` : "Patient inconnu",
        start: `${a.date}T${a.startTime}`,
        end: `${a.date}T${a.endTime}`,
        backgroundColor: hex,
        borderColor: hex,
        textColor: "#fff",
        extendedProps: { appointment: a },
      }
    }),
    [filteredAppointments, patients]
  )

  // ---------- Handlers ----------

  function handleDateSelect(info: DateSelectArg) {
    const dateStr = info.startStr.split("T")[0]
    setEditingAppointment(null)
    setPrefillDate(dateStr)
    setDialogOpen(true)
  }

  function handleEventClick(info: EventClickArg) {
    const appt = info.event.extendedProps.appointment as Appointment | undefined
    if (appt) {
      setEditingAppointment(appt)
      setPrefillDate("")
      setDialogOpen(true)
    }
  }

  async function handleEventDrop(info: EventDropArg) {
    const apptId = info.event.id
    const newStart = info.event.start
    const newEnd = info.event.end
    if (!newStart) return
    const dateStr = newStart.toISOString().split("T")[0]
    const st = `${String(newStart.getHours()).padStart(2, "0")}:${String(newStart.getMinutes()).padStart(2, "0")}`
    const et = newEnd
      ? `${String(newEnd.getHours()).padStart(2, "0")}:${String(newEnd.getMinutes()).padStart(2, "0")}`
      : st
    await updateAppointment(apptId, { date: dateStr, startTime: st, endTime: et })
  }

  function handleViewChange(view: ViewType) {
    setCurrentView(view)
    calendarRef.current?.getApi().changeView(view)
  }

  function navDir(dir: "prev" | "next") {
    if (dir === "prev") calendarRef.current?.getApi().prev()
    else calendarRef.current?.getApi().next()
  }

  function goToday() {
    calendarRef.current?.getApi().today()
  }

  // ---------- Dialog Submit ----------

  async function handleFormSubmit(data: AppointmentFormData & { status?: AppointmentStatus }) {
    if (!user) return
    setSubmitting(true)
    try {
      if (editingAppointment) {
        await updateAppointment(editingAppointment._id, {
          patientId: data.patientId,
          dentistId: data.dentistId,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          reason: data.reason || undefined,
          notes: data.notes || undefined,
          status: data.status ?? editingAppointment.status,
        })
      } else {
        await addAppointment({ ...data, createdBy: user._id })
      }
      closeDialog()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!editingAppointment) return
    setSubmitting(true)
    try {
      await removeAppointment(editingAppointment._id)
      closeDialog()
    } finally {
      setSubmitting(false)
    }
  }

  function closeDialog() {
    setDialogOpen(false)
    setEditingAppointment(null)
    setPrefillDate("")
  }

  function openCreateDialog() {
    setEditingAppointment(null)
    setPrefillDate("")
    setDialogOpen(true)
  }

  // ---------- Loading / Error ----------

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
        <p className="text-destructive font-medium">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>R\u00e9essayer</Button>
      </div>
    )
  }

  // ---------- Render ----------

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold tracking-tight">Rendez-vous</h2>
          <Badge variant="secondary" className="ml-1">{appointments.length}</Badge>
        </div>
        <Button onClick={openCreateDialog}>
          <CalendarPlus className="mr-2 h-4 w-4" />
          Nouveau Rendez-vous
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-input bg-background p-0.5">
            {([["dayGridDay", "Jour"], ["dayGridWeek", "Semaine"], ["dayGridMonth", "Mois"]] as [ViewType, string][]).map(([v, label]) => (
              <button
                key={v}
                onClick={() => handleViewChange(v)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                  currentView === v ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <Separator orientation="vertical" className="h-6 hidden sm:block" />

          <Select value={dentistFilter} onValueChange={setDentistFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Tous les dentistes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les dentistes</SelectItem>
              {dentists.map((d) => (
                <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <StatusFilterButton active={statusFilter === "all"} onClick={() => setStatusFilter("all")} label="Tous" />
          {(Object.entries(STATUS_LABELS) as [AppointmentStatus, string][]).map(([key, label]) => (
            <StatusFilterButton
              key={key}
              active={statusFilter === key}
              onClick={() => setStatusFilter(key)}
              label={label}
              variant={key}
            />
          ))}
        </div>
      </div>

      {/* Calendar Nav */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={() => navDir("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToday}>Aujourd&apos;hui</Button>
          <Button variant="outline" size="icon" onClick={() => navDir("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <CalendarDays className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-medium mb-1">Aucun rendez-vous</h3>
            <p className="text-sm text-muted-foreground mb-4">Commencez par cr\u00e9er un nouveau rendez-vous.</p>
            <Button onClick={openCreateDialog}>
              <CalendarPlus className="mr-2 h-4 w-4" />
              Nouveau Rendez-vous
            </Button>
          </div>
        ) : (
          <div className="fc-custom-styles p-1">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={currentView}
              locale={frLocale}
              firstDay={1}
              weekends={true}
              businessHours={{ daysOfWeek: [1, 2, 3, 4, 5, 6], startTime: "08:00", endTime: "18:00" }}
              slotDuration="00:30:00"
              height="auto"
              events={calendarEvents}
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={3}
              headerToolbar={false}
              select={handleDateSelect}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              eventContent={(arg) => {
                const appt = arg.event.extendedProps.appointment as Appointment | undefined
                return (
                  <div className="fc-event-custom px-1 py-0.5 text-xs leading-tight truncate">
                    <span className="font-medium">{arg.timeText}</span>
                    <span className="ml-1">{arg.event.title}</span>
                  </div>
                )
              }}
            />
          </div>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog() }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAppointment ? "Modifier le Rendez-vous" : "Nouveau Rendez-vous"}</DialogTitle>
            <DialogDescription>
              {editingAppointment ? "Modifiez les informations du rendez-vous." : "Remplissez les informations pour cr\u00e9er un nouveau rendez-vous."}
            </DialogDescription>
          </DialogHeader>

          <AppointmentForm
            key={editingAppointment?._id ?? "new"}
            initialData={editingAppointment ?? undefined}
            defaultDate={prefillDate || undefined}
            dentists={dentists}
            patients={patients}
            onSubmit={handleFormSubmit}
            onCancel={closeDialog}
          />

          {editingAppointment && (
            <>
              <Separator />
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Statut actuel:</span>
                  <StatusBadge status={editingAppointment.status} />
                </div>
                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={submitting}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ---------- Status Filter Button ----------

function StatusFilterButton({
  active,
  onClick,
  label,
  variant,
}: {
  active: boolean
  onClick: () => void
  label: string
  variant?: AppointmentStatus
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2.5 py-1 text-xs font-medium rounded-full border transition-colors",
        active
          ? variant
            ? `${STATUS_STYLES[variant].bg} ${STATUS_STYLES[variant].text} border-transparent`
            : "bg-primary text-primary-foreground border-primary"
          : "bg-background text-muted-foreground border-input hover:border-foreground"
      )}
    >
      {label}
    </button>
  )
}
