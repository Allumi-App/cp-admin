import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'
import { marked } from 'https://esm.sh/marked@12'

// Public booking-request handler. Records the lead (anon RPC) and emails Christina
// + the visitor using dashboard-editable templates. Gmail creds come from secrets.
//   Secrets required: GMAIL_USER, GMAIL_APP_PASSWORD

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...CORS } })
}
function render(tpl: string | null, vars: Record<string, string>): string {
  return (tpl ?? '').replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, k) => vars[k] ?? '')
}
function htmlEscape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
// Untrusted variable values are html-escaped before substitution into the
// (admin-authored) markdown template, so a value can't inject markup into emails.
function escapeVars(vars: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(vars).map(([k, v]) => [k, htmlEscape(String(v ?? ''))]))
}
// Render the markdown body (bold/italic/lists/links; raw <u> for underline) to
// HTML. Single newlines become <br> to match the dashboard editor preview.
function bodyToHtml(md: string): string {
  return marked.parse(md, { breaks: true, gfm: true }) as string
}
function emailShell(bodyHtml: string, footer: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#FDF2F0;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#FFFDF9;border:1px solid #2C18101A;border-radius:18px;overflow:hidden;">
      <tr><td style="padding:38px 40px 30px;text-align:center;border-bottom:1px solid #2C18101A;">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:25px;font-weight:700;letter-spacing:-0.01em;"><span style="color:#2C1810;">Christina</span> <span style="color:#C49C40;">Pfeiffer</span></div>
      </td></tr>
      <tr><td style="padding:34px 40px 30px;color:#2C1810;font-size:15px;line-height:1.65;font-family:Helvetica,Arial,sans-serif;">${bodyHtml}</td></tr>
      <tr><td style="padding:22px 40px 30px;border-top:1px solid #2C18101A;text-align:center;">
        <div style="font-size:12px;font-weight:500;color:#2C181099;">Christina Pfeiffer &middot; Transformation Coaching</div>
        <div style="padding-top:7px;font-size:11px;line-height:1.5;color:#2C181066;">${htmlEscape(footer)}</div>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`
}
function pick(lang: string, en: string | null, de: string | null): string {
  return lang === 'de' ? de || en || '' : en || ''
}

const FOOTER = 'You received this because you requested a session at christinapfeiffer.com'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  let payload
  try {
    payload = await req.json()
  } catch (_e) {
    return json({ ok: false, error: 'BAD_REQUEST' }, 400)
  }

  const customer = payload?.customer ?? {}
  const lang = payload?.lang === 'de' ? 'de' : 'en'
  if (!customer.firstName || !customer.email) {
    return json({ ok: false, emailed: false, error: 'Missing required fields.' }, 400)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const db = createClient(supabaseUrl, anonKey)

  // Record the lead (best-effort).
  const { error: recErr } = await db.rpc('submit_booking_request', {
    p_package_slug: payload.packageSlug ?? null,
    p_package_name: payload.packageName ?? null,
    p_first_name: customer.firstName ?? null,
    p_last_name: customer.lastName ?? null,
    p_email: customer.email ?? null,
    p_phone: customer.phone ?? null,
    p_focus: customer.focus ?? null,
    p_lang: lang,
  })
  if (recErr) console.error('[send-booking-request] record failed:', recErr.message)

  const vars: Record<string, string> = {
    firstName: customer.firstName ?? '',
    lastName: customer.lastName ?? '',
    email: customer.email ?? '',
    phone: customer.phone ?? '',
    focus: customer.focus ?? '',
    packageName: payload.packageName ?? payload.packageSlug ?? '',
    packagePrice: payload.packagePrice ?? '',
    lang,
  }

  let emailed = false
  let emailError = ''
  try {
    const gmailUser = Deno.env.get('GMAIL_USER')
    const gmailPass = Deno.env.get('GMAIL_APP_PASSWORD')
    if (!gmailUser || !gmailPass) throw new Error('MISSING_GMAIL_SECRETS')

    const { data: templates } = await db.from('email_templates').select('*')
    const notify = templates?.find((t: { kind: string }) => t.kind === 'notify_christina')
    const confirm = templates?.find((t: { kind: string }) => t.kind === 'confirm_visitor')
    if (!notify && !confirm) throw new Error('NO_EMAIL_TEMPLATES')

    const client = new SMTPClient({
      connection: { hostname: 'smtp.gmail.com', port: 465, tls: true, auth: { username: gmailUser, password: gmailPass } },
    })

    if (notify) {
      const bodyMd = pick(lang, notify.body, notify.body_de)
      await client.send({
        from: `Christina Pfeiffer Website <${gmailUser}>`,
        to: notify.to_email || gmailUser,
        replyTo: customer.email,
        subject: render(pick(lang, notify.subject, notify.subject_de), vars),
        content: render(bodyMd, vars),
        html: emailShell(bodyToHtml(render(bodyMd, escapeVars(vars))), FOOTER),
      })
    }
    if (confirm) {
      const bodyMd = pick(lang, confirm.body, confirm.body_de)
      await client.send({
        from: `Christina Pfeiffer <${gmailUser}>`,
        to: customer.email,
        subject: render(pick(lang, confirm.subject, confirm.subject_de), vars),
        content: render(bodyMd, vars),
        html: emailShell(bodyToHtml(render(bodyMd, escapeVars(vars))), FOOTER),
      })
    }
    try { await client.close() } catch (_e) { /* ignore */ }
    emailed = true
  } catch (e) {
    emailError = e instanceof Error ? e.message : String(e)
    console.error('[send-booking-request] email failed:', emailError)
  }

  return json({ ok: true, emailed, emailError: emailError || undefined })
})
