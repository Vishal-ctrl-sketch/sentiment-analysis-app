"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface AnalyticsData {
  summary: {
    totalComments: number
    sentimentCounts: {
      positive: number
      negative: number
      neutral: number
    }
    avgConfidence: number
  }
  dailyTrends: Record<string, Record<string, number>>
  platformCounts: Record<string, Record<string, number>>
}

export function AnalyticsOverview() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    platform: "all",
    days: 7,
  })

  const platforms = ["twitter", "facebook", "instagram", "reddit", "youtube", "linkedin", "tiktok"]

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const params = {
        platform: filters.platform === "all" ? undefined : filters.platform,
        days: filters.days,
      }
      const response = await apiClient.getAnalytics(params)
      setData(response)
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [filters])

  const getSentimentPercentage = (count: number, total: number) => {
    return total > 0 ? Math.round((count / total) * 100) : 0
  }

  const getSentimentTrend = (sentiment: "positive" | "negative" | "neutral") => {
    if (!data?.dailyTrends) return null

    const dates = Object.keys(data.dailyTrends).sort()
    if (dates.length < 2) return null

    const recent = data.dailyTrends[dates[dates.length - 1]]?.[sentiment] || 0
    const previous = data.dailyTrends[dates[dates.length - 2]]?.[sentiment] || 0

    if (previous === 0) return null

    const change = ((recent - previous) / previous) * 100
    return Math.round(change)
  }

  const getTrendIcon = (trend: number | null) => {
    if (trend === null) return <Minus className="h-4 w-4" />
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">No analytics data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <Select value={filters.platform} onValueChange={(value: string) => setFilters({ ...filters, platform: value })}>
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
              <label className="text-sm font-medium">Time Period</label>
              <Select
                value={filters.days.toString()}
                onValueChange={(value: string) => setFilters({ ...filters, days: Number.parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Last 24 hours</SelectItem>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalComments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Comments analyzed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positive Sentiment</CardTitle>
            {getTrendIcon(getSentimentTrend("positive"))}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {getSentimentPercentage(data.summary.sentimentCounts.positive, data.summary.totalComments)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {data.summary.sentimentCounts.positive} comments
              {getSentimentTrend("positive") !== null && (
                <span className="ml-1">
                  ({getSentimentTrend("positive")! > 0 ? "+" : ""}
                  {getSentimentTrend("positive")}%)
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Negative Sentiment</CardTitle>
            {getTrendIcon(getSentimentTrend("negative"))}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {getSentimentPercentage(data.summary.sentimentCounts.negative, data.summary.totalComments)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {data.summary.sentimentCounts.negative} comments
              {getSentimentTrend("negative") !== null && (
                <span className="ml-1">
                  ({getSentimentTrend("negative")! > 0 ? "+" : ""}
                  {getSentimentTrend("negative")}%)
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <Badge variant="outline">{data.summary.avgConfidence >= 0.8 ? "High" : "Medium"}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(data.summary.avgConfidence * 100)}%</div>
            <p className="text-xs text-muted-foreground">Analysis confidence</p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Breakdown */}
      {Object.keys(data.platformCounts).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Platform Breakdown</CardTitle>
            <CardDescription>Sentiment distribution across platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.platformCounts).map(([platform, counts]) => (
                <div key={platform} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">{platform}</span>
                    <span className="text-sm text-muted-foreground">{counts.total} comments</span>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <div
                      className="bg-green-500"
                      style={{
                        width: `${getSentimentPercentage(counts.positive, counts.total)}%`,
                      }}
                    />
                    <div
                      className="bg-red-500"
                      style={{
                        width: `${getSentimentPercentage(counts.negative, counts.total)}%`,
                      }}
                    />
                    <div
                      className="bg-gray-400"
                      style={{
                        width: `${getSentimentPercentage(counts.neutral, counts.total)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Positive: {getSentimentPercentage(counts.positive, counts.total)}%</span>
                    <span>Negative: {getSentimentPercentage(counts.negative, counts.total)}%</span>
                    <span>Neutral: {getSentimentPercentage(counts.neutral, counts.total)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Trends */}
      {Object.keys(data.dailyTrends).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Trends</CardTitle>
            <CardDescription>Sentiment trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.dailyTrends)
                .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                .slice(-7)
                .map(([date, counts]) => (
                  <div key={date} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{new Date(date).toLocaleDateString()}</span>
                      <span className="text-sm text-muted-foreground">{counts.total} comments</span>
                    </div>
                    <div className="flex h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                      <div
                        className="bg-green-500"
                        style={{
                          width: `${getSentimentPercentage(counts.positive, counts.total)}%`,
                        }}
                      />
                      <div
                        className="bg-red-500"
                        style={{
                          width: `${getSentimentPercentage(counts.negative, counts.total)}%`,
                        }}
                      />
                      <div
                        className="bg-gray-400"
                        style={{
                          width: `${getSentimentPercentage(counts.neutral, counts.total)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
