import { PageHeader } from '@/components/shared/page-header'
import { useCpSections } from '../sections/use-cp-sections'
import { CpSectionEditor } from '../components/cp-section-editor'
import { CpListEditor } from '../components/cp-list-editor'
import { aboutStatsHooks, type CpAboutStat } from '../lib/cp-hooks'

export function CpAboutPage() {
  const { data: sections, isLoading } = useCpSections()
  const about = sections?.find((s) => s.section_key === 'about')

  return (
    <div>
      <PageHeader title="About" />

      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : !about ? (
        <p className="text-muted-foreground italic">About section not found.</p>
      ) : (
        <div className="space-y-8">
          <CpSectionEditor
            section={about}
            withImage
            imageLabel="Upload about photo"
            fields={[
              { name: 'eyebrow', label: 'Eyebrow' },
              { name: 'title', label: 'Title (line 1)' },
              { name: 'title_accent', label: 'Accent line' },
              { name: 'subtitle', label: 'Paragraph 1', type: 'textarea' },
              { name: 'body', label: 'Paragraph 2', type: 'textarea' },
              { name: 'trust', label: 'Badge' },
            ]}
          />

          <CpListEditor<CpAboutStat>
            heading="Stats"
            addLabel="Add Stat"
            singularLabel="Stat"
            emptyText="No stats yet."
            hooks={aboutStatsHooks}
            fields={[
              { name: 'value', label: 'Value', required: true, title: true, placeholder: '200+' },
              { name: 'label', label: 'Label', bilingual: true, placeholder: 'sessions held' },
            ]}
          />
        </div>
      )}
    </div>
  )
}
