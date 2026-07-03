import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabaseCp } from '@/lib/supabase-cp'
import { toast } from 'sonner'

export interface CpSubscriber {
  id: string
  email: string
  lang: string
  status: 'subscribed' | 'unsubscribed'
  created_at: string
}

export function useCpSubscribers() {
  return useQuery({
    queryKey: ['cp', 'subscribers'],
    queryFn: async () => {
      const { data, error } = await supabaseCp
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as CpSubscriber[]
    },
  })
}

export function useDeleteCpSubscribers() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabaseCp.from('subscribers').delete().in('id', ids)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cp', 'subscribers'] })
      toast.success('Removed')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

interface BroadcastResult {
  sent: number
  failed: number
  total: number
}

/**
 * Send the "Subscriber broadcast" template to subscribers via the CP Supabase
 * Edge Function `send-subscriber-broadcast` (it holds the Gmail creds and does
 * the actual sending). The dashboard's session token authorizes the call — RLS
 * (is_admin) inside the function gates who can read subscribers.
 * Pass specific emails to target a selection, or omit to send to everyone.
 */
export function useSendCpBroadcast() {
  return useMutation({
    mutationFn: async (emails?: string[]): Promise<BroadcastResult> => {
      const { data, error } = await supabaseCp.functions.invoke('send-subscriber-broadcast', {
        body: emails?.length ? { emails } : {},
      })
      if (error) {
        // Surface the function's JSON error message when present.
        let msg = error.message
        try {
          const ctx = (error as { context?: Response }).context
          if (ctx) {
            const j = await ctx.json()
            if (j?.error) msg = j.error
          }
        } catch {
          // ignore — fall back to error.message
        }
        throw new Error(msg)
      }
      const r = data as Partial<BroadcastResult> & { ok?: boolean; error?: string }
      if (!r?.ok) throw new Error(r?.error || 'Broadcast failed')
      return { sent: r.sent ?? 0, failed: r.failed ?? 0, total: r.total ?? 0 }
    },
    onSuccess: (r) =>
      toast.success(
        `Sent to ${r.sent} subscriber${r.sent !== 1 ? 's' : ''}${r.failed ? `, ${r.failed} failed` : ''}`,
      ),
    onError: (e: Error) => toast.error(e.message),
  })
}
