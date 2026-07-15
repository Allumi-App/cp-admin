import { PageHeader } from '@/components/shared/page-header'
import { useCpSections } from '../sections/use-cp-sections'
import { CpSectionEditor } from '../components/cp-section-editor'
import { CpListEditor } from '../components/cp-list-editor'
import { ecosystemCardsHooks, type CpEcosystemCard } from '../lib/cp-hooks'

export function CpEcosystemPage() {
  const { data: sections, isLoading } = useCpSections()
  const ecosystem = sections?.find((s) => s.section_key === 'ecosystem')

  return (
    <div>
      <PageHeader title="Ecosystem" />

      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : !ecosystem ? (
        <p className="text-muted-foreground italic">Ecosystem section not found.</p>
      ) : (
        <div className="space-y-8">
          <CpSectionEditor
            section={ecosystem}
            fields={[
              { name: 'eyebrow', label: 'Eyebrow' },
              { name: 'title', label: 'Title (line 1)' },
              { name: 'title_accent', label: 'Accent word' },
              { name: 'subtitle', label: 'Body', type: 'textarea' },
            ]}
          />

          <CpListEditor<CpEcosystemCard>
            heading="Product Cards"
            addLabel="Add Card"
            singularLabel="Card"
            emptyText="No product cards yet."
            hooks={ecosystemCardsHooks}
            fields={[
              {
                name: 'product',
                label: 'Product (image style)',
                type: 'select',
                options: [
                  { value: 'allumi', label: 'ALLUMI — App (phone mockup)' },
                  { value: 'show', label: 'The Show — Podcast (phone mockup)' },
                  { value: 'book', label: 'Unbecoming Human — Book (cover mockup)' },
                ],
              },
              { name: 'title', label: 'Title', bilingual: true, required: true, title: true },
              { name: 'description', label: 'Description', type: 'textarea', bilingual: true },
              { name: 'cta_label', label: 'Button label', bilingual: true },
              { name: 'url', label: 'Button link (URL)', placeholder: 'https://...' },
            ]}
          />
        </div>
      )}
    </div>
  )
}
