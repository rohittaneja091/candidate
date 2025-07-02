import { type NextRequest, NextResponse } from "next/server"

// Real API integration for academic databases
export async function POST(request: NextRequest) {
  const { authorName, university, email } = await request.json()

  try {
    // Search across multiple academic databases
    const [openAlexResults, semanticScholarResults, crossRefResults] = await Promise.allSettled([
      searchOpenAlex(authorName),
      searchSemanticScholar(authorName),
      searchCrossRef(authorName),
    ])

    // Combine and deduplicate results
    const allPublications = []

    if (openAlexResults.status === "fulfilled") {
      allPublications.push(...openAlexResults.value)
    }

    if (semanticScholarResults.status === "fulfilled") {
      allPublications.push(...semanticScholarResults.value)
    }

    if (crossRefResults.status === "fulfilled") {
      allPublications.push(...crossRefResults.value)
    }

    // Deduplicate by DOI or title similarity
    const uniquePublications = deduplicatePublications(allPublications)

    // Extract skills from publications
    const extractedSkills = extractSkillsFromPublications(uniquePublications)

    return NextResponse.json({
      publications: uniquePublications,
      extractedSkills,
      totalFound: uniquePublications.length,
    })
  } catch (error) {
    console.error("Error scraping publications:", error)
    return NextResponse.json({ error: "Failed to scrape publications" }, { status: 500 })
  }
}

async function searchOpenAlex(authorName: string) {
  const encodedName = encodeURIComponent(authorName)
  const response = await fetch(
    `https://api.openalex.org/works?filter=author.display_name:${encodedName}&per-page=50&sort=cited_by_count:desc`,
    {
      headers: {
        "User-Agent": "PhD-Recruiting-DB (mailto:your-email@domain.com)", // Replace with your email
      },
    },
  )

  if (!response.ok) {
    throw new Error(`OpenAlex API error: ${response.status}`)
  }

  const data = await response.json()

  return data.results.map((work: any) => ({
    title: work.title,
    authors: work.authorships?.map((a: any) => a.author?.display_name).filter(Boolean) || [],
    year: work.publication_year,
    citations: work.cited_by_count || 0,
    venue: work.primary_location?.source?.display_name || "Unknown",
    doi: work.doi,
    url: work.doi ? `https://doi.org/${work.doi.replace("https://doi.org/", "")}` : work.landing_page_url,
    abstract: work.abstract_inverted_index ? reconstructAbstract(work.abstract_inverted_index) : "",
    source: "OpenAlex",
    concepts: work.concepts?.map((c: any) => c.display_name) || [],
  }))
}

async function searchSemanticScholar(authorName: string) {
  // First, search for the author
  const authorResponse = await fetch(
    `https://api.semanticscholar.org/graph/v1/author/search?query=${encodeURIComponent(authorName)}&limit=1`,
    {
      headers: {
        "x-api-key": process.env.SEMANTIC_SCHOLAR_API_KEY || "", // Optional but recommended
      },
    },
  )

  if (!authorResponse.ok) {
    throw new Error(`Semantic Scholar author search error: ${authorResponse.status}`)
  }

  const authorData = await authorResponse.json()

  if (!authorData.data || authorData.data.length === 0) {
    return []
  }

  const authorId = authorData.data[0].authorId

  // Get author's papers
  const papersResponse = await fetch(
    `https://api.semanticscholar.org/graph/v1/author/${authorId}/papers?fields=title,year,citationCount,venue,externalIds,abstract,authors&limit=50`,
    {
      headers: {
        "x-api-key": process.env.SEMANTIC_SCHOLAR_API_KEY || "",
      },
    },
  )

  if (!papersResponse.ok) {
    throw new Error(`Semantic Scholar papers error: ${papersResponse.status}`)
  }

  const papersData = await papersResponse.json()

  return papersData.data.map((paper: any) => ({
    title: paper.title,
    authors: paper.authors?.map((a: any) => a.name) || [],
    year: paper.year,
    citations: paper.citationCount || 0,
    venue: paper.venue || "Unknown",
    doi: paper.externalIds?.DOI,
    url: paper.externalIds?.DOI
      ? `https://doi.org/${paper.externalIds.DOI}`
      : `https://semanticscholar.org/paper/${paper.paperId}`,
    abstract: paper.abstract || "",
    source: "Semantic Scholar",
  }))
}

async function searchCrossRef(authorName: string) {
  const response = await fetch(
    `https://api.crossref.org/works?query.author=${encodeURIComponent(authorName)}&rows=50&sort=score&order=desc`,
    {
      headers: {
        "User-Agent": "PhD-Recruiting-DB (mailto:your-email@domain.com)", // Replace with your email
      },
    },
  )

  if (!response.ok) {
    throw new Error(`CrossRef API error: ${response.status}`)
  }

  const data = await response.json()

  return data.message.items.map((item: any) => ({
    title: item.title?.[0] || "Unknown Title",
    authors: item.author?.map((a: any) => `${a.given || ""} ${a.family || ""}`.trim()) || [],
    year: item.published?.["date-parts"]?.[0]?.[0] || item.created?.["date-parts"]?.[0]?.[0],
    citations: item["is-referenced-by-count"] || 0,
    venue: item["container-title"]?.[0] || "Unknown",
    doi: item.DOI,
    url: item.URL || (item.DOI ? `https://doi.org/${item.DOI}` : ""),
    abstract: item.abstract || "",
    source: "CrossRef",
  }))
}

function deduplicatePublications(publications: any[]) {
  const seen = new Set()
  const unique = []

  for (const pub of publications) {
    // Create a key for deduplication (DOI preferred, then title similarity)
    const key =
      pub.doi ||
      pub.title
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .trim()

    if (!seen.has(key)) {
      seen.add(key)
      unique.push(pub)
    }
  }

  return unique
}

function extractSkillsFromPublications(publications: any[]) {
  const skillKeywords = {
    "Machine Learning": ["machine learning", "ml", "neural network", "deep learning"],
    "Deep Learning": ["deep learning", "neural network", "cnn", "rnn", "transformer"],
    "Computer Vision": ["computer vision", "image processing", "object detection", "segmentation"],
    "Natural Language Processing": ["nlp", "natural language", "text processing", "language model"],
    "Reinforcement Learning": ["reinforcement learning", "rl", "policy gradient", "q-learning"],
    "Distributed Systems": ["distributed", "cluster", "parallel computing", "scalability"],
    "Quantum Computing": ["quantum", "qubit", "quantum algorithm", "quantum machine learning"],
    Robotics: ["robot", "robotics", "autonomous", "control system"],
    Cybersecurity: ["security", "cryptography", "encryption", "privacy"],
    PyTorch: ["pytorch", "torch"],
    TensorFlow: ["tensorflow", "tf"],
    Python: ["python"],
    CUDA: ["cuda", "gpu computing"],
  }

  const extractedSkills = new Set()

  publications.forEach((pub) => {
    const text = `${pub.title} ${pub.abstract} ${pub.venue}`.toLowerCase()

    Object.entries(skillKeywords).forEach(([skill, keywords]) => {
      if (keywords.some((keyword) => text.includes(keyword))) {
        extractedSkills.add(skill)
      }
    })
  })

  return Array.from(extractedSkills)
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
