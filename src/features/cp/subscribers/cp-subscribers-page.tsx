import { useState } from 'react'
import { Mail, Trash2, Send, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { useCpSubscribers, useDeleteCpSubscribers, useSendCpBroadcast } from './use-cp-subscribers'

export function CpSubscribersPage() {
  const { data: subscribers, isLoading } = useCpSubscribers()
  const deleteSubscribers = useDeleteCpSubscribers()
  const sendBroadcast = useSendCpBroadcast()

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmSend, setConfirmSend] = useState(false)

  const list = subscribers ?? []
  const allSelected = list.length > 0 && selected.size === list.length
  const selectedList = list.filter((s) => selected.has(s.id))
  // No selection → the broadcast goes to everyone.
  const recipients = selectedList.length ? selectedList : list

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(list.map((s) => s.id)))
  }

  function doSend() {
    const emails = selectedList.length ? selectedList.map((s) => s.email) : undefined
    sendBroadcast.mutate(emails)
    setConfirmSend(false)
  }

  function doDelete() {
    deleteSubscribers.mutate([...selected], { onSuccess: () => setSelected(new Set()) })
    setConfirmDelete(false)
  }

  return (
    <div>
      <PageHeader
        title="Subscribers"
        action={
          list.length > 0 ? (
            <span className="text-sm text-muted-foreground">
              {list.length} subscriber{list.length !== 1 ? 's' : ''}
            </span>
          ) : null
        }
      />

      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : !list.length ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Mail className="w-7 h-7 text-foreground" />
          </div>
          <p className="text-muted-foreground italic">No subscribers yet.</p>
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div className="mb-3 flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              {selected.size > 0 ? `${selected.size} selected` : 'Select all'}
            </label>

            <div className="flex-1" />

            {selected.size > 0 && (
              <button
                onClick={() => setConfirmDelete(true)}
                disabled={deleteSubscribers.isPending}
                className="flex items-center gap-2 px-3 py-2 h-9 rounded-xl text-sm font-medium border border-border text-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
            <button
              onClick={() => setConfirmSend(true)}
              disabled={sendBroadcast.isPending}
              className="flex items-center gap-2 px-4 py-2 h-9 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {sendBroadcast.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {selectedList.length ? `Email ${selectedList.length} selected` : 'Email all'}
            </button>
          </div>

          <div className="space-y-2">
            {list.map((sub) => (
              <div
                key={sub.id}
                className="bg-card rounded-2xl border border-border/60 flex items-center gap-3 p-3.5"
              >
                <input
                  type="checkbox"
                  checked={selected.has(sub.id)}
                  onChange={() => toggle(sub.id)}
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{sub.email}</div>
                </div>
                <span className="text-xs uppercase tracking-wide text-muted-foreground shrink-0">
                  {sub.lang}
                </span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {new Date(sub.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmSend}
        title="Send broadcast"
        description={`Send the "Subscriber broadcast" template to ${recipients.length} subscriber${
          recipients.length !== 1 ? 's' : ''
        }? Edit the wording first under Email Templates.`}
        confirmLabel="Send"
        onConfirm={doSend}
        onCancel={() => setConfirmSend(false)}
      />

      <ConfirmDialog
        open={confirmDelete}
        title="Remove subscribers"
        description={`Remove ${selected.size} subscriber${selected.size !== 1 ? 's' : ''}?`}
        confirmLabel="Remove"
        destructive
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}
