import { generateObject } from "ai"
import { groq } from "@ai-sdk/groq"
import { z } from "zod"

const translationSchema = z.object({
  translatedText: z.string(),
  detectedLanguage: z.string(),
  confidence: z.number().min(0).max(1),
})

export type TranslationResult = z.infer<typeof translationSchema>

const languageNames: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese",
  ar: "Arabic",
  hi: "Hindi",
  tr: "Turkish",
  pl: "Polish",
  nl: "Dutch",
  sv: "Swedish",
  da: "Danish",
  no: "Norwegian",
  fi: "Finnish",
  cs: "Czech",
  hu: "Hungarian",
  ro: "Romanian",
  bg: "Bulgarian",
  hr: "Croatian",
  sk: "Slovak",
  sl: "Slovenian",
  et: "Estonian",
  lv: "Latvian",
  lt: "Lithuanian",
  mt: "Maltese",
  el: "Greek",
  cy: "Welsh",
  ga: "Irish",
  is: "Icelandic",
  mk: "Macedonian",
  sq: "Albanian",
  sr: "Serbian",
  bs: "Bosnian",
  me: "Montenegrin",
  uk: "Ukrainian",
  be: "Belarusian",
  ka: "Georgian",
  am: "Amharic",
  sw: "Swahili",
  zu: "Zulu",
  af: "Afrikaans",
  th: "Thai",
  vi: "Vietnamese",
  id: "Indonesian",
  ms: "Malay",
  tl: "Filipino",
  he: "Hebrew",
  fa: "Persian",
  ur: "Urdu",
  bn: "Bengali",
  ta: "Tamil",
  te: "Telugu",
  ml: "Malayalam",
  kn: "Kannada",
  gu: "Gujarati",
  pa: "Punjabi",
  or: "Odia",
  as: "Assamese",
  ne: "Nepali",
  si: "Sinhala",
  my: "Myanmar",
  km: "Khmer",
  lo: "Lao",
  ka: "Georgian",
  hy: "Armenian",
  az: "Azerbaijani",
  kk: "Kazakh",
  ky: "Kyrgyz",
  uz: "Uzbek",
  tg: "Tajik",
  mn: "Mongolian",
}

export async function translateText(text: string, targetLanguage = "en"): Promise<TranslationResult> {
  try {
    const targetLanguageName = languageNames[targetLanguage] || "English"

    const { object } = await generateObject({
      model: groq("llama-3.1-70b-versatile"),
      schema: translationSchema,
      prompt: `Translate the following text to ${targetLanguageName} and detect the original language:

Text: "${text}"

Please provide:
1. The translated text in ${targetLanguageName}
2. The detected original language (use ISO 639-1 code like 'en', 'es', 'fr', etc.)
3. Your confidence level in the translation (0-1)

If the text is already in ${targetLanguageName}, return the original text and indicate that no translation was needed.`,
    })

    return object
  } catch (error) {
    console.error("Translation failed:", error)
    // Fallback response
    return {
      translatedText: text,
      detectedLanguage: "unknown",
      confidence: 0.0,
    }
  }
}

export async function detectLanguage(text: string): Promise<{ language: string; confidence: number }> {
  try {
    const { object } = await generateObject({
      model: groq("llama-3.1-70b-versatile"),
      schema: z.object({
        language: z.string(),
        confidence: z.number().min(0).max(1),
      }),
      prompt: `Detect the language of this text and provide your confidence level:

Text: "${text}"

Respond with:
1. The language code (ISO 639-1 format like 'en', 'es', 'fr', etc.)
2. Your confidence level (0-1)`,
    })

    return object
  } catch (error) {
    console.error("Language detection failed:", error)
    return {
      language: "en",
      confidence: 0.5,
    }
  }
}

export function getLanguageName(code: string): string {
  return languageNames[code] || code.toUpperCase()
}

export function getSupportedLanguages(): Array<{ code: string; name: string }> {
  return Object.entries(languageNames).map(([code, name]) => ({ code, name }))
}
