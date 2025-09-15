"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Languages, ArrowRight, Copy, Check } from "lucide-react"
import { getSupportedLanguages, getLanguageName } from "@/lib/translator"
import { useToast } from "@/hooks/use-toast"

interface TranslationResult {
  translatedText: string
  detectedLanguage: string
  confidence: number
}

export function TranslationTool() {
  const [inputText, setInputText] = useState("")
  const [targetLanguage, setTargetLanguage] = useState("en")
  const [result, setResult] = useState<TranslationResult | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const supportedLanguages = getSupportedLanguages()

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to translate",
        variant: "destructive",
      })
      return
    }

    setIsTranslating(true)
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          targetLanguage,
          action: "translate",
        }),
      })

      if (!response.ok) {
        throw new Error("Translation failed")
      }

      const data = await response.json()
      setResult(data.result)
    } catch (error) {
      toast({
        title: "Error",
        description: "Translation failed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsTranslating(false)
    }
  }

  const handleDetectLanguage = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to detect language",
        variant: "destructive",
      })
      return
    }

    setIsDetecting(true)
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          action: "detect",
        }),
      })

      if (!response.ok) {
        throw new Error("Language detection failed")
      }

      const data = await response.json()
      toast({
        title: "Language Detected",
        description: `${getLanguageName(data.result.language)} (${Math.round(data.result.confidence * 100)}% confidence)`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Language detection failed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDetecting(false)
    }
  }

  const handleCopy = async () => {
    if (result?.translatedText) {
      await navigator.clipboard.writeText(result.translatedText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Copied",
        description: "Translation copied to clipboard",
      })
    }
  }

  const sampleTexts = [
    { text: "¡Excelente producto! Lo recomiendo mucho.", language: "Spanish" },
    { text: "Ce produit est vraiment fantastique!", language: "French" },
    { text: "Dieses Produkt ist wirklich schlecht.", language: "German" },
    { text: "この製品は素晴らしいです！", language: "Japanese" },
    { text: "Этот продукт просто ужасен.", language: "Russian" },
  ]

  const loadSampleText = (text: string) => {
    setInputText(text)
    setResult(null)
  }

  return (
    <div className="space-y-6">
      {/* Translation Tool */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Text Translation
          </CardTitle>
          <CardDescription>Translate text between different languages using AI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sample Texts */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Try sample texts:</label>
            <div className="flex flex-wrap gap-2">
              {sampleTexts.map((sample, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => loadSampleText(sample.text)}
                  className="text-xs bg-transparent"
                >
                  {sample.language}
                </Button>
              ))}
            </div>
          </div>

          {/* Input Text */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Text to translate</label>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text in any language..."
              rows={4}
            />
          </div>

          {/* Target Language Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Language</label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target language" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {supportedLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button
                onClick={handleDetectLanguage}
                disabled={isDetecting}
                variant="outline"
                className="bg-transparent"
              >
                {isDetecting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Languages className="mr-2 h-4 w-4" />
                )}
                Detect Language
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleTranslate} disabled={isTranslating} className="flex-1">
              {isTranslating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Translate
                </>
              )}
            </Button>
          </div>

          {/* Translation Result */}
          {result && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Translation Result</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {getLanguageName(result.detectedLanguage)} → {getLanguageName(targetLanguage)}
                  </Badge>
                  <Badge variant="secondary">{Math.round(result.confidence * 100)}% confidence</Badge>
                  <Button size="sm" variant="outline" onClick={handleCopy} className="bg-transparent">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm leading-relaxed">{result.translatedText}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Language Support Info */}
      <Card>
        <CardHeader>
          <CardTitle>Supported Languages</CardTitle>
          <CardDescription>We support translation between {supportedLanguages.length} languages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {supportedLanguages.slice(0, 20).map((lang) => (
              <Badge key={lang.code} variant="outline" className="justify-center">
                {lang.name}
              </Badge>
            ))}
            {supportedLanguages.length > 20 && (
              <Badge variant="secondary" className="justify-center">
                +{supportedLanguages.length - 20} more
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
