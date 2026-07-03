import { useState } from 'react'
import type { DropResult } from '@hello-pangea/dnd'

/**
 * Smooth drag-and-drop ordering. Renders from LOCAL state that's updated
 * synchronously inside onDragEnd, so the dropped order is painted in the same
 * frame the drag ends. Driving the list straight off a React Query result
 * stutters — RQ defers its re-render, so the drop animation lands on the old
 * order, snaps back, then jumps. Local state avoids that; `persist` saves in the
 * background and we adopt the query result again when it genuinely changes.
 */
export function useOrderedList<T extends { id: string }>(
  data: T[] | undefined,
  persist: (ids: string[]) => void,
) {
  const [items, setItems] = useState<T[]>(data ?? [])
  // Adopt server data when its reference actually changes (initial load,
  // add/remove/edit) using the documented "sync state during render" pattern —
  // an effect would re-render a frame late and reintroduce the stutter.
  const [prevData, setPrevData] = useState(data)
  if (data !== prevData) {
    setPrevData(data)
    setItems(data ?? [])
  }

  function onDragEnd(result: DropResult) {
    if (!result.destination) return
    const src = result.source.index
    const dst = result.destination.index
    if (src === dst) return
    const next = Array.from(items)
    const [moved] = next.splice(src, 1)
    next.splice(dst, 0, moved)
    setItems(next)
    persist(next.map((i) => i.id))
  }

  return { items, onDragEnd }
}
