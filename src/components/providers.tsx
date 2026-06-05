"use client"

import { type ReactNode } from "react"
import { TooltipProvider } from "@radix-ui/react-tooltip"
import { ConvexProvider, ConvexReactClient } from "convex/react"
import { ToastProvider } from "@/lib/toast"

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL ?? ""

function createConvexClient() {
  if (!convexUrl) return null
  return new ConvexReactClient(convexUrl)
}

const convexClient =
  typeof window !== "undefined" ? createConvexClient() : null

function Providers({ children }: { children: ReactNode }) {
  if (convexClient) {
    return (
      <ConvexProvider client={convexClient}>
        <TooltipProvider>
          <ToastProvider>{children}</ToastProvider>
        </TooltipProvider>
      </ConvexProvider>
    )
  }

  return (
    <TooltipProvider>
      <ToastProvider>{children}</ToastProvider>
    </TooltipProvider>
  )
}

export { Providers }
