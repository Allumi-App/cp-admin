import { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import {
  useCpEmailTemplates,
  useUpdateCpEmailTemplate,
  CP_TEMPLATE_LABELS,
  CP_TEMPLATE_PLACEHOLDERS,
  type CpEmailTemplate,
} from './use-cp-email-templates'
import { EmailPreview } from './email-preview'
import { MarkdownEditor } from '@/components/shared/markdown/markdown-editor'

const inputClass =
  'w-full rounded-xl border border-input bg-white px-3 py-2 h-10 text-base md:text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_1px_#2C1810] transition-colors'
const tabClass = (active: boolean) =>
  `px-4 py-2 h-10 rounded-xl text-sm font-medium transition-colors ${
    active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
  }`

/** Inner card — state initialized from the loaded template (remounted via `key`). */
function TemplateCard({ template }: { template: CpEmailTemplate }) {
  const update = useUpdateCpEmailTemplate()
  const meta = CP_TEMPLATE_LABELS[template.kind] ?? { title: template.kind, description: '' }
  const isNotify = template.kind === 'notify_christina'

  const [activeTab, setActiveTab] = useState<'en' | 'de'>('en')
  const [toEmail, setToEmail] = useState(template.to_email ?? '')
  const [subject, setSubject] = useState(template.subject ?? '')
  const [subjectDe, setSubjectDe] = useState(template.subject_de ?? '')
  const [body, setBody] = useState(template.body ?? '')
  const [bodyDe, setBodyDe] = useState(template.body_de ?? '')

  const subjVal = activeTab === 'en' ? subject : subjectDe
  const bodyVal = activeTab === 'en' ? body : bodyDe
  const setSubj = activeTab === 'en' ? setSubject : setSubjectDe
  const setBod = activeTab === 'en' ? setBody : setBodyDe
  const langLabel = activeTab === 'en' ? 'English' : 'Deutsch'

  async function handleSave() {
    await update.mutateAsync({
      id: template.id,
      subject,
      subject_de: subjectDe,
      body,
      body_de: bodyDe,
      ...(isNotify ? { to_email: toEmail.trim() || null } : {}),
    })
  }

  return (
    <div className="bg-card rounded-2xl border border-border/60 p-6">
      <h3 className="font-semibold">{meta.title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{meta.description}</p>

      {isNotify && (
        <div className="mb-5">
          <label className="block text-sm font-medium text-foreground/80 mb-1.5">Send requests to</label>
          <input
            type="email"
            value={toEmail}
            onChange={(e) => setToEmail(e.target.value)}
            placeholder="christina@example.com"
            className={inputClass}
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
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1.5">Subject ({langLabel})</label>
          <input type="text" value={subjVal} onChange={(e) => setSubj(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1.5">Body ({langLabel})</label>
          <MarkdownEditor value={bodyVal} onChange={setBod} rows={12} />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={update.isPending}
        className="mt-4 bg-primary text-primary-foreground px-6 py-2 h-10 rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {update.isPending ? 'Saving...' : 'Save'}
      </button>

      <div className="mt-6 border-t border-border/60 pt-5">
        <div className="text-sm font-medium text-foreground/80 mb-3">
          Preview <span className="font-normal text-muted-foreground">— {langLabel}, with sample data</span>
        </div>
        <EmailPreview subject={subjVal} body={bodyVal} />
      </div>
    </div>
  )
}

const ORDER = ['notify_christina', 'confirm_visitor', 'subscribe_thankyou', 'subscriber_broadcast']

export function CpEmailTemplatesPage() {
  const { data, isLoading } = useCpEmailTemplates()

  const templates = [...(data ?? [])].sort(
    (a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind),
  )

  return (
    <div>
      <PageHeader title="Email Templates" />

      <div className="mb-6 rounded-2xl border border-border/60 bg-secondary/50 p-4 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Placeholders</span> — drop any of these into a
        subject or body and they're filled in automatically when the email is sent:
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {CP_TEMPLATE_PLACEHOLDERS.map((p) => (
            <code key={p} className="rounded-md border border-border/60 bg-card px-1.5 py-0.5 text-xs text-foreground">
              {`{{${p}}}`}
            </code>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : (
        <div className="space-y-6">
          {templates.map((t) => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </div>
      )}
    </div>
  )
}
