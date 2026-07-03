import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Plus, GripVertical, Trash2, Pencil, ExternalLink, X, Podcast, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { CpShowIcon } from '../components/platform-icons'
import { useOrderedList } from '../lib/use-ordered-list'
import { showPlatformsHooks, type CpShowPlatform } from '../lib/cp-hooks'

const SHOW_PLATFORMS = ['Spotify', 'Apple Podcasts', 'YouTube'] as const

const inputClass =
  'w-full rounded-xl border border-input bg-white px-3 py-2 h-10 text-base md:text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_1px_#2C1810] transition-colors'
const selectClass =
  "w-full rounded-xl border border-input bg-white pl-3 pr-10 py-2 h-10 text-base md:text-sm focus:outline-none focus:border-primary focus:shadow-[0_0_0_1px_#2C1810] transition-colors appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[position:right_12px_center] bg-no-repeat"

export function CpShowPage() {
  const { data: serverLinks, isLoading } = showPlatformsHooks.useList()
  const createLink = showPlatformsHooks.useCreate()
  const updateLink = showPlatformsHooks.useUpdate()
  const deleteLink = showPlatformsHooks.useRemove()
  const reorderLinks = showPlatformsHooks.useReorder()
  const { items: links, onDragEnd } = useOrderedList(serverLinks, reorderLinks.mutate)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [platform, setPlatform] = useState<string>(SHOW_PLATFORMS[0])
  const [url, setUrl] = useState('')

  function openCreate() {
    setPlatform(SHOW_PLATFORMS[0])
    setUrl('')
    setEditingId(null)
    setShowForm(true)
  }

  function openEdit(link: CpShowPlatform) {
    setPlatform(link.platform || SHOW_PLATFORMS[0])
    setUrl(link.url || '')
    setEditingId(link.id)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editingId) await updateLink.mutateAsync({ id: editingId, platform, url })
    else await createLink.mutateAsync({ platform, url })
    setShowForm(false)
  }


  return (
    <div>
      <PageHeader
        title="The Show — Platforms"
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 h-10 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Platform
          </button>
        }
      />

      {showForm && (
        <div className="mb-6 bg-card rounded-2xl border border-border/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{editingId ? 'Edit Platform' : 'New Platform'}</h3>
            <button onClick={() => setShowForm(false)} className="text-foreground p-1.5 rounded-lg hover:bg-black/[0.08] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">Platform *</label>
                <div className="flex items-center gap-2.5">
                  <CpShowIcon platform={platform} />
                  <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={selectClass}>
                    {SHOW_PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">URL *</label>
                <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} required className={inputClass} placeholder="https://..." />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={createLink.isPending || updateLink.isPending} className="bg-primary text-primary-foreground px-6 py-2 h-10 rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {editingId ? 'Save' : 'Add Platform'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 h-10 rounded-xl text-sm font-medium border border-border hover:bg-black/[0.08] transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : !links.length ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Podcast className="w-7 h-7 text-foreground" />
          </div>
          <p className="text-muted-foreground italic">No platforms yet. Add your first one.</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="cp-show-platforms">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {links.map((link, index) => (
                  <Draggable key={link.id} draggableId={link.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-center gap-3 bg-card rounded-2xl border border-border/60 p-3.5 transition-shadow ${
                          snapshot.isDragging ? 'shadow-lg' : 'hover:bg-black/[0.04]'
                        }`}
                      >
                        <div {...provided.dragHandleProps} className="text-muted-foreground cursor-grab">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <CpShowIcon platform={link.platform} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{link.platform}</div>
                          <div className="text-xs text-muted-foreground truncate">{link.url}</div>
                        </div>
                        {link.url && (
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-foreground p-1.5 rounded-lg hover:bg-black/[0.08] transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button onClick={() => openEdit(link)} className="text-foreground p-1.5 rounded-lg hover:bg-black/[0.08] transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        {deleteLink.isPending && deleteLink.variables === link.id ? (
                          <div className="p-1.5">
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          </div>
                        ) : (
                          <button onClick={() => setDeleteId(link.id)} className="text-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Platform"
        description="Are you sure you want to delete this platform?"
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (deleteId) {
            deleteLink.mutate(deleteId)
            setDeleteId(null)
          }
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
