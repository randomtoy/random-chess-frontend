import type { CSSProperties, ReactNode } from 'react'
import styles from './GlassPanel.module.css'

interface GlassPanelProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export function GlassPanel({ children, className, style }: GlassPanelProps) {
  const cls = [styles.panel, className].filter(Boolean).join(' ')
  return (
    <div className={cls} style={style}>
      {children}
    </div>
  )
}
