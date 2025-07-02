import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Get database statistics
    const [candidatesResult, publicationsResult, skillsResult] = await Promise.all([
      supabase.from("candidates").select("id", { count: "exact" }),
      supabase.from("publications").select("id", { count: "exact" }),
      supabase.from("candidate_skills").select("candidate_id", { count: "exact" }),
    ])

    // Get recent additions
    const { data: recentCandidates } = await supabase
      .from("candidates")
      .select("name, university, created_at")
      .order("created_at", { ascending: false })
      .limit(10)

    // Get top universities
    const { data: universityStats } = await supabase
      .from("candidates")
      .select("university")
      .then((result) => {
        if (result.data) {
          const counts = result.data.reduce((acc, candidate) => {
            acc[candidate.university] = (acc[candidate.university] || 0) + 1
            return acc
          }, {})
          return { data: Object.entries(counts).map(([university, count]) => ({ university, count })) }
        }
        return { data: [] }
      })

    return NextResponse.json({
      statistics: {
        totalCandidates: candidatesResult.count || 0,
        totalPublications: publicationsResult.count || 0,
        totalSkillAssignments: skillsResult.count || 0,
      },
      recentCandidates: recentCandidates || [],
      universityDistribution: universityStats || [],
    })
  } catch (error) {
    console.error("Error getting population status:", error)
    return NextResponse.json({ error: "Failed to get status" }, { status: 500 })
  }
}
