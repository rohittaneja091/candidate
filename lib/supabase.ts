import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Candidate {
  id: string
  name: string
  email: string
  phone?: string
  university: string
  department?: string
  graduation_year: number
  years_experience: number
  phd_university?: string // NEW: PhD institution
  phd_graduation_year?: number // NEW: PhD graduation year
  phd_department?: string // NEW: PhD department
  created_at: string
  updated_at: string
}

export interface Publication {
  id: string
  candidate_id: string
  title: string
  conference?: string
  journal?: string
  year: number
  citations: number
  url?: string
  abstract?: string
  doi?: string
  venue_type: "conference" | "journal"
  venue_rank: "top-tier" | "mid-tier" | "other"
  created_at: string
}

export interface CandidateSkill {
  candidate_id: string
  skill_id: string
  proficiency_level: "beginner" | "intermediate" | "advanced" | "expert"
}

export interface Internship {
  id: string
  candidate_id: string
  company: string
  role: string
  duration?: string
  start_date?: string
  end_date?: string
  year: number
  description?: string
  created_at: string
}

// Database operations
export async function createCandidate(candidateData: Omit<Candidate, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase.from("candidates").insert([candidateData]).select().single()

  if (error) throw error
  return data
}

export async function getCandidates() {
  const { data, error } = await supabase
    .from("candidates")
    .select(`
      *,
      publications (*),
      candidate_skills (
        skill_id,
        proficiency_level,
        skills (name, category)
      ),
      internships (*),
      candidate_research_areas (
        research_areas (name)
      )
    `)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function addPublications(candidateId: string, publications: any[]) {
  const publicationsData = publications.map((pub) => ({
    candidate_id: candidateId,
    title: pub.title,
    conference: pub.venue,
    year: pub.year,
    citations: pub.citations,
    url: pub.url,
    abstract: pub.abstract,
    doi: pub.doi,
    venue_type: "conference" as const,
    venue_rank: getVenueRank(pub.venue),
  }))

  const { data, error } = await supabase.from("publications").insert(publicationsData).select()

  if (error) throw error
  return data
}

function getVenueRank(venue: string): "top-tier" | "mid-tier" | "other" {
  const topTierVenues = [
    "NeurIPS",
    "ICML",
    "ICLR",
    "ASPLOS",
    "OSDI",
    "SOSP",
    "SIGCOMM",
    "STOC",
    "FOCS",
    "CRYPTO",
    "USENIX Security",
    "CCS",
    "ICRA",
    "RSS",
    "IROS",
  ]

  if (topTierVenues.some((topVenue) => venue.includes(topVenue))) {
    return "top-tier"
  }

  return "other"
}
