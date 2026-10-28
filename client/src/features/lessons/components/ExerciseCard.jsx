import { useEffect, useRef, useState } from 'react'
import { useAudio } from '@/hooks/useAudio'
import { useSpeech, stopSpeaking } from '@/hooks/useSpeech'
import { useSettings } from '@/app/settings'
import { useI18n } from '@/i18n'
import { isAnswerCorrect, normalize } from '@/features/lessons/utils'
import styles from './ExerciseCard.module.css'

// Задания для малышей 3–6 лет: ответы — картинки, вопрос озвучивается,
// при ошибке можно попробовать ещё раз (штрафов нет).
const TILE_TYPES = ['choose_picture', 'odd_one_out', 'choose_letter', 'count']
const NEXT_DELAY_MS = 1500

const normOption = (o) => (o && typeof o === 'object' ? o : { text: String(o) })
const pickPraise = (t) => t(`child.exercise.praise${1 + Math.floor(Math.random() * 3)}`)

/* ── вопрос + кнопка «послушать» (озвучивается автоматически) ── */
function QuestionHeader({ exercise }) {
  const { t } = useI18n()
  const { speak, canSpeak } = useSpeech()
  const soundOn = useSettings((s) => s.soundOn)
  const speakRef = useRef(speak)
  speakRef.current = speak

  useEffect(() => {
    if (!soundOn) return undefined
    const id = setTimeout(() => speakRef.current(exercise.question, { audio: exercise.audio }), 300)
    return () => { clearTimeout(id); stopSpeaking() }
    // озвучиваем один раз при появлении карточки
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const canListen = canSpeak || Boolean(exercise.audio)

  return (
    <div className={styles.qRow}>
      {canListen && (
        <button
          type="button"
          className={styles.listenBtn}
          onClick={() => speak(exercise.question, { audio: exercise.audio })}
          aria-label={t('child.exercise.listen')}
          title={t('child.exercise.listen')}
        >
          🔊
        </button>
      )}
      <p className={styles.question}>{exercise.question}</p>
    </div>
  )
}

/* ── картинки / буквы / счёт / лишнее ── */
function TileExercise({ exercise, onAnswer }) {
  const { t } = useI18n()
  const { speak } = useSpeech()
  const soundOn = useSettings((s) => s.soundOn)
  const { playCorrect, playWrong } = useAudio()
  const [wrong, setWrong] = useState([])
  const [done, setDone] = useState(null)
  const timerRef = useRef(null)
  const praiseRef = useRef(null)
  if (praiseRef.current === null) praiseRef.current = pickPraise(t)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const options = (exercise.options ?? []).map(normOption)
  const cols = options.length === 4 ? 2 : Math.min(options.length, 3)

  const pick = (i) => {
    if (done !== null || wrong.includes(i)) return
    if (i === exercise.answer) {
      setDone(i)
      playCorrect()
      const label = options[i].label
      if (soundOn) speak(`${label ? `${label}! ` : ''}${praiseRef.current}`)
      const firstTry = wrong.length === 0
      timerRef.current = setTimeout(() => onAnswer({ correct: firstTry }), NEXT_DELAY_MS)
    } else {
      setWrong((w) => [...w, i])
      playWrong()
      if (soundOn) speak(t('child.exercise.tryAgain'))
    }
  }

  const doneLabel = done !== null ? options[done].label : null

  return (
    <div className={styles.card}>
      <QuestionHeader exercise={exercise} />

      {exercise.show && <div className={styles.show} aria-hidden="true">{exercise.show}</div>}

      {exercise.type === 'count' && (
        <div className={styles.countGrid} aria-hidden="true">
          {Array.from({ length: Math.min(Number(exercise.count) || 0, 12) }, (_, i) => (
            <span key={i} className={styles.countItem}>{exercise.emoji}</span>
          ))}
        </div>
      )}

      <div className={styles.tiles} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {options.map((o, i) => {
          const content = o.emoji ?? o.text ?? ''
          const len = [...String(content)].length
          const isEmoji = o.emoji !== undefined
          const size = isEmoji ? 64 : len <= 2 ? 56 : len <= 4 ? 40 : 28
          const state =
            done === i ? styles.tileCorrect : wrong.includes(i) ? styles.tileWrong : ''
          return (
            <button
              key={i}
              type="button"
              className={[styles.tile, state].join(' ')}
              onClick={() => pick(i)}
              disabled={done !== null || wrong.includes(i)}
              aria-label={o.label || String(o.text ?? '')}
            >
              <span
                className={isEmoji ? styles.tileEmoji : styles.tileText}
                style={{ fontSize: size }}
              >
                {content}
              </span>
            </button>
          )
        })}
      </div>

      <p className={styles.feedback} aria-live="polite">
        {done !== null
          ? `🎉 ${praiseRef.current}${doneLabel ? ` ${t('child.exercise.itIs', { w: doneLabel })}` : ''}`
          : wrong.length > 0
            ? `💪 ${t('child.exercise.tryAgain')}`
            : '\u00A0'}
      </p>
    </div>
  )
}

/* ── соедини пары ── */
function MatchPairs({ exercise, onAnswer }) {
  const { t } = useI18n()
  const { speak } = useSpeech()
  const soundOn = useSettings((s) => s.soundOn)
  const { playCorrect, playWrong, playClick } = useAudio()
  const pairs = exercise.pairs ?? []
  const [order] = useState(() => {
    const idx = pairs.map((_, i) => i)
    for (let k = 0; k < 10; k++) {
      for (let i = idx.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [idx[i], idx[j]] = [idx[j], idx[i]]
      }
      if (idx.length < 2 || idx.some((v, i) => v !== i)) break // чтобы пары не стояли «в ряд»
    }
    return idx
  })
  const [selected, setSelected] = useState(null)
  const [matched, setMatched] = useState([])
  const [mistakes, setMistakes] = useState(0)
  const [shake, setShake] = useState(null)
  const timerRef = useRef(null)
  const praiseRef = useRef(null)
  if (praiseRef.current === null) praiseRef.current = pickPraise(t)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const pickLeft = (i) => {
    if (matched.includes(i)) return
    playClick()
    setSelected(i)
  }

  const pickRight = (j) => {
    if (matched.includes(j) || selected === null) return
    if (j === selected) {
      const next = [...matched, j]
      setMatched(next)
      setSelected(null)
      playCorrect()
      if (next.length === pairs.length) {
        if (soundOn) speak(praiseRef.current)
        timerRef.current = setTimeout(() => onAnswer({ correct: mistakes === 0 }), NEXT_DELAY_MS)
      }
    } else {
      setMistakes((m) => m + 1)
      setShake(j)
      setTimeout(() => setShake(null), 500)
      playWrong()
      setSelected(null)
    }
  }

  const finished = matched.length === pairs.length && pairs.length > 0

  return (
    <div className={styles.card}>
      <QuestionHeader exercise={exercise} />
      <div className={styles.pairsGrid}>
        <div className={styles.pairCol}>
          {pairs.map((p, i) => (
            <button
              key={i}
              type="button"
              className={[
                styles.pairBtn,
                matched.includes(i) ? styles.pairDone : '',
                selected === i ? styles.pairSelected : '',
              ].join(' ')}
              onClick={() => pickLeft(i)}
              disabled={matched.includes(i)}
            >
              {p.left}
            </button>
          ))}
        </div>
        <div className={styles.pairCol}>
          {order.map((j) => (
            <button
              key={j}
              type="button"
              className={[
                styles.pairBtn,
                matched.includes(j) ? styles.pairDone : '',
                shake === j ? styles.shake : '',
              ].join(' ')}
              onClick={() => pickRight(j)}
              disabled={matched.includes(j)}
            >
              {pairs[j].right}
            </button>
          ))}
        </div>
      </div>
      <p className={styles.feedback} aria-live="polite">
        {finished ? `🎉 ${praiseRef.current}` : '\u00A0'}
      </p>
    </div>
  )
}

/* ── «школьные» типы (оставлены для совместимости со старыми уроками) ── */
function LegacyExercise({ exercise, onAnswer }) {
  const { t } = useI18n()
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [value, setValue] = useState('')
  const timerRef = useRef(null)
  const { playCorrect, playWrong } = useAudio()

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const correct = revealed && isAnswerCorrect(exercise, selected)

  const handleSelect = (option) => {
    if (revealed) return
    const ok = isAnswerCorrect(exercise, option)
    setSelected(option)
    setRevealed(true)
    if (ok) playCorrect(); else playWrong()
    timerRef.current = setTimeout(() => onAnswer({ correct: ok }), 900)
  }

  const feedback = revealed && (
    <p className={styles.feedback}>
      {correct
        ? t('child.exercise.correct')
        : t('child.exercise.correctAnswer', {
            answer: exercise.type === 'true_false'
              ? (normalize(exercise.answer) === 'true' ? t('child.exercise.trueShort') : t('child.exercise.falseShort'))
              : exercise.answer,
          })}
    </p>
  )

  if (exercise.type === 'multiple_choice') {
    return (
      <div className={styles.card}>
        <QuestionHeader exercise={exercise} />
        <div className={styles.options}>
          {(exercise.options ?? []).map((opt, i) => {
            const isRight = normalize(opt) === normalize(exercise.answer)
            let state = ''
            if (revealed) {
              if (isRight) state = styles.correct
              else if (opt === selected) state = styles.wrong
            }
            return (
              <button key={`${i}-${opt}`} className={[styles.option, state].join(' ')} onClick={() => handleSelect(opt)} disabled={revealed}>
                {revealed && isRight && '✅ '}
                {revealed && opt === selected && !isRight && '❌ '}
                {opt}
              </button>
            )
          })}
        </div>
        {feedback}
      </div>
    )
  }

  if (exercise.type === 'fill_blank') {
    const submit = () => { if (value.trim()) handleSelect(value.trim()) }
    return (
      <div className={styles.card}>
        <QuestionHeader exercise={exercise} />
        <div className={styles.fillWrap}>
          <input
            className={[styles.fillInput, revealed ? (correct ? styles.correctInput : styles.wrongInput) : ''].join(' ')}
            placeholder={t('child.exercise.fillPh')}
            aria-label={t('child.exercise.fillPh')}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            disabled={revealed}
            autoFocus
          />
          {!revealed && <button className={styles.submitBtn} onClick={submit} aria-label="OK">✓</button>}
        </div>
        {feedback}
      </div>
    )
  }

  if (exercise.type === 'true_false') {
    return (
      <div className={styles.card}>
        <QuestionHeader exercise={exercise} />
        <div className={styles.tfRow}>
          {['true', 'false'].map((val) => {
            let state = ''
            if (revealed) {
              if (val === normalize(exercise.answer)) state = styles.correct
              else if (val === selected) state = styles.wrong
            }
            return (
              <button key={val} className={[styles.tfBtn, state].join(' ')} onClick={() => handleSelect(val)} disabled={revealed}>
                {val === 'true' ? t('child.exercise.true') : t('child.exercise.false')}
              </button>
            )
          })}
        </div>
        {feedback}
      </div>
    )
  }

  // неизвестный тип — просто карточка с кнопкой «Далее»
  return (
    <div className={styles.card}>
      <QuestionHeader exercise={exercise} />
      <button className={styles.submitBtn} onClick={() => { if (!revealed) { setRevealed(true); onAnswer({ correct: true }) } }}>
        {t('child.exercise.next')}
      </button>
    </div>
  )
}

export default function ExerciseCard({ exercise, onAnswer }) {
  if (TILE_TYPES.includes(exercise.type)) return <TileExercise exercise={exercise} onAnswer={onAnswer} />
  if (exercise.type === 'match_pairs') return <MatchPairs exercise={exercise} onAnswer={onAnswer} />
  return <LegacyExercise exercise={exercise} onAnswer={onAnswer} />
}
