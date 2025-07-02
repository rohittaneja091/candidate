import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// ──────────────────────────────────────────────────────────
// Safe fetch helper – never throws, always returns { ok, data, error }
// ──────────────────────────────────────────────────────────
async function safeFetchJSON(
  url: string,
  options: RequestInit = {},
): Promise<{ ok: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(url, options)

    const isJson = (res.headers.get("content-type") || "").includes("application/json")
    const body = isJson ? await res.json() : await res.text()

    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status} – ${JSON.stringify(body).slice(0, 120)}` }
    }

    return { ok: true, data: body }
  } catch (err: any) {
    return { ok: false, error: err.message }
  }
}

// ── batch helper ────────────────────────────────────────────────
async function insertPublicationsBatch(rows: any[], batchSize = 500) {
  for (let i = 0; i < rows.length; i += batchSize) {
    const slice = rows.slice(i, i + batchSize)
    const { error } = await supabase.from("publications").insert(slice)
    if (error) throw error
  }
}

// ── OpenAlex helpers ────────────────────────────────────────────
const institutionCache = new Map<string, string>()

async function getOpenAlexInstitutionId(name: string): Promise<string | null> {
  console.log(`🔍 Looking up OpenAlex institution ID for: ${name}`)

  if (institutionCache.has(name)) {
    console.log(`✅ Found cached ID for ${name}: ${institutionCache.get(name)}`)
    return institutionCache.get(name)!
  }

  const { ok, data, error } = await safeFetchJSON(
    `https://api.openalex.org/institutions?search=${encodeURIComponent(name)}&per-page=1`,
    {
      headers: { "User-Agent": "PhD-Recruiting-DB (mailto:your-email@domain.com)" },
    },
  )

  if (!ok) {
    console.error(`❌ Failed to lookup institution ${name}:`, error)
    return null
  }

  if (!data?.results?.length) {
    console.warn(`⚠️ No institution found for: ${name}`)
    return null
  }

  const id: string = data.results[0].id?.split("/").pop()
  if (id) {
    institutionCache.set(name, id)
    console.log(`✅ Found institution ID for ${name}: ${id}`)
  }
  return id || null
}

async function searchOpenAlexByUniversity(university: string, minCitations: number) {
  console.log(`🔍 Searching OpenAlex for ${university} (min citations: ${minCitations})`)

  const papers: any[] = []
  const currentYear = new Date().getFullYear()

  // Try multiple search strategies
  const strategies = [
    // Strategy 1: Institution-based search
    async () => {
      const instId = await getOpenAlexInstitutionId(university)
      if (!instId) return []

      const yearWindow = `${currentYear - 4}-${currentYear}`
      const baseFilter = `institutions.id:${instId},publication_year:${yearWindow},cited_by_count:>${minCitations}`
      const url = `https://api.openalex.org/works?filter=${baseFilter}&per-page=100&sort=cited_by_count:desc`

      console.log(`📡 Strategy 1 - Institution search: ${url}`)

      const { ok, data, error } = await safeFetchJSON(url, {
        headers: { "User-Agent": "PhD-Recruiting-DB (mailto:your-email@domain.com)" },
      })

      if (!ok) {
        console.error(`❌ Strategy 1 failed:`, error)
        return []
      }

      return data?.results || []
    },

    // Strategy 2: Simple text search
    async () => {
      const query = encodeURIComponent(university)
      const url = `https://api.openalex.org/works?search=${query}&filter=publication_year:${currentYear - 2}-${currentYear},cited_by_count:>${minCitations}&per-page=50&sort=cited_by_count:desc`

      console.log(`📡 Strategy 2 - Text search: ${url}`)

      const { ok, data, error } = await safeFetchJSON(url, {
        headers: { "User-Agent": "PhD-Recruiting-DB (mailto:your-email@domain.com)" },
      })

      if (!ok) {
        console.error(`❌ Strategy 2 failed:`, error)
        return []
      }

      return data?.results || []
    },
  ]

  // Try each strategy
  for (let i = 0; i < strategies.length; i++) {
    try {
      const results = await strategies[i]()
      if (results.length > 0) {
        console.log(`✅ Strategy ${i + 1} found ${results.length} papers`)

        const processedPapers = results.map((w: any) => ({
          id: w.id,
          title: w.title || "Untitled",
          authors:
            w.authorships?.map((a: any) => ({
              name: a.author?.display_name || "Unknown Author",
              id: a.author?.id,
              institutions: a.institutions?.map((i: any) => i.display_name) || [university],
            })) || [],
          year: w.publication_year || currentYear,
          citations: w.cited_by_count || 0,
          venue: w.primary_location?.source?.display_name || "Unknown Venue",
          doi: w.doi,
          url: w.landing_page_url || w.doi,
          abstract: w.abstract_inverted_index ? reconstructAbstract(w.abstract_inverted_index) : "",
          concepts: w.concepts?.map((c: any) => c.display_name) || [],
          source: "OpenAlex",
        }))

        papers.push(...processedPapers)
        break // Success, no need to try other strategies
      }
    } catch (error) {
      console.error(`❌ Strategy ${i + 1} crashed:`, error)
    }
  }

  console.log(`📊 OpenAlex final result: ${papers.length} papers for ${university}`)
  return papers
}

async function searchSemanticScholarByUniversity(university: string, minCitations: number): Promise<any[]> {
  console.log(`🔍 Searching Semantic Scholar for ${university} (min citations: ${minCitations})`)

  const papers: any[] = []
  const apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY

  if (!apiKey) {
    console.warn(`⚠️ Semantic Scholar: no API key found, skipping search for "${university}"`)
    return papers
  }

  const currentYear = new Date().getFullYear()
  const url =
    "https://api.semanticscholar.org/graph/v1/paper/search?" +
    new URLSearchParams({
      query: university,
      year: `${currentYear - 3}-${currentYear}`,
      minCitationCount: String(Math.max(1, minCitations)), // Ensure at least 1
      limit: "50", // Reduced limit
      fields: "title,year,citationCount,venue,externalIds,abstract,authors",
    })

  console.log(`📡 Querying Semantic Scholar: ${url}`)

  const { ok, data, error } = await safeFetchJSON(url, {
    headers: { "x-api-key": apiKey },
  })

  if (ok && data?.data) {
    const results = data.data.map((paper: any) => ({
      id: paper.paperId,
      title: paper.title || "Untitled",
      authors:
        paper.authors?.map((a: any) => ({
          name: a.name || "Unknown Author",
          id: a.authorId,
          institutions: [university], // Assume from this university
        })) || [],
      year: paper.year || currentYear,
      citations: paper.citationCount || 0,
      venue: paper.venue || "Unknown Venue",
      doi: paper.externalIds?.DOI,
      url: paper.externalIds?.DOI
        ? `https://doi.org/${paper.externalIds.DOI}`
        : `https://semanticscholar.org/paper/${paper.paperId}`,
      abstract: paper.abstract || "",
      concepts: [],
      source: "Semantic Scholar",
    }))

    papers.push(...results)
    console.log(`✅ Semantic Scholar found ${results.length} papers for ${university}`)
  } else {
    console.error(`❌ Semantic Scholar search failed:`, error)
  }

  return papers
}

async function identifyPhDCandidates(papers: any[], graduationYears: number[]) {
  console.log(`🎓 Identifying PhD candidates from ${papers.length} papers`)

  if (papers.length === 0) {
    console.warn(`⚠️ No papers to analyze for PhD candidates`)
    return []
  }

  const authorMap = new Map()

  // Group papers by author
  papers.forEach((paper) => {
    if (!paper.authors || paper.authors.length === 0) {
      console.warn(`⚠️ Paper has no authors: ${paper.title}`)
      return
    }

    paper.authors.forEach((author) => {
      if (!author.name || author.name.length < 3) return

      const key = author.name.toLowerCase().trim()
      if (!authorMap.has(key)) {
        authorMap.set(key, {
          name: author.name,
          id: author.id,
          papers: [],
          totalCitations: 0,
          institutions: new Set(),
          firstPaperYear: paper.year,
          lastPaperYear: paper.year,
        })
      }

      const authorData = authorMap.get(key)
      authorData.papers.push(paper)
      authorData.totalCitations += paper.citations || 0
      if (author.institutions) {
        author.institutions.forEach((inst) => authorData.institutions.add(inst))
      }
      authorData.firstPaperYear = Math.min(authorData.firstPaperYear, paper.year || 2024)
      authorData.lastPaperYear = Math.max(authorData.lastPaperYear, paper.year || 2024)
    })
  })

  console.log(`👥 Found ${authorMap.size} unique authors`)

  // VERY relaxed criteria for PhD candidates
  const candidates = []
  const currentYear = new Date().getFullYear()

  authorMap.forEach((authorData, key) => {
    // Super relaxed heuristics:
    const hasAnyPublications = authorData.papers.length >= 1
    const hasRecentWork = authorData.lastPaperYear >= currentYear - 5 // Extended to 5 years
    const hasReasonableCitations = authorData.totalCitations >= 1 && authorData.totalCitations <= 10000 // Very broad range

    if (hasAnyPublications && hasRecentWork && hasReasonableCitations) {
      const estimatedGradYear = Math.max(authorData.lastPaperYear + 1, currentYear)

      candidates.push({
        ...authorData,
        institutions: Array.from(authorData.institutions),
        estimatedGraduationYear: estimatedGradYear,
        isLikelyPhD: true,
      })
    }
  })

  const sortedCandidates = candidates.sort((a, b) => b.totalCitations - a.totalCitations).slice(0, 20)
  console.log(`🎯 Identified ${sortedCandidates.length} potential PhD candidates`)

  // Log some examples
  sortedCandidates.slice(0, 3).forEach((candidate, i) => {
    console.log(
      `📋 Candidate ${i + 1}: ${candidate.name} (${candidate.papers.length} papers, ${candidate.totalCitations} citations)`,
    )
  })

  return sortedCandidates
}

// Add a test mode that creates sample candidates
async function createTestCandidates() {
  console.log(`🧪 Creating test candidates...`)

  const testCandidates = [
    {
      name: "Dr. Test Candidate One",
      email: "test1@stanford.edu",
      university: "Stanford University",
      department: "Computer Science",
      graduation_year: 2024,
      years_experience: 3,
      phd_university: "Stanford University",
      phd_graduation_year: 2024,
      phd_department: "Computer Science",
    },
    {
      name: "Dr. Test Candidate Two",
      email: "test2@mit.edu",
      university: "MIT",
      department: "EECS",
      graduation_year: 2025,
      years_experience: 2,
      phd_university: "MIT",
      phd_graduation_year: 2025,
      phd_department: "Electrical Engineering and Computer Science",
    },
  ]

  let added = 0
  for (const candidateData of testCandidates) {
    try {
      // Check if already exists
      const { data: existing } = await supabase
        .from("candidates")
        .select("id")
        .eq("email", candidateData.email)
        .single()

      if (existing) {
        console.log(`⚠️ Test candidate ${candidateData.name} already exists`)
        continue
      }

      const { data: candidate, error } = await supabase.from("candidates").insert(candidateData).select().single()

      if (error) {
        console.error(`❌ Failed to create test candidate:`, error)
        continue
      }

      // Add a test publication
      await supabase.from("publications").insert({
        candidate_id: candidate.id,
        title: `Test Publication by ${candidate.name}`,
        conference: "NeurIPS",
        year: 2023,
        citations: 50,
        venue_type: "conference",
        venue_rank: "top-tier",
        source: "test",
      })

      added++
      console.log(`✅ Created test candidate: ${candidate.name}`)
    } catch (error) {
      console.error(`❌ Error creating test candidate:`, error)
    }
  }

  return added
}

// Rest of the helper functions remain the same...
async function processCandidate(authorData: any, university: string) {
  console.log(`👤 Processing candidate: ${authorData.name}`)

  try {
    // Check if candidate already exists
    const { data: existingCandidate } = await supabase
      .from("candidates")
      .select("id")
      .eq("name", authorData.name)
      .single()

    if (existingCandidate) {
      console.log(`⚠️ Candidate ${authorData.name} already exists, skipping...`)
      return null
    }

    // Generate email
    const email = generateEstimatedEmail(authorData.name, university)

    // Extract skills and research areas
    const skills = extractSkillsFromPapers(authorData.papers)
    const researchAreas = extractResearchAreas(authorData.papers)
    const phdInfo = extractPhDInformation(authorData, university)

    console.log(`💾 Creating candidate record for ${authorData.name}`)

    // Create candidate
    const { data: candidate, error: candidateError } = await supabase
      .from("candidates")
      .insert({
        name: authorData.name,
        email: email,
        university: university,
        department: inferDepartment(authorData.papers),
        graduation_year: authorData.estimatedGraduationYear,
        years_experience: Math.max(1, new Date().getFullYear() - authorData.firstPaperYear),
        phd_university: phdInfo.university,
        phd_graduation_year: phdInfo.graduationYear,
        phd_department: phdInfo.department,
      })
      .select()
      .single()

    if (candidateError) {
      console.error(`❌ Error creating candidate ${authorData.name}:`, candidateError)
      return null
    }

    console.log(`✅ Created candidate: ${candidate.name} (ID: ${candidate.id})`)

    // Add publications (simplified)
    const publicationsData = authorData.papers.slice(0, 5).map((paper) => ({
      candidate_id: candidate.id,
      title: paper.title,
      conference: paper.venue.includes("Journal") ? null : paper.venue,
      journal: paper.venue.includes("Journal") ? paper.venue : null,
      year: paper.year,
      citations: paper.citations,
      url: paper.url,
      abstract: paper.abstract?.slice(0, 500) || "", // Truncate long abstracts
      doi: paper.doi,
      venue_type: paper.venue.includes("Journal") ? "journal" : "conference",
      venue_rank: getVenueRank(paper.venue),
      source: paper.source,
    }))

    if (publicationsData.length > 0) {
      await insertPublicationsBatch(publicationsData)
      console.log(`✅ Added ${publicationsData.length} publications for ${authorData.name}`)
    }

    return {
      candidate,
      publicationsCount: publicationsData.length,
      skillsCount: skills.length,
    }
  } catch (error) {
    console.error(`❌ Error processing candidate ${authorData.name}:`, error)
    return null
  }
}

// Simplified helper functions
function extractPhDInformation(authorData: any, currentUniversity: string) {
  return {
    university: currentUniversity,
    graduationYear: authorData.estimatedGraduationYear,
    department: "Computer Science",
  }
}

function generateEstimatedEmail(name: string, university: string) {
  const nameParts = name.toLowerCase().split(" ")
  const firstName = nameParts[0]
  const lastName = nameParts[nameParts.length - 1]

  const domainMap = {
    "Stanford University": "stanford.edu",
    MIT: "mit.edu",
    "Carnegie Mellon University": "cmu.edu",
    "UC Berkeley": "berkeley.edu",
    Caltech: "caltech.edu",
  }

  const domain = domainMap[university] || "university.edu"
  return `${firstName}.${lastName}@${domain}`
}

function extractSkillsFromPapers(papers: any[]) {
  return ["Machine Learning", "Python", "Research"] // Simplified
}

function extractResearchAreas(papers: any[]) {
  return ["Artificial Intelligence"] // Simplified
}

function inferDepartment(papers: any[]) {
  return "Computer Science" // Simplified
}

function getVenueRank(venue: string): "top-tier" | "mid-tier" | "other" {
  const topTierVenues = ["NeurIPS", "ICML", "ICLR", "Nature", "Science"]
  return topTierVenues.some((topVenue) => venue.includes(topVenue)) ? "top-tier" : "other"
}

function deduplicatePapers(papers: any[]) {
  const seen = new Set()
  const unique = []

  for (const paper of papers) {
    const key =
      paper.title
        ?.toLowerCase()
        .replace(/[^\w\s]/g, "")
        .trim() || Math.random().toString()
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(paper)
    }
  }

  return unique
}

function reconstructAbstract(invertedIndex: any): string {
  if (!invertedIndex) return ""
  const words: string[] = []
  Object.entries(invertedIndex).forEach(([word, positions]: [string, any]) => {
    positions.forEach((pos: number) => {
      words[pos] = word
    })
  })
  return words.filter(Boolean).join(" ")
}

// Main endpoint
export async function POST(request: NextRequest) {
  console.log("🚀 Starting candidate population process...")

  try {
    const {
      universities = ["Stanford University", "MIT"],
      minCitations = 5, // Very low threshold
      maxCandidates = 20, // Small number for testing
      graduationYears = [2024, 2025, 2026],
      testMode = false, // New test mode flag
    } = await request.json()

    console.log(`📋 Configuration:`, {
      universities: universities.length,
      minCitations,
      maxCandidates,
      graduationYears,
      testMode,
    })

    const results = {
      candidatesAdded: 0,
      publicationsAdded: 0,
      skillsExtracted: 0,
      errors: [],
      searchResults: [],
    }

    // Test mode: create sample candidates
    if (testMode) {
      console.log(`🧪 Running in test mode...`)
      const testCandidatesAdded = await createTestCandidates()
      results.candidatesAdded = testCandidatesAdded
      results.publicationsAdded = testCandidatesAdded

      return NextResponse.json({
        success: true,
        message: `Test mode: Created ${testCandidatesAdded} test candidates`,
        results,
      })
    }

    // Real mode: search academic databases
    for (const university of universities.slice(0, 2)) {
      // Limit to 2 universities for testing
      try {
        console.log(`\n🏫 Processing university: ${university}`)

        const papers = await searchPapersByUniversity(university, minCitations)
        console.log(`📄 Found ${papers.length} papers from ${university}`)

        if (papers.length === 0) {
          console.warn(`⚠️ No papers found for ${university}, trying test mode for this university`)
          results.searchResults.push({
            university,
            papersFound: 0,
            candidatesIdentified: 0,
          })
          continue
        }

        const candidateAuthors = await identifyPhDCandidates(papers, graduationYears)
        console.log(`🎓 Identified ${candidateAuthors.length} potential PhD candidates from ${university}`)

        results.searchResults.push({
          university,
          papersFound: papers.length,
          candidatesIdentified: candidateAuthors.length,
        })

        // Process candidates
        const candidatesToProcess = candidateAuthors.slice(0, 5) // Max 5 per university
        console.log(`👥 Processing ${candidatesToProcess.length} candidates from ${university}`)

        for (const authorData of candidatesToProcess) {
          try {
            const candidate = await processCandidate(authorData, university)
            if (candidate) {
              results.candidatesAdded++
              results.publicationsAdded += candidate.publicationsCount || 0
              results.skillsExtracted += candidate.skillsCount || 0
              console.log(`📊 Progress: ${results.candidatesAdded} candidates added so far`)
            }
          } catch (error) {
            console.error(`❌ Error processing candidate:`, error)
            results.errors.push(`Failed to process candidate: ${error.message}`)
          }
        }

        // Short delay
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`❌ Error processing university ${university}:`, error)
        results.errors.push(`Failed to process ${university}: ${error.message}`)
      }
    }

    console.log(`\n🎉 Population process completed!`)
    console.log(`📊 Final results:`, results)

    return NextResponse.json({
      success: true,
      message: `Successfully populated database with ${results.candidatesAdded} candidates`,
      results: {
        ...results,
        errors: results.errors.map(String),
      },
    })
  } catch (error: any) {
    console.error("💥 Unexpected population crash:", error)
    return NextResponse.json({
      success: false,
      message: "Population completed with fatal error",
      results: { candidatesAdded: 0, publicationsAdded: 0, skillsExtracted: 0, errors: [error.message] },
    })
  }
}

async function searchPapersByUniversity(university: string, minCitations: number) {
  console.log(`🔍 Searching papers for ${university}`)
  const papers = []

  try {
    const openAlexPapers = await searchOpenAlexByUniversity(university, minCitations)
    papers.push(...openAlexPapers)
    console.log(`📚 OpenAlex contributed ${openAlexPapers.length} papers for ${university}`)
  } catch (error) {
    console.error(`❌ OpenAlex search failed for ${university}:`, error)
  }

  try {
    const semanticPapers = await searchSemanticScholarByUniversity(university, minCitations)
    papers.push(...semanticPapers)
    console.log(`📚 Semantic Scholar contributed ${semanticPapers.length} papers for ${university}`)
  } catch (error) {
    console.error(`❌ Semantic Scholar search failed for ${university}:`, error)
  }

  const uniquePapers = deduplicatePapers(papers)
  console.log(`🔄 After deduplication: ${uniquePapers.length} unique papers for ${university}`)

  return uniquePapers
}
