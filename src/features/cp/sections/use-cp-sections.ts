import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabaseCp } from '@/lib/supabase-cp'
import { toast } from 'sonner'

export interface CpSection {
  id: string
  section_key: string
  eyebrow: string | null
  eyebrow_de: string | null
  title: string | null
  title_de: string | null
  title_accent: string | null
  title_accent_de: string | null
  title_suffix: string | null
  title_suffix_de: string | null
  subtitle: string | null
  subtitle_de: string | null
  body: string | null
  body_de: string | null
  cta_primary: string | null
  cta_primary_de: string | null
  cta_secondary: string | null
  cta_secondary_de: string | null
  trust: string | null
  trust_de: string | null
  image_url: string | null
  is_visible: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export type CpSectionField =
  | 'eyebrow'
  | 'title'
  | 'title_accent'
  | 'title_suffix'
  | 'subtitle'
  | 'body'
  | 'cta_primary'
  | 'cta_secondary'
  | 'trust'

/** Which fields each section exposes in the editor. about/approach/testimonials are edited on their own pages. */
export const CP_SECTION_FIELDS: Record<string, CpSectionField[]> = {
  hero: ['eyebrow', 'title', 'title_accent', 'subtitle', 'cta_primary', 'cta_secondary', 'trust'],
  allumi: ['eyebrow', 'title', 'title_accent', 'subtitle', 'cta_secondary'],
  show: ['eyebrow', 'title', 'title_accent', 'subtitle'],
  final_cta: ['eyebrow', 'title', 'subtitle', 'cta_primary', 'cta_secondary'],
  footer: ['subtitle', 'body'],
}

export const CP_SECTION_LABELS: Record<string, string> = {
  hero: 'Hero',
  approach: 'Coaching',
  ecosystem: 'Ecosystem',
  allumi: 'ALLUMI App',
  show: 'The Show',
  testimonials: 'Testimonials',
  about: 'About',
  final_cta: 'Final CTA',
  footer: 'Footer',
}

/** Sections edited on a dedicated page instead of inline. */
export const CP_LINKED_SECTIONS: Record<string, string> = {
  about: '/cp/about',
  approach: '/cp/approach',
  ecosystem: '/cp/ecosystem',
  testimonials: '/cp/testimonials',
}

/** Sections that expose an image upload in the inline editor. */
export const CP_IMAGE_SECTIONS = new Set(['allumi', 'show'])

/** Per-section, per-field label overrides (otherwise the field name is title-cased). */
const CP_FIELD_LABELS: Record<string, Partial<Record<CpSectionField, string>>> = {
  hero: { title: 'Title (line 1)', title_accent: 'Accent word', cta_primary: 'Primary button', cta_secondary: 'Secondary link', trust: 'Trust line' },
  allumi: { title: 'Title (line 1)', title_accent: 'Accent word', cta_secondary: 'Link text' },
  show: { title: 'Title (line 1)', title_accent: 'Accent word' },
  testimonials: { title: 'Title (line 1)', title_accent: 'Accent word' },
  final_cta: { subtitle: 'Body', cta_primary: 'Button', cta_secondary: 'Newsletter note' },
  footer: { subtitle: 'Tagline', body: 'Copyright' },
}

export function getCpFieldLabel(sectionKey: string, field: CpSectionField, lang: 'en' | 'de'): string {
  const override = CP_FIELD_LABELS[sectionKey]?.[field]
  const base = override || field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return `${base} (${lang === 'en' ? 'English' : 'Deutsch'})`
}

/** Fields rendered as a textarea rather than a single-line input. */
export const CP_TEXTAREA_FIELDS: CpSectionField[] = ['subtitle', 'body']

export function useCpSections() {
  return useQuery({
    queryKey: ['cp', 'sections'],
    queryFn: async () => {
      const { data, error } = await supabaseCp
        .from('sections')
        .select('*')
        .order('display_order', { ascending: true })
      if (error) throw error
      return data as CpSection[]
    },
  })
}

export function useUpdateCpSection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (section: Partial<CpSection> & { id: string }) => {
      const { id, ...updates } = section
      const { data, error } = await supabaseCp
        .from('sections')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as CpSection
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cp', 'sections'] })
      toast.success('Section updated')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useReorderCpSections() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(
        ids.map((id, index) => supabaseCp.from('sections').update({ display_order: index }).eq('id', id)),
      )
    },
    onMutate: async (ids: string[]) => {
      const prev = queryClient.getQueryData<CpSection[]>(['cp', 'sections'])
      if (prev) {
        const byId = new Map(prev.map((it) => [it.id, it]))
        // Reuse the same objects, just reordered (cloning stutters the drop).
        const next = ids.map((id) => byId.get(id)).filter((it): it is CpSection => Boolean(it))
        queryClient.setQueryData(['cp', 'sections'], next)
      }
      return { prev }
    },
    onError: (err: Error, _ids: string[], ctx?: { prev?: CpSection[] }) => {
      if (ctx?.prev) queryClient.setQueryData(['cp', 'sections'], ctx.prev)
      queryClient.invalidateQueries({ queryKey: ['cp', 'sections'] })
      toast.error(err.message)
    },
  })
}
