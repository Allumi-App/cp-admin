import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { supabaseCp } from '@/lib/supabase-cp'
import { FileUpload } from '@/components/shared/file-upload'
import { useUpdateCpSection } from '../sections/use-cp-sections'
import type { CpSection } from '../sections/use-cp-sections'

export interface CpSectionFieldDef {
  name: string
  label: string
  type?: 'text' | 'textarea'
}

const inputClass =
  'w-full rounded-xl border border-input bg-white px-3 py-2 h-10 text-base md:text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_1px_#2C1810] transition-colors'
const textareaClass =
  'w-full rounded-xl border border-input bg-white px-3 py-2 text-base md:text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_1px_#2C1810] transition-colors resize-none'
const tabClass = (active: boolean) =>
  `px-4 py-2 h-10 rounded-xl text-sm font-medium transition-colors ${
    active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
  }`

/** Edits the bilingual text fields (and optional image) of a single CP section row. */
export function CpSectionEditor({
  section,
  fields,
  withImage = false,
  imageLabel = 'Upload image',
}: {
  section: CpSection
  fields: CpSectionFieldDef[]
  withImage?: boolean
  imageLabel?: string
}) {
  const updateSection = useUpdateCpSection()
  const [activeTab, setActiveTab] = useState<'en' | 'de'>('en')
  const [form, setForm] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const data: Record<string, string> = {}
    for (const f of fields) {
      data[f.name] = (section[f.name as keyof CpSection] as string) || ''
      data[`${f.name}_de`] = (section[`${f.name}_de` as keyof CpSection] as string) || ''
    }
    setForm(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section])

  function setField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    const updates: Record<string, string | null> = {}
    for (const f of fields) {
      updates[f.name] = form[f.name] || null
      updates[`${f.name}_de`] = form[`${f.name}_de`] || null
    }
    await updateSection.mutateAsync({ id: section.id, ...updates })
  }

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

  return (
    <div className="bg-card rounded-2xl border border-border/60 p-6">
      {withImage && (
        <div className="mb-5">
          <label className="block text-sm font-medium text-foreground/80 mb-1.5">Photo</label>
          <FileUpload
            onFile={handleImage}
            accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
            label={uploading ? 'Uploading...' : imageLabel}
            preview={section.image_url}
          />
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab('en')} className={tabClass(activeTab === 'en')}>
          English
        </button>
        <button onClick={() => setActiveTab('de')} className={tabClass(activeTab === 'de')}>
          Deutsch
        </button>
      </div>

      <div className="space-y-4">
        {fields.map((f) => {
          const key = activeTab === 'en' ? f.name : `${f.name}_de`
          return (
            <div key={key}>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                {f.label} ({activeTab === 'en' ? 'English' : 'Deutsch'})
              </label>
              {f.type === 'textarea' ? (
                <textarea
                  value={form[key] || ''}
                  onChange={(e) => setField(key, e.target.value)}
                  rows={3}
                  className={textareaClass}
                />
              ) : (
                <input
                  type="text"
                  value={form[key] || ''}
                  onChange={(e) => setField(key, e.target.value)}
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
    </div>
  )
}
