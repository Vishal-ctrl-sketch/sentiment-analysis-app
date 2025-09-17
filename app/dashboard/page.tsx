"use client"

import { useState } from "react"
import { CommentCollector } from "@/components/comment-collector"
import { CommentList } from "@/components/comment-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatabaseSetupNotice } from "@/components/database-setup-notice"

export default function DashboardPage() {
  const [url, setUrl] = useState<string>("")
  const [comments, setComments] = useState<any[]>([]) // store fetched comments

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Comment Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Collect, analyze, and manage social media comments with AI-powered sentiment analysis.
        </p>
      </div>

      <DatabaseSetupNotice />

      <Tabs defaultValue="collect" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="collect">Collect Comments</TabsTrigger>
          <TabsTrigger value="manage">Manage Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="collect" className="space-y-6">
          {/* URL input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter URL to fetch comments"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-md"
            />
          </div>

          {/* Pass URL and setter for comments */}
          <CommentCollector url={url} setComments={setComments} />
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <CommentList comments={comments} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
