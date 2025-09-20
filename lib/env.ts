import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// --- Helper to validate required env vars ---
function getEnvVar(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`❌ Missing required environment variable: ${name}`)
  return value
}

export const env = {
  // Required
  googleApiKey: getEnvVar("GOOGLE_GENERATIVE_AI_API_KEY"),
  supabaseUrl: getEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: getEnvVar("SUPABASE_SERVICE_ROLE_KEY"), // server only
}

// --- Optional: Supabase client for quick use ---
export const supabase = createSupabaseClient(
  env.supabaseUrl,
  env.supabaseServiceRoleKey
)
