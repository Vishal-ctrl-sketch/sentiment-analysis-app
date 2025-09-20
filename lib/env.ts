// lib/env.ts
function getEnvVar(name: string, required = true): string | undefined {
  const value = process.env[name];
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  // ✅ Supabase
  supabaseUrl: getEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY"),

  // ✅ Supabase service role (server-side only, no NEXT_PUBLIC prefix)
  supabaseServiceKey: getEnvVar("SUPABASE_SERVICE_ROLE_KEY", false),

  // ✅ Google Generative AI
  googleApiKey: getEnvVar("GOOGLE_GENERATIVE_AI_API_KEY"),
};
