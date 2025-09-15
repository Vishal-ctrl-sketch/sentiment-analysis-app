import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, MessageSquare, TrendingUp, Zap, Bot, Globe } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 text-balance">
            Social Media Sentiment Analysis
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-pretty">
            Analyze social media comments with AI-powered sentiment analysis. Get real-time insights, multilingual
            support, and comprehensive analytics.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/dashboard">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 bg-transparent">
              <Link href="/analytics">View Analytics</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <MessageSquare className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Comment Collection</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Collect and process comments from multiple social media platforms</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Zap className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>AI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Advanced sentiment analysis powered by Groq AI with emotion detection</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Comprehensive analytics with charts, trends, and insights</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Bot className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>AI Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Chat with AI to get insights and understand your sentiment data</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Globe className="h-12 w-12 text-teal-600 mx-auto mb-4" />
              <CardTitle>Multilingual Support</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Analyze comments in multiple languages with automatic translation</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-pink-600 mx-auto mb-4" />
              <CardTitle>Real-time Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Get instant insights with trend analysis and performance metrics</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Links */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <Link href="/dashboard" className="group">
              <div className="text-2xl font-bold text-blue-600 mb-2 group-hover:text-blue-700 transition-colors">
                Dashboard
              </div>
              <div className="text-gray-600 dark:text-gray-300">Manage Comments</div>
            </Link>
            <Link href="/analytics" className="group">
              <div className="text-2xl font-bold text-green-600 mb-2 group-hover:text-green-700 transition-colors">
                Analytics
              </div>
              <div className="text-gray-600 dark:text-gray-300">View Insights</div>
            </Link>
            <Link href="/insights" className="group">
              <div className="text-2xl font-bold text-purple-600 mb-2 group-hover:text-purple-700 transition-colors">
                AI Chat
              </div>
              <div className="text-gray-600 dark:text-gray-300">Ask Questions</div>
            </Link>
            <Link href="/translate" className="group">
              <div className="text-2xl font-bold text-orange-600 mb-2 group-hover:text-orange-700 transition-colors">
                Translate
              </div>
              <div className="text-gray-600 dark:text-gray-300">Multilingual</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
