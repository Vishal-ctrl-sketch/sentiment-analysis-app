import { type NextRequest, NextResponse } from "next/server"
import { translateText, detectLanguage } from "@/lib/translator"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, targetLanguage, commentId, action = "translate" } = body

    // Validate required text
    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    let result

    if (action === "detect") {
      result = await detectLanguage(text)
      return NextResponse.json({ result })
    }

    if (!targetLanguage) {
      return NextResponse.json(
        { error: "Target language is required for translation" },
        { status: 400 },
      )
    }

    result = await translateText(text, targetLanguage)

    // If commentId is provided, persist translation in DB
    if (commentId) {
      const supabase = await createClient()

      const { error } = await supabase
        .from("comments")
        .update({
          translated_content: result.translatedText,
          language_code: result.detectedLanguage,
        })
        .eq("id", commentId)

      if (error) {
        console.error("❌ Failed to update comment with translation:", error)
        return NextResponse.json(
          { error: "Failed to save translation" },
          { status: 500 },
        )
      }
    }

    return NextResponse.json({ result })
  } catch (error) {
    console.error("❌ Translation API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
