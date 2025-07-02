"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Search, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AddCandidateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddCandidate: (candidate: any) => void
}

export default function AddCandidateDialog({ open, onOpenChange, onAddCandidate }: AddCandidateDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    university: "",
    department: "",
    graduationYear: new Date().getFullYear(),
    yearsExperience: 0,
    researchAreas: [] as string[],
    skills: [] as string[],
    phdUniversity: "", // NEW
    phdGraduationYear: new Date().getFullYear(), // NEW
    phdDepartment: "", // NEW
  })

  const [newSkill, setNewSkill] = useState("")
  const [newResearchArea, setNewResearchArea] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [scrapedData, setScrapedData] = useState<any>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create candidate in database
      const response = await fetch("/api/candidates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          university: formData.university,
          department: formData.department,
          graduation_year: formData.graduationYear,
          years_experience: formData.yearsExperience,
          phd_university: formData.phdUniversity,
          phd_graduation_year: formData.phdGraduationYear,
          phd_department: formData.phdDepartment,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create candidate")
      }

      const candidate = await response.json()

      // Add scraped publications if available
      if (scrapedData?.publications?.length > 0) {
        await fetch("/api/publications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            candidateId: candidate.id,
            publications: scrapedData.publications,
          }),
        })
      }

      toast({
        title: "Success",
        description: `Added ${formData.name} with ${scrapedData?.publications?.length || 0} publications`,
      })

      onAddCandidate(candidate)
      onOpenChange(false)
      resetForm()
    } catch (error) {
      console.error("Error adding candidate:", error)
      toast({
        title: "Error",
        description: "Failed to add candidate. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const searchPublications = async () => {
    if (!formData.name) {
      toast({
        title: "Error",
        description: "Please enter a candidate name first",
        variant: "destructive",
      })
      return
    }

    setIsSearching(true)

    try {
      const response = await fetch("/api/scrape/publications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authorName: formData.name,
          university: formData.university,
          email: formData.email,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to search publications")
      }

      const data = await response.json()
      setScrapedData(data)

      // Auto-add extracted skills
      if (data.extractedSkills?.length > 0) {
        setFormData((prev) => ({
          ...prev,
          skills: [...new Set([...prev.skills, ...data.extractedSkills])],
        }))
      }

      toast({
        title: "Success",
        description: `Found ${data.publications?.length || 0} publications and extracted ${data.extractedSkills?.length || 0} skills`,
      })
    } catch (error) {
      console.error("Error searching publications:", error)
      toast({
        title: "Error",
        description: "Failed to search publications. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      university: "",
      department: "",
      graduationYear: new Date().getFullYear(),
      yearsExperience: 0,
      researchAreas: [],
      skills: [],
      phdUniversity: "",
      phdGraduationYear: new Date().getFullYear(),
      phdDepartment: "",
    })
    setScrapedData(null)
  }

  const addSkill = () => {
    if (newSkill && !formData.skills.includes(newSkill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill],
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }))
  }

  const addResearchArea = () => {
    if (newResearchArea && !formData.researchAreas.includes(newResearchArea)) {
      setFormData((prev) => ({
        ...prev,
        researchAreas: [...prev.researchAreas, newResearchArea],
      }))
      setNewResearchArea("")
    }
  }

  const removeResearchArea = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      researchAreas: prev.researchAreas.filter((a) => a !== area),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Candidate</DialogTitle>
          <DialogDescription>
            Add a new PhD candidate to the database. Publications will be automatically discovered from academic
            databases.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="university">University *</Label>
              <Input
                id="university"
                value={formData.university}
                onChange={(e) => setFormData((prev) => ({ ...prev, university: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phdUniversity">PhD University</Label>
              <Input
                id="phdUniversity"
                value={formData.phdUniversity}
                onChange={(e) => setFormData((prev) => ({ ...prev, phdUniversity: e.target.value }))}
                placeholder="Where did/will they get their PhD?"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phdDepartment">PhD Department</Label>
              <Input
                id="phdDepartment"
                value={formData.phdDepartment}
                onChange={(e) => setFormData((prev) => ({ ...prev, phdDepartment: e.target.value }))}
                placeholder="PhD department (if different)"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phdGraduationYear">PhD Graduation Year</Label>
              <Input
                id="phdGraduationYear"
                type="number"
                value={formData.phdGraduationYear}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phdGraduationYear: Number.parseInt(e.target.value) }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Research Areas</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add research area"
                value={newResearchArea}
                onChange={(e) => setNewResearchArea(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addResearchArea())}
              />
              <Button type="button" onClick={addResearchArea} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {formData.researchAreas.map((area) => (
                <Badge key={area} variant="secondary" className="gap-1">
                  {area}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeResearchArea(area)} />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Skills{" "}
              {scrapedData?.extractedSkills?.length > 0 && <span className="text-green-600">(Auto-extracted)</span>}
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              />
              <Button type="button" onClick={addSkill} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {formData.skills.map((skill) => (
                <Badge key={skill} variant="outline" className="gap-1">
                  {skill}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                </Badge>
              ))}
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <Label>Auto-discover Publications & Skills</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={searchPublications}
                disabled={isSearching || !formData.name}
                className="gap-2 bg-transparent"
              >
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {isSearching ? "Searching..." : "Search Publications"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Automatically search OpenAlex, Semantic Scholar, and CrossRef for publications and extract skills.
            </p>
            {scrapedData && (
              <div className="text-sm text-green-600">
                ✓ Found {scrapedData.publications?.length || 0} publications and extracted{" "}
                {scrapedData.extractedSkills?.length || 0} skills
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                "Add Candidate"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
