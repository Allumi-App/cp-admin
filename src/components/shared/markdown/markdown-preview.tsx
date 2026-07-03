import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

interface MarkdownPreviewProps {
  content: string
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  if (!content) {
    return (
      <div className="px-4 py-3 text-muted-foreground text-sm italic min-h-[20rem]">
        Nothing to preview
      </div>
    )
  }

  return (
    <div
      className={[
        'px-4 py-3 text-base md:text-sm min-h-[20rem] overflow-auto',
        '[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:mt-4',
        '[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:mt-3',
        '[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3',
        '[&_h4]:text-base [&_h4]:font-semibold [&_h4]:mb-1 [&_h4]:mt-2',
        '[&_p]:mb-3 [&_p]:leading-relaxed',
        '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3',
        '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3',
        '[&_li]:mb-1',
        '[&_a]:text-primary [&_a]:underline',
        '[&_strong]:font-bold [&_em]:italic [&_u]:underline',
        '[&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-3',
        '[&_code]:bg-secondary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm',
        '[&_pre]:bg-secondary [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:mb-3 [&_pre]:overflow-auto',
        '[&_table]:w-full [&_table]:border-collapse [&_table]:mb-3',
        '[&_th]:border [&_th]:border-input [&_th]:px-3 [&_th]:py-1.5 [&_th]:bg-secondary [&_th]:text-left [&_th]:font-semibold',
        '[&_td]:border [&_td]:border-input [&_td]:px-3 [&_td]:py-1.5',
        '[&_hr]:border-input [&_hr]:my-4',
      ].join(' ')}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>
    </div>
  )
}
