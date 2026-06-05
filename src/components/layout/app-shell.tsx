"use client"

import { useState, type ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { Toaster } from "@/lib/toast"

interface AppShellProps {
  children: ReactNode
  title: string
}

function AppShell({ children, title }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title={title}
          onMenuToggle={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  )
}

export { AppShell }
