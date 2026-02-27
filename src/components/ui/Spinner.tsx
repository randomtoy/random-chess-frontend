import styles from './Spinner.module.css'

interface SpinnerProps {
  size?: number
}

export function Spinner({ size = 24 }: SpinnerProps) {
  const thickness = Math.max(1.5, size * 0.07)
  return (
    <span
      className={styles.ring}
      style={{
        width: size,
        height: size,
        borderWidth: thickness,
      }}
      aria-label="Loading"
      role="status"
    />
  )
}
