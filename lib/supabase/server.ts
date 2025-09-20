import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { env } from "@/lib/env" // use our validated env

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // ignore if called in Server Component
        }
      },
    },
  })
}