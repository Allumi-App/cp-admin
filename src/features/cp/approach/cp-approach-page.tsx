import { PageHeader } from '@/components/shared/page-header'
import { useCpSections } from '../sections/use-cp-sections'
import { CpSectionEditor } from '../components/cp-section-editor'
import { CpListEditor } from '../components/cp-list-editor'
import { approachPillarsHooks, type CpApproachPillar } from '../lib/cp-hooks'

export function CpApproachPage() {
  const { data: sections, isLoading } = useCpSections()
  const approach = sections?.find((s) => s.section_key === 'approach')

  return (
    <div>
      <PageHeader title="Coaching Pillars" />

      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : !approach ? (
        <p className="text-muted-foreground italic">Coaching section not found.</p>
      ) : (
        <div className="space-y-8">
          <CpSectionEditor
            section={approach}
            fields={[
              { name: 'eyebrow', label: 'Eyebrow' },
              { name: 'title', label: 'Title (line 1)' },
              { name: 'title_accent', label: 'Accent word' },
              { name: 'title_suffix', label: 'Title (suffix)' },
              { name: 'subtitle', label: 'Body', type: 'textarea' },
              { name: 'cta_primary', label: 'Button' },
            ]}
          />

          <CpListEditor<CpApproachPillar>
            heading="Pillars"
            addLabel="Add Pillar"
            singularLabel="Pillar"
            emptyText="No pillars yet."
            hooks={approachPillarsHooks}
            fields={[
              { name: 'label', label: 'Label', bilingual: true, placeholder: '01 — What it is' },
              { name: 'title', label: 'Title', bilingual: true, required: true, title: true },
              { name: 'body', label: 'Body', type: 'textarea', bilingual: true },
            ]}
          />
        </div>
      )}
    </div>
  )
}
