import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import api from '@/services/api'
import Loader from '@/components/UI/Loader'
import styles from './Map.module.css'

const typeEmoji = { READING: '📖', WRITING: '✏️', PHONICS: '🔤', COMPREHENSION: '🧠', VOCABULARY: '📝' }
const diffColor = { EASY: '#43d9ad', MEDIUM: '#ffd166', HARD: '#ff6584' }

export default function Map() {
  const { childId } = useParams()
  const navigate = useNavigate()

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

  if (lessonsLoading || progressLoading) return <Loader text="Загрузка карты..." />

  const progressMap = Object.fromEntries(progress.map((p) => [p.lessonId, p]))

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.back} onClick={() => navigate('/play')}>← Выбор игрока</button>
        <div className={styles.xpBar}>
          <span>⚡ {stats?.totalXp ?? 0} XP</span>
          <span>🏆 Уровень {stats?.level ?? 1}</span>
          <span>🔥 {stats?.streakDays ?? 0} дней</span>
        </div>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>🗺️ Карта уроков</h1>
        <p className={styles.sub}>Выбери урок и начни путешествие!</p>

        <div className={styles.mapGrid}>
          {lessons.map((lesson, i) => {
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
