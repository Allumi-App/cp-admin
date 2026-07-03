import { createClient } from '@supabase/supabase-js'

const cpUrl = import.meta.env.VITE_CP_SUPABASE_URL as string
const cpAnonKey = import.meta.env.VITE_CP_SUPABASE_ANON_KEY as string

if (!cpUrl || !cpAnonKey) {
  throw new Error('Missing VITE_CP_SUPABASE_URL or VITE_CP_SUPABASE_ANON_KEY environment variables')
}

/**
 * Christina Pfeiffer Supabase project — a SEPARATE project from Allumi.
 * Uses a distinct storageKey so its auth session doesn't collide with the
 * Allumi client's session in localStorage (the dashboard is signed into both).
 */
export const supabaseCp = createClient(cpUrl, cpAnonKey, {
  auth: { storageKey: 'sb-cp-auth' },
})
