import { createClient } from '@/lib/supabase/server'

export type OwnedKeysResult =
  | { authorized: false }
  | { authorized: true; keys: string[] }

// Resolves which client_key values the currently signed-in user owns,
// via clients.owner_id -> auth.users.id. Used by every dashboard API
// route to decide what data a request is allowed to see.
export async function getOwnedKeys(): Promise<OwnedKeysResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { authorized: false }
  }

  const { data, error } = await supabase
    .from('clients')
    .select('client_key')
    .eq('owner_id', user.id)
    .eq('is_active', true)

  if (error) {
    // Fail closed: a DB error here must never fall back to "no filter"
    // (which would mean everyone's data). Treat it as owning nothing —
    // but log it, so a broken `clients` query shows up in Vercel logs
    // instead of silently looking like "user just has no data".
    console.error('getOwnedKeys: failed to query clients table:', error.message)
    return { authorized: true, keys: [] }
  }

  return { authorized: true, keys: (data || []).map((row) => row.client_key as string) }
}
