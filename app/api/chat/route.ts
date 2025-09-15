import { streamText } from "ai"
import { groq } from "@ai-sdk/groq"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const { messages } = await req.json()

  // Get recent analytics data to provide context
  const supabase = await createClient()

  // Fetch recent sentiment data
  const { data: recentComments } = await supabase
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

  // Calculate summary statistics
  const totalComments = recentComments?.length || 0
  const sentimentCounts = recentComments?.reduce(
    (acc, item) => {
      acc[item.sentiment] = (acc[item.sentiment] || 0) + 1
      return acc
    },
    { positive: 0, negative: 0, neutral: 0 } as Record<string, number>,
  ) || { positive: 0, negative: 0, neutral: 0 }

  const avgConfidence =
    totalComments > 0 ? recentComments!.reduce((sum, item) => sum + item.confidence_score, 0) / totalComments : 0

  // Get platform distribution
  const platformCounts =
    recentComments?.reduce(
      (acc, item) => {
        const platform = item.comments.platform
        acc[platform] = (acc[platform] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  // Extract top keywords
  const allKeywords = recentComments?.flatMap((item) => item.keywords || []) || []
  const keywordCounts = allKeywords.reduce(
    (acc, keyword) => {
      acc[keyword] = (acc[keyword] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const topKeywords = Object.entries(keywordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([keyword]) => keyword)

  // Create context for the AI
  const analyticsContext = `
Current Sentiment Analysis Data (Last 7 days):
- Total Comments: ${totalComments}
- Positive: ${sentimentCounts.positive} (${totalComments > 0 ? Math.round((sentimentCounts.positive / totalComments) * 100) : 0}%)
- Negative: ${sentimentCounts.negative} (${totalComments > 0 ? Math.round((sentimentCounts.negative / totalComments) * 100) : 0}%)
- Neutral: ${sentimentCounts.neutral} (${totalComments > 0 ? Math.round((sentimentCounts.neutral / totalComments) * 100) : 0}%)
- Average Confidence: ${Math.round(avgConfidence * 100)}%
- Top Platforms: ${Object.entries(platformCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([platform, count]) => `${platform} (${count})`)
    .join(", ")}
- Top Keywords: ${topKeywords.slice(0, 5).join(", ")}

Recent Sample Comments:
${
  recentComments
    ?.slice(0, 5)
    .map((item) => `- [${item.sentiment.toUpperCase()}] ${item.comments.content.slice(0, 100)}...`)
    .join("\n") || "No recent comments"
}
`

  const result = await streamText({
    model: groq("llama-3.1-70b-versatile"),
    messages,
    system: `You are an AI assistant specialized in social media sentiment analysis. You help users understand their sentiment analysis data, provide insights, and answer questions about social media comments and trends.

You have access to the following current data:
${analyticsContext}

Guidelines:
- Provide helpful insights about sentiment trends and patterns
- Explain sentiment analysis concepts when asked
- Suggest actionable recommendations based on the data
- Be conversational but professional
- If asked about specific data not in the context, acknowledge the limitation
- Help users understand what the sentiment scores and confidence levels mean
- Provide context about why certain sentiments might be occurring
- Suggest ways to improve sentiment or address negative feedback

Always base your responses on the actual data provided and be specific with numbers and percentages when relevant.`,
  })

  return result.toDataStreamResponse()
}
