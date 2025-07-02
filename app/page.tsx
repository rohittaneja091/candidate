"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Filter, Download, Users, BookOpen, GraduationCap, Building, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CandidatesTable from "@/components/candidates-table"
import AddCandidateDialog from "@/components/add-candidate-dialog"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import PhdFilterBadge from "@/components/phd-filter-badge"
import PhdStatsCard from "@/components/phd-stats-card"
import AppReadme from "@/components/app-readme"

export default function RecruitingDashboard() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSkill, setSelectedSkill] = useState("all")
  const [selectedUniversity, setSelectedUniversity] = useState("all")
  const [selectedCompany, setSelectedCompany] = useState("all")
  const [minCitations, setMinCitations] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedPhdUniversity, setSelectedPhdUniversity] = useState("all")
  const [phdOnly, setPhdOnly] = useState(false)

  // Load candidates from Supabase
  useEffect(() => {
    loadCandidates()
  }, [])

  const loadCandidates = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from("candidates")
        .select(`
          *,
          publications (*),
          candidate_skills (
            proficiency_level,
            skills (name, category)
          ),
          internships (*),
          candidate_research_areas (
            research_areas (name)
          )
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading candidates:", error)
        return
      }

      // Transform data to match the expected format
      const transformedCandidates = data.map((candidate) => ({
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        university: candidate.university,
        department: candidate.department,
        graduationYear: candidate.graduation_year,
        yearsExperience: candidate.years_experience,
        phdUniversity: candidate.phd_university, // NEW
        phdGraduationYear: candidate.phd_graduation_year, // NEW
        phdDepartment: candidate.phd_department, // NEW
        skills: candidate.candidate_skills?.map((cs) => cs.skills.name) || [],
        publications: candidate.publications || [],
        internships: candidate.internships || [],
        researchAreas: candidate.candidate_research_areas?.map((cra) => cra.research_areas.name) || [],
      }))

      setCandidates(transformedCandidates)
    } catch (error) {
      console.error("Error loading candidates:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      candidate.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSkill = selectedSkill === "all" || candidate.skills.includes(selectedSkill)
    const matchesUniversity = selectedUniversity === "all" || candidate.university === selectedUniversity

    const companies = candidate.internships.map((i) => i.company)
    const matchesCompany = selectedCompany === "all" || companies.includes(selectedCompany)

    const totalCitations = candidate.publications.reduce((sum, pub) => sum + pub.citations, 0)
    const matchesCitations = !minCitations || totalCitations >= Number.parseInt(minCitations)

    // NEW PhD filters
    const matchesPhdUniversity = selectedPhdUniversity === "all" || candidate.phdUniversity === selectedPhdUniversity
    const matchesPhdOnly = !phdOnly || candidate.phdUniversity // Only show candidates with PhD info if filter is enabled

    return (
      matchesSearch &&
      matchesSkill &&
      matchesUniversity &&
      matchesCompany &&
      matchesCitations &&
      matchesPhdUniversity &&
      matchesPhdOnly
    )
  })

  const allSkills = Array.from(new Set(candidates.flatMap((c) => c.skills)))
  const allUniversities = Array.from(new Set(candidates.map((c) => c.university)))
  const allCompanies = Array.from(new Set(candidates.flatMap((c) => c.internships.map((i) => i.company))))
  const allPhdUniversities = Array.from(new Set(candidates.map((c) => c.phdUniversity).filter(Boolean)))

  const stats = {
    totalCandidates: candidates.length,
    totalPublications: candidates.reduce((sum, c) => sum + c.publications.length, 0),
    avgExperience:
      candidates.length > 0
        ? Math.round(candidates.reduce((sum, c) => sum + c.yearsExperience, 0) / candidates.length)
        : 0,
    topUniversities: allUniversities.length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading candidates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">PhD Talent Database</h1>
            <p className="text-muted-foreground">Discover and recruit top PhD candidates from leading conferences</p>
          </div>
          <div className="flex gap-2">
            <Link href="/populate">
              <Button variant="outline" className="gap-2 bg-transparent">
                <Database className="h-4 w-4" />
                Populate Database
              </Button>
            </Link>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Candidate
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* README Section */}
        <AppReadme />

        {/* Empty State */}
        {candidates.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No candidates in database</h3>
              <p className="text-muted-foreground mb-4">
                Get started by populating your database with real PhD candidates from academic sources
              </p>
              <div className="flex gap-2 justify-center">
                <Link href="/populate">
                  <Button className="gap-2">
                    <Database className="h-4 w-4" />
                    Populate Database
                  </Button>
                </Link>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(true)} className="gap-2 bg-transparent">
                  <Plus className="h-4 w-4" />
                  Add Manually
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        {candidates.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCandidates}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Publications</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPublications}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Experience</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.avgExperience} years</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Universities</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.topUniversities}</div>
                </CardContent>
              </Card>
            </div>

            {/* PhD-specific stats */}
            <PhdStatsCard candidates={candidates} />

            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Search & Filter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
                  <div className="xl:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, email, skills..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by skill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Skills</SelectItem>
                      {allSkills.map((skill) => (
                        <SelectItem key={skill} value={skill}>
                          {skill}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Current university" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Universities</SelectItem>
                      {allUniversities.map((uni) => (
                        <SelectItem key={uni} value={uni}>
                          {uni}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedPhdUniversity} onValueChange={setSelectedPhdUniversity}>
                    <SelectTrigger>
                      <SelectValue placeholder="PhD university" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All PhD Universities</SelectItem>
                      {allPhdUniversities.map((uni) => (
                        <SelectItem key={uni} value={uni}>
                          {uni}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Companies</SelectItem>
                      {allCompanies.map((company) => (
                        <SelectItem key={company} value={company}>
                          {company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Min citations"
                    value={minCitations}
                    onChange={(e) => setMinCitations(e.target.value)}
                  />
                </div>

                {/* PhD Only Toggle */}
                <div className="flex items-center space-x-2 mt-4">
                  <input
                    type="checkbox"
                    id="phdOnly"
                    checked={phdOnly}
                    onChange={(e) => setPhdOnly(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="phdOnly" className="text-sm font-medium">
                    Show only PhD candidates
                  </label>
                  <span className="text-xs text-muted-foreground">
                    ({candidates.filter((c) => c.phdUniversity).length} of {candidates.length} candidates have PhD info)
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* PhD Filter Badges */}
            <PhdFilterBadge
              phdUniversity={selectedPhdUniversity}
              phdOnly={phdOnly}
              onRemovePhdUniversity={() => setSelectedPhdUniversity("all")}
              onTogglePhdOnly={() => setPhdOnly(!phdOnly)}
            />

            {/* Results Table */}
            <Card>
              <CardHeader>
                <CardTitle>Candidates ({filteredCandidates.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <CandidatesTable candidates={filteredCandidates} />
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <AddCandidateDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddCandidate={(candidate) => {
          loadCandidates() // Reload from database
        }}
      />
    </div>
  )
}
