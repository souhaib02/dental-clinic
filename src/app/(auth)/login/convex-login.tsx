"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, type UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Stethoscope, Loader2, Database, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { loginSchema, type LoginFormData } from "@/lib/zod-schemas"
import type { User } from "@/lib/types"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/lib/toast"
import { useMutation } from "convex/react"
import { api } from "convex/_generated/api"

export default function ConvexLoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [seeding, setSeeding] = useState(false)

  const loginMutation = useMutation(api.auth.login)
  const seedMutation = useMutation(api.seed.seed)

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
    try {
      const user = await loginMutation({ email: data.email, password: data.password })
      login(user as unknown as User)
      toast({ title: "Connexion réussie", variant: "success" })
      router.push("/dashboard")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Email ou mot de passe incorrect"
      toast({ title: "Erreur de connexion", description: message, variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSeed() {
    setSeeding(true)
    try {
      await seedMutation({})
      toast({ title: "Données de démonstration créées", variant: "success" })
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible d'amorcer les données",
        variant: "destructive",
      })
    } finally {
      setSeeding(false)
    }
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
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@cabinet.com"
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

            <div className="mt-4 space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                    Première connexion ?
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={handleSeed}
                disabled={seeding}
              >
                {seeding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
                {seeding ? "Amorçage..." : "Amorcer les données de démonstration"}
              </Button>
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
