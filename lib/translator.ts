import { GoogleGenerativeAI } from "@google/generative-ai"
import { z } from "zod"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

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
  hy: "Armenian",
  az: "Azerbaijani",
  kk: "Kazakh",
  ky: "Kyrgyz",
  uz: "Uzbek",
  tg: "Tajik",
  mn: "Mongolian",
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
}

export async function translateText(
  text: string,
  targetLanguage = "en"
): Promise<TranslationResult> {
  try {
    const targetLanguageName = languageNames[targetLanguage] || "English"
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `Translate the following text to ${targetLanguageName}.
Also detect the original language and provide confidence.

Text: "${text}"

Respond ONLY as JSON in this format:
{
  "translatedText": "...",
  "detectedLanguage": "en",
  "confidence": 0.95
}`

    const result = await model.generateContent(prompt)
    const raw = result.response.text().trim()

    const parsed = translationSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) {
      throw new Error("Failed to parse translation result")
    }

    return parsed.data
  } catch (error) {
    console.error("Translation failed:", error)
    return {
      translatedText: text,
      detectedLanguage: "unknown",
      confidence: 0.0,
    }
  }
}

export async function detectLanguage(
  text: string
): Promise<{ language: string; confidence: number }> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `Detect the language of the following text.
Respond ONLY as JSON:
{
  "language": "en",
  "confidence": 0.9
}

Text: "${text}"`

    const result = await model.generateContent(prompt)
    const raw = result.response.text().trim()

    const schema = z.object({
      language: z.string(),
      confidence: z.number().min(0).max(1),
    })

    const parsed = schema.safeParse(JSON.parse(raw))
    if (!parsed.success) {
      throw new Error("Failed to parse language detection result")
    }

    return parsed.data
  } catch (error) {
    console.error("Language detection failed:", error)
    return { language: "en", confidence: 0.5 }
  }
}

export function getLanguageName(code: string): string {
  return languageNames[code] || code.toUpperCase()
}

export function getSupportedLanguages(): Array<{ code: string; name: string }> {
  return Object.entries(languageNames).map(([code, name]) => ({ code, name }))
}
