"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import {
  Bell,
  Search,
  Moon,
  Sun,
  Menu,
  User,
  Settings,
  LogOut,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface HeaderProps {
  title: string
  onMenuToggle: () => void
}

function Header({ title, onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth()
  const [darkMode, setDarkMode] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem("theme")
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches
    const isDark = stored ? stored === "dark" : prefersDark
    setDarkMode(isDark)
    document.documentElement.classList.toggle("dark", isDark)
    document.documentElement.classList.toggle("light", !isDark)
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function toggleDark() {
    const next = !darkMode
    setDarkMode(next)
    document.documentElement.classList.toggle("dark", next)
    document.documentElement.classList.toggle("light", !next)
    localStorage.setItem("theme", next ? "dark" : "light")
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 lg:px-6 dark:border-gray-800 dark:bg-gray-900">
      <button
        onClick={onMenuToggle}
        className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden dark:hover:bg-gray-800"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="flex-1 text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h1>

      <div className="hidden items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 sm:flex dark:border-gray-700 dark:bg-gray-800">
        <Search className="h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher..."
          className="bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-400 dark:text-white"
        />
      </div>

      <button
        onClick={toggleDark}
        className="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      <button className="relative rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
        <Bell className="h-5 w-5" />
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
          3
        </span>
      </button>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowUserMenu((v) => !v)}
          className="flex items-center gap-2 rounded-md p-1.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
            {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
          <span className="hidden md:inline">
            {user?.name ?? "Utilisateur"}
          </span>
        </button>

        {showUserMenu && (
          <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <Link
              href="/profile"
              onClick={() => setShowUserMenu(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <User className="h-4 w-4" />
              Profil
            </Link>
            <Link
              href="/settings"
              onClick={() => setShowUserMenu(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Settings className="h-4 w-4" />
              Paramètres
            </Link>
            <hr className="my-1 border-gray-200 dark:border-gray-700" />
            <button
              onClick={() => {
                logout()
                setShowUserMenu(false)
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export { Header }
