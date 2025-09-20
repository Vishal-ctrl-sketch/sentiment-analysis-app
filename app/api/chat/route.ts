import { type NextRequest, NextResponse } from "next/server"
import { generateText, type LanguageModelV1 } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createClient } from "@/lib/supabase/server"
import { env } from "@/lib/env"

// ✅ Validate Google API key at startup
if (!env.googleApiKey) {
  throw new Error("❌ Missing GOOGLE_GENERATIVE_AI_API_KEY in environment")
}

// ✅ Create Google provider with API key
const google = createGoogleGenerativeAI({ apiKey: env.googleApiKey })

async function runGenerateText(prompt: string) {
  return generateText({
    model: google("gemini-1.5-flash") as unknown as LanguageModelV1,
    prompt,
  })
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const supabase = await createClient()

    // --- Fetch recent sentiment analysis data ---
    const { data: recentComments, error: supabaseError } = await supabase
      .from("sentiment_analysis")
      .select(`
        sentiment,
        confidence_score,
        keywords,
        analyzed_at,
        comments!inner (
          content,
          platform,
          posted_at
        )
      `)
      .gte("analyzed_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order("analyzed_at", { ascending: false })
      .limit(100)

    if (supabaseError) {
      console.error("❌ Supabase error:", supabaseError.message)
      return NextResponse.json({ error: "Database query failed" }, { status: 500 })
    }

    // --- Analytics calculations ---
    const totalComments = recentComments?.length || 0
    const sentimentCounts =
      recentComments?.reduce((acc, item) => {
        acc[item.sentiment] = (acc[item.sentiment] || 0) + 1
        return acc
      }, { positive: 0, negative: 0, neutral: 0 } as Record<string, number>) ?? {
        positive: 0,
        negative: 0,
        neutral: 0,
      }

    const avgConfidence =
      totalComments > 0
        ? recentComments!.reduce((sum, item) => sum + item.confidence_score, 0) /
          totalComments
        : 0

    const platformCounts =
      recentComments?.reduce((acc, item) => {
        const platform = item.comments?.[0]?.platform
        if (platform) acc[platform] = (acc[platform] || 0) + 1
        return acc
      }, {} as Record<string, number>) ?? {}

    const allKeywords = recentComments?.flatMap((item) => item.keywords || []) || []
    const keywordCounts = allKeywords.reduce((acc, keyword) => {
      acc[keyword] = (acc[keyword] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topKeywords = Object.entries(keywordCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([keyword]) => keyword)

    // --- Analytics context for AI ---
    const analyticsContext = `
Current Sentiment Analysis Data (Last 7 days):
- Total Comments: ${totalComments}
- Positive: ${sentimentCounts.positive}
- Negative: ${sentimentCounts.negative}
- Neutral: ${sentimentCounts.neutral}
- Average Confidence: ${Math.round(avgConfidence * 100)}%
- Top Platforms: ${Object.entries(platformCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([platform, count]) => `${platform} (${count})`)
        .join(", ")}
- Top Keywords: ${topKeywords.slice(0, 5).join(", ")}

Recent Sample Comments:
${
  recentComments?.slice(0, 5).map((item) => {
    const c = item.comments?.[0]
    return c ? `- [${item.sentiment.toUpperCase()}] ${c.content.slice(0, 100)}...` : ""
  }).join("\n") || "No recent comments"
}
`

    // --- User prompt ---
    const userMessage = messages?.at(-1)?.content ?? "Hello, give me insights."
    const prompt = `
You are an AI assistant specialized in social media sentiment analysis.
You help users understand their sentiment analysis data, provide insights,
and answer questions about social media comments and trends.

You have access to the following current data:
${analyticsContext}

User question: ${userMessage}
`

    const result = await runGenerateText(prompt)

    return NextResponse.json({
      messages: [
        {
          id: Date.now().toString(),
          role: "assistant",
          content: result.text,
        },
      ],
    })
  } catch (error) {
    console.error("❌ Chat route failed:", error)
    return NextResponse.json(
      {
        messages: [
          {
            role: "assistant",
            content:
              "⚠️ Sorry, I couldn’t process your request. Please check your configuration.",
          },
        ],
      },
      { status: 500 }
    )
  }
}
