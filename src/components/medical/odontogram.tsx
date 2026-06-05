"use client"

import type { OdontogramEntry, ToothStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

interface OdontogramProps {
  entries: OdontogramEntry[]
  onToothClick: (toothNumber: number) => void
}

const TOOTH_CONFIG: Record<ToothStatus, { bg: string; label: string }> = {
  healthy: { bg: "bg-green-500 dark:bg-green-600", label: "Sain" },
  decayed: { bg: "bg-red-500 dark:bg-red-600", label: "Carie" },
  filled: { bg: "bg-blue-500 dark:bg-blue-600", label: "Plombé" },
  crowned: { bg: "bg-purple-500 dark:bg-purple-600", label: "Couronné" },
  extracted: { bg: "bg-gray-400 dark:bg-gray-500", label: "Extrait" },
  root_canal: { bg: "bg-yellow-500 dark:bg-yellow-600", label: "Dévitalisé" },
  implant: { bg: "bg-cyan-500 dark:bg-cyan-600", label: "Implant" },
  bridge: { bg: "bg-pink-500 dark:bg-pink-600", label: "Pont" },
  missing: { bg: "bg-gray-700 dark:bg-gray-600", label: "Absent" },
}

const UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
const LOWER = [31, 32, 33, 34, 35, 36, 37, 38, 48, 47, 46, 45, 44, 43, 42, 41]

export function Odontogram({ entries, onToothClick }: OdontogramProps) {
  const getStatus = (n: number): ToothStatus => {
    const entry = entries.find((e) => e.toothNumber === n)
    return entry?.status ?? "healthy"
  }

  const renderTooth = (n: number) => {
    const status = getStatus(n)
    const cfg = TOOTH_CONFIG[status]
    const missing = status === "missing"
    const extracted = status === "extracted"

    return (
      <button
        key={n}
        onClick={() => onToothClick(n)}
        className={cn(
          "flex h-14 w-11 flex-col items-center justify-center rounded-lg border-2 border-white/20 text-[10px] font-bold transition-all hover:scale-110 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
          cfg.bg,
          "text-white",
          (extracted || missing) && "opacity-60 saturate-50"
        )}
        title={`Dent ${n}: ${cfg.label}`}
      >
        {extracted ? (
          <span className="text-lg font-black">✕</span>
        ) : missing ? (
          <span className="text-lg">—</span>
        ) : (
          <span className="text-xs">{n}</span>
        )}
      </button>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-center overflow-x-auto pb-1">
        <div className="inline-flex items-center gap-0.5">
          {UPPER.map((n, i) => (
            <span key={n} className="contents">
              {renderTooth(n)}
              {i === 7 && <div className="mx-1.5 h-12 w-0.5 shrink-0 rounded bg-border" />}
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-center overflow-x-auto pb-1">
        <div className="inline-flex items-center gap-0.5">
          {LOWER.map((n, i) => (
            <span key={n} className="contents">
              {renderTooth(n)}
              {i === 7 && <div className="mx-1.5 h-12 w-0.5 shrink-0 rounded bg-border" />}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 pt-1">
        {(Object.entries(TOOTH_CONFIG) as [ToothStatus, typeof TOOTH_CONFIG[ToothStatus]][]).map(
          ([status, cfg]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className={cn("h-3 w-3 rounded-sm", cfg.bg)} />
              <span className="text-xs text-muted-foreground">{cfg.label}</span>
            </div>
          )
        )}
      </div>
    </div>
  )
}
