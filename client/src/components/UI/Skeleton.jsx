import styles from './Skeleton.module.css'

export function SkeletonCard({ height = 120 }) {
  return <div className={styles.card} style={{ height }} />
}

export function SkeletonText({ width = '100%', height = 16 }) {
  return <div className={styles.text} style={{ width, height }} />
}

export function SkeletonGrid({ count = 4 }) {
  return (
    <div className={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} height={160} />
      ))}
    </div>
  )
}

export default function Skeleton({ children }) {
  return <div className={styles.wrapper}>{children}</div>
}
