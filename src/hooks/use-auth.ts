"use client"

import { useState, useEffect, useCallback } from "react"
import type { User } from "@/lib/types"

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    try {
      const stored = localStorage.getItem("dental-clinic-user")
      if (stored) {
        const user = JSON.parse(stored) as User
        setState({ user, isLoading: false, isAuthenticated: true })
      } else {
        setState({ user: null, isLoading: false, isAuthenticated: false })
      }
    } catch {
      setState({ user: null, isLoading: false, isAuthenticated: false })
    }
  }, [])

  const login = useCallback((user: User) => {
    localStorage.setItem("dental-clinic-user", JSON.stringify(user))
    setState({ user, isLoading: false, isAuthenticated: true })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("dental-clinic-user")
    setState({ user: null, isLoading: false, isAuthenticated: false })
  }, [])

  return { ...state, login, logout }
}

export { useAuth }
