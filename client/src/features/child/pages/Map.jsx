import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import api from '@/services/api'
import { useI18n } from '@/i18n'
import { localizeLesson } from '@/features/lessons/localize'
import Loader from '@/components/UI/Loader'
import SettingsSwitcher from '@/components/SettingsSwitcher/SettingsSwitcher'
import styles from './Map.module.css'

const typeEmoji = { READING: '📖', WRITING: '✏️', PHONICS: '🔤', COMPREHENSION: '🧠', VOCABULARY: '📝' }
const diffColor = { EASY: '#43d9ad', MEDIUM: '#ffd166', HARD: '#ff6584' }

// Компонент назывался Map и затенял глобальный Map — переименован
export default function LessonMap() {
  const { childId } = useParams()
  const navigate = useNavigate()
  const { t, lang } = useI18n()

  const { data: lessons = [], isLoading: lessonsLoading } = useQuery({
    queryKey: ['lessons'],
    queryFn: () => api.get('/lessons').then((r) => r.data),
  })

  const { data: progress = [], isLoading: progressLoading } = useQuery({
    queryKey: ['progress', childId],
    queryFn: () => api.get(`/lessons/progress/${childId}`).then((r) => r.data),
  })

  const { data: stats } = useQuery({
    queryKey: ['childStats', childId],
    queryFn: () => api.get(`/children/${childId}/stats`).then((r) => r.data),
  })

  if (lessonsLoading || progressLoading) return <Loader text={t('child.map.loading')} />

  const progressMap = Object.fromEntries(progress.map((p) => [p.lessonId, p]))

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.back} onClick={() => navigate('/play')}>{t('child.map.back')}</button>
        <div className={styles.xpBar}>
          <span>⚡ {stats?.totalXp ?? 0} XP</span>
          <span>{t('child.map.level', { n: stats?.level ?? 1 })}</span>
          <span>🔥 {t('labels.streakDays', { count: stats?.streakDays ?? 0 })}</span>
        </div>
        <SettingsSwitcher />
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>{t('child.map.title')}</h1>
        <p className={styles.sub}>{t('child.map.sub')}</p>

        {lessons.length === 0 && <p className={styles.sub}>{t('child.map.empty')}</p>}

        <div className={styles.mapGrid}>
          {lessons.map((rawLesson, i) => {
            const lesson = localizeLesson(rawLesson, lang)
            const p = progressMap[lesson.id]
            const done = p?.status === 'COMPLETED'
            const inProgress = p?.status === 'IN_PROGRESS'

            return (
              <button
                key={lesson.id}
                className={[styles.node, done ? styles.done : '', inProgress ? styles.active : ''].join(' ')}
                onClick={() => navigate(`/play/${childId}/lesson/${lesson.id}`)}
                style={{ '--diff-color': diffColor[lesson.difficulty] }}
              >
                <div className={styles.nodeNum}>{done ? '✅' : inProgress ? '▶️' : i + 1}</div>
                <div className={styles.nodeEmoji}>{typeEmoji[lesson.type]}</div>
                <div className={styles.nodeTitle}>{lesson.title}</div>
                <div className={styles.nodeMeta}>
                  <span className={styles.xpReward}>+{lesson.xpReward} XP</span>
                  {p?.score != null && <span className={styles.score}>{p.score}%</span>}
                </div>
              </button>
            )
          })}
        </div>
      </main>
    </div>
  )
}
