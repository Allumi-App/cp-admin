// Live preview of the branded email shell around the editable body — mirrors
// emailShell() + markdown rendering in the CP send-* edge functions. Placeholders
// are filled with sample data so Christina sees what the email actually looks like.
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

const SAMPLE: Record<string, string> = {
  firstName: 'Anna',
  lastName: 'Becker',
  email: 'anna.becker@email.com',
  phone: '+49 151 2345 6789',
  focus:
    "I've felt stuck in my career for a while and want help deciding whether to pivot into something more meaningful — how to approach the conversation with my partner, how to handle the financial uncertainty, and what a realistic first step looks like over the next month or two.",
  packageName: 'Single Session',
  packagePrice: '€120',
}

function fill(text: string): string {
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => SAMPLE[key] ?? `{{${key}}}`)
}

export function EmailPreview({ subject, body }: { subject: string; body: string }) {
  const filledSubject = fill(subject || '').trim()
  const filledBody = fill(body || '')

  return (
    <div style={{ background: '#FDF2F0', borderRadius: 16, padding: 20 }}>
      <div style={{ fontSize: 12, color: '#2C181099', marginBottom: 14 }}>
        <span style={{ fontWeight: 600, color: '#2C1810' }}>Subject:</span> {filledSubject || '—'}
      </div>

      <div
        style={{
          maxWidth: 480,
          marginLeft: 'auto',
          marginRight: 'auto',
          background: '#FFFDF9',
          border: '1px solid #2C18101A',
          borderRadius: 14,
          overflow: 'hidden',
        }}
      >
        {/* Header — fixed brand shell (the navbar wordmark) */}
        <div
          style={{
            padding: '28px 32px 22px',
            textAlign: 'center',
            borderBottom: '1px solid #2C18101A',
          }}
        >
          <div
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '-0.01em',
            }}
          >
            <span style={{ color: '#2C1810' }}>Christina</span>{' '}
            <span style={{ color: '#C49C40' }}>Pfeiffer</span>
          </div>
        </div>

        {/* Body — the editable content, rendered as markdown (matches the sent email) */}
        <div style={{ padding: '26px 32px 24px', fontSize: 14, lineHeight: 1.65, color: '#2C1810' }}>
          {filledBody.trim().length === 0 ? (
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: '#2C181066' }}>
              Your message will appear here…
            </p>
          ) : (
            <div
              className={[
                '[&_p]:my-0 [&_p]:mb-3.5 [&_p:last-child]:mb-0 [&_p]:leading-[1.65]',
                '[&_strong]:font-bold [&_em]:italic [&_u]:underline [&_del]:line-through',
                '[&_a]:text-[#C49C40] [&_a]:underline',
                '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:mb-1',
                '[&_h1]:text-lg [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-base [&_h2]:font-bold [&_h2]:mb-2 [&_h3]:font-semibold [&_h3]:mb-1',
                '[&_blockquote]:border-l-2 [&_blockquote]:border-[#2C181033] [&_blockquote]:pl-3 [&_blockquote]:italic',
                '[&_hr]:border-[#2C18101A] [&_hr]:my-4',
              ].join(' ')}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {filledBody}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer — fixed brand shell */}
        <div
          style={{
            padding: '16px 32px 24px',
            borderTop: '1px solid #2C18101A',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 11.5, fontWeight: 500, color: '#2C181099' }}>
            Christina Pfeiffer · Transformation Coaching
          </div>
          <div style={{ paddingTop: 6, fontSize: 10.5, lineHeight: 1.5, color: '#2C181066' }}>
            You received this because you requested a session at christinapfeiffer.com
          </div>
        </div>
      </div>
    </div>
  )
}
