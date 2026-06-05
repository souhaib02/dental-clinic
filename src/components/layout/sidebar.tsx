"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  Receipt,
  Package,
  BarChart3,
  Shield,
  X,
} from "lucide-react"

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/appointments", label: "Rendez-vous", icon: Calendar },
  { href: "/medical-records", label: "Dossier M\u00e9dical", icon: Stethoscope },
  { href: "/billing", label: "Facturation", icon: Receipt },
  { href: "/stock", label: "Stock", icon: Package },
  { href: "/reports", label: "Rapports", icon: BarChart3 },
  { href: "/users", label: "Utilisateurs", icon: Shield },
]

function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto",
          "dark:bg-gray-900 dark:border-gray-800",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-800">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg text-gray-900 dark:text-white"
          >
            <Stethoscope className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Cabinet Dentaire
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

export { Sidebar }
