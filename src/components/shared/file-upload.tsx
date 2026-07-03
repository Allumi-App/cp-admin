import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import type { FileRejection } from 'react-dropzone'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface FileUploadProps {
  onFile: (file: File) => void
  accept?: Record<string, string[]>
  label: string
  preview?: string | null
  onClear?: () => void
  className?: string
}

export function FileUpload({ onFile, accept, label, preview, className }: FileUploadProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) {
        onFile(accepted[0])
      }
    },
    [onFile]
  )

  const onDropRejected = useCallback((rejections: FileRejection[]) => {
    const error = rejections[0]?.errors[0]
    if (error) {
      toast.error(error.message)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept,
    multiple: false,
  })

  return (
    <div className={cn('flex items-start gap-4', className)}>
      {preview && (
        <img
          src={preview}
          alt="Current artwork"
          className="h-20 w-20 shrink-0 rounded-2xl object-contain border border-border"
        />
      )}
      <div
        {...getRootProps()}
        className={cn(
          'flex-1 border border-dashed rounded-3xl p-6 text-center cursor-pointer transition-colors',
          isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
        )}
      >
        <input {...getInputProps()} />
        <div className="p-3 bg-secondary rounded-full w-fit mx-auto mb-2">
          <Upload className="w-8 h-8 text-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {isDragActive ? 'Drop here...' : 'Drag & drop or click to browse'}
        </p>
      </div>
    </div>
  )
}
