import styles from './Card.module.css'

export default function Card({ children, className = '', onClick, hoverable = false }) {
  return (
    <div
      className={[styles.card, hoverable ? styles.hoverable : '', className].join(' ')}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
