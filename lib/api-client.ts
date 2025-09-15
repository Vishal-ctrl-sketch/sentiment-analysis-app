export class ApiClient {
  private baseUrl = "/api"

  async analyzeSentiment(text: string, commentId?: string) {
    const response = await fetch(`${this.baseUrl}/analyze-sentiment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, commentId }),
    })

    if (!response.ok) {
      throw new Error(`Sentiment analysis failed: ${response.statusText}`)
    }

    return response.json()
  }

  async batchAnalyzeSentiment(texts: string[]) {
    const response = await fetch(`${this.baseUrl}/analyze-sentiment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts }),
    })

    if (!response.ok) {
      throw new Error(`Batch sentiment analysis failed: ${response.statusText}`)
    }

    return response.json()
  }

  async getComments(params?: {
    platform?: string
    sentiment?: string
    limit?: number
    offset?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.platform) searchParams.set("platform", params.platform)
    if (params?.sentiment) searchParams.set("sentiment", params.sentiment)
    if (params?.limit) searchParams.set("limit", params.limit.toString())
    if (params?.offset) searchParams.set("offset", params.offset.toString())

    const response = await fetch(`${this.baseUrl}/comments?${searchParams}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.statusText}`)
    }

    return response.json()
  }

  async createComment(comment: {
    content: string
    platform: string
    platform_post_id?: string
    author_username?: string
    author_display_name?: string
    posted_at?: string
    language_code?: string
  }) {
    const response = await fetch(`${this.baseUrl}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(comment),
    })

    if (!response.ok) {
      throw new Error(`Failed to create comment: ${response.statusText}`)
    }

    return response.json()
  }

  async getAnalytics(params?: { platform?: string; days?: number }) {
    const searchParams = new URLSearchParams()
    if (params?.platform) searchParams.set("platform", params.platform)
    if (params?.days) searchParams.set("days", params.days.toString())

    const response = await fetch(`${this.baseUrl}/analytics?${searchParams}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch analytics: ${response.statusText}`)
    }

    return response.json()
  }
}

export const apiClient = new ApiClient()
