import { useState } from 'react'
import styles from './ExerciseCard.module.css'

export default function ExerciseCard({ exercise, onAnswer }) {
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)

  const handleSelect = (option) => {
    if (revealed) return
    setSelected(option)
    setRevealed(true)
    setTimeout(() => onAnswer(option), 900)
  }

  // Multiple choice
  if (exercise.type === 'multiple_choice') {
    return (
      <div className={styles.card}>
        <p className={styles.question}>{exercise.question}</p>
        <div className={styles.options}>
          {exercise.options.map((opt) => {
            let state = ''
            if (revealed) {
              if (opt === exercise.answer) state = styles.correct
              else if (opt === selected) state = styles.wrong
            }
            return (
              <button
                key={opt}
                className={[styles.option, state].join(' ')}
                onClick={() => handleSelect(opt)}
                disabled={revealed}
              >
                {opt}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // Fill in the blank
  if (exercise.type === 'fill_blank') {
    const [value, setValue] = useState('')
    const handleSubmit = () => {
      if (!value.trim()) return
      handleSelect(value.trim().toLowerCase())
    }
    return (
      <div className={styles.card}>
        <p className={styles.question}>{exercise.question}</p>
        <div className={styles.fillWrap}>
          <input
            className={[styles.fillInput, revealed ? (selected === exercise.answer ? styles.correctInput : styles.wrongInput) : ''].join(' ')}
            placeholder="Введи ответ..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            disabled={revealed}
            autoFocus
          />
          {!revealed && (
            <button className={styles.submitBtn} onClick={handleSubmit}>✓</button>
          )}
        </div>
        {revealed && (
          <p className={styles.hint}>
            {selected === exercise.answer ? '✅ Правильно!' : `❌ Правильный ответ: ${exercise.answer}`}
          </p>
        )}
      </div>
    )
  }

  // True / False
  if (exercise.type === 'true_false') {
    return (
      <div className={styles.card}>
        <p className={styles.question}>{exercise.question}</p>
        <div className={styles.tfRow}>
          {['true', 'false'].map((val) => {
            let state = ''
            if (revealed) {
              if (val === exercise.answer) state = styles.correct
              else if (val === selected) state = styles.wrong
            }
            return (
              <button
                key={val}
                className={[styles.tfBtn, state].join(' ')}
                onClick={() => handleSelect(val)}
                disabled={revealed}
              >
                {val === 'true' ? '✅ Верно' : '❌ Неверно'}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.card}>
      <p className={styles.question}>{exercise.question}</p>
      <button className={styles.submitBtn} onClick={() => onAnswer('ok')}>Далее →</button>
    </div>
  )
}
