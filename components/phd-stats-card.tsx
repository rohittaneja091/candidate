"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, TrendingUp, Award } from "lucide-react"

interface Candidate {
  phdUniversity?: string
  phdGraduationYear?: number
  publications: any[]
}

interface PhdStatsCardProps {
  candidates: Candidate[]
}

export default function PhdStatsCard({ candidates }: PhdStatsCardProps) {
  const phdCandidates = candidates.filter((c) => c.phdUniversity)
  const currentYear = new Date().getFullYear()

  // Recent PhD graduates (last 3 years)
  const recentGrads = phdCandidates.filter((c) => c.phdGraduationYear && c.phdGraduationYear >= currentYear - 3)

  // Current PhD students (graduating in future)
  const currentStudents = phdCandidates.filter((c) => c.phdGraduationYear && c.phdGraduationYear > currentYear)

  // Top PhD universities by count
  const phdUniversityCounts = phdCandidates.reduce(
    (acc, candidate) => {
      if (candidate.phdUniversity) {
        acc[candidate.phdUniversity] = (acc[candidate.phdUniversity] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>,
  )

  const topPhdUniversities = Object.entries(phdUniversityCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-blue-600" />
          PhD Candidate Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* PhD Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{phdCandidates.length}</div>
            <div className="text-sm text-muted-foreground">PhD Candidates</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{recentGrads.length}</div>
            <div className="text-sm text-muted-foreground">Recent Grads</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{currentStudents.length}</div>
            <div className="text-sm text-muted-foreground">Current Students</div>
          </div>
        </div>

        {/* Top PhD Universities */}
        {topPhdUniversities.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Top PhD Universities
            </h4>
            <div className="space-y-2">
              {topPhdUniversities.map(([university, count]) => (
                <div key={university} className="flex items-center justify-between text-sm">
                  <span className="truncate">{university}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Graduation Timeline */}
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Graduation Timeline
          </h4>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Graduated 2022-{currentYear}:</span>
              <span className="font-medium">{recentGrads.length}</span>
            </div>
            <div className="flex justify-between">
              <span>
                Graduating {currentYear + 1}-{currentYear + 2}:
              </span>
              <span className="font-medium">{currentStudents.length}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
