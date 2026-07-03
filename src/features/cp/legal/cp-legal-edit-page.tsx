import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { PageHeader } from '@/components/shared/page-header'
import { MarkdownEditor } from '@/components/shared/markdown/markdown-editor'
import {
  useCpLegalDocument,
  useUpdateCpLegalDocument,
  CP_LEGAL_LABELS,
  type CpLegalDocument,
} from './use-cp-legal'

const inputClass =
  'w-full rounded-xl border border-input bg-white px-3 py-2 h-10 text-base md:text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_1px_#2C1810] transition-colors'
const tabClass = (active: boolean) =>
  `px-4 py-2 h-10 rounded-xl text-sm font-medium transition-colors ${
    active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
  }`

/** Inner form — state is initialized from the loaded doc (remounted via `key`). */
function LegalForm({ doc }: { doc: CpLegalDocument }) {
  const navigate = useNavigate()
  const updateDoc = useUpdateCpLegalDocument()

  const [activeTab, setActiveTab] = useState<'en' | 'de'>('en')
  const [title, setTitle] = useState(doc.title)
  const [titleDe, setTitleDe] = useState(doc.title_de)
  const [content, setContent] = useState(doc.content)
  const [contentDe, setContentDe] = useState(doc.content_de)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await updateDoc.mutateAsync({ id: doc.id, title, title_de: titleDe, content, content_de: contentDe })
    navigate('/cp/legal')
  }

  return (
    <div>
      <PageHeader title={`Edit ${CP_LEGAL_LABELS[doc.slug] || doc.slug}`} />

      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('en')} className={tabClass(activeTab === 'en')}>
          English
        </button>
        <button onClick={() => setActiveTab('de')} className={tabClass(activeTab === 'de')}>
          Deutsch
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {activeTab === 'en' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">Title (English) *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">Content (English)</label>
              <MarkdownEditor value={content} onChange={setContent} rows={20} />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">Title (Deutsch) *</label>
              <input type="text" value={titleDe} onChange={(e) => setTitleDe(e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">Content (Deutsch)</label>
              <MarkdownEditor value={contentDe} onChange={setContentDe} rows={20} />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={updateDoc.isPending}
          className="bg-primary text-primary-foreground px-6 py-2 h-10 rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {updateDoc.isPending ? 'Saving...' : 'Save Document'}
        </button>
      </form>
    </div>
  )
}

export function CpLegalEditPage() {
  const { id } = useParams<{ id: string }>()
  const { data: doc, isLoading } = useCpLegalDocument(id!)

  if (isLoading) return <div className="text-muted-foreground">Loading...</div>
  if (!doc) return <div className="text-destructive">Document not found</div>

  return <LegalForm key={doc.id} doc={doc} />
}
