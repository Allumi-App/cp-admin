import { useRef } from 'react'
import { MarkdownToolbar } from './markdown-toolbar'
import { MarkdownPreview } from './markdown-preview'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  rows?: number
  required?: boolean
}

export function MarkdownEditor({ value, onChange, rows = 20, required }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  return (
    <div className="rounded-xl border border-input bg-white overflow-hidden focus-within:border-primary focus-within:shadow-[0_0_0_1px_#2C1810] transition-colors">
      {/* Toolbar */}
      <MarkdownToolbar textareaRef={textareaRef} value={value} onChange={onChange} />

      {/* Side-by-side editor and preview */}
      <div className="flex divide-x divide-input">
        {/* Editor pane */}
        <div className="w-1/2 min-w-0">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            rows={rows}
            placeholder="Write your markdown here..."
            className="w-full h-full px-4 py-3 text-base md:text-sm placeholder:text-muted-foreground focus:outline-none transition-colors font-mono resize-none border-0"
            style={{ minHeight: `${rows * 1.5}rem` }}
          />
        </div>

        {/* Preview pane */}
        <div className="w-1/2 min-w-0 overflow-auto bg-secondary/10" style={{ minHeight: `${rows * 1.5}rem` }}>
          <MarkdownPreview content={value} />
        </div>
      </div>
    </div>
  )
}
