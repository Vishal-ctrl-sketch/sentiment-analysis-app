import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { analyzeSentiment, batchAnalyzeSentiment } from "@/lib/sentiment-analyzer"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, texts, commentId } = body

    if (!text && !texts) {
      return NextResponse.json({ error: "Text or texts array is required" }, { status: 400 })
    }

    const supabase = await createClient()

    if (texts && Array.isArray(texts)) {
      // Batch analysis
      const results = await batchAnalyzeSentiment(texts)
      return NextResponse.json({ results })
    } else {
      // Single text analysis
      const result = await analyzeSentiment(text)

      // If commentId is provided, save the analysis to database
      if (commentId) {
        const { error } = await supabase.from("sentiment_analysis").insert({
          comment_id: commentId,
          sentiment: result.sentiment,
          confidence_score: result.confidence,
          emotions: result.emotions,
          keywords: result.keywords,
          model_version: "groq-llama-3.1-70b",
        })

        if (error) {
          console.error("Failed to save sentiment analysis:", error)
          return NextResponse.json({ error: "Failed to save analysis" }, { status: 500 })
        }
      }

      return NextResponse.json({ result })
    }
  } catch (error) {
    console.error("Sentiment analysis API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
