import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import api from '@/services/api'
import Card from '@/components/UI/Card'
import Loader from '@/components/UI/Loader'
import styles from './Progress.module.css'

const difficultyLabel = { EASY: '🟢 Лёгкий', MEDIUM: '🟡 Средний', HARD: '🔴 Сложный' }
const statusLabel = { COMPLETED: '✅ Завершён', IN_PROGRESS: '⏳ В процессе', NOT_STARTED: '⬜ Не начат' }

// Generate weekly XP data from progress
function buildWeeklyData(progress) {
  const days = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']
  const data = days.map((d) => ({ day: d, xp: 0, lessons: 0 }))
  progress.forEach((p) => {
    if (!p.completedAt) return
    const d = new Date(p.completedAt)
    const now = new Date()
    const diffDays = Math.floor((now - d) / 86400000)
    if (diffDays < 7) {
      const idx = (d.getDay() + 6) % 7 // Mon=0
      data[idx].xp += p.lesson?.xpReward ?? 10
      data[idx].lessons += 1
    }
  })
  return data
}

export default function Progress() {
  const { childId } = useParams()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['childStats', childId],
    queryFn: () => api.get(`/children/${childId}/stats`).then((r) => r.data),
  })

  const { data: progress = [], isLoading: progressLoading } = useQuery({
    queryKey: ['childProgress', childId],
    queryFn: () => api.get(`/lessons/progress/${childId}`).then((r) => r.data),
  })

  if (statsLoading || progressLoading) return <Loader text="Загрузка прогресса..." />

  const weeklyData = buildWeeklyData(progress)
  const completedProgress = progress.filter((p) => p.status === 'COMPLETED')

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/dashboard" className={styles.back}>← Назад</Link>
        <h1>Прогресс ребёнка</h1>
      </header>

      <main className={styles.main}>
        {/* Stat cards */}
        <div className={styles.statsGrid}>
          {[
            { icon: '⚡', label: 'Всего XP', value: stats?.totalXp ?? 0, color: '#6c63ff' },
            { icon: '🏆', label: 'Уровень', value: stats?.level ?? 1, color: '#ff9f43' },
            { icon: '🔥', label: 'Дней подряд', value: stats?.streakDays ?? 0, color: '#ff6584' },
            { icon: '📖', label: 'Уроков пройдено', value: stats?.completedLessons ?? 0, color: '#43d9ad' },
          ].map((s) => (
            <Card key={s.label} className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: s.color + '20', color: s.color }}>{s.icon}</div>
              <div className={styles.statValue} style={{ color: s.color }}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </Card>
          ))}
        </div>

        {/* XP progress bar */}
        <Card className={styles.xpCard}>
          <div className={styles.xpHeader}>
            <span>🏆 Уровень {stats?.level}</span>
            <span>{stats?.xpToNextLevel} XP до следующего уровня</span>
          </div>
          <div className={styles.xpBar}>
            <div className={styles.xpFill} style={{ width: `${Math.max(5, 100 - Math.min(100, stats?.xpToNextLevel ?? 100))}%` }} />
          </div>
        </Card>

        {/* Charts */}
        <div className={styles.chartsGrid}>
          <Card className={styles.chartCard}>
            <h3>📊 XP за последние 7 дней</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0eeff" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [`${v} XP`, 'XP']} />
                <Bar dataKey="xp" fill="#6c63ff" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className={styles.chartCard}>
            <h3>📈 Уроков завершено по дням</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0eeff" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip formatter={(v) => [`${v} уроков`, 'Уроки']} />
                <Line type="monotone" dataKey="lessons" stroke="#43d9ad" strokeWidth={3} dot={{ r: 5, fill: '#43d9ad' }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Badges */}
        {stats?.badges?.length > 0 && (
          <div className={styles.section}>
            <h2>🏅 Значки</h2>
            <div className={styles.badges}>
              {stats.badges.map((b) => (
                <Card key={b.id} className={styles.badge}>
                  <div className={styles.badgeIcon}>{b.badge.iconUrl}</div>
                  <div className={styles.badgeName}>{b.badge.name}</div>
                  <div className={styles.badgeDesc}>{b.badge.description}</div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Lesson history */}
        <div className={styles.section}>
          <h2>📚 История уроков</h2>
          {progress.length === 0 ? (
            <Card className={styles.emptyState}>
              <span>📭</span>
              <p>Уроки ещё не начаты</p>
            </Card>
          ) : (
            <Card className={styles.tableCard}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Урок</th>
                    <th>Сложность</th>
                    <th>Статус</th>
                    <th>Результат</th>
                    <th>Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {progress.map((p) => (
                    <tr key={p.id}>
                      <td><b>{p.lesson.title}</b></td>
                      <td>{difficultyLabel[p.lesson.difficulty]}</td>
                      <td>{statusLabel[p.status]}</td>
                      <td>{p.score != null ? <span className={styles.score}>{p.score}%</span> : '—'}</td>
                      <td>{p.completedAt ? new Date(p.completedAt).toLocaleDateString('ru-RU') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
