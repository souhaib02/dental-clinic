"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { appointmentSchema, type AppointmentFormData } from "@/lib/zod-schemas"
import type { Appointment, AppointmentStatus, User, Patient } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface AppointmentFormProps {
  initialData?: Appointment
  defaultDate?: string
  dentists: User[]
  patients: Patient[]
  onSubmit: (data: AppointmentFormData & { status?: AppointmentStatus }) => Promise<void>
  onCancel: () => void
}

type FormValues = AppointmentFormData & { status?: AppointmentStatus }

const statusLabels: Record<AppointmentStatus, string> = {
  scheduled: "Planifi\u00e9",
  confirmed: "Confirm\u00e9",
  pending: "En attente",
  cancelled: "Annul\u00e9",
  completed: "Termin\u00e9",
}

function AppointmentForm({
  initialData,
  defaultDate,
  dentists,
  patients,
  onSubmit,
  onCancel,
}: AppointmentFormProps) {
  const isEditing = !!initialData
  const [saving, setSaving] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientId: initialData?.patientId ?? "",
      dentistId: initialData?.dentistId ?? "",
      date: initialData?.date ?? defaultDate ?? "",
      startTime: initialData?.startTime ?? "",
      endTime: initialData?.endTime ?? "",
      reason: initialData?.reason ?? "",
      notes: initialData?.notes ?? "",
      status: initialData?.status ?? "scheduled",
    },
  })

  async function onFormSubmit(data: FormValues) {
    setSaving(true)
    try {
      await onSubmit(data)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="patientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Patient</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="S\u00e9lectionner un patient" />
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

        <FormField
          control={form.control}
          name="dentistId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dentiste</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="S\u00e9lectionner un dentiste" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {dentists.map((d) => (
                    <SelectItem key={d._id} value={d._id}>
                      {d.name}
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>D\u00e9but</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fin</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motif</FormLabel>
              <FormControl>
                <Input placeholder="Motif du rendez-vous" {...field} />
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
                <Textarea
                  placeholder="Notes additionnelles..."
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isEditing && (
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Statut</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="S\u00e9lectionner un statut" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={saving}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Modifier" : "Cr\u00e9er"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export { AppointmentForm }
export type { AppointmentFormProps }
