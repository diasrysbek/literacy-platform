import { useI18n } from '@/i18n'
import styles from './NewExerciseEditor.module.css'

// Редактор заданий для малышей: картинки / буквы / счёт / лишнее / пары.
// Варианты ответа — эмодзи (или буква/цифра). Правильный — по номеру (answer = индекс).
export const NEW_TYPES = ['choose_picture', 'odd_one_out', 'choose_letter', 'count', 'match_pairs']

export const newExerciseTemplate = (type, question = '') => {
  switch (type) {
    case 'choose_letter':
      return { type, question, options: [{ text: '' }, { text: '' }, { text: '' }], answer: 0 }
    case 'count':
      return { type, question, emoji: '🍎', count: 3, options: [{ text: '1' }, { text: '2' }, { text: '3' }], answer: 2 }
    case 'match_pairs':
      return { type, question, pairs: [{ left: '', right: '' }, { left: '', right: '' }, { left: '', right: '' }] }
    default: // choose_picture, odd_one_out
      return { type, question, options: [{ emoji: '' }, { emoji: '' }, { emoji: '' }], answer: 0 }
  }
}

const optionKey = (type) => (type === 'choose_picture' || type === 'odd_one_out' ? 'emoji' : 'text')

export default function NewExerciseEditor({ ex, onChange }) {
  const { t } = useI18n()

  if (ex.type === 'match_pairs') {
    const pairs = ex.pairs ?? []
    const setPair = (i, key, value) =>
      onChange({ ...ex, pairs: pairs.map((p, j) => (j === i ? { ...p, [key]: value } : p)) })
    return (
      <div className={styles.box}>
        <label>{t('admin.curriculum.pairs')}</label>
        {pairs.map((p, i) => (
          <div key={i} className={styles.row}>
            <input className={styles.emoji} value={p.left} onChange={(e) => setPair(i, 'left', e.target.value)} placeholder="🐰" />
            <span>↔</span>
            <input className={styles.emoji} value={p.right} onChange={(e) => setPair(i, 'right', e.target.value)} placeholder="🥕" />
            <button type="button" className={styles.small} disabled={pairs.length <= 2}
              onClick={() => onChange({ ...ex, pairs: pairs.filter((_, j) => j !== i) })}>✕</button>
          </div>
        ))}
        {pairs.length < 5 && (
          <button type="button" className={styles.add}
            onClick={() => onChange({ ...ex, pairs: [...pairs, { left: '', right: '' }] })}>
            {t('admin.curriculum.addPair')}
          </button>
        )}
      </div>
    )
  }

  const key = optionKey(ex.type)
  const options = ex.options ?? []
  const setOption = (i, value) =>
    onChange({ ...ex, options: options.map((o, j) => (j === i ? { ...o, [key]: value } : o)) })
  const removeOption = (i) => {
    const next = options.filter((_, j) => j !== i)
    const answer = ex.answer === i ? 0 : ex.answer > i ? ex.answer - 1 : ex.answer
    onChange({ ...ex, options: next, answer })
  }

  return (
    <div className={styles.box}>
      {ex.type === 'count' && (
        <div className={styles.row}>
          <label>{t('admin.curriculum.countEmoji')}</label>
          <input className={styles.emoji} value={ex.emoji ?? ''} onChange={(e) => onChange({ ...ex, emoji: e.target.value })} />
          <label>{t('admin.curriculum.countHow')}</label>
          <input className={styles.num} type="number" min={1} max={12} value={ex.count ?? 1}
            onChange={(e) => onChange({ ...ex, count: Number(e.target.value) })} />
        </div>
      )}
      <label>{t('admin.curriculum.tileOptions')}</label>
      {options.map((o, i) => (
        <div key={i} className={styles.row}>
          <input
            className={styles.emoji}
            value={o[key] ?? ''}
            onChange={(e) => setOption(i, e.target.value)}
            placeholder={key === 'emoji' ? '🍎' : 'А'}
          />
          <button type="button"
            className={[styles.mark, ex.answer === i ? styles.marked : ''].join(' ')}
            onClick={() => onChange({ ...ex, answer: i })}
            title={t('admin.curriculum.markCorrect')}>
            {ex.answer === i ? '✅' : '○'}
          </button>
          <button type="button" className={styles.small} disabled={options.length <= 2} onClick={() => removeOption(i)}>✕</button>
        </div>
      ))}
      {options.length < 4 && (
        <button type="button" className={styles.add}
          onClick={() => onChange({ ...ex, options: [...options, { [key]: '' }] })}>
          {t('admin.curriculum.addOption')}
        </button>
      )}
    </div>
  )
}
