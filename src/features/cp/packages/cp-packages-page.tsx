import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Plus, GripVertical, Trash2, Pencil, X, Tag, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { useOrderedList } from '../lib/use-ordered-list'
import { packagesHooks, type CpPackage } from './use-cp-packages'

const inputClass =
  'w-full rounded-xl border border-input bg-white px-3 py-2 h-10 text-base md:text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_1px_#2C1810] transition-colors'
const textareaClass =
  'w-full rounded-xl border border-input bg-white px-3 py-2 text-base md:text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_1px_#2C1810] transition-colors resize-none'
const tabClass = (active: boolean) =>
  `px-4 py-2 h-10 rounded-xl text-sm font-medium transition-colors ${
    active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
  }`
const labelClass = 'block text-sm font-medium text-foreground/80 mb-1.5'

const formatEuro = (cents: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(
    cents / 100,
  )

interface FormState {
  slug: string
  priceEuros: string
  sessionCount: string
  duration: string
  segment: string
  segment_de: string
  name: string
  name_de: string
  description: string
  description_de: string
  included: string
  included_de: string
}

const blank: FormState = {
  slug: '',
  priceEuros: '',
  sessionCount: '1',
  duration: '60',
  segment: '',
  segment_de: '',
  name: '',
  name_de: '',
  description: '',
  description_de: '',
  included: '',
  included_de: '',
}

function toForm(p: CpPackage): FormState {
  return {
    slug: p.slug || '',
    priceEuros: String(Math.round(p.price_cents / 100)),
    sessionCount: String(p.session_count),
    duration: String(p.duration),
    segment: p.segment || '',
    segment_de: p.segment_de || '',
    name: p.name || '',
    name_de: p.name_de || '',
    description: p.description || '',
    description_de: p.description_de || '',
    included: (p.included || []).join('\n'),
    included_de: (p.included_de || []).join('\n'),
  }
}

function toValues(f: FormState) {
  const lines = (s: string) =>
    s
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
  return {
    slug: f.slug || null,
    price_cents: Math.round((parseFloat(f.priceEuros) || 0) * 100),
    session_count: parseInt(f.sessionCount, 10) || 1,
    duration: parseInt(f.duration, 10) || 60,
    segment: f.segment || null,
    segment_de: f.segment_de || null,
    name: f.name || null,
    name_de: f.name_de || null,
    description: f.description || null,
    description_de: f.description_de || null,
    included: lines(f.included),
    included_de: lines(f.included_de),
  }
}

export function CpPackagesPage() {
  const { data: serverPackages, isLoading } = packagesHooks.useList()
  const createPkg = packagesHooks.useCreate()
  const updatePkg = packagesHooks.useUpdate()
  const deletePkg = packagesHooks.useRemove()
  const reorderPkgs = packagesHooks.useReorder()
  const { items: packages, onDragEnd } = useOrderedList(serverPackages, reorderPkgs.mutate)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'en' | 'de'>('en')
  const [form, setForm] = useState<FormState>(blank)

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function openCreate() {
    setForm(blank)
    setActiveTab('en')
    setEditingId(null)
    setShowForm(true)
  }

  function openEdit(p: CpPackage) {
    setForm(toForm(p))
    setActiveTab('en')
    setEditingId(p.id)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const values = toValues(form)
    if (editingId) await updatePkg.mutateAsync({ id: editingId, ...values })
    else await createPkg.mutateAsync(values)
    setShowForm(false)
  }


  return (
    <div>
      <PageHeader
        title="Packages"
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 h-10 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Package
          </button>
        }
      />

      {showForm && (
        <div className="mb-6 bg-card rounded-2xl border border-border/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{editingId ? 'Edit Package' : 'New Package'}</h3>
            <button onClick={() => setShowForm(false)} className="text-foreground p-1.5 rounded-lg hover:bg-black/[0.08] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className={labelClass}>Price (€) *</label>
                <input type="number" min="0" step="1" value={form.priceEuros} onChange={(e) => set('priceEuros', e.target.value)} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Sessions *</label>
                <input type="number" min="1" step="1" value={form.sessionCount} onChange={(e) => set('sessionCount', e.target.value)} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Minutes / session</label>
                <input type="number" min="1" step="5" value={form.duration} onChange={(e) => set('duration', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Slug</label>
                <input type="text" value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="single" className={inputClass} />
              </div>
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={() => setActiveTab('en')} className={tabClass(activeTab === 'en')}>English</button>
              <button type="button" onClick={() => setActiveTab('de')} className={tabClass(activeTab === 'de')}>Deutsch</button>
            </div>

            {activeTab === 'en' ? (
              <>
                <div>
                  <label className={labelClass}>Name (English) *</label>
                  <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Segment label (English)</label>
                  <input type="text" value={form.segment} onChange={(e) => set('segment', e.target.value)} placeholder="Single session" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Description (English)</label>
                  <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} className={textareaClass} />
                </div>
                <div>
                  <label className={labelClass}>What's included (English) — one per line</label>
                  <textarea value={form.included} onChange={(e) => set('included', e.target.value)} rows={4} className={textareaClass} />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className={labelClass}>Name (Deutsch)</label>
                  <input type="text" value={form.name_de} onChange={(e) => set('name_de', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Segment label (Deutsch)</label>
                  <input type="text" value={form.segment_de} onChange={(e) => set('segment_de', e.target.value)} placeholder="Einzelsitzung" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Description (Deutsch)</label>
                  <textarea value={form.description_de} onChange={(e) => set('description_de', e.target.value)} rows={3} className={textareaClass} />
                </div>
                <div>
                  <label className={labelClass}>What's included (Deutsch) — one per line</label>
                  <textarea value={form.included_de} onChange={(e) => set('included_de', e.target.value)} rows={4} className={textareaClass} />
                </div>
              </>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createPkg.isPending || updatePkg.isPending}
                className="bg-primary text-primary-foreground px-6 py-2 h-10 rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {editingId ? 'Save' : 'Add Package'}
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
      ) : !packages.length ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Tag className="w-7 h-7 text-foreground" />
          </div>
          <p className="text-muted-foreground italic">No packages yet. Add your first one.</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="cp-packages">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {packages.map((p, index) => (
                  <Draggable key={p.id} draggableId={p.id} index={index}>
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
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{p.name || p.slug || '—'}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatEuro(p.price_cents)} · {p.session_count} session{p.session_count === 1 ? '' : 's'} · {p.duration} min
                          </div>
                        </div>
                        <button onClick={() => openEdit(p)} className="text-foreground p-1.5 rounded-lg hover:bg-black/[0.08] transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        {deletePkg.isPending && deletePkg.variables === p.id ? (
                          <div className="p-1.5">
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          </div>
                        ) : (
                          <button onClick={() => setDeleteId(p.id)} className="text-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
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
        title="Delete Package"
        description="Are you sure you want to delete this package?"
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (deleteId) {
            deletePkg.mutate(deleteId)
            setDeleteId(null)
          }
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
