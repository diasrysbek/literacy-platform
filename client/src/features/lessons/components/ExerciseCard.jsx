import { useState } from 'react'
import { useAudio } from '@/hooks/useAudio'
import styles from './ExerciseCard.module.css'

export default function ExerciseCard({ exercise, onAnswer }) {
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const { playCorrect, playWrong } = useAudio()

  const handleSelect = (option) => {
    if (revealed) return
    setSelected(option)
    setRevealed(true)
    const isCorrect = option === exercise.answer ||
      option?.toLowerCase() === exercise.answer?.toLowerCase()
    if (isCorrect) playCorrect()
    else playWrong()
    setTimeout(() => onAnswer(option), 900)
  }

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
              <button key={opt}
                className={[styles.option, state].join(' ')}
                onClick={() => handleSelect(opt)}
                disabled={revealed}>
                {revealed && opt === exercise.answer && '✅ '}
                {revealed && opt === selected && opt !== exercise.answer && '❌ '}
                {opt}
              </button>
            )
          })}
        </div>
        {revealed && (
          <p className={styles.feedback}>
            {selected === exercise.answer ? '🎉 Правильно!' : `Правильный ответ: ${exercise.answer}`}
          </p>
        )}
      </div>
    )
  }

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
            className={[styles.fillInput,
              revealed ? (selected === exercise.answer ? styles.correctInput : styles.wrongInput) : ''
            ].join(' ')}
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
          <p className={styles.feedback}>
            {selected === exercise.answer ? '🎉 Правильно!' : `Правильный ответ: ${exercise.answer}`}
          </p>
        )}
      </div>
    )
  }

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
              <button key={val}
                className={[styles.tfBtn, state].join(' ')}
                onClick={() => handleSelect(val)}
                disabled={revealed}>
                {val === 'true' ? '✅ Верно' : '❌ Неверно'}
              </button>
            )
          })}
        </div>
        {revealed && (
          <p className={styles.feedback}>
            {selected === exercise.answer ? '🎉 Правильно!' : `Правильный ответ: ${exercise.answer === 'true' ? 'Верно' : 'Неверно'}`}
          </p>
        )}
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
