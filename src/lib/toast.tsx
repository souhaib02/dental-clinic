"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

type ToastVariant = "default" | "destructive" | "success"

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
}

interface ToastContextType {
  toasts: Toast[]
  toast: (opts: Omit<Toast, "id">) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((opts: Omit<Toast, "id">) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { ...opts, id }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  )
}

function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

function ToastItem({
  toast: t,
  onDismiss,
}: {
  toast: Toast
  onDismiss: () => void
}) {
  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg",
        t.variant === "destructive" &&
          "border-red-500 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200",
        t.variant === "success" &&
          "border-green-500 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-200",
        (!t.variant || t.variant === "default") &&
          "border-gray-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
      )}
    >
      <div className="flex-1">
        {t.title && (
          <p className="text-sm font-semibold">{t.title}</p>
        )}
        {t.description && (
          <p className="text-sm opacity-90">{t.description}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 rounded-md p-1 hover:bg-black/10 dark:hover:bg-white/10"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

function Toaster() {
  const { toasts, dismiss } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  )
}

export { ToastProvider, ToastContext, useToast, Toaster }
export type { Toast, ToastVariant }
