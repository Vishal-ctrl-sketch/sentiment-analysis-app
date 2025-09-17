"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface CommentListProps {
  comments: any[]
}

export function CommentList({ comments }: CommentListProps) {
  if (!comments.length) return <p>No comments available.</p>

  return (
    <div className="space-y-4">
      {comments.map((comment, idx) => (
        <Card key={idx}>
          <CardHeader>
            <CardTitle>{comment.platform || "Unknown Platform"}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{comment.content}</p>
            {comment.sentiment_analysis?.sentiment && (
              <Badge>{comment.sentiment_analysis.sentiment}</Badge>
            )}
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(comment.created_at || new Date()), { addSuffix: true })}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}