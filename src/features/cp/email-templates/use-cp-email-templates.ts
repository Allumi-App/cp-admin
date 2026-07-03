import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabaseCp } from '@/lib/supabase-cp'
import { toast } from 'sonner'

export type CpEmailTemplateKind =
  | 'notify_christina'
  | 'confirm_visitor'
  | 'subscribe_thankyou'
  | 'subscriber_broadcast'

export interface CpEmailTemplate {
  id: string
  kind: CpEmailTemplateKind
  subject: string | null
  subject_de: string | null
  body: string | null
  body_de: string | null
  to_email: string | null
  created_at: string
  updated_at: string
}

export const CP_TEMPLATE_LABELS: Record<string, { title: string; description: string }> = {
  notify_christina: {
    title: 'Notify Christina',
    description: 'Sent to you whenever a visitor requests a coaching package.',
  },
  confirm_visitor: {
    title: 'Visitor confirmation',
    description: 'Automatic reply sent to the person who submitted the request.',
  },
  subscribe_thankyou: {
    title: 'Subscription thank-you',
    description: 'Sent automatically when someone subscribes from the website.',
  },
  subscriber_broadcast: {
    title: 'Subscriber broadcast',
    description: 'The email sent to subscribers when you broadcast from the Subscribers page.',
  },
}

/** Tokens that get replaced when the email is sent. */
export const CP_TEMPLATE_PLACEHOLDERS = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'focus',
  'packageName',
  'packagePrice',
] as const

export function useCpEmailTemplates() {
  return useQuery({
    queryKey: ['cp', 'email_templates'],
    queryFn: async () => {
      const { data, error } = await supabaseCp.from('email_templates').select('*')
      if (error) throw error
      return data as CpEmailTemplate[]
    },
  })
}

export function useUpdateCpEmailTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CpEmailTemplate> & { id: string }) => {
      const { data, error } = await supabaseCp
        .from('email_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as CpEmailTemplate
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cp', 'email_templates'] })
      toast.success('Template saved')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
