import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabaseCp } from '@/lib/supabase-cp'
import { toast } from 'sonner'

export interface CpStoreLink {
  id: string
  platform: string
  url: string | null
  badge_image_url: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export const STORE_PLATFORMS = ['ios', 'android'] as const

async function uploadBadge(platform: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()
  const filePath = `badges/${platform}-badge.${ext}`
  const { error } = await supabaseCp.storage.from('website-assets').upload(filePath, file, { upsert: true })
  if (error) throw error
  const { data } = supabaseCp.storage.from('website-assets').getPublicUrl(filePath)
  return data.publicUrl
}

export function useCpStoreLinks() {
  return useQuery({
    queryKey: ['cp', 'store_links'],
    queryFn: async () => {
      const { data, error } = await supabaseCp
        .from('store_links')
        .select('*')
        .order('display_order', { ascending: true })
      if (error) throw error
      return data as CpStoreLink[]
    },
  })
}

export function useCreateCpStoreLink() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ platform, url, badgeFile }: { platform: string; url: string; badgeFile?: File }) => {
      let badge_image_url: string | null = null
      if (badgeFile) badge_image_url = await uploadBadge(platform, badgeFile)

      const { data: existing } = await supabaseCp
        .from('store_links')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
      const nextOrder = existing && existing.length > 0 ? existing[0].display_order + 1 : 0

      const { data, error } = await supabaseCp
        .from('store_links')
        .insert({ platform, url, badge_image_url, display_order: nextOrder })
        .select()
        .single()
      if (error) throw error
      return data as CpStoreLink
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cp', 'store_links'] })
      toast.success('Store link added')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useUpdateCpStoreLink() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, platform, url, badgeFile }: { id: string; platform: string; url: string; badgeFile?: File }) => {
      let badge_image_url: string | undefined
      if (badgeFile) badge_image_url = await uploadBadge(platform, badgeFile)

      const { data, error } = await supabaseCp
        .from('store_links')
        .update({ platform, url, ...(badge_image_url !== undefined && { badge_image_url }) })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as CpStoreLink
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cp', 'store_links'] })
      toast.success('Store link updated')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useDeleteCpStoreLink() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseCp.from('store_links').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cp', 'store_links'] })
      toast.success('Store link deleted')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useReorderCpStoreLinks() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(
        ids.map((id, index) => supabaseCp.from('store_links').update({ display_order: index }).eq('id', id)),
      )
    },
    onMutate: async (ids: string[]) => {
      const prev = queryClient.getQueryData<CpStoreLink[]>(['cp', 'store_links'])
      if (prev) {
        const byId = new Map(prev.map((it) => [it.id, it]))
        // Reuse the same objects, just reordered (cloning stutters the drop).
        const next = ids.map((id) => byId.get(id)).filter((it): it is CpStoreLink => Boolean(it))
        queryClient.setQueryData(['cp', 'store_links'], next)
      }
      return { prev }
    },
    onError: (err: Error, _ids: string[], ctx?: { prev?: CpStoreLink[] }) => {
      if (ctx?.prev) queryClient.setQueryData(['cp', 'store_links'], ctx.prev)
      queryClient.invalidateQueries({ queryKey: ['cp', 'store_links'] })
      toast.error(err.message)
    },
  })
}
