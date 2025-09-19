"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import type { PieLabelRenderProps } from "recharts"
import { apiClient } from "@/lib/api-client"

interface ChartData {
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

const SENTIMENT_COLORS = {
  positive: "#22c55e",
  negative: "#ef4444",
  neutral: "#6b7280",
}

// ✅ Type-safe label renderer
const renderPieLabel = ({ name, percent }: PieLabelRenderProps): React.ReactNode => {
  if (percent == null) return name ?? ""
  return `${name ?? ""} ${(percent * 100).toFixed(0)}%`
}

export function SentimentCharts() {
  const [data, setData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    platform: "all",
    days: 30,
  })

  const platforms = ["twitter", "facebook", "instagram", "reddit", "youtube", "linkedin", "tiktok"]

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = {
        platform: filters.platform === "all" ? undefined : filters.platform,
        days: filters.days,
      }
      const response = await apiClient.getAnalytics(params)
      setData(response)
    } catch (error) {
      console.error("Failed to fetch chart data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filters])

  if (loading || !data) {
    return <div className="flex items-center justify-center py-8">Loading charts...</div>
  }

  // Prepare pie chart data
  const pieData = [
    { name: "Positive", value: data.summary.sentimentCounts.positive, color: SENTIMENT_COLORS.positive },
    { name: "Negative", value: data.summary.sentimentCounts.negative, color: SENTIMENT_COLORS.negative },
    { name: "Neutral", value: data.summary.sentimentCounts.neutral, color: SENTIMENT_COLORS.neutral },
  ].filter((item) => item.value > 0)

  // Prepare platform bar chart data
  const platformData = Object.entries(data.platformCounts).map(([platform, counts]) => ({
    platform: platform.charAt(0).toUpperCase() + platform.slice(1),
    positive: counts.positive,
    negative: counts.negative,
    neutral: counts.neutral,
    total: counts.total,
  }))

  // Prepare daily trends line chart data
  const trendData = Object.entries(data.dailyTrends)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, counts]) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      positive: counts.positive,
      negative: counts.negative,
      neutral: counts.neutral,
      total: counts.total,
    }))

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Chart Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="text-sm font-medium">Time Period</label>
              <Select
                value={filters.days.toString()}
                onValueChange={(value) => setFilters({ ...filters, days: Number.parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Distribution</CardTitle>
            <CardDescription>Overall sentiment breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderPieLabel as any} // ✅ minimal cast here
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform Comparison Bar Chart */}
        {platformData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Platform Comparison</CardTitle>
              <CardDescription>Sentiment by platform</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={platformData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="platform" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="positive" stackId="a" fill={SENTIMENT_COLORS.positive} />
                  <Bar dataKey="negative" stackId="a" fill={SENTIMENT_COLORS.negative} />
                  <Bar dataKey="neutral" stackId="a" fill={SENTIMENT_COLORS.neutral} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Daily Trends Line Chart */}
      {trendData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Trends Over Time</CardTitle>
            <CardDescription>Daily sentiment analysis trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="positive"
                  stroke={SENTIMENT_COLORS.positive}
                  strokeWidth={2}
                  dot={{ fill: SENTIMENT_COLORS.positive }}
                />
                <Line
                  type="monotone"
                  dataKey="negative"
                  stroke={SENTIMENT_COLORS.negative}
                  strokeWidth={2}
                  dot={{ fill: SENTIMENT_COLORS.negative }}
                />
                <Line
                  type="monotone"
                  dataKey="neutral"
                  stroke={SENTIMENT_COLORS.neutral}
                  strokeWidth={2}
                  dot={{ fill: SENTIMENT_COLORS.neutral }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
