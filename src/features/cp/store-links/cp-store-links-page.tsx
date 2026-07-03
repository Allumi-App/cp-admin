import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useOrderedList } from '../lib/use-ordered-list'
import { Plus, GripVertical, Trash2, Pencil, X, Download, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { FileUpload } from '@/components/shared/file-upload'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { CpStoreIcon } from '../components/platform-icons'
import {
  useCpStoreLinks,
  useCreateCpStoreLink,
  useUpdateCpStoreLink,
  useDeleteCpStoreLink,
  useReorderCpStoreLinks,
  STORE_PLATFORMS,
  type CpStoreLink,
} from './use-cp-store-links'

const PLATFORM_LABELS: Record<string, string> = {
  ios: 'iOS (App Store)',
  android: 'Android (Google Play)',
}

const inputClass =
  'w-full rounded-xl border border-input bg-white px-3 py-2 h-10 text-base md:text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_1px_#2C1810] transition-colors'
const selectClass =
  "w-full rounded-xl border border-input bg-white pl-3 pr-10 py-2 h-10 text-base md:text-sm focus:outline-none focus:border-primary focus:shadow-[0_0_0_1px_#2C1810] transition-colors appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[position:right_12px_center] bg-no-repeat"

export function CpStoreLinksPage() {
  const { data: serverLinks, isLoading } = useCpStoreLinks()
  const createLink = useCreateCpStoreLink()
  const updateLink = useUpdateCpStoreLink()
  const deleteLink = useDeleteCpStoreLink()
  const reorderLinks = useReorderCpStoreLinks()
  const { items: links, onDragEnd } = useOrderedList(serverLinks, reorderLinks.mutate)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [platform, setPlatform] = useState('ios')
  const [url, setUrl] = useState('')
  const [badgeFile, setBadgeFile] = useState<File | null>(null)
  const [badgePreview, setBadgePreview] = useState<string | null>(null)

  function openCreate() {
    setPlatform('ios')
    setUrl('')
    setBadgeFile(null)
    setBadgePreview(null)
    setEditingId(null)
    setShowForm(true)
  }

  function openEdit(link: CpStoreLink) {
    setPlatform(link.platform)
    setUrl(link.url || '')
    setBadgeFile(null)
    setBadgePreview(link.badge_image_url)
    setEditingId(link.id)
    setShowForm(true)
  }

  function handleBadgeFile(file: File) {
    setBadgeFile(file)
    setBadgePreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editingId) await updateLink.mutateAsync({ id: editingId, platform, url, ...(badgeFile && { badgeFile }) })
    else await createLink.mutateAsync({ platform, url, ...(badgeFile && { badgeFile }) })
    setShowForm(false)
  }

  return (
    <div>
      <PageHeader
        title="Store Links"
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 h-10 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Link
          </button>
        }
      />

      {showForm && (
        <div className="mb-6 bg-card rounded-2xl border border-border/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{editingId ? 'Edit Store Link' : 'New Store Link'}</h3>
            <button onClick={() => setShowForm(false)} className="text-foreground p-1.5 rounded-lg hover:bg-black/[0.08] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">Platform *</label>
                <div className="flex items-center gap-2.5">
                  <CpStoreIcon platform={platform} />
                  <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={selectClass}>
                    {STORE_PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {PLATFORM_LABELS[p]}
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
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">Badge Image</label>
              <FileUpload
                onFile={handleBadgeFile}
                accept={{ 'image/*': ['.png', '.svg', '.webp'] }}
                label="Upload store badge image"
                preview={badgePreview}
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={createLink.isPending || updateLink.isPending} className="bg-primary text-primary-foreground px-6 py-2 h-10 rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {editingId ? 'Save' : 'Add Link'}
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
            <Download className="w-7 h-7 text-foreground" />
          </div>
          <p className="text-muted-foreground italic">No store links yet. Add your first link.</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="cp-store-links">
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
                        {link.badge_image_url ? (
                          <img src={link.badge_image_url} alt={link.platform} className="h-10 w-auto object-contain" />
                        ) : (
                          <CpStoreIcon platform={link.platform} />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{PLATFORM_LABELS[link.platform] || link.platform}</div>
                          <div className="text-xs text-muted-foreground truncate">{link.url}</div>
                        </div>
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
        title="Delete Store Link"
        description="Are you sure you want to delete this store link?"
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
