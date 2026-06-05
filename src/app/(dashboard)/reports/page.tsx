"use client"

import { useState, useMemo } from "react"
import {
  Euro,
  TrendingUp,
  Users,
  Calendar,
  Activity,
  Loader2,
  AlertCircle,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn, formatCurrency } from "@/lib/utils"

const MONTHS = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Jun",
  "Jul",
  "Aoû",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
]

const MOCK_REVENUE = [
  { month: 0, revenue: 12450 },
  { month: 1, revenue: 15320 },
  { month: 2, revenue: 14180 },
  { month: 3, revenue: 18200 },
  { month: 4, revenue: 16540 },
  { month: 5, revenue: 20500 },
  { month: 6, revenue: 19300 },
  { month: 7, revenue: 22100 },
  { month: 8, revenue: 17800 },
  { month: 9, revenue: 23400 },
  { month: 10, revenue: 19800 },
  { month: 11, revenue: 25600 },
]

const MOCK_PATIENT_GROWTH = [
  { month: 0, patients: 12 },
  { month: 1, patients: 18 },
  { month: 2, patients: 15 },
  { month: 3, patients: 22 },
  { month: 4, patients: 19 },
  { month: 5, patients: 25 },
  { month: 6, patients: 21 },
  { month: 7, patients: 28 },
  { month: 8, patients: 24 },
  { month: 9, patients: 30 },
  { month: 10, patients: 26 },
  { month: 11, patients: 35 },
]

const MOCK_APPOINTMENT_STATS = {
  total: 320,
  completed: 210,
  cancelled: 45,
  noShow: 28,
  attendanceRate: 87,
}

const MOCK_APPOINTMENT_BY_STATUS = [
  { label: "Terminés", value: 210, color: "bg-green-500" },
  { label: "Planifiés", value: 37, color: "bg-blue-500" },
  { label: "Annulés", value: 45, color: "bg-red-500" },
  { label: "Non présentés", value: 28, color: "bg-yellow-500" },
]

const MOCK_TREATMENTS = [
  { name: "Détartrage", count: 156, revenue: 23400 },
  { name: "Extraction", count: 98, revenue: 14700 },
  { name: "Traitement canalaire", count: 76, revenue: 22800 },
  { name: "Prothèse dentaire", count: 65, revenue: 32500 },
  { name: "Couronne", count: 54, revenue: 27000 },
  { name: "Orthodontie", count: 48, revenue: 43200 },
  { name: "Implant", count: 42, revenue: 50400 },
  { name: "Blanchiment", count: 38, revenue: 11400 },
  { name: "Dévitalisation", count: 32, revenue: 9600 },
  { name: "Scellement", count: 28, revenue: 4200 },
]

const PATIENT_STATS = {
  newThisMonth: 35,
  active: 180,
  inactive: 65,
}

function mockAsync<T>(data: T, delay = 600): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay))
}

function useReportsData() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<{
    revenue: typeof MOCK_REVENUE
    patientGrowth: typeof MOCK_PATIENT_GROWTH
    appointmentStats: typeof MOCK_APPOINTMENT_STATS
    appointmentByStatus: typeof MOCK_APPOINTMENT_BY_STATUS
    treatments: typeof MOCK_TREATMENTS
  } | null>(null)

  useState(() => {
    mockAsync({
      revenue: MOCK_REVENUE,
      patientGrowth: MOCK_PATIENT_GROWTH,
      appointmentStats: MOCK_APPOINTMENT_STATS,
      appointmentByStatus: MOCK_APPOINTMENT_BY_STATUS,
      treatments: MOCK_TREATMENTS,
    })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  })

  return { data, loading, error }
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  trend,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  subtitle?: string
  trend?: { value: number; positive: boolean }
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
                trend.positive
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              )}
            >
              {trend.positive ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              )}
              {trend.value}%
            </span>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Chargement des données...
        </p>
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <AlertCircle className="h-10 w-10 text-destructive" />
      <p className="text-sm text-muted-foreground">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="text-sm font-medium text-primary hover:underline"
      >
        Réessayer
      </button>
    </div>
  )
}

function EmptyState({
  icon: Icon,
  message,
}: {
  icon: React.ElementType
  message: string
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-16">
      <Icon className="h-12 w-12 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

function BarChart({
  data,
  valueKey,
  labelKey,
  formatValue,
  color = "bg-primary",
  height = 200,
}: {
  data: { month?: number; name?: string; [key: string]: unknown }[]
  valueKey: string
  labelKey: string
  formatValue?: (v: number) => string
  color?: string
  height?: number
}) {
  const max = Math.max(...data.map((d) => (d[valueKey] as number) || 0), 1)

  return (
    <div className="space-y-3">
      <div
        className="flex items-end gap-1.5"
        style={{ height }}
      >
        {data.map((item, i) => {
          const val = item[valueKey] as number
          const barHeight = (val / max) * 100
          return (
            <div
              key={i}
              className="group relative flex flex-1 flex-col items-center justify-end h-full"
            >
              <div className="invisible absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs font-medium shadow group-hover:visible">
                {formatValue ? formatValue(val) : val}
              </div>
              <div
                className={cn(
                  "w-full rounded-t transition-all duration-300",
                  color
                )}
                style={{
                  height: `${Math.max(barHeight, 2)}%`,
                  opacity: 0.85,
                }}
              />
              <span className="mt-1.5 text-xs text-muted-foreground">
                {item[labelKey] as string}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PieChartSegments({
  segments,
  size = 200,
}: {
  segments: { label: string; value: number; color: string }[]
  size?: number
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0)

  const cumulativePercentages = useMemo(() => {
    let cum = 0
    return segments.map((seg) => {
      const start = cum
      cum += (seg.value / total) * 100
      return { ...seg, start, end: cum, percent: (seg.value / total) * 100 }
    })
  }, [total])

  const radius = size / 2 - 10
  const circumference = 2 * Math.PI * radius

  let accumulatedOffset = 0
  const slices = cumulativePercentages.map((seg) => {
    const length = (seg.percent / 100) * circumference
    const offset = accumulatedOffset
    accumulatedOffset += length
    return { ...seg, length, offset }
  })

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div
        className="relative shrink-0"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} className="-rotate-90">
          {total === 0 ? (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="20"
            />
          ) : (
            slices.map((seg, i) => (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={`hsl(var(--${seg.color.replace("bg-", "").replace("-500", "")}))`}
                strokeWidth="20"
                strokeDasharray={`${seg.length} ${circumference - seg.length}`}
                strokeDashoffset={-seg.offset}
                className="transition-all duration-500"
              />
            ))
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold">{total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {cumulativePercentages.map((seg, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className={cn(
                "h-3 w-3 rounded-full",
                seg.color.replace("bg-", "bg-")
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{seg.label}</p>
              <p className="text-xs text-muted-foreground">
                {seg.value} ({seg.percent.toFixed(1)}%)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FinancialTab({
  data,
}: {
  data: {
    revenue: typeof MOCK_REVENUE
    patientGrowth: typeof MOCK_PATIENT_GROWTH
    appointmentStats: typeof MOCK_APPOINTMENT_STATS
    appointmentByStatus: typeof MOCK_APPOINTMENT_BY_STATUS
    treatments: typeof MOCK_TREATMENTS
  }
}) {
  const totalRevenue = data.revenue.reduce((s, r) => s + r.revenue, 0)
  const currentMonthRevenue =
    data.revenue.find((r) => r.month === new Date().getMonth())?.revenue ?? 0
  const dailyAvg = Math.round(currentMonthRevenue / 30)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Euro}
          label="CA Journalier (moy.)"
          value={formatCurrency(dailyAvg)}
          subtitle="Basé sur le mois en cours"
        />
        <StatCard
          icon={Euro}
          label="CA Mensuel"
          value={formatCurrency(currentMonthRevenue)}
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          icon={TrendingUp}
          label="CA Annuel"
          value={formatCurrency(totalRevenue)}
          trend={{ value: 8, positive: true }}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4 text-primary" />
            Revenus par mois
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart
            data={data.revenue.map((r) => ({
              ...r,
              label: MONTHS[r.month],
            }))}
            valueKey="revenue"
            labelKey="label"
            formatValue={(v) => formatCurrency(v)}
            color="bg-primary"
          />
          <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <span className="text-sm text-muted-foreground">
              Total période
            </span>
            <span className="text-lg font-bold">
              {formatCurrency(totalRevenue)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PatientsTab({
  data,
}: {
  data: {
    revenue: typeof MOCK_REVENUE
    patientGrowth: typeof MOCK_PATIENT_GROWTH
    appointmentStats: typeof MOCK_APPOINTMENT_STATS
    appointmentByStatus: typeof MOCK_APPOINTMENT_BY_STATUS
    treatments: typeof MOCK_TREATMENTS
  }
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Users}
          label="Nouveaux patients (ce mois)"
          value={PATIENT_STATS.newThisMonth}
          trend={{ value: 15, positive: true }}
        />
        <StatCard
          icon={Activity}
          label="Patients actifs"
          value={PATIENT_STATS.active}
          subtitle="Avec rendez-vous"
        />
        <StatCard
          icon={Users}
          label="Patients inactifs"
          value={PATIENT_STATS.inactive}
          subtitle="Sans rendez-vous depuis 6 mois"
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4 text-primary" />
            Croissance des patients par mois
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart
            data={data.patientGrowth.map((r) => ({
              ...r,
              label: MONTHS[r.month],
            }))}
            valueKey="patients"
            labelKey="label"
            color="bg-blue-500"
          />
          <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-lg font-bold">
              {data.patientGrowth.reduce((s, r) => s + r.patients, 0)}{" "}
              patients
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AppointmentsTab({
  data,
}: {
  data: {
    revenue: typeof MOCK_REVENUE
    patientGrowth: typeof MOCK_PATIENT_GROWTH
    appointmentStats: typeof MOCK_APPOINTMENT_STATS
    appointmentByStatus: typeof MOCK_APPOINTMENT_BY_STATUS
    treatments: typeof MOCK_TREATMENTS
  }
}) {
  const stats = data.appointmentStats
  const cancellationRate = Math.round(
    (stats.cancelled / stats.total) * 100
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Calendar}
          label="Total rendez-vous"
          value={stats.total}
        />
        <StatCard
          icon={Activity}
          label="Taux de présence"
          value={`${stats.attendanceRate}%`}
          trend={{ value: 3, positive: true }}
        />
        <StatCard
          icon={AlertCircle}
          label="Taux d'annulation"
          value={`${cancellationRate}%`}
          trend={{ value: 2, positive: false }}
        />
        <StatCard
          icon={Calendar}
          label="Rendez-vous complétés"
          value={stats.completed}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PieChart className="h-4 w-4 text-primary" />
            Distribution des statuts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PieChartSegments segments={data.appointmentByStatus} />
        </CardContent>
      </Card>
    </div>
  )
}

function TreatmentsTab({
  data,
}: {
  data: {
    revenue: typeof MOCK_REVENUE
    patientGrowth: typeof MOCK_PATIENT_GROWTH
    appointmentStats: typeof MOCK_APPOINTMENT_STATS
    appointmentByStatus: typeof MOCK_APPOINTMENT_BY_STATUS
    treatments: typeof MOCK_TREATMENTS
  }
}) {
  const maxCount = Math.max(...data.treatments.map((t) => t.count), 1)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4 text-primary" />
            Top 10 traitements les plus réalisés
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.treatments.map((treatment) => {
            const width = (treatment.count / maxCount) * 100
            return (
              <div key={treatment.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{treatment.name}</span>
                  <span className="text-muted-foreground">
                    {treatment.count} réalisations
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Euro className="h-4 w-4 text-primary" />
            Revenus par traitement
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Traitement</TableHead>
                <TableHead className="text-right">
                  Nombre de réalisations
                </TableHead>
                <TableHead className="text-right">Revenu total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.treatments.map((treatment) => (
                <TableRow key={treatment.name}>
                  <TableCell className="font-medium">
                    {treatment.name}
                  </TableCell>
                  <TableCell className="text-right">
                    {treatment.count}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(treatment.revenue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ReportsPage() {
  const [tab, setTab] = useState("financial")
  const { data, loading, error } = useReportsData()

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />
  if (!data) return <EmptyState icon={BarChart3} message="Aucune donnée disponible" />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Rapports & Statistiques
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Suivez l'activité et les performances de votre cabinet.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="financial" className="gap-2">
            <Euro className="h-4 w-4" />
            Financier
          </TabsTrigger>
          <TabsTrigger value="patients" className="gap-2">
            <Users className="h-4 w-4" />
            Patients
          </TabsTrigger>
          <TabsTrigger value="appointments" className="gap-2">
            <Calendar className="h-4 w-4" />
            Rendez-vous
          </TabsTrigger>
          <TabsTrigger value="treatments" className="gap-2">
            <Activity className="h-4 w-4" />
            Traitements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="financial">
          <FinancialTab data={data} />
        </TabsContent>
        <TabsContent value="patients">
          <PatientsTab data={data} />
        </TabsContent>
        <TabsContent value="appointments">
          <AppointmentsTab data={data} />
        </TabsContent>
        <TabsContent value="treatments">
          <TreatmentsTab data={data} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
