import { PageHeader } from '@/components/shared/page-header'
import { CpListEditor } from '../components/cp-list-editor'
import { faqHooks, type CpFaqItem } from '../lib/cp-hooks'

export function CpFaqPage() {
  return (
    <div>
      <PageHeader title="FAQ" />
      <CpListEditor<CpFaqItem>
        heading="FAQ"
        addLabel="Add FAQ"
        singularLabel="FAQ item"
        emptyText="No FAQ items yet. Add your first one."
        hooks={faqHooks}
        fields={[
          { name: 'question', label: 'Question', bilingual: true, required: true, title: true },
          { name: 'answer', label: 'Answer', type: 'textarea', bilingual: true, required: true },
        ]}
      />
    </div>
  )
}
