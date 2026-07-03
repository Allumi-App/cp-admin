// Live preview of the branded email shell around the editable body — mirrors
// emailShell() in the CP site's send-booking-request server action. Placeholders
// are filled with sample data so Christina sees what the email actually looks like.

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
  const paragraphs = fill(body || '')
    .split(/\n{2,}/)
    .filter((p) => p.trim().length > 0)

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

        {/* Body — the editable content */}
        <div style={{ padding: '26px 32px 24px' }}>
          {paragraphs.length === 0 ? (
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: '#2C181066' }}>
              Your message will appear here…
            </p>
          ) : (
            paragraphs.map((p, i) => {
              const lines = p.split('\n')
              return (
                <p
                  key={i}
                  style={{
                    margin: i === paragraphs.length - 1 ? 0 : '0 0 14px',
                    fontSize: 14,
                    lineHeight: 1.65,
                    color: '#2C1810',
                  }}
                >
                  {lines.map((line, j) => (
                    <span key={j}>
                      {line}
                      {j < lines.length - 1 ? <br /> : null}
                    </span>
                  ))}
                </p>
              )
            })
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
