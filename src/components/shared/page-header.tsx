import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  action?: ReactNode
}

export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <div className="h-20 -mx-8 px-8 flex items-center justify-between bg-white border-b border-gray-300 mb-8">
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      {action}
    </div>
  )
}
