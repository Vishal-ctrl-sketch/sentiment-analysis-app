import { AIChatbot } from "@/components/ai-chatbot"
import { AnalyticsOverview } from "@/components/analytics-overview"

export default function InsightsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI Insights</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Get AI-powered insights and ask questions about your sentiment analysis data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Chatbot - Takes up 2 columns on large screens */}
        <div className="lg:col-span-2">
          <AIChatbot />
        </div>

        {/* Quick Analytics Summary - Takes up 1 column */}
        <div className="space-y-6">
          <AnalyticsOverview />
        </div>
      </div>
    </div>
  )
}
