import styles from './XPBar.module.css'

export default function XPBar({ xp }) {
  return (
    <div className={styles.wrap}>
      <span className={styles.icon}>⚡</span>
      <span className={styles.label}>+{xp} XP</span>
    </div>
  )
}
