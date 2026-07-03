import { PageHeader } from '@/components/shared/page-header'
import { useCpSections } from '../sections/use-cp-sections'
import { CpSectionEditor } from '../components/cp-section-editor'
import { CpListEditor } from '../components/cp-list-editor'
import { testimonialsHooks, type CpTestimonial } from '../lib/cp-hooks'

export function CpTestimonialsPage() {
  const { data: sections } = useCpSections()
  const section = sections?.find((s) => s.section_key === 'testimonials')

  return (
    <div>
      <PageHeader title="Testimonials" />

      <div className="space-y-8">
        {section && (
          <CpSectionEditor
            section={section}
            fields={[
              { name: 'eyebrow', label: 'Eyebrow' },
              { name: 'title', label: 'Title (line 1)' },
              { name: 'title_accent', label: 'Accent line' },
            ]}
          />
        )}

        <CpListEditor<CpTestimonial>
          heading="Testimonials"
          addLabel="Add Testimonial"
          singularLabel="Testimonial"
          emptyText="No testimonials yet. Add your first one."
          hooks={testimonialsHooks}
          fields={[
            { name: 'name', label: 'Name', required: true, title: true, placeholder: 'Lena M.' },
            { name: 'tag', label: 'Tag', bilingual: true, placeholder: 'Career change' },
            { name: 'quote', label: 'Quote', type: 'textarea', bilingual: true, required: true },
          ]}
        />
      </div>
    </div>
  )
}
