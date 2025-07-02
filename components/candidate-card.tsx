import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Building, ExternalLink, Mail, Phone, GraduationCap } from "lucide-react"

interface Publication {
  title: string
  conference: string
  year: number
  citations: number
  url?: string
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
  phdUniversity?: string // NEW
  phdGraduationYear?: number // NEW
  phdDepartment?: string // NEW
}

interface CandidateCardProps {
  candidate: Candidate
}

export default function CandidateCard({ candidate }: CandidateCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const topConferences = ["NeurIPS", "ASPLOS", "ICML", "ICLR", "SIGCOMM", "OSDI", "SOSP"]
  const hasTopConferencePubs = candidate.publications.some((pub) =>
    topConferences.some((conf) => pub.conference.includes(conf)),
  )

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={candidate.avatar || "/placeholder.svg"} alt={candidate.name} />
              <AvatarFallback>{getInitials(candidate.name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="flex items-center gap-2">
                {candidate.name}
                {hasTopConferencePubs && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Top Tier
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  {candidate.university}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Graduating {candidate.graduationYear}
                </span>
              </CardDescription>
              {candidate.phdUniversity && (
                <div className="text-sm text-blue-600 mt-2 flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  <span className="font-medium">PhD:</span> {candidate.phdUniversity}
                  {candidate.phdGraduationYear && <span>({candidate.phdGraduationYear})</span>}
                  {candidate.phdDepartment && candidate.phdDepartment !== candidate.department && (
                    <span className="text-muted-foreground">• {candidate.phdDepartment}</span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1 bg-transparent">
              <Mail className="h-3 w-3" />
              Contact
            </Button>
            <Button size="sm">View Profile</Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Skills */}
        <div>
          <h4 className="text-sm font-medium mb-2">Key Skills</h4>
          <div className="flex flex-wrap gap-1">
            {candidate.skills.slice(0, 6).map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {candidate.skills.length > 6 && (
              <Badge variant="outline" className="text-xs">
                +{candidate.skills.length - 6} more
              </Badge>
            )}
          </div>
        </div>

        {/* Research Areas */}
        <div>
          <h4 className="text-sm font-medium mb-2">Research Areas</h4>
          <div className="flex flex-wrap gap-1">
            {candidate.researchAreas.map((area) => (
              <Badge key={area} variant="secondary" className="text-xs">
                {area}
              </Badge>
            ))}
          </div>
        </div>

        {/* Publications */}
        <div>
          <h4 className="text-sm font-medium mb-2">Recent Publications ({candidate.publications.length})</h4>
          <div className="space-y-2">
            {candidate.publications.slice(0, 2).map((pub, index) => (
              <div key={index} className="text-sm border-l-2 border-muted pl-3">
                <div className="font-medium line-clamp-1">{pub.title}</div>
                <div className="text-muted-foreground flex items-center gap-2">
                  <span>
                    {pub.conference} {pub.year}
                  </span>
                  <span>•</span>
                  <span>{pub.citations} citations</span>
                  {pub.url && <ExternalLink className="h-3 w-3 ml-1" />}
                </div>
              </div>
            ))}
            {candidate.publications.length > 2 && (
              <div className="text-xs text-muted-foreground">
                +{candidate.publications.length - 2} more publications
              </div>
            )}
          </div>
        </div>

        {/* Recent Internships */}
        {candidate.internships.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Recent Experience</h4>
            <div className="space-y-1">
              {candidate.internships.slice(0, 2).map((internship, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium">{internship.role}</span> at{" "}
                  <span className="text-muted-foreground">{internship.company}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({internship.duration}, {internship.year})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
          <span className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {candidate.email}
          </span>
          {candidate.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {candidate.phone}
            </span>
          )}
          <span className="ml-auto">{candidate.yearsExperience} years experience</span>
        </div>
      </CardContent>
    </Card>
  )
}
