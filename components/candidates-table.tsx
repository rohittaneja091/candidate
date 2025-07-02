"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronUp, ChevronDown, Mail, Eye, GraduationCap } from "lucide-react"
import CandidateDetailDialog from "./candidate-detail-dialog"

interface Publication {
  title: string
  conference: string
  year: number
  citations: number
  url?: string
  journal?: string
}

interface Internship {
  company: string
  role: string
  duration: string
  year: number
}

interface Candidate {
  id: string
  name: string
  email: string
  phone?: string
  university: string
  department: string
  graduationYear: number
  yearsExperience: number
  skills: string[]
  publications: Publication[]
  internships: Internship[]
  researchAreas: string[]
  avatar?: string
  phdUniversity?: string
  phdGraduationYear?: number
}

interface CandidatesTableProps {
  candidates: Candidate[]
}

type SortField = "name" | "email" | "university" | "citations" | "publications"
type SortDirection = "asc" | "desc"

export default function CandidatesTable({ candidates }: CandidatesTableProps) {
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getTotalCitations = (publications: Publication[]) => {
    return publications.reduce((sum, pub) => sum + pub.citations, 0)
  }

  const getTopConferences = (publications: Publication[]) => {
    const topConferences = ["NeurIPS", "ASPLOS", "ICML", "ICLR", "SIGCOMM", "OSDI", "SOSP"]

    return publications.filter((pub) => {
      // Safely check both conference and journal fields
      const venue = pub.conference ?? pub.journal ?? ""
      return topConferences.some((conf) => venue.includes(conf))
    }).length
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedCandidates = [...candidates].sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (sortField) {
      case "name":
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case "email":
        aValue = a.email.toLowerCase()
        bValue = b.email.toLowerCase()
        break
      case "university":
        aValue = a.university.toLowerCase()
        bValue = b.university.toLowerCase()
        break
      case "citations":
        aValue = getTotalCitations(a.publications)
        bValue = getTotalCitations(b.publications)
        break
      case "publications":
        aValue = a.publications.length
        bValue = b.publications.length
        break
      default:
        return 0
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer hover:bg-muted/50 select-none" onClick={() => handleSort("name")}>
              <div className="flex items-center">
                Candidate Name
                <SortIcon field="name" />
              </div>
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50 select-none" onClick={() => handleSort("email")}>
              <div className="flex items-center">
                Email
                <SortIcon field="email" />
              </div>
            </TableHead>
            <TableHead>Skills</TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 select-none text-center"
              onClick={() => handleSort("citations")}
            >
              <div className="flex items-center justify-center">
                Publications & Citations
                <SortIcon field="citations" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 select-none"
              onClick={() => handleSort("university")}
            >
              <div className="flex items-center">
                University
                <SortIcon field="university" />
              </div>
            </TableHead>
            <TableHead>Companies Worked At</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCandidates.map((candidate) => {
            const totalCitations = getTotalCitations(candidate.publications)
            const topTierPubs = getTopConferences(candidate.publications)
            const companies = Array.from(new Set(candidate.internships.map((i) => i.company)))

            return (
              <TableRow key={candidate.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={candidate.avatar || "/placeholder.svg"} alt={candidate.name} />
                      <AvatarFallback className="text-xs">{getInitials(candidate.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {candidate.name}
                        {topTierPubs > 0 && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                            Top Tier
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">Graduating {candidate.graduationYear}</div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="text-sm">
                    <div>{candidate.email}</div>
                    {candidate.phone && <div className="text-muted-foreground text-xs">{candidate.phone}</div>}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {candidate.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {candidate.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{candidate.skills.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-center">
                  <div className="space-y-1">
                    <div className="font-medium">{candidate.publications.length} publications</div>
                    <div className="text-sm text-muted-foreground">{totalCitations} total citations</div>
                    {topTierPubs > 0 && (
                      <div className="text-xs text-green-600">
                        {topTierPubs} top-tier venue{topTierPubs > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <div>
                    <div className="font-medium text-sm">{candidate.university}</div>
                    <div className="text-xs text-muted-foreground">{candidate.department}</div>
                    {candidate.phdUniversity && candidate.phdUniversity !== candidate.university && (
                      <div className="text-xs text-blue-600 mt-1">
                        <GraduationCap className="h-3 w-3 inline mr-1" />
                        PhD: {candidate.phdUniversity} ({candidate.phdGraduationYear})
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">{candidate.yearsExperience} years experience</div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-1">
                    {companies.slice(0, 2).map((company, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium">{company}</span>
                        {candidate.internships.find((i) => i.company === company) && (
                          <div className="text-xs text-muted-foreground">
                            {candidate.internships.find((i) => i.company === company)?.role}
                          </div>
                        )}
                      </div>
                    ))}
                    {companies.length > 2 && (
                      <div className="text-xs text-muted-foreground">+{companies.length - 2} more</div>
                    )}
                    {companies.length === 0 && (
                      <div className="text-sm text-muted-foreground">No experience listed</div>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-transparent">
                      <Mail className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 bg-transparent"
                      onClick={() => {
                        setSelectedCandidate(candidate)
                        setIsDetailDialogOpen(true)
                      }}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {sortedCandidates.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">No candidates found matching your criteria.</div>
      )}
      <CandidateDetailDialog
        candidate={selectedCandidate}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
      />
    </div>
  )
}
