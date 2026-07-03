import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabaseCp } from '@/lib/supabase-cp'
import { toast } from 'sonner'

export interface CpListRow {
  id: string
  display_order: number
  [key: string]: unknown
}

/**
 * Generates the standard list-CRUD hooks (list / create / update / delete /
 * reorder) for a simple `display_order`-sorted CP table. All CP query keys are
 * namespaced under 'cp' so they never collide with the Allumi client's cache.
 */
export function makeCpListHooks<T extends CpListRow>(table: string, label: string) {
  const key = ['cp', table]

  function useList() {
    return useQuery({
      queryKey: key,
      queryFn: async () => {
        const { data, error } = await supabaseCp
          .from(table)
          .select('*')
          .order('display_order', { ascending: true })
        if (error) throw error
        return data as T[]
      },
    })
  }

  function useCreate() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: async (values: Record<string, unknown>) => {
        const { data: existing } = await supabaseCp
          .from(table)
          .select('display_order')
          .order('display_order', { ascending: false })
          .limit(1)
        const nextOrder =
          existing && existing.length > 0 ? (existing[0].display_order as number) + 1 : 0
        const { data, error } = await supabaseCp
          .from(table)
          .insert({ ...values, display_order: nextOrder })
          .select()
          .single()
        if (error) throw error
        return data as T
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: key })
        toast.success(`${label} added`)
      },
      onError: (e: Error) => toast.error(e.message),
    })
  }

  function useUpdate() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: async ({ id, ...updates }: { id: string } & Record<string, unknown>) => {
        const { data, error } = await supabaseCp
          .from(table)
          .update(updates)
          .eq('id', id)
          .select()
          .single()
        if (error) throw error
        return data as T
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: key })
        toast.success(`${label} updated`)
      },
      onError: (e: Error) => toast.error(e.message),
    })
  }

  function useRemove() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabaseCp.from(table).delete().eq('id', id)
        if (error) throw error
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: key })
        toast.success(`${label} deleted`)
      },
      onError: (e: Error) => toast.error(e.message),
    })
  }

  function useReorder() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: async (ids: string[]) => {
        await Promise.all(
          ids.map((id, i) => supabaseCp.from(table).update({ display_order: i }).eq('id', id)),
        )
      },
      // Optimistically reorder the cache so the dropped item stays put (no stutter).
      // Reuse the SAME row objects, just reordered — cloning them (new references)
      // forces every Draggable to re-render mid drop-animation, which stutters.
      // display_order is left stale on the objects (render uses array order); the
      // DB write below sets the real values.
      onMutate: async (ids: string[]) => {
        const prev = qc.getQueryData<T[]>(key)
        if (prev) {
          const byId = new Map(prev.map((it) => [it.id, it]))
          const next = ids.map((id) => byId.get(id)).filter((it): it is T => Boolean(it))
          qc.setQueryData(key, next)
        }
        return { prev }
      },
      onError: (e: Error, _ids: string[], ctx?: { prev?: T[] }) => {
        if (ctx?.prev) qc.setQueryData(key, ctx.prev)
        qc.invalidateQueries({ queryKey: key })
        toast.error(e.message)
      },
      // No refetch on success: the optimistic order already matches the DB, and a
      // post-drop refetch is exactly what caused the visible stutter.
    })
  }

  return { useList, useCreate, useUpdate, useRemove, useReorder }
}

export type CpListHooks<T extends CpListRow> = ReturnType<typeof makeCpListHooks<T>>
