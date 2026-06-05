"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Stethoscope, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { loginSchema, type LoginFormData } from "@/lib/zod-schemas"
import type { User } from "@/lib/types"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/lib/toast"

const convexConfigured = !!process.env.NEXT_PUBLIC_CONVEX_URL

const ConvexLoginPage = dynamic(() => import("./convex-login"), { ssr: false })

export default function LoginPage() {
  if (convexConfigured) {
    return <ConvexLoginPage />
  }
  return <DemoLoginPage />
}

function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-950">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  )
}

function DemoLoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/dashboard")
    }
  }, [isAuthenticated, authLoading, router])

  async function handleSubmit(data: LoginFormData) {
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 600))
    const demoUser: User = {
      _id: "demo-user",
      _creationTime: Date.now(),
      email: data.email,
      name: data.email.split("@")[0] || "Utilisateur",
      role: "admin",
      isActive: true,
    }
    login(demoUser)
    toast({ title: "Connexion réussie", description: "Mode démonstration", variant: "success" })
    router.push("/dashboard")
    setSubmitting(false)
  }

  if (authLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-teal-50 p-4 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20 dark:shadow-blue-600/10">
            <Stethoscope className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Cabinet Dentaire
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Application de gestion
          </p>
        </div>

        <Card className="border-gray-200 shadow-xl dark:border-gray-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Connexion</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <Badge
                variant="outline"
                className="w-full justify-center gap-1.5 border-amber-300 bg-amber-50 py-1.5 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                Mode démonstration
              </Badge>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ex: admin@demo.com"
                  autoComplete="email"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Connexion..." : "Se connecter"}
              </Button>
            </form>

            <div className="mt-4 space-y-2 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
              <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                Connectez-vous avec n'importe quel email (mot de passe 6+ caractères)
              </p>
              <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                Exemple : <span className="font-medium text-gray-600 dark:text-gray-300">admin@demo.com</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500">
          &copy; {new Date().getFullYear()} Cabinet Dentaire. Tous droits réservés.
        </p>
      </div>
    </div>
  )
}
