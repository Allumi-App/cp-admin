import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabaseCp } from '@/lib/supabase-cp'
import { toast } from 'sonner'

export interface CpLegalDocument {
  id: string
  slug: string
  title: string
  title_de: string
  content: string
  content_de: string
  display_order: number
  created_at: string
  updated_at: string
}

export const CP_LEGAL_LABELS: Record<string, string> = {
  impressum: 'Impressum',
  datenschutz: 'Datenschutz',
  agb: 'AGB',
  widerruf: 'Widerruf',
}

export function useCpLegalDocuments() {
  return useQuery({
    queryKey: ['cp', 'legal'],
    queryFn: async () => {
      const { data, error } = await supabaseCp
        .from('legal_documents')
        .select('*')
        .order('display_order', { ascending: true })
      if (error) throw error
      return data as CpLegalDocument[]
    },
  })
}

export function useCpLegalDocument(id: string) {
  return useQuery({
    queryKey: ['cp', 'legal', id],
    queryFn: async () => {
      const { data, error } = await supabaseCp
        .from('legal_documents')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as CpLegalDocument
    },
  })
}

export function useUpdateCpLegalDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      title,
      title_de,
      content,
      content_de,
    }: {
      id: string
      title: string
      title_de: string
      content: string
      content_de: string
    }) => {
      const { data, error } = await supabaseCp
        .from('legal_documents')
        .update({ title, title_de, content, content_de })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as CpLegalDocument
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cp', 'legal'] })
      toast.success('Document saved')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useReorderCpLegalDocuments() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(
        ids.map((id, index) =>
          supabaseCp.from('legal_documents').update({ display_order: index }).eq('id', id),
        ),
      )
    },
    onMutate: async (ids: string[]) => {
      const prev = queryClient.getQueryData<CpLegalDocument[]>(['cp', 'legal'])
      if (prev) {
        const byId = new Map(prev.map((it) => [it.id, it]))
        // Reuse the same objects, just reordered (cloning stutters the drop).
        const next = ids.map((id) => byId.get(id)).filter((it): it is CpLegalDocument => Boolean(it))
        queryClient.setQueryData(['cp', 'legal'], next)
      }
      return { prev }
    },
    onError: (err: Error, _ids: string[], ctx?: { prev?: CpLegalDocument[] }) => {
      if (ctx?.prev) queryClient.setQueryData(['cp', 'legal'], ctx.prev)
      queryClient.invalidateQueries({ queryKey: ['cp', 'legal'] })
      toast.error(err.message)
    },
  })
}
