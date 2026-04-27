import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import api from '@/services/api'
import Loader from '@/components/UI/Loader'
import Button from '@/components/UI/Button'
import ExerciseCard from '@/features/lessons/components/ExerciseCard'
import ProgressBar from '@/features/lessons/components/ProgressBar'
import XPBar from '@/features/lessons/components/XPBar'
import styles from './Lesson.module.css'

export default function Lesson() {
  const { childId, lessonId } = useParams()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState([])
  const [started, setStarted] = useState(false)

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => api.get(`/lessons/${lessonId}`).then((r) => r.data),
  })

  const startMutation = useMutation({
    mutationFn: () => api.post(`/lessons/${lessonId}/start`, { childId }),
    onSuccess: () => setStarted(true),
  })

  const completeMutation = useMutation({
    mutationFn: (score) => api.post(`/lessons/${lessonId}/complete`, { childId, score }),
    onSuccess: (res) => {
      navigate(`/play/${childId}/result/${lessonId}`, {
        state: { score: calculateScore(), newBadges: res.data.newBadges, lesson },
      })
    },
  })

  if (isLoading) return <Loader text="Загружаем урок..." />

  const exercises = lesson?.content?.exercises ?? []
  const totalSteps = exercises.length

  const calculateScore = () => {
    if (!exercises.length) return 100
    const correct = answers.filter((a, i) => a === exercises[i]?.answer).length
    return Math.round((correct / exercises.length) * 100)
  }

  const handleAnswer = (answer) => {
    const newAnswers = [...answers, answer]
    setAnswers(newAnswers)
    if (step + 1 >= totalSteps) {
      const correct = newAnswers.filter((a, i) => a === exercises[i]?.answer).length
      const score = Math.round((correct / totalSteps) * 100)
      completeMutation.mutate(score)
    } else {
      setStep(step + 1)
    }
  }

  // Intro screen
  if (!started) {
    return (
      <div className={styles.intro}>
        <div className={styles.introCard}>
          <div className={styles.introEmoji}>
            {{ READING: '📖', WRITING: '✏️', PHONICS: '🔤', COMPREHENSION: '🧠', VOCABULARY: '📝' }[lesson?.type] ?? '📚'}
          </div>
          <h1>{lesson?.title}</h1>
          <p>{lesson?.description}</p>
          <div className={styles.introBadges}>
            <span>⚡ +{lesson?.xpReward} XP</span>
            <span>❓ {totalSteps} заданий</span>
          </div>
          <Button size="lg" onClick={() => startMutation.mutate()} loading={startMutation.isPending}>
            🚀 Начать урок!
          </Button>
          <button className={styles.backBtn} onClick={() => navigate(`/play/${childId}/map`)}>
            Вернуться на карту
          </button>
        </div>
      </div>
    )
  }

  if (completeMutation.isPending) return <Loader text="Сохраняем результат..." />

  const current = exercises[step]

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.exit} onClick={() => navigate(`/play/${childId}/map`)}>✕</button>
        <div className={styles.progressWrap}>
          <ProgressBar value={step} max={totalSteps} />
          <span className={styles.stepCount}>{step}/{totalSteps}</span>
        </div>
        <XPBar xp={lesson?.xpReward} />
      </header>

      <main className={styles.main}>
        {current && (
          <ExerciseCard
            key={step}
            exercise={current}
            onAnswer={handleAnswer}
          />
        )}
      </main>
    </div>
  )
}
