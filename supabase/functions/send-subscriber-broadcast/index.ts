import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'
import { marked } from 'https://esm.sh/marked@12'

// Dashboard-triggered newsletter broadcast. The admin dashboard calls this with
// the admin's CP session token; RLS (is_admin) gates who can read subscribers, so
// a non-admin token reaches no one. Gmail creds come from function secrets.
//   Secrets required: GMAIL_USER, GMAIL_APP_PASSWORD
//   (SUPABASE_URL / SUPABASE_ANON_KEY are injected automatically.)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...CORS },
  })
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

interface Subscriber {
  email: string
  lang: string | null
  status: string
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ ok: false, error: 'UNAUTHORIZED' }, 401)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  // Client bound to the caller's session — RLS (is_admin()) gates the data.
  const db = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: userData } = await db.auth.getUser()
  if (!userData?.user) return json({ ok: false, error: 'UNAUTHORIZED' }, 401)

  let only: string[] | null = null
  try {
    const b = await req.json()
    if (b?.emails?.length) only = b.emails.map((e: string) => e.toLowerCase().trim())
  } catch (_e) {
    // no body -> broadcast to everyone
  }

  const { data: subsData, error: subsErr } = await db
    .from('subscribers')
    .select('email, lang, status')
    .eq('status', 'subscribed')
  if (subsErr) return json({ ok: false, error: subsErr.message }, 403)

  let subscribers = (subsData ?? []) as Subscriber[]
  if (only) subscribers = subscribers.filter((s) => only!.includes(s.email.toLowerCase()))
  if (!subscribers.length) return json({ ok: true, sent: 0, failed: 0, total: 0 })

  const { data: tplData } = await db
    .from('email_templates')
    .select('*')
    .eq('kind', 'subscriber_broadcast')
  const tpl = tplData?.[0]
  if (!tpl) return json({ ok: false, error: 'NO_BROADCAST_TEMPLATE' }, 400)

  const gmailUser = Deno.env.get('GMAIL_USER')
  const gmailPass = Deno.env.get('GMAIL_APP_PASSWORD')
  if (!gmailUser || !gmailPass) return json({ ok: false, error: 'MISSING_GMAIL_SECRETS' }, 500)

  const footer = 'You received this because you subscribed at christinapfeiffer.com. Reply to unsubscribe.'
  const client = new SMTPClient({
    connection: { hostname: 'smtp.gmail.com', port: 465, tls: true, auth: { username: gmailUser, password: gmailPass } },
  })

  let sent = 0
  let failed = 0
  for (const sub of subscribers) {
    const loc = sub.lang === 'de' ? 'de' : 'en'
    const vars = { email: sub.email, lang: loc }
    const bodyMd = pick(loc, tpl.body, tpl.body_de)
    try {
      await client.send({
        from: `Christina Pfeiffer <${gmailUser}>`,
        to: sub.email,
        subject: render(pick(loc, tpl.subject, tpl.subject_de), vars),
        content: render(bodyMd, vars),
        html: emailShell(bodyToHtml(render(bodyMd, escapeVars(vars))), footer),
      })
      sent++
    } catch (e) {
      failed++
      console.error('[send-subscriber-broadcast] failed for', sub.email, e)
    }
  }
  try {
    await client.close()
  } catch (_e) {
    // ignore close errors
  }

  return json({ ok: true, sent, failed, total: subscribers.length })
})
