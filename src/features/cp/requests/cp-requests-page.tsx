import { useState } from 'react'
import { Inbox, Flag, MailCheck, RotateCcw, Archive, Trash2, Phone } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import {
  useCpRequests,
  useUpdateCpRequests,
  useDeleteCpRequests,
  type CpBookingRequest,
  type CpRequestStatus,
} from './use-cp-requests'

const FILTERS: { key: CpRequestStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'replied', label: 'Replied' },
  { key: 'archived', label: 'Archived' },
]

const STATUS_BADGE: Record<CpRequestStatus, string> = {
  new: 'bg-primary/10 text-primary',
  replied: 'bg-emerald-500/12 text-emerald-700',
  archived: 'bg-muted text-muted-foreground',
}

function tabClass(active: boolean) {
  return `px-3.5 py-2 h-9 rounded-xl text-sm font-medium transition-colors ${
    active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
  }`
}

function actionBtn(extra = '') {
  return `flex items-center gap-1.5 px-3 py-2 h-9 rounded-xl text-sm font-medium border border-border hover:bg-black/[0.08] transition-colors ${extra}`
}

function fullName(r: CpBookingRequest) {
  return [r.first_name, r.last_name].filter(Boolean).join(' ') || '(no name)'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function CpRequestsPage() {
  const { data: requests, isLoading } = useCpRequests()
  const update = useUpdateCpRequests()
  const del = useDeleteCpRequests()

  const [filter, setFilter] = useState<CpRequestStatus | 'all'>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmDelete, setConfirmDelete] = useState(false)

  const all = requests ?? []
  const counts = {
    all: all.length,
    new: all.filter((r) => r.status === 'new').length,
    replied: all.filter((r) => r.status === 'replied').length,
    archived: all.filter((r) => r.status === 'archived').length,
  }
  const list = filter === 'all' ? all : all.filter((r) => r.status === filter)

  const selectedIds = [...selected]
  const allVisibleSelected = list.length > 0 && list.every((r) => selected.has(r.id))

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAllVisible() {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allVisibleSelected) list.forEach((r) => next.delete(r.id))
      else list.forEach((r) => next.add(r.id))
      return next
    })
  }

  function bulkStatus(status: CpRequestStatus) {
    update.mutate({ ids: selectedIds, patch: { status } }, { onSuccess: () => setSelected(new Set()) })
  }

  function bulkFlag(is_flagged: boolean) {
    update.mutate({ ids: selectedIds, patch: { is_flagged } }, { onSuccess: () => setSelected(new Set()) })
  }

  function toggleFlag(r: CpBookingRequest) {
    update.mutate({ ids: [r.id], patch: { is_flagged: !r.is_flagged } })
  }

  return (
    <div>
      <PageHeader title="Requests" />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {FILTERS.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={tabClass(filter === f.key)}>
            {f.label}
            <span className="ml-1.5 text-xs opacity-70">{counts[f.key]}</span>
          </button>
        ))}
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4 rounded-2xl border border-border/60 bg-card p-3">
          <span className="text-sm font-medium px-1">{selected.size} selected</span>
          <button onClick={() => bulkStatus('replied')} className={actionBtn()}>
            <MailCheck className="w-4 h-4" /> Mark replied
          </button>
          <button onClick={() => bulkStatus('new')} className={actionBtn()}>
            <RotateCcw className="w-4 h-4" /> Mark new
          </button>
          <button onClick={() => bulkFlag(true)} className={actionBtn()}>
            <Flag className="w-4 h-4" /> Flag
          </button>
          <button onClick={() => bulkFlag(false)} className={actionBtn()}>
            <Flag className="w-4 h-4" /> Unflag
          </button>
          <button onClick={() => bulkStatus('archived')} className={actionBtn()}>
            <Archive className="w-4 h-4" /> Archive
          </button>
          <button onClick={() => setConfirmDelete(true)} className={actionBtn('text-destructive hover:bg-destructive/10')}>
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : !list.length ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Inbox className="w-7 h-7 text-foreground" />
          </div>
          <p className="text-muted-foreground italic">No requests here yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="flex items-center gap-2 px-3.5 text-xs text-muted-foreground cursor-pointer select-none">
            <input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} className="size-4 accent-primary" />
            Select all
          </label>

          {list.map((r) => (
            <div
              key={r.id}
              className={`flex items-start gap-3 bg-card rounded-2xl border p-3.5 transition-colors ${
                selected.has(r.id) ? 'border-primary/50 bg-primary/[0.03]' : 'border-border/60'
              }`}
            >
              <input
                type="checkbox"
                checked={selected.has(r.id)}
                onChange={() => toggle(r.id)}
                className="mt-1 size-4 accent-primary shrink-0"
              />

              <button
                onClick={() => toggleFlag(r)}
                title={r.is_flagged ? 'Unflag' : 'Flag'}
                className={`mt-0.5 shrink-0 p-1 rounded-lg hover:bg-black/[0.08] transition-colors ${
                  r.is_flagged ? 'text-amber-500' : 'text-muted-foreground/50'
                }`}
              >
                <Flag className="w-4 h-4" fill={r.is_flagged ? 'currentColor' : 'none'} />
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <span className="font-medium text-sm">{fullName(r)}</span>
                  <a href={`mailto:${r.email ?? ''}`} className="text-sm text-primary hover:underline truncate">
                    {r.email}
                  </a>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[r.status]}`}>
                    {r.status}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  {r.package_name && <span className="font-medium text-foreground/70">{r.package_name}</span>}
                  {r.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {r.phone}
                    </span>
                  )}
                  <span>{formatDate(r.created_at)}</span>
                  {r.lang && <span className="uppercase">{r.lang}</span>}
                </div>
                {r.focus && <p className="mt-2 text-sm text-foreground/80 whitespace-pre-wrap">{r.focus}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete requests"
        description={`Permanently delete ${selected.size} request${selected.size === 1 ? '' : 's'}? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          del.mutate(selectedIds, { onSuccess: () => setSelected(new Set()) })
          setConfirmDelete(false)
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}
