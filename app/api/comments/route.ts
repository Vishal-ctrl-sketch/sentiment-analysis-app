import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { analyzeSentiment } from "@/lib/sentiment-analyzer"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get("platform")
    const sentiment = searchParams.get("sentiment")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const supabase = await createClient()

    let query = supabase
      .from("comments")
      .select(`
        *,
        sentiment_analysis (
          sentiment,
          confidence_score,
          emotions,
          keywords,
          analyzed_at
        )
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (platform) {
      query = query.eq("platform", platform)
    }

    if (sentiment) {
      query = query.eq("sentiment_analysis.sentiment", sentiment)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ comments: data })
  } catch (error) {
    console.error("Comments API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      content,
      platform,
      platform_post_id,
      author_username,
      author_display_name,
      posted_at,
      language_code = "en",
    } = body

    if (!content || !platform) {
      return NextResponse.json({ error: "Content and platform are required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Insert comment
    const { data: comment, error: commentError } = await supabase
      .from("comments")
      .insert({
        content,
        platform,
        platform_post_id,
        author_username,
        author_display_name,
        posted_at,
        language_code,
      })
      .select()
      .single()

    if (commentError) {
      return NextResponse.json({ error: commentError.message }, { status: 500 })
    }

    // Analyze sentiment
    try {
      const sentimentResult = await analyzeSentiment(content)

      // Save sentiment analysis
      const { error: sentimentError } = await supabase.from("sentiment_analysis").insert({
        comment_id: comment.id,
        sentiment: sentimentResult.sentiment,
        confidence_score: sentimentResult.confidence,
        emotions: sentimentResult.emotions,
        keywords: sentimentResult.keywords,
        model_version: "groq-llama-3.1-70b",
      })

      if (sentimentError) {
        console.error("Failed to save sentiment analysis:", sentimentError)
      }
    } catch (sentimentError) {
      console.error("Sentiment analysis failed:", sentimentError)
    }

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error("Comments POST API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
