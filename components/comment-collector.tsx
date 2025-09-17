"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, Upload } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface CommentCollectorProps {
  url: string
  setComments: React.Dispatch<React.SetStateAction<any[]>>
}

interface CommentForm {
  content: string
  platform: string
  author_username: string
  author_display_name: string
  platform_post_id: string
}

export function CommentCollector({ url, setComments }: CommentCollectorProps) {
  const [form, setForm] = useState<CommentForm>({
    content: "",
    platform: "",
    author_username: "",
    author_display_name: "",
    platform_post_id: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Fetch comments when URL changes
  useEffect(() => {
    if (!url) return
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/fetch-comments?url=${encodeURIComponent(url)}`)
        const data = await res.json()
        setComments(data.comments || [])
      } catch (err) {
        console.error(err)
        toast({
          title: "Error",
          description: "Failed to fetch comments from URL",
          variant: "destructive",
        })
        setComments([])
      }
    }
    fetchComments()
  }, [url, setComments, toast])

  // Single comment submission (existing logic)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.content || !form.platform) {
      toast({
        title: "Error",
        description: "Content and platform are required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await apiClient.createComment({
        content: form.content,
        platform: form.platform,
        platform_post_id: form.platform_post_id || undefined,
        author_username: form.author_username || undefined,
        author_display_name: form.author_display_name || undefined,
        posted_at: new Date().toISOString(),
      })

      toast({
        title: "Success",
        description: "Comment added and analyzed successfully",
      })

      setForm({
        content: "",
        platform: "",
        author_username: "",
        author_display_name: "",
        platform_post_id: "",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Single Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          placeholder="Enter comment..."
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          value={form.platform}
          onChange={(e) => setForm({ ...form, platform: e.target.value })}
          placeholder="Platform"
          className="w-full p-2 border rounded"
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : <Plus className="h-4 w-4" />}
          Submit
        </Button>
      </form>
    </div>
  )
}