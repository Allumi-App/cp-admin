import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Code,
  Quote,
  Minus,
  Table,
  Image,
} from 'lucide-react'

interface MarkdownToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  value: string
  onChange: (value: string) => void
}

type ActionType = 'wrap' | 'prefix' | 'insert'

const actions: {
  icon: React.ComponentType<{ className?: string }>
  type: ActionType
  syntax: string
  /** For asymmetric wraps (e.g. HTML tags), the closing token. Defaults to `syntax`. */
  close?: string
  tooltip: string
  group?: string
}[] = [
  { icon: Bold, type: 'wrap', syntax: '**', tooltip: 'Bold', group: 'inline' },
  { icon: Italic, type: 'wrap', syntax: '_', tooltip: 'Italic', group: 'inline' },
  { icon: Underline, type: 'wrap', syntax: '<u>', close: '</u>', tooltip: 'Underline', group: 'inline' },
  { icon: Strikethrough, type: 'wrap', syntax: '~~', tooltip: 'Strikethrough', group: 'inline' },
  { icon: Code, type: 'wrap', syntax: '`', tooltip: 'Inline code', group: 'inline' },
  { icon: Heading1, type: 'prefix', syntax: '# ', tooltip: 'Heading 1', group: 'heading' },
  { icon: Heading2, type: 'prefix', syntax: '## ', tooltip: 'Heading 2', group: 'heading' },
  { icon: Heading3, type: 'prefix', syntax: '### ', tooltip: 'Heading 3', group: 'heading' },
  { icon: List, type: 'prefix', syntax: '- ', tooltip: 'Bullet list', group: 'list' },
  { icon: ListOrdered, type: 'prefix', syntax: '1. ', tooltip: 'Numbered list', group: 'list' },
  { icon: Quote, type: 'prefix', syntax: '> ', tooltip: 'Blockquote', group: 'block' },
  { icon: Minus, type: 'insert', syntax: '\n---\n', tooltip: 'Horizontal rule', group: 'block' },
  { icon: LinkIcon, type: 'insert', syntax: '[link text](https://)', tooltip: 'Link', group: 'media' },
  { icon: Image, type: 'insert', syntax: '![alt text](https://)', tooltip: 'Image', group: 'media' },
  { icon: Table, type: 'insert', syntax: '\n| Header | Header |\n| ------ | ------ |\n| Cell   | Cell   |\n', tooltip: 'Table', group: 'media' },
]

function insertMarkdown(
  textarea: HTMLTextAreaElement,
  value: string,
  onChange: (v: string) => void,
  type: ActionType,
  syntax: string,
  close?: string,
) {
  const { selectionStart, selectionEnd } = textarea
  const selected = value.substring(selectionStart, selectionEnd)

  let newValue: string
  let cursorPos: number

  if (type === 'wrap') {
    const closing = close ?? syntax
    const inner = selected || 'text'
    const wrapped = `${syntax}${inner}${closing}`
    newValue = value.substring(0, selectionStart) + wrapped + value.substring(selectionEnd)
    cursorPos = selectionStart + syntax.length + inner.length + closing.length
  } else if (type === 'prefix') {
    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
    newValue = value.substring(0, lineStart) + syntax + value.substring(lineStart)
    cursorPos = selectionStart + syntax.length
  } else {
    newValue = value.substring(0, selectionStart) + syntax + value.substring(selectionEnd)
    cursorPos = selectionStart + syntax.length
  }

  onChange(newValue)
  requestAnimationFrame(() => {
    textarea.focus()
    textarea.setSelectionRange(cursorPos, cursorPos)
  })
}

// Group actions by their group, preserving order
const groupedActions = actions.reduce<{ group: string; items: typeof actions }[]>((acc, action) => {
  const group = action.group || 'other'
  const existing = acc.find((g) => g.group === group)
  if (existing) {
    existing.items.push(action)
  } else {
    acc.push({ group, items: [action] })
  }
  return acc
}, [])

export function MarkdownToolbar({ textareaRef, value, onChange }: MarkdownToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-input bg-secondary/50">
      {groupedActions.map((group, i) => (
        <div key={group.group} className="flex items-center gap-0.5">
          {i > 0 && <div className="w-px h-5 bg-border mx-1" />}
          {group.items.map((action) => (
            <button
              key={action.tooltip}
              type="button"
              title={action.tooltip}
              onClick={() => {
                if (textareaRef.current) {
                  insertMarkdown(textareaRef.current, value, onChange, action.type, action.syntax, action.close)
                }
              }}
              className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <action.icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
