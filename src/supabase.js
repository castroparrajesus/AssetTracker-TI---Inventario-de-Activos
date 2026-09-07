import { createClient } from '@supabase/supabase-js'

// Prefer Vite env names, fall back to Next.js compatible names.
// If values are missing, use safe placeholders so the app can still build locally.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder-anon-key'

if (!import.meta.env.VITE_SUPABASE_URL && !import.meta.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn('Supabase URL not configured. Define VITE_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL in .env to enable auth and DB access.')
}

if (!import.meta.env.VITE_SUPABASE_KEY && !import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
  console.warn('Supabase anon key not configured. Define VITE_SUPABASE_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env to enable auth and DB access.')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)