import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import api from '@/services/api'
import { useI18n } from '@/i18n'
import { useSettings } from '@/app/settings'
import Loader from '@/components/UI/Loader'
import Button from '@/components/UI/Button'
import SettingsSwitcher from '@/components/SettingsSwitcher/SettingsSwitcher'
import ExerciseCard from '@/features/lessons/components/ExerciseCard'
import ProgressBar from '@/features/lessons/components/ProgressBar'
import XPBar from '@/features/lessons/components/XPBar'
import { calculateScore } from '@/features/lessons/utils'
import { localizeLesson } from '@/features/lessons/localize'
import styles from './Lesson.module.css'

const typeEmoji = { READING: '📖', WRITING: '✏️', PHONICS: '🔤', COMPREHENSION: '🧠', VOCABULARY: '📝' }

export default function Lesson() {
  const { childId, lessonId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { t, lang } = useI18n()
  const soundOn = useSettings((s) => s.soundOn)
  const toggleSound = useSettings((s) => s.toggleSound)
  const [step, setStep] = useState(0)
  const [results, setResults] = useState([])
  const [started, setStarted] = useState(false)
  const [saveError, setSaveError] = useState(false)

  const { data: rawLesson, isLoading, isError, refetch } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => api.get(`/lessons/${lessonId}`).then((r) => r.data),
  })
  // название и задания на языке интерфейса (казахский/английский берутся из translations)
  const lesson = useMemo(() => localizeLesson(rawLesson, lang), [rawLesson, lang])

  const startMutation = useMutation({
    mutationFn: () => api.post(`/lessons/${lessonId}/start`, { childId }),
    // даже если «start» не сохранился, ребёнок всё равно может проходить урок
    onSuccess: () => setStarted(true),
    onError: () => setStarted(true),
  })

  const completeMutation = useMutation({
    mutationFn: (score) => api.post(`/lessons/${lessonId}/complete`, { childId, score }),
    onSuccess: (res) => {
      // TanStack Query v5: фильтры передаются объектом { queryKey }
      queryClient.invalidateQueries({ queryKey: ['childStats', childId] })
      queryClient.invalidateQueries({ queryKey: ['childProgress', childId] })
      queryClient.invalidateQueries({ queryKey: ['progress', childId] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['children'] })

      navigate(`/play/${childId}/result/${lessonId}`, {
        state: {
          score: res.data.progress?.score ?? 0,
          xpAwarded: res.data.xpAwarded,
          newBadges: res.data.newBadges ?? [],
          lesson,
        },
      })
    },
    onError: () => setSaveError(true),
  })

  if (isLoading) return <Loader text={t('child.lesson.loading')} />

  if (isError || !lesson) {
    return (
      <div className={styles.intro}>
        <SettingsSwitcher floating />
        <div className={styles.introCard}>
          <div className={styles.introEmoji}>😕</div>
          <p>{t('child.lesson.loadError')}</p>
          <Button onClick={() => refetch()}>{t('child.lesson.retry')}</Button>
          <button className={styles.backBtn} onClick={() => navigate(`/play/${childId}/map`)}>
            {t('child.lesson.backToMap')}
          </button>
        </div>
      </div>
    )
  }

  const exercises = lesson.content?.exercises ?? []
  const totalSteps = exercises.length

  // result = { correct } — верно ли ребёнок ответил с первой попытки
  const handleAnswer = (result) => {
    const newResults = [...results, result]
    setResults(newResults)
    if (step + 1 >= totalSteps) {
      setSaveError(false)
      completeMutation.mutate(calculateScore(exercises, newResults))
    } else {
      setStep(step + 1)
    }
  }

  const retrySave = () => {
    setSaveError(false)
    completeMutation.mutate(calculateScore(exercises, results))
  }

  if (!started) {
    return (
      <div className={styles.intro}>
        <SettingsSwitcher floating />
        <div className={styles.introCard}>
          <div className={styles.introEmoji}>{typeEmoji[lesson.type] ?? '📚'}</div>
          <h1>{lesson.title}</h1>
          <p>{lesson.description}</p>
          <div className={styles.introBadges}>
            <span>⚡ +{lesson.xpReward} XP</span>
            <span>❓ {t('labels.tasksCount', { count: totalSteps })}</span>
          </div>
          {totalSteps === 0 && <p>{t('child.lesson.noExercises')}</p>}
          {/* без заданий урок нельзя начать — раньше ребёнок застревал на пустом экране */}
          <Button
            size="lg"
            onClick={() => startMutation.mutate()}
            loading={startMutation.isPending}
            disabled={totalSteps === 0}
          >
            {t('child.lesson.start')}
          </Button>
          <button className={styles.backBtn} onClick={() => navigate(`/play/${childId}/map`)}>
            {t('child.lesson.backToMap')}
          </button>
        </div>
      </div>
    )
  }

  if (saveError) {
    return (
      <div className={styles.intro}>
        <div className={styles.introCard}>
          <div className={styles.introEmoji}>😕</div>
          <p>{t('child.lesson.saveError')}</p>
          <Button onClick={retrySave}>{t('child.lesson.retry')}</Button>
          <button className={styles.backBtn} onClick={() => navigate(`/play/${childId}/map`)}>
            {t('child.lesson.backToMap')}
          </button>
        </div>
      </div>
    )
  }

  if (completeMutation.isPending) return <Loader text={t('child.lesson.saving')} />

  const current = exercises[step]

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.exit} onClick={() => navigate(`/play/${childId}/map`)} aria-label={t('child.lesson.exit')}>✕</button>
        <div className={styles.progressWrap}>
          <ProgressBar value={step} max={totalSteps} />
          <span className={styles.stepCount}>{step}/{totalSteps}</span>
        </div>
        <button
          className={styles.soundBtn}
          onClick={toggleSound}
          aria-pressed={soundOn}
          aria-label={soundOn ? t('child.lesson.soundOff') : t('child.lesson.soundOn')}
          title={soundOn ? t('child.lesson.soundOff') : t('child.lesson.soundOn')}
        >
          {soundOn ? '🔊' : '🔇'}
        </button>
        <XPBar xp={lesson.xpReward} />
      </header>
      <main className={styles.main}>
        {current && (
          <ExerciseCard key={step} exercise={current} onAnswer={handleAnswer} />
        )}
      </main>
    </div>
  )
}
