"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Languages, Globe, ArrowRight } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { getLanguageName, getSupportedLanguages } from "@/lib/translator"
import type { CommentWithSentiment } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"

export function MultilingualComments() {
  const [comments, setComments] = useState<CommentWithSentiment[]>([])
  const [loading, setLoading] = useState(true)
  const [translating, setTranslating] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    language: "all",
    platform: "all",
  })

  const { toast } = useToast()
  const supportedLanguages = getSupportedLanguages()
  const platforms = ["twitter", "facebook", "instagram", "reddit", "youtube", "linkedin", "tiktok"]

  const fetchComments = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getComments({
        platform: filters.platform === "all" ? undefined : filters.platform,
        limit: 50,
      })
      setComments(response.comments || [])
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [filters.platform])

  const handleTranslate = async (commentId: string, text: string, targetLanguage = "en") => {
    setTranslating(commentId)
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          targetLanguage,
          commentId,
        }),
      })

      if (!response.ok) {
        throw new Error("Translation failed")
      }

      const data = await response.json()

      // Update the comment in the local state
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                translated_content: data.result.translatedText,
                language_code: data.result.detectedLanguage,
              }
            : comment,
        ),
      )

      toast({
        title: "Translation Complete",
        description: `Comment translated to ${getLanguageName(targetLanguage)}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Translation failed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setTranslating(null)
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "negative":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const filteredComments = comments.filter((comment) => {
    if (filters.language === "all") return true
    return comment.language_code === filters.language
  })

  // Get unique languages from comments
  const availableLanguages = Array.from(new Set(comments.map((c) => c.language_code).filter(Boolean)))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Multilingual Comments
          </CardTitle>
          <CardDescription>View and translate comments from different languages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <Select value={filters.language} onValueChange={(value) => setFilters({ ...filters, language: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All languages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All languages</SelectItem>
                  {availableLanguages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {getLanguageName(lang)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <Select value={filters.platform} onValueChange={(value) => setFilters({ ...filters, platform: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All platforms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All platforms</SelectItem>
                  {platforms.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Languages className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No comments found</p>
            </CardContent>
          </Card>
        ) : (
          filteredComments.map((comment) => (
            <Card key={comment.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">{comment.platform}</Badge>
                    {comment.language_code && (
                      <Badge variant="secondary">
                        <Languages className="h-3 w-3 mr-1" />
                        {getLanguageName(comment.language_code)}
                      </Badge>
                    )}
                    {comment.sentiment_analysis && (
                      <Badge className={getSentimentColor(comment.sentiment_analysis.sentiment)}>
                        {comment.sentiment_analysis.sentiment}
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                {(comment.author_display_name || comment.author_username) && (
                  <CardDescription>
                    {comment.author_display_name || comment.author_username}
                    {comment.author_username && comment.author_display_name && ` (@${comment.author_username})`}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Original Content */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Original</span>
                    {comment.language_code !== "en" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTranslate(comment.id, comment.content)}
                        disabled={translating === comment.id}
                        className="bg-transparent"
                      >
                        {translating === comment.id ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <ArrowRight className="h-3 w-3 mr-1" />
                        )}
                        Translate to English
                      </Button>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {comment.content}
                  </p>
                </div>

                {/* Translated Content */}
                {comment.translated_content && comment.translated_content !== comment.content && (
                  <div>
                    <span className="text-sm font-medium">Translation</span>
                    <p className="text-sm leading-relaxed p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mt-2">
                      {comment.translated_content}
                    </p>
                  </div>
                )}

                {/* Keywords */}
                {comment.sentiment_analysis?.keywords && comment.sentiment_analysis.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {comment.sentiment_analysis.keywords.slice(0, 5).map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
