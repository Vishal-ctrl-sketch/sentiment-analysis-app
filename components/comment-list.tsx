"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Loader2, MessageSquare, Search, Filter } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import type { CommentWithSentiment } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

export function CommentList() {
  const [comments, setComments] = useState<CommentWithSentiment[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    platform: "all",
    sentiment: "all",
    search: "",
  })
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    hasMore: true,
  })

  const platforms = ["twitter", "facebook", "instagram", "reddit", "youtube", "linkedin", "tiktok"]
  const sentiments = ["positive", "negative", "neutral"]

  const fetchComments = async (reset = false) => {
    setLoading(true)
    try {
      const params = {
        platform: filters.platform === "all" ? undefined : filters.platform,
        sentiment: filters.sentiment === "all" ? undefined : filters.sentiment,
        limit: pagination.limit,
        offset: reset ? 0 : pagination.offset,
      }

      const response = await apiClient.getComments(params)
      const newComments = response.comments || []

      if (reset) {
        setComments(newComments)
        setPagination((prev) => ({ ...prev, offset: newComments.length, hasMore: newComments.length === prev.limit }))
      } else {
        setComments((prev) => [...prev, ...newComments])
        setPagination((prev) => ({
          ...prev,
          offset: prev.offset + newComments.length,
          hasMore: newComments.length === prev.limit,
        }))
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments(true)
  }, [filters.platform, filters.sentiment])

  const handleLoadMore = () => {
    fetchComments(false)
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

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600 dark:text-green-400"
    if (confidence >= 0.6) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const filteredComments = comments.filter((comment) =>
    filters.search ? comment.content.toLowerCase().includes(filters.search.toLowerCase()) : true,
  )

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Sentiment</label>
              <Select value={filters.sentiment} onValueChange={(value) => setFilters({ ...filters, sentiment: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All sentiments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sentiments</SelectItem>
                  {sentiments.map((sentiment) => (
                    <SelectItem key={sentiment} value={sentiment}>
                      {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search comments..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {loading && comments.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : filteredComments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No comments found</p>
            </CardContent>
          </Card>
        ) : (
          filteredComments.map((comment) => (
            <Card key={comment.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{comment.platform}</Badge>
                    {comment.sentiment_analysis && (
                      <>
                        <Badge className={getSentimentColor(comment.sentiment_analysis.sentiment)}>
                          {comment.sentiment_analysis.sentiment}
                        </Badge>
                        <span
                          className={`text-sm font-medium ${getConfidenceColor(comment.sentiment_analysis.confidence_score)}`}
                        >
                          {Math.round(comment.sentiment_analysis.confidence_score * 100)}%
                        </span>
                      </>
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
              <CardContent>
                <p className="text-sm leading-relaxed mb-3">{comment.content}</p>
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

        {pagination.hasMore && !loading && (
          <div className="flex justify-center">
            <Button onClick={handleLoadMore} variant="outline">
              Load More
            </Button>
          </div>
        )}

        {loading && comments.length > 0 && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
      </div>
    </div>
  )
}
