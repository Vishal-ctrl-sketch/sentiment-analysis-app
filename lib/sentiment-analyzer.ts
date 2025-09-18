import { generateObject, type LanguageModelV1 } from "ai"
import { z } from "zod"

// define your schema
const sentimentSchema = z.object({
  sentiment: z.enum(["positive", "negative", "neutral"]),
  confidence: z.number().min(0).max(1),
  emotions: z.object({
    joy: z.number().min(0).max(1),
    anger: z.number().min(0).max(1),
    fear: z.number().min(0).max(1),
    sadness: z.number().min(0).max(1),
    surprise: z.number().min(0).max(1),
    disgust: z.number().min(0).max(1),
  }),
  keywords: z.array(z.string()),
  reasoning: z.string(),
})

export type SentimentResult = z.infer<typeof sentimentSchema>

async function runGenerateSentiment(text: string) {
  // Cast the model string to LanguageModelV1
  const model = "llama-3.1-70b-versatile" as unknown as LanguageModelV1

  const { object } = await generateObject({
    model,
    schema: sentimentSchema,
    prompt: `Analyze the sentiment of this social media comment: "${text}"
    
Please provide:
1. Overall sentiment (positive, negative, or neutral)
2. Confidence score (0-1)
3. Emotion scores for joy, anger, fear, sadness, surprise, disgust (0-1 each)
4. Key words/phrases that influenced the sentiment
5. Brief reasoning for your analysis

Be objective and consider context, sarcasm, and nuanced language.`,
  })

  return object
}

export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  try {
    return await runGenerateSentiment(text)
  } catch (error) {
    console.error("Sentiment analysis failed:", error)
    return {
      sentiment: "neutral",
      confidence: 0.5,
      emotions: {
        joy: 0,
        anger: 0,
        fear: 0,
        sadness: 0,
        surprise: 0,
        disgust: 0,
      },
      keywords: [],
      reasoning: "Analysis failed, defaulted to neutral",
    }
  }
}

export async function batchAnalyzeSentiment(texts: string[]): Promise<SentimentResult[]> {
  const results = await Promise.allSettled(texts.map((text) => analyzeSentiment(text)))

  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value
    } else {
      console.error(`Batch analysis failed for text ${index}:`, result.reason)
      return {
        sentiment: "neutral" as const,
        confidence: 0.5,
        emotions: {
          joy: 0,
          anger: 0,
          fear: 0,
          sadness: 0,
          surprise: 0,
          disgust: 0,
        },
        keywords: [],
        reasoning: "Batch analysis failed, defaulted to neutral",
      }
    }
  })
}
