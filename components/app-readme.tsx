"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ChevronDown,
  ChevronUp,
  Database,
  Search,
  GraduationCap,
  BookOpen,
  Users,
  Download,
  Plus,
  Filter,
  Zap,
} from "lucide-react"

export default function AppReadme() {
  const [isExpanded, setIsExpanded] = useState(false)

  const features = [
    {
      icon: <Database className="h-4 w-4" />,
      title: "Auto-Population",
      description: "Automatically discover PhD candidates from OpenAlex, Semantic Scholar, and CrossRef",
      color: "bg-blue-100 text-blue-800",
    },
    {
      icon: <GraduationCap className="h-4 w-4" />,
      title: "PhD-Focused Filtering",
      description: "Filter by PhD university, graduation year, and PhD-only candidates",
      color: "bg-purple-100 text-purple-800",
    },
    {
      icon: <BookOpen className="h-4 w-4" />,
      title: "Publication Analysis",
      description: "Track citations, top-tier venues, and research impact automatically",
      color: "bg-green-100 text-green-800",
    },
    {
      icon: <Search className="h-4 w-4" />,
      title: "Advanced Search",
      description: "Search by skills, universities, companies, citations, and research areas",
      color: "bg-orange-100 text-orange-800",
    },
    {
      icon: <Users className="h-4 w-4" />,
      title: "Detailed Profiles",
      description: "View complete candidate profiles with publications, experience, and skills",
      color: "bg-pink-100 text-pink-800",
    },
    {
      icon: <Download className="h-4 w-4" />,
      title: "Export & Contact",
      description: "Export candidate data and contact information for recruitment",
      color: "bg-indigo-100 text-indigo-800",
    },
  ]

  const quickActions = [
    {
      icon: <Database className="h-4 w-4" />,
      text: "Populate Database",
      description: "Start with real PhD candidates",
    },
    { icon: <Plus className="h-4 w-4" />, text: "Add Candidate", description: "Manually add a candidate" },
    { icon: <Filter className="h-4 w-4" />, text: "PhD-Only Filter", description: "Focus on PhD candidates" },
    { icon: <Search className="h-4 w-4" />, text: "Search Skills", description: "Find by technical expertise" },
  ]

  return (
    <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">PhD Talent Database</CardTitle>
              <p className="text-sm text-muted-foreground">
                AI-powered recruiting platform for discovering top PhD candidates from academic publications
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="gap-2">
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Hide Details
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show Features
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Key Features */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Key Features
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                  <Badge variant="secondary" className={`${feature.color} gap-1`}>
                    {feature.icon}
                  </Badge>
                  <div>
                    <h5 className="font-medium text-sm">{feature.title}</h5>
                    <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Start */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Quick Start Guide
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {quickActions.map((action, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border text-sm">
                  <div className="p-1 bg-gray-100 rounded">{action.icon}</div>
                  <div>
                    <div className="font-medium">{action.text}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Sources */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Database className="h-4 w-4" />
              Academic Data Sources
            </h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="gap-1">
                <BookOpen className="h-3 w-3" />
                OpenAlex (200M+ papers)
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Users className="h-3 w-3" />
                Semantic Scholar (AI-powered)
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Download className="h-3 w-3" />
                CrossRef (DOI resolution)
              </Badge>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold mb-2 text-amber-800">💡 Pro Tips</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Start by clicking "Populate Database" to automatically discover PhD candidates</li>
              <li>• Use the "PhD-Only" filter to focus exclusively on PhD-level talent</li>
              <li>• Filter by top-tier publications to find high-impact researchers</li>
              <li>• Search by specific skills (e.g., "PyTorch", "Computer Vision") to find technical matches</li>
              <li>• Click on any candidate to view their detailed profile with publications and experience</li>
            </ul>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
