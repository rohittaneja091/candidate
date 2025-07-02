import { type NextRequest, NextResponse } from "next/server"
import { getCandidates, createCandidate } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const candidates = await getCandidates()
    return NextResponse.json(candidates)
  } catch (error) {
    console.error("Error fetching candidates:", error)
    return NextResponse.json({ error: "Failed to fetch candidates" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const candidateData = await request.json()
    const candidate = await createCandidate(candidateData)
    return NextResponse.json(candidate, { status: 201 })
  } catch (error) {
    console.error("Error creating candidate:", error)
    return NextResponse.json({ error: "Failed to create candidate" }, { status: 500 })
  }
}
