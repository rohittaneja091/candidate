"use client"

import { Badge } from "@/components/ui/badge"
import { GraduationCap, X } from "lucide-react"

interface PhdFilterBadgeProps {
  phdUniversity?: string
  phdOnly: boolean
  onRemovePhdUniversity: () => void
  onTogglePhdOnly: () => void
}

export default function PhdFilterBadge({
  phdUniversity,
  phdOnly,
  onRemovePhdUniversity,
  onTogglePhdOnly,
}: PhdFilterBadgeProps) {
  if (!phdUniversity && !phdOnly) return null

  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm font-medium">Active PhD Filters:</span>

      {phdOnly && (
        <Badge variant="secondary" className="gap-1 bg-blue-100 text-blue-800">
          <GraduationCap className="h-3 w-3" />
          PhD Candidates Only
          <X className="h-3 w-3 cursor-pointer hover:bg-blue-200 rounded" onClick={onTogglePhdOnly} />
        </Badge>
      )}

      {phdUniversity && phdUniversity !== "all" && (
        <Badge variant="secondary" className="gap-1 bg-purple-100 text-purple-800">
          <GraduationCap className="h-3 w-3" />
          PhD: {phdUniversity}
          <X className="h-3 w-3 cursor-pointer hover:bg-purple-200 rounded" onClick={onRemovePhdUniversity} />
        </Badge>
      )}
    </div>
  )
}
