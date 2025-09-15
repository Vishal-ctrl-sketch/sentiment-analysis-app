import { CommentCollector } from "@/components/comment-collector"
import { CommentList } from "@/components/comment-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Comment Management</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Collect, analyze, and manage social media comments with AI-powered sentiment analysis.
        </p>
      </div>

      <Tabs defaultValue="collect" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="collect">Collect Comments</TabsTrigger>
          <TabsTrigger value="manage">Manage Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="collect" className="space-y-6">
          <CommentCollector />
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <CommentList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
