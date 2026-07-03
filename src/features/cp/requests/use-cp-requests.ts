import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabaseCp } from '@/lib/supabase-cp'
import { toast } from 'sonner'

export type CpRequestStatus = 'new' | 'replied' | 'archived'

export interface CpBookingRequest {
  id: string
  package_slug: string | null
  package_name: string | null
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  focus: string | null
  lang: string | null
  status: CpRequestStatus
  is_flagged: boolean
  created_at: string
  updated_at: string
}

export function useCpRequests() {
  return useQuery({
    queryKey: ['cp', 'booking_requests'],
    queryFn: async () => {
      const { data, error } = await supabaseCp
        .from('booking_requests')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as CpBookingRequest[]
    },
  })
}

/** Count of unread (status = 'new') requests, for the sidebar badge. */
export function useCpNewRequestCount() {
  return useQuery({
    queryKey: ['cp', 'booking_requests', 'new-count'],
    queryFn: async () => {
      const { count, error } = await supabaseCp
        .from('booking_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new')
      if (error) throw error
      return count ?? 0
    },
  })
}

type RequestPatch = Partial<Pick<CpBookingRequest, 'status' | 'is_flagged'>>

export function useUpdateCpRequests() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ ids, patch }: { ids: string[]; patch: RequestPatch }) => {
      const { error } = await supabaseCp.from('booking_requests').update(patch).in('id', ids)
      if (error) throw error
    },
    // Invalidating the prefix also refreshes the 'new-count' query.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cp', 'booking_requests'] }),
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useDeleteCpRequests() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabaseCp.from('booking_requests').delete().in('id', ids)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cp', 'booking_requests'] })
      toast.success('Deleted')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
