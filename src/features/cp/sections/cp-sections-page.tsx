import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useOrderedList } from '../lib/use-ordered-list'
import { GripVertical, ChevronDown, ChevronRight, Eye, EyeOff, Layout, ExternalLink } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { FileUpload } from '@/components/shared/file-upload'
import { supabaseCp } from '@/lib/supabase-cp'
import {
  useCpSections,
  useUpdateCpSection,
  useReorderCpSections,
  CP_SECTION_FIELDS,
  CP_SECTION_LABELS,
  CP_LINKED_SECTIONS,
  CP_IMAGE_SECTIONS,
  CP_TEXTAREA_FIELDS,
  getCpFieldLabel,
} from './use-cp-sections'
import type { CpSection, CpSectionField } from './use-cp-sections'

const inputClass =
  'w-full rounded-xl border border-input bg-white px-3 py-2 h-10 text-base md:text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_1px_#2C1810] transition-colors'
const textareaClass =
  'w-full rounded-xl border border-input bg-white px-3 py-2 text-base md:text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_1px_#2C1810] transition-colors resize-none'
const tabClass = (active: boolean) =>
  `px-4 py-2 h-10 rounded-xl text-sm font-medium transition-colors ${
    active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
  }`

function SectionCard({
  section,
  isExpanded,
  onToggleExpand,
  dragHandleProps,
}: {
  section: CpSection
  isExpanded: boolean
  onToggleExpand: () => void
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement> | null
}) {
  const updateSection = useUpdateCpSection()
  const [activeTab, setActiveTab] = useState<'en' | 'de'>('en')
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState(false)

  const linkedTo = CP_LINKED_SECTIONS[section.section_key]
  const fields = CP_SECTION_FIELDS[section.section_key] || []
  const hasImage = CP_IMAGE_SECTIONS.has(section.section_key)

  async function handleImage(file: File) {
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${section.section_key}/${crypto.randomUUID()}.${ext}`
      const { error } = await supabaseCp.storage.from('website-assets').upload(path, file, { upsert: true })
      if (error) throw error
      const { data } = supabaseCp.storage.from('website-assets').getPublicUrl(path)
      await updateSection.mutateAsync({ id: section.id, image_url: data.publicUrl })
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    const data: Record<string, string> = {}
    for (const field of fields) {
      data[field] = (section[field as keyof CpSection] as string) || ''
      data[`${field}_de`] = (section[`${field}_de` as keyof CpSection] as string) || ''
    }
    setFormData(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section])

  function handleChange(key: string, value: string) {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    const updates: Record<string, string | null> = {}
    for (const field of fields) {
      updates[field] = formData[field] || null
      updates[`${field}_de`] = formData[`${field}_de`] || null
    }
    await updateSection.mutateAsync({ id: section.id, ...updates })
  }

  async function handleToggleVisibility() {
    await updateSection.mutateAsync({ id: section.id, is_visible: !section.is_visible })
  }

  return (
    <div className="bg-card rounded-2xl border border-border/60">
      <div className="flex items-center gap-3 p-3.5">
        <div {...dragHandleProps} className="text-muted-foreground cursor-grab">
          <GripVertical className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-medium text-sm">
            {CP_SECTION_LABELS[section.section_key] || section.section_key}
          </span>
        </div>
        <button
          onClick={handleToggleVisibility}
          disabled={updateSection.isPending}
          className="text-muted-foreground p-1.5 rounded-lg hover:bg-black/[0.08] disabled:opacity-50 transition-colors"
          title={section.is_visible ? 'Visible' : 'Hidden'}
        >
          {section.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        {linkedTo ? (
          <Link
            to={linkedTo}
            className="text-muted-foreground p-1.5 rounded-lg hover:bg-black/[0.08] transition-colors"
            title="Edit on dedicated page"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        ) : (
          <button
            onClick={onToggleExpand}
            className="text-muted-foreground p-1.5 rounded-lg hover:bg-black/[0.08] transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}
      </div>

      {isExpanded && !linkedTo && (
        <div className="px-4 pb-4 pt-0 border-t border-border/40">
          {hasImage && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">Image</label>
              <FileUpload
                onFile={handleImage}
                accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.svg'] }}
                label={uploading ? 'Uploading...' : 'Upload section image'}
                preview={section.image_url}
              />
            </div>
          )}
          {fields.length > 0 && (
          <>
          <div className="flex gap-2 my-4">
            <button onClick={() => setActiveTab('en')} className={tabClass(activeTab === 'en')}>
              English
            </button>
            <button onClick={() => setActiveTab('de')} className={tabClass(activeTab === 'de')}>
              Deutsch
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((field: CpSectionField) => {
              const key = activeTab === 'en' ? field : `${field}_de`
              const isTextarea = CP_TEXTAREA_FIELDS.includes(field)
              return (
                <div key={key}>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                    {getCpFieldLabel(section.section_key, field, activeTab)}
                  </label>
                  {isTextarea ? (
                    <textarea
                      value={formData[key] || ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      rows={3}
                      className={textareaClass}
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData[key] || ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className={inputClass}
                    />
                  )}
                </div>
              )
            })}
          </div>

          <button
            onClick={handleSave}
            disabled={updateSection.isPending}
            className="mt-4 bg-primary text-primary-foreground px-6 py-2 h-10 rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {updateSection.isPending ? 'Saving...' : 'Save'}
          </button>
          </>
          )}
        </div>
      )}
    </div>
  )
}

export function CpSectionsPage() {
  const { data: serverSections, isLoading } = useCpSections()
  const reorderSections = useReorderCpSections()
  const { items: sections, onDragEnd } = useOrderedList(serverSections, reorderSections.mutate)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div>
      <PageHeader title="Page Sections" />

      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : !sections.length ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Layout className="w-7 h-7 text-foreground" />
          </div>
          <p className="text-muted-foreground italic">No sections found.</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="cp-sections">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {sections.map((section, index) => (
                  <Draggable key={section.id} draggableId={section.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={snapshot.isDragging ? 'shadow-lg rounded-2xl' : ''}
                      >
                        <SectionCard
                          section={section}
                          isExpanded={expandedIds.has(section.id)}
                          onToggleExpand={() => toggleExpand(section.id)}
                          dragHandleProps={provided.dragHandleProps}
                        />
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
    </div>
  )
}
