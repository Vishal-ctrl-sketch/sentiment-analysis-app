"use client"

import { useChat } from "ai/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Bot, User, Send, Loader2, MessageSquare, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ChatMessage } from "ai/react"

export function AIChatbot() {
  const { messages, append, isLoading } = useChat({
    api: "/api/chat",
  })

  const [input, setInput] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)

  const suggestedQuestions = [
    "What's the overall sentiment trend this week?",
    "Which platform has the most positive feedback?",
    "What are the main topics people are discussing?",
    "How can I improve negative sentiment?",
    "What does the confidence score mean?",
    "Show me insights about recent comments",
  ]

  const handleSuggestedQuestion = (question: string) => {
    setInput(question)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    await append({ role: "user", content: input })
    setInput("")
  }

  return (
    <Card className={cn("transition-all duration-300", isExpanded ? "h-[600px]" : "h-auto")}>
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          AI Sentiment Assistant
          <Sparkles className="h-4 w-4 text-yellow-500" />
        </CardTitle>
        <CardDescription>
          Ask questions about your sentiment analysis data and get AI-powered insights
        </CardDescription>
      </CardHeader>

      {isExpanded && (
        <CardContent className="flex flex-col h-[500px]">
          {/* Messages */}
          <ScrollArea className="flex-1 mb-4 pr-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Start a conversation with your AI assistant</p>
                  <div className="grid grid-cols-1 gap-2">
                    {suggestedQuestions.slice(0, 3).map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestedQuestion(question)}
                        className="text-left justify-start h-auto p-3 bg-transparent"
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message: ChatMessage) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 p-3 rounded-lg",
                    message.role === "user"
                      ? "bg-blue-50 dark:bg-blue-900/20 ml-8"
                      : "bg-gray-50 dark:bg-gray-800/50 mr-8",
                  )}
                >
                  <div className="flex-shrink-0">
                    {message.role === "user" ? (
                      <User className="h-6 w-6 text-blue-600" />
                    ) : (
                      <Bot className="h-6 w-6 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {message.role === "user" ? "You" : "AI Assistant"}
                      </Badge>
                    </div>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 mr-8">
                  <Bot className="h-6 w-6 text-green-600" />
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-500">AI is thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Suggested Questions */}
          {messages.length === 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">More suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.slice(3).map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestedQuestion(question)}
                    className="text-xs bg-transparent"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your sentiment data..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </CardContent>
      )}
    </Card>
  )
}