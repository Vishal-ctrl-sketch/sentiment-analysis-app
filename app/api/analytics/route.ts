// Force this route to be dynamic since we use request.url
export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get("platform")
    const days = Number.parseInt(searchParams.get("days") || "7")

    const supabase = await createClient()

    // Get sentiment distribution
    let sentimentQuery = supabase
      .from("sentiment_analysis")
      .select(`
        sentiment,
        confidence_score,
        analyzed_at,
        comments!inner (
          platform,
          posted_at
        )
      `)
      .gte("analyzed_at", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())

    if (platform) {
      sentimentQuery = sentimentQuery.eq("comments.platform", platform)
    }

    const { data: sentimentData, error: sentimentError } = await sentimentQuery

    if (sentimentError) {
      return NextResponse.json({ error: sentimentError.message }, { status: 500 })
    }

    // Calculate analytics
    const totalComments = sentimentData.length
    const sentimentCounts = sentimentData.reduce(
      (acc, item) => {
        acc[item.sentiment] = (acc[item.sentiment] || 0) + 1
        return acc
      },
      { positive: 0, negative: 0, neutral: 0 } as Record<string, number>,
    )

    const avgConfidence =
      sentimentData.reduce((sum, item) => sum + item.confidence_score, 0) / totalComments || 0

    // Get daily trends
    const dailyTrends = sentimentData.reduce((acc, item) => {
      const date = new Date(item.analyzed_at).toISOString().split("T")[0]
      if (!acc[date]) {
        acc[date] = { positive: 0, negative: 0, neutral: 0, total: 0 }
      }
      acc[date][item.sentiment]++
      acc[date].total++
      return acc
    }, {} as Record<string, Record<string, number>>)

    // Get platform distribution
    const platformCounts = sentimentData.reduce((acc, item) => {
      item.comments.forEach((comment: { platform: string }) => {
        const platform = comment.platform
        if (!acc[platform]) {
          acc[platform] = { positive: 0, negative: 0, neutral: 0, total: 0 }
        }
        acc[platform][item.sentiment]++
        acc[platform].total++
      })
      return acc
    }, {} as Record<string, Record<string, number>>)

    return NextResponse.json({
      summary: {
        totalComments,
        sentimentCounts,
        avgConfidence: Math.round(avgConfidence * 100) / 100,
      },
      dailyTrends,
      platformCounts,
    })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
