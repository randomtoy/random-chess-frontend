import styles from './StatusChip.module.css'

type ChipVariant = 'neutral' | 'success' | 'warning' | 'error'

interface StatusChipProps {
  label: string
  variant?: ChipVariant
  dot?: boolean
}

export function StatusChip({ label, variant = 'neutral', dot = true }: StatusChipProps) {
  return (
    <span className={[styles.chip, styles[variant]].join(' ')}>
      {dot && <span className={styles.dot} />}
      {label}
    </span>
  )
}
