"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Calendar,
  Building,
  ExternalLink,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  Award,
  Briefcase,
  MapPin,
} from "lucide-react"

interface Publication {
  title: string
  conference?: string
  journal?: string
  year: number
  citations: number
  url?: string
  venue_rank?: string
}

interface Internship {
  company: string
  role: string
  duration: string
  year: number
  description?: string
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
  phdUniversity?: string
  phdGraduationYear?: number
  phdDepartment?: string
  skills: string[]
  publications: Publication[]
  internships: Internship[]
  researchAreas: string[]
  avatar?: string
}

interface CandidateDetailDialogProps {
  candidate: Candidate | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CandidateDetailDialog({ candidate, open, onOpenChange }: CandidateDetailDialogProps) {
  if (!candidate) return null

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const totalCitations = candidate.publications.reduce((sum, pub) => sum + pub.citations, 0)
  const topTierPubs = candidate.publications.filter((pub) => pub.venue_rank === "top-tier").length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={candidate.avatar || "/placeholder.svg"} alt={candidate.name} />
              <AvatarFallback className="text-lg">{getInitials(candidate.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-2xl flex items-center gap-2">
                {candidate.name}
                {topTierPubs > 0 && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Top Tier Researcher
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Current Affiliation */}
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Current Affiliation</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        <span>{candidate.university}</span>
                      </div>
                      {candidate.department && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{candidate.department}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Graduating {candidate.graduationYear}</span>
                      </div>
                    </div>
                  </div>

                  {/* PhD Information */}
                  {candidate.phdUniversity && (
                    <div>
                      <h4 className="font-medium text-foreground mb-2">PhD Details</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{candidate.phdUniversity}</span>
                        </div>
                        {candidate.phdDepartment && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{candidate.phdDepartment}</span>
                          </div>
                        )}
                        {candidate.phdGraduationYear && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>PhD {candidate.phdGraduationYear}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{candidate.email}</span>
                  </div>
                  {candidate.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{candidate.phone}</span>
                    </div>
                  )}
                  <div className="ml-auto text-muted-foreground">{candidate.yearsExperience} years experience</div>
                </div>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="publications">Publications</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="skills">Skills & Research</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Publications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{candidate.publications.length}</div>
                  <p className="text-xs text-muted-foreground">{totalCitations} total citations</p>
                  {topTierPubs > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      {topTierPubs} top-tier venue{topTierPubs > 1 ? "s" : ""}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Experience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{candidate.internships.length}</div>
                  <p className="text-xs text-muted-foreground">Industry positions</p>
                  <p className="text-xs text-muted-foreground">{candidate.yearsExperience} years total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{candidate.skills.length}</div>
                  <p className="text-xs text-muted-foreground">Technical skills</p>
                  <p className="text-xs text-muted-foreground">{candidate.researchAreas.length} research areas</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Publications Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Publications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {candidate.publications.slice(0, 3).map((pub, index) => (
                    <div key={index} className="border-l-2 border-muted pl-4">
                      <h4 className="font-medium text-sm">{pub.title}</h4>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                        <span>
                          {pub.conference || pub.journal} {pub.year}
                        </span>
                        <span>•</span>
                        <span>{pub.citations} citations</span>
                        {pub.venue_rank === "top-tier" && (
                          <>
                            <span>•</span>
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                              Top Tier
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {candidate.publications.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{candidate.publications.length - 3} more publications
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="publications" className="space-y-4">
            <div className="space-y-4">
              {candidate.publications.map((pub, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{pub.title}</h4>
                        <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                          <span>{pub.conference || pub.journal}</span>
                          <span>•</span>
                          <span>{pub.year}</span>
                          <span>•</span>
                          <span>{pub.citations} citations</span>
                          {pub.venue_rank === "top-tier" && (
                            <>
                              <span>•</span>
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                Top Tier
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                      {pub.url && (
                        <Button variant="outline" size="sm" className="ml-4 bg-transparent">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="experience" className="space-y-4">
            <div className="space-y-4">
              {candidate.internships.map((internship, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{internship.role}</h4>
                        <p className="text-sm text-muted-foreground">{internship.company}</p>
                        <div className="text-xs text-muted-foreground mt-1">
                          {internship.duration} • {internship.year}
                        </div>
                        {internship.description && <p className="text-sm mt-2">{internship.description}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {candidate.internships.length === 0 && (
                <Card>
                  <CardContent className="pt-4 text-center text-muted-foreground">
                    No industry experience listed
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Technical Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  {candidate.skills.length === 0 && <p className="text-sm text-muted-foreground">No skills listed</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Research Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {candidate.researchAreas.map((area) => (
                      <Badge key={area} variant="secondary">
                        {area}
                      </Badge>
                    ))}
                  </div>
                  {candidate.researchAreas.length === 0 && (
                    <p className="text-sm text-muted-foreground">No research areas listed</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Contact
          </Button>
          <Button>Schedule Interview</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
