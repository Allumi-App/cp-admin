import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useOrderedList } from '../lib/use-ordered-list'
import {
  Plus,
  GripVertical,
  Trash2,
  Pencil,
  X,
  ChevronDown,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { FileUpload } from '@/components/shared/file-upload'
import { supabaseCp } from '@/lib/supabase-cp'
import type { CpListHooks, CpListRow } from '../lib/make-list-hooks'

export interface CpFieldDef {
  name: string
  label: string
  type?: 'text' | 'textarea' | 'select' | 'image'
  /** Options for a `select` field (non-bilingual). */
  options?: { value: string; label: string }[]
  bilingual?: boolean
  required?: boolean
  placeholder?: string
  /** Use this field's value as the row's title in the collapsed list. */
  title?: boolean
}

const inputClass =
  'w-full rounded-xl border border-input bg-white px-3 py-2 h-10 text-base md:text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_1px_#2C1810] transition-colors'
const textareaClass =
  'w-full rounded-xl border border-input bg-white px-3 py-2 text-base md:text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_1px_#2C1810] transition-colors resize-none'
const selectClass =
  "w-full rounded-xl border border-input bg-white pl-3 pr-10 py-2 h-10 text-base md:text-sm focus:outline-none focus:border-primary focus:shadow-[0_0_0_1px_#2C1810] transition-colors appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[position:right_12px_center] bg-no-repeat"
const tabClass = (active: boolean) =>
  `px-4 py-2 h-10 rounded-xl text-sm font-medium transition-colors ${
    active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
  }`

export function CpListEditor<T extends CpListRow>({
  heading,
  addLabel,
  emptyText,
  singularLabel,
  fields,
  hooks,
  imageFolder = 'list',
}: {
  heading: string
  addLabel: string
  emptyText: string
  singularLabel: string
  fields: CpFieldDef[]
  hooks: CpListHooks<T>
  /** Storage folder (in the `website-assets` bucket) for uploaded image fields. */
  imageFolder?: string
}) {
  const { data: serverItems, isLoading } = hooks.useList()
  const createItem = hooks.useCreate()
  const updateItem = hooks.useUpdate()
  const deleteItem = hooks.useRemove()
  const reorderItems = hooks.useReorder()
  const { items, onDragEnd } = useOrderedList(serverItems, reorderItems.mutate)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'en' | 'de'>('en')
  const [form, setForm] = useState<Record<string, string>>({})
  // Freshly picked image files (keyed by field name) + their object-URL previews,
  // uploaded to storage on submit. Separate from `form` so we don't persist blob URLs.
  const [files, setFiles] = useState<Record<string, File>>({})
  const [previews, setPreviews] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState(false)

  const hasBilingual = fields.some((f) => f.bilingual)
  const titleField = fields.find((f) => f.title) ?? fields[0]

  function blankForm(): Record<string, string> {
    const data: Record<string, string> = {}
    for (const f of fields) {
      data[f.name] = f.type === 'select' && f.options?.length ? f.options[0].value : ''
      if (f.bilingual) data[`${f.name}_de`] = ''
    }
    return data
  }

  function openCreate() {
    setForm(blankForm())
    setFiles({})
    setPreviews({})
    setActiveTab('en')
    setEditingId(null)
    setShowForm(true)
  }

  function openEdit(row: T) {
    const data: Record<string, string> = {}
    for (const f of fields) {
      data[f.name] = (row[f.name] as string) || ''
      if (f.bilingual) data[`${f.name}_de`] = (row[`${f.name}_de`] as string) || ''
    }
    setForm(data)
    setFiles({})
    setPreviews({})
    setActiveTab('en')
    setEditingId(row.id)
    setShowForm(true)
  }

  function handleImageFile(name: string, file: File) {
    setFiles((prev) => ({ ...prev, [name]: file }))
    setPreviews((prev) => ({ ...prev, [name]: URL.createObjectURL(file) }))
  }

  function setField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setUploading(true)
    try {
      const values: Record<string, unknown> = {}
      for (const f of fields) {
        if (f.type === 'image' && files[f.name]) {
          const file = files[f.name]
          const ext = file.name.split('.').pop()
          const path = `${imageFolder}/${crypto.randomUUID()}.${ext}`
          const { error } = await supabaseCp.storage
            .from('website-assets')
            .upload(path, file, { upsert: true })
          if (error) throw error
          const { data } = supabaseCp.storage.from('website-assets').getPublicUrl(path)
          values[f.name] = data.publicUrl
        } else {
          values[f.name] = form[f.name] || null
        }
        if (f.bilingual) values[`${f.name}_de`] = form[`${f.name}_de`] || null
      }
      if (editingId) await updateItem.mutateAsync({ id: editingId, ...values })
      else await createItem.mutateAsync(values)
      setShowForm(false)
    } finally {
      setUploading(false)
    }
  }

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function renderField(f: CpFieldDef, lang: 'en' | 'de') {
    const key = lang === 'en' ? f.name : `${f.name}_de`
    return (
      <div key={key}>
        <label className="block text-sm font-medium text-foreground/80 mb-1.5">
          {f.label} ({lang === 'en' ? 'English' : 'Deutsch'})
          {f.required && lang === 'en' ? ' *' : ''}
        </label>
        {f.type === 'image' ? (
          <FileUpload
            onFile={(file) => handleImageFile(f.name, file)}
            accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
            label="Upload image"
            preview={previews[f.name] || form[f.name] || null}
          />
        ) : f.type === 'select' ? (
          <select
            value={form[key] || ''}
            onChange={(e) => setField(key, e.target.value)}
            className={selectClass}
          >
            {(f.options ?? []).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : f.type === 'textarea' ? (
          <textarea
            value={form[key] || ''}
            onChange={(e) => setField(key, e.target.value)}
            required={f.required && lang === 'en'}
            rows={3}
            placeholder={f.placeholder}
            className={textareaClass}
          />
        ) : (
          <input
            type="text"
            value={form[key] || ''}
            onChange={(e) => setField(key, e.target.value)}
            required={f.required && lang === 'en'}
            placeholder={f.placeholder}
            className={inputClass}
          />
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{heading}</h3>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 h-10 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {addLabel}
        </button>
      </div>

      {showForm && (
        <div className="mb-4 bg-card rounded-2xl border border-border/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">{editingId ? `Edit ${singularLabel}` : `New ${singularLabel}`}</h4>
            <button
              onClick={() => setShowForm(false)}
              className="text-foreground p-1.5 rounded-lg hover:bg-black/[0.08] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {hasBilingual && (
            <div className="flex gap-2 mb-4">
              <button onClick={() => setActiveTab('en')} className={tabClass(activeTab === 'en')}>
                English
              </button>
              <button onClick={() => setActiveTab('de')} className={tabClass(activeTab === 'de')}>
                Deutsch
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {(!hasBilingual || activeTab === 'en'
              ? fields
              : fields.filter((f) => f.bilingual)
            ).map((f) => renderField(f, hasBilingual ? activeTab : 'en'))}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createItem.isPending || updateItem.isPending || uploading}
                className="bg-primary text-primary-foreground px-6 py-2 h-10 rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {uploading ? 'Uploading...' : editingId ? 'Save' : addLabel}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 h-10 rounded-xl text-sm font-medium border border-border hover:bg-black/[0.08] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : !items.length ? (
        <p className="text-muted-foreground italic py-6">{emptyText}</p>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={`cp-list-${heading}`}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {items.map((item, index) => {
                  const isExpanded = expandedIds.has(item.id)
                  return (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`bg-card rounded-2xl border border-border/60 transition-shadow ${
                            snapshot.isDragging ? 'shadow-lg' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3 p-3.5">
                            <div {...provided.dragHandleProps} className="text-muted-foreground cursor-grab">
                              <GripVertical className="w-4 h-4" />
                            </div>
                            <button onClick={() => toggleExpand(item.id)} className="text-muted-foreground p-0.5">
                              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">
                                {(item[titleField.name] as string) || '—'}
                              </div>
                            </div>
                            <button
                              onClick={() => openEdit(item)}
                              className="text-foreground p-1.5 rounded-lg hover:bg-black/[0.08] transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            {deleteItem.isPending && deleteItem.variables === item.id ? (
                              <div className="p-1.5">
                                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteId(item.id)}
                                className="text-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          {isExpanded && (
                            <div className="px-4 pb-4 pt-0 border-t border-border/40 mx-3.5 space-y-2">
                              {fields
                                .filter((f) => !f.title)
                                .map((f) => {
                                  const en = item[f.name] as string
                                  const de = f.bilingual ? (item[`${f.name}_de`] as string) : null
                                  if (!en && !de) return null
                                  if (f.type === 'image') {
                                    return (
                                      <div key={f.name} className="mt-3">
                                        <div className="text-xs font-medium text-foreground/60">{f.label}</div>
                                        <img
                                          src={en}
                                          alt={f.label}
                                          className="mt-1 h-20 w-20 rounded-2xl border border-border object-contain"
                                        />
                                      </div>
                                    )
                                  }
                                  return (
                                    <div key={f.name} className="mt-3">
                                      <div className="text-xs font-medium text-foreground/60">{f.label}</div>
                                      {en && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{en}</p>}
                                      {de && (
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap italic">{de}</p>
                                      )}
                                    </div>
                                  )
                                })}
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  )
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title={`Delete ${singularLabel}`}
        description={`Are you sure you want to delete this ${singularLabel.toLowerCase()}?`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (deleteId) {
            deleteItem.mutate(deleteId)
            setDeleteId(null)
          }
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
