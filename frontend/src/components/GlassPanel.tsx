import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'article'
}

export function GlassPanel({ children, className = '', as: Tag = 'div' }: Props) {
  return (
    <Tag
      className={`relative overflow-hidden rounded-3xl border border-stone-200/90 bg-white/90 shadow-glass-light backdrop-blur-md ring-1 ring-white/90 ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white via-white to-cardinal/[0.04]"
        aria-hidden
      />
      <div className="relative z-10">{children}</div>
    </Tag>
  )
}
