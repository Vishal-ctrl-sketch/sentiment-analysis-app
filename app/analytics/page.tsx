import { AnalyticsOverview } from "@/components/analytics-overview"
import { SentimentCharts } from "@/components/sentiment-charts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Comprehensive sentiment analysis insights and trends across all platforms.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AnalyticsOverview />
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <SentimentCharts />
        </TabsContent>
      </Tabs>
    </div>
  )
}
