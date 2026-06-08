"use client"

import {
  Calendar,
  Users,
  CalendarCheck,
  Euro,
  TrendingUp,
  AlertTriangle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { DashboardStats, Payment } from "@/lib/types"
import { useQuery } from "convex/react"
import { api } from "convex/_generated/api"

const convexConfigured = !!process.env.NEXT_PUBLIC_CONVEX_URL

interface RevenueDataPoint {
  month: string
  revenue: number
}

const monthLabels: Record<string, string> = {
  "2025-01": "Jan", "2025-02": "Fév", "2025-03": "Mar",
  "2025-04": "Avr", "2025-05": "Mai", "2025-06": "Jun",
  "2025-07": "Jul", "2025-08": "Aoû", "2025-09": "Sep",
  "2025-10": "Oct", "2025-11": "Nov", "2025-12": "Déc",
}

function mockStats(): DashboardStats {
  return {
    todayAppointments: 8,
    patientsToday: 5,
    upcomingAppointments: 12,
    dailyRevenue: 1850,
    monthlyRevenue: 28450,
    lowStockItems: 3,
    cancelledAppointments: 1,
    recentPayments: [
      { _id: "1", _creationTime: Date.now(), invoiceId: "inv-1", patientId: "p1", amount: 800, method: "cash", date: new Date().toISOString().split("T")[0], receivedBy: "u1" },
      { _id: "2", _creationTime: Date.now(), invoiceId: "inv-2", patientId: "p2", amount: 250, method: "card", date: new Date().toISOString().split("T")[0], receivedBy: "u1" },
      { _id: "3", _creationTime: Date.now(), invoiceId: "inv-3", patientId: "p3", amount: 1200, method: "transfer", date: new Date(Date.now() - 86400000).toISOString().split("T")[0], receivedBy: "u1" },
      { _id: "4", _creationTime: Date.now(), invoiceId: "inv-4", patientId: "p4", amount: 450, method: "cash", date: new Date(Date.now() - 86400000).toISOString().split("T")[0], receivedBy: "u1" },
      { _id: "5", _creationTime: Date.now(), invoiceId: "inv-5", patientId: "p5", amount: 600, method: "card", date: new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0], receivedBy: "u1" },
    ],
  }
}

const mockRevenue: RevenueDataPoint[] = [
  { month: "2025-01", revenue: 18500 },
  { month: "2025-02", revenue: 21200 },
  { month: "2025-03", revenue: 19800 },
  { month: "2025-04", revenue: 25300 },
  { month: "2025-05", revenue: 28450 },
  { month: "2025-06", revenue: 22100 },
]

function StatCard({
  icon: Icon,
  label,
  value,
  variant,
  highlight,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  variant?: "default" | "warning" | "danger"
  highlight?: boolean
}) {
  return (
    <Card
      className={`border-gray-200 transition-shadow hover:shadow-md dark:border-gray-800 ${
        highlight ? "ring-2 ring-blue-500/20 dark:ring-blue-400/20" : ""
      }`}
    >
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
            variant === "warning"
              ? "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
              : variant === "danger"
                ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
                : "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function methodLabel(method: string): string {
  const labels: Record<string, string> = {
    cash: "Espèces",
    card: "Carte",
    transfer: "Virement",
    insurance: "Assurance",
  }
  return labels[method] ?? method
}

function methodBadge(method: string) {
  const colors: Record<string, string> = {
    cash: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
    card: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    transfer: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
    insurance: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  }
  return colors[method] ?? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Card key={i} className="border-gray-200 dark:border-gray-800">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="h-11 w-11 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-5 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <div className="h-5 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <div className="h-5 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-40">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 animate-pulse rounded-t bg-gray-200 dark:bg-gray-700"
                  style={{ height: `${30 + Math.random() * 70}%` }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const convexStats = convexConfigured ? useQuery(api.dashboard.getStats) : undefined
  const convexRevenue = convexConfigured ? useQuery(api.dashboard.getRevenueData) : undefined
  const loading = convexConfigured && (convexStats === undefined || convexRevenue === undefined)

  const stats: DashboardStats = convexConfigured
    ? (convexStats ?? { todayAppointments: 0, patientsToday: 0, upcomingAppointments: 0, dailyRevenue: 0, monthlyRevenue: 0, lowStockItems: 0, cancelledAppointments: 0, recentPayments: [] })
    : mockStats()
  const revenue: RevenueDataPoint[] = convexConfigured ? (convexRevenue ?? []) : mockRevenue

  if (loading) return <LoadingSkeleton />

  const maxRevenue = Math.max(...revenue.map((r) => r.revenue), 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Aperçu du jour</h2>
        {!convexConfigured && (
          <Badge
            variant="outline"
            className="gap-1.5 border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
          >
            <AlertCircle className="h-3 w-3" />
            Données de démonstration
          </Badge>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Calendar} label="Rendez-vous du jour" value={stats.todayAppointments} />
        <StatCard icon={Users} label="Patients reçus" value={stats.patientsToday} />
        <StatCard icon={CalendarCheck} label="À venir" value={stats.upcomingAppointments} />
        <StatCard icon={Euro} label="CA Journalier" value={formatCurrency(stats.dailyRevenue)} />
        <StatCard icon={TrendingUp} label="CA Mensuel" value={formatCurrency(stats.monthlyRevenue)} highlight />
        <StatCard icon={AlertTriangle} label="Alertes stock" value={stats.lowStockItems} variant={stats.lowStockItems > 0 ? "warning" : "default"} />
        <StatCard icon={XCircle} label="Rendez-vous annulés" value={stats.cancelledAppointments} variant={stats.cancelledAppointments > 0 ? "danger" : "default"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Euro className="h-4 w-4 text-blue-600" />
              Paiements récents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentPayments.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">Aucun paiement récent</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Méthode</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentPayments.map((payment: Payment) => (
                    <TableRow key={payment._id}>
                      <TableCell className="text-gray-600 dark:text-gray-400">{formatDate(payment.date)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${methodBadge(payment.method)}`}>
                          {methodLabel(payment.method)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Revenus mensuels
            </CardTitle>
          </CardHeader>
          <CardContent>
            {revenue.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">Aucune donnée de revenus</p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-end gap-2" style={{ height: 180 }}>
                  {revenue.map((point) => {
                    const height = (point.revenue / maxRevenue) * 100
                    const shortMonth = point.month.split("-")[1]
                    return (
                      <div key={point.month} className="group relative flex flex-1 flex-col items-center gap-1">
                        <div
                          className="w-full max-w-[48px] rounded-t-md bg-gradient-to-t from-blue-600 to-blue-400 transition-all hover:from-blue-700 hover:to-blue-500 dark:from-blue-700 dark:to-blue-500"
                          style={{ height: `${Math.max(height, 4)}%` }}
                        >
                          <div className="invisible absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white shadow group-hover:visible dark:bg-gray-100 dark:text-gray-900">
                            {formatCurrency(point.revenue)}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {monthLabels[point.month] ?? shortMonth}
                        </span>
                      </div>
                    )
                  })}
                </div>

                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total période</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(revenue.reduce((sum, r) => sum + r.revenue, 0))}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
