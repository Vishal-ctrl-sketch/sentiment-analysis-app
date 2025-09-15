"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Upload } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface CommentForm {
  content: string
  platform: string
  author_username: string
  author_display_name: string
  platform_post_id: string
}

export function CommentCollector() {
  const [form, setForm] = useState<CommentForm>({
    content: "",
    platform: "",
    author_username: "",
    author_display_name: "",
    platform_post_id: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bulkComments, setBulkComments] = useState("")
  const [selectedPlatform, setSelectedPlatform] = useState("")
  const { toast } = useToast()

  const platforms = [
    { value: "twitter", label: "Twitter/X" },
    { value: "facebook", label: "Facebook" },
    { value: "instagram", label: "Instagram" },
    { value: "reddit", label: "Reddit" },
    { value: "youtube", label: "YouTube" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "tiktok", label: "TikTok" },
  ]

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

      // Reset form
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

  const handleBulkUpload = async () => {
    if (!bulkComments.trim() || !selectedPlatform) {
      toast({
        title: "Error",
        description: "Please enter comments and select a platform",
        variant: "destructive",
      })
      return
    }

    const comments = bulkComments
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    if (comments.length === 0) {
      toast({
        title: "Error",
        description: "No valid comments found",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const promises = comments.map((content, index) =>
        apiClient.createComment({
          content,
          platform: selectedPlatform,
          author_username: `user_${index + 1}`,
          posted_at: new Date().toISOString(),
        }),
      )

      await Promise.all(promises)

      toast({
        title: "Success",
        description: `${comments.length} comments uploaded and analyzed successfully`,
      })

      setBulkComments("")
      setSelectedPlatform("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload comments",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const sampleComments = [
    "This product is amazing! Love the new features.",
    "Terrible customer service, very disappointed.",
    "The update is okay, nothing special though.",
    "Best purchase I've made this year! Highly recommend.",
    "Having issues with the app crashing constantly.",
  ]

  const loadSampleData = () => {
    setBulkComments(sampleComments.join("\n"))
    setSelectedPlatform("twitter")
  }

  return (
    <div className="space-y-6">
      {/* Single Comment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Single Comment
          </CardTitle>
          <CardDescription>Manually add a comment for sentiment analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform *</Label>
                <Select value={form.platform} onValueChange={(value) => setForm({ ...form, platform: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((platform) => (
                      <SelectItem key={platform.value} value={platform.value}>
                        {platform.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="platform_post_id">Post ID</Label>
                <Input
                  id="platform_post_id"
                  value={form.platform_post_id}
                  onChange={(e) => setForm({ ...form, platform_post_id: e.target.value })}
                  placeholder="Original post ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author_username">Username</Label>
                <Input
                  id="author_username"
                  value={form.author_username}
                  onChange={(e) => setForm({ ...form, author_username: e.target.value })}
                  placeholder="@username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author_display_name">Display Name</Label>
                <Input
                  id="author_display_name"
                  value={form.author_display_name}
                  onChange={(e) => setForm({ ...form, author_display_name: e.target.value })}
                  placeholder="Display name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Comment Content *</Label>
              <Textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Enter the comment text..."
                rows={3}
                required
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Comment
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Bulk Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Upload Comments
          </CardTitle>
          <CardDescription>Upload multiple comments at once (one per line)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-platform">Platform *</Label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((platform) => (
                    <SelectItem key={platform.value} value={platform.value}>
                      {platform.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={loadSampleData} className="w-full bg-transparent">
                Load Sample Data
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bulk-comments">Comments (one per line)</Label>
            <Textarea
              id="bulk-comments"
              value={bulkComments}
              onChange={(e) => setBulkComments(e.target.value)}
              placeholder="Enter comments, one per line..."
              rows={8}
            />
            {bulkComments && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {bulkComments.split("\n").filter((line) => line.trim().length > 0).length} comments
                </Badge>
              </div>
            )}
          </div>

          <Button onClick={handleBulkUpload} disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Comments
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
