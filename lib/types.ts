export interface Comment {
  id: string
  content: string
  platform: string
  platform_post_id?: string
  author_username?: string
  author_display_name?: string
  posted_at?: string
  collected_at: string
  language_code: string
  translated_content?: string
  created_at: string
  updated_at: string
}

export interface SentimentAnalysis {
  id: string
  comment_id: string
  sentiment: "positive" | "negative" | "neutral"
  confidence_score: number
  emotions?: Record<string, number>
  keywords?: string[]
  analyzed_at: string
  model_version: string
  created_at: string
}

export interface Topic {
  id: string
  name: string
  description?: string
  created_at: string
}

export interface CommentTopic {
  id: string
  comment_id: string
  topic_id: string
  relevance_score: number
  created_at: string
}

export interface SentimentSummary {
  id: string
  date: string
  platform?: string
  topic_id?: string
  positive_count: number
  negative_count: number
  neutral_count: number
  total_comments: number
  avg_confidence: number
  created_at: string
  updated_at: string
}

export interface CommentWithSentiment extends Comment {
  sentiment_analysis?: SentimentAnalysis
  topics?: Topic[]
}
