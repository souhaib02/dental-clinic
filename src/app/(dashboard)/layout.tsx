"use client"

import { useEffect, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { AppShell } from "@/components/layout/app-shell"
import { Loader2 } from "lucide-react"

function getTitleFromPath(pathname: string): string {
  if (pathname === "/" || pathname === "/dashboard") return "Tableau de Bord"
  if (pathname.startsWith("/patients")) return pathname === "/patients" ? "Patients" : "Patient"
  if (pathname.startsWith("/appointments")) return "Rendez-vous"
  if (pathname.startsWith("/medical-records")) return "Dossier M\u00e9dical"
  if (pathname.startsWith("/billing")) return "Facturation"
  if (pathname.startsWith("/stock")) return "Stock"
  if (pathname.startsWith("/reports")) return "Rapports"
  if (pathname.startsWith("/users")) return "Utilisateurs"
  if (pathname.startsWith("/profile")) return "Profil"
  if (pathname.startsWith("/settings")) return "Param\u00e8tres"
  return "Cabinet Dentaire"
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return <AppShell title={getTitleFromPath(pathname)}>{children}</AppShell>
}
