"use client"

import React from "react"
import Link from "next/link"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Database, Download, Play, RefreshCw, Users, BookOpen, Award, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PopulationStatus {
  statistics: {
    totalCandidates: number
    totalPublications: number
    totalSkillAssignments: number
  }
  recentCandidates: Array<{
    name: string
    university: string
    created_at: string
  }>
  universityDistribution: Array<{
    university: string
    count: number
  }>
}

export default function DatabasePopulator() {
  const [isPopulating, setIsPopulating] = useState(false)
  const [populationProgress, setPopulationProgress] = useState(0)
  const [status, setStatus] = useState<PopulationStatus | null>(null)
  const [populationResults, setPopulationResults] = useState<any>(null)
  const { toast } = useToast()

  const loadStatus = async () => {
    try {
      const response = await fetch("/api/populate/status")
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error("Error loading status:", error)
    }
  }

  const startPopulation = async (testMode = false) => {
    setIsPopulating(true)
    setPopulationProgress(0)
    setPopulationResults(null)

    // helper: safely read JSON if possible, otherwise return text
    const safeParse = async (res: Response) => {
      const ct = res.headers.get("content-type") || ""
      if (ct.includes("application/json")) {
        try {
          return await res.json()
        } catch {
          /* fall through */
        }
      }
      return { error: await res.text() }
    }

    // progress simulation
    const interval = setInterval(() => setPopulationProgress((p) => Math.min(p + Math.random() * 12, 90)), 850)

    try {
      const res = await fetch("/api/populate/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          universities: ["Stanford University", "MIT", "Carnegie Mellon University", "UC Berkeley", "Caltech"],
          minCitations: 5,
          maxCandidates: 20,
          graduationYears: [2024, 2025, 2026],
          testMode, // Add test mode flag
        }),
      })

      clearInterval(interval)
      setPopulationProgress(100)

      const payload = await safeParse(res) // ← NEW (never throws)

      if (!res.ok || payload?.success === false) {
        // show whatever the server sent back
        throw new Error(payload?.error || payload?.message || "Population failed on the server")
      }

      setPopulationResults(payload)
      toast({
        title: "Success!",
        description: `Added ${payload.results?.candidatesAdded ?? 0} candidates with ${
          payload.results?.publicationsAdded ?? 0
        } publications`,
      })
      await loadStatus()
    } catch (err: any) {
      console.error("Population error:", err)
      toast({
        title: "Error",
        description: err.message || "Unknown error",
        variant: "destructive",
      })
    } finally {
      clearInterval(interval)
      setIsPopulating(false)
      setPopulationProgress(0)
    }
  }

  // Load status on component mount
  React.useEffect(() => {
    loadStatus()
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Population
          </CardTitle>
          <CardDescription>
            Automatically populate your database with real PhD candidates from top universities using academic APIs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          {status && (
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{status.statistics.totalCandidates}</div>
                <div className="text-sm text-muted-foreground">Candidates</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{status.statistics.totalPublications}</div>
                <div className="text-sm text-muted-foreground">Publications</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{status.statistics.totalSkillAssignments}</div>
                <div className="text-sm text-muted-foreground">Skills Mapped</div>
              </div>
            </div>
          )}

          <Separator />

          {/* Population Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Populate from Academic Sources</h3>
                <p className="text-sm text-muted-foreground">
                  Fetch real PhD candidates from OpenAlex, Semantic Scholar, and other academic databases
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={loadStatus} disabled={isPopulating} className="gap-2 bg-transparent">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                <Link href="/">
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <Users className="h-4 w-4" />
                    View All Data
                  </Button>
                </Link>
                <Button onClick={() => startPopulation(false)} disabled={isPopulating} className="gap-2">
                  {isPopulating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Populating...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Start Population
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => startPopulation(true)}
                  disabled={isPopulating}
                  variant="outline"
                  className="gap-2 bg-transparent"
                >
                  {isPopulating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Test Mode
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Progress */}
            {isPopulating && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Fetching candidates from academic databases...</span>
                  <span>{Math.round(populationProgress)}%</span>
                </div>
                <Progress value={populationProgress} className="w-full" />
              </div>
            )}

            {/* Results */}
            {populationResults && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">Population Complete!</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Candidates Added:</span> {populationResults.results.candidatesAdded}
                  </div>
                  <div>
                    <span className="font-medium">Publications Added:</span>{" "}
                    {populationResults.results.publicationsAdded}
                  </div>
                  <div>
                    <span className="font-medium">Skills Extracted:</span> {populationResults.results.skillsExtracted}
                  </div>
                  <div>
                    <span className="font-medium">Errors:</span> {populationResults.results.errors.length}
                  </div>
                </div>

                {/* Search Results Breakdown */}
                {populationResults.results.searchResults && (
                  <div className="mt-4">
                    <h5 className="font-medium text-green-800 mb-2">Search Results by University:</h5>
                    <div className="space-y-1 text-xs">
                      {populationResults.results.searchResults.map((result, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{result.university}:</span>
                          <span>
                            {result.papersFound} papers → {result.candidatesIdentified} candidates
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tips for better results */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <h4 className="font-medium text-blue-800 mb-1">Tips for Better Results:</h4>
                  <ul className="text-blue-700 space-y-1 text-xs">
                    <li>• Lower citation thresholds to find more early-career researchers</li>
                    <li>• Extended search to 4 years of recent publications</li>
                    <li>• Broader venue coverage including conferences and journals</li>
                    <li>• Relaxed PhD candidate identification criteria</li>
                    <li>• Multiple API sources for comprehensive coverage</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* University Distribution */}
          {status?.universityDistribution && status.universityDistribution.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">University Distribution</h4>
              <div className="grid grid-cols-2 gap-2">
                {status.universityDistribution.slice(0, 8).map((uni, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="truncate">{uni.university}</span>
                    <Badge variant="secondary">{uni.count}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Candidates */}
          {status?.recentCandidates && status.recentCandidates.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Recently Added Candidates</h4>
              <div className="space-y-2">
                {status.recentCandidates.slice(0, 5).map((candidate, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{candidate.name}</span>
                      <span className="text-muted-foreground ml-2">• {candidate.university}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(candidate.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Sources Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-medium">OpenAlex</h4>
              <p className="text-sm text-muted-foreground">Comprehensive academic database with 200M+ papers</p>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-medium">Semantic Scholar</h4>
              <p className="text-sm text-muted-foreground">AI-powered research tool with author profiles</p>
            </div>
            <div className="text-center">
              <Award className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h4 className="font-medium">CrossRef</h4>
              <p className="text-sm text-muted-foreground">DOI resolution and publication metadata</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
