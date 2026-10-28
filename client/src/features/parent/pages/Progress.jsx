import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import api from '@/services/api'
import { useI18n } from '@/i18n'
import { localizeLesson } from '@/features/lessons/localize'
import Card from '@/components/UI/Card'
import Loader from '@/components/UI/Loader'
import SettingsSwitcher from '@/components/SettingsSwitcher/SettingsSwitcher'
import styles from './Progress.module.css'

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

// XP/уроки за последние 7 календарных дней.
// Раньше считали «прошло меньше 7×24 часов», из-за чего прошлая среда и сегодняшняя
// попадали в один столбец «Ср».
function buildWeeklyData(progress, dayLabels) {
  const data = dayLabels.map((d) => ({ day: d, xp: 0, lessons: 0 }))
  const today = startOfDay(new Date())
  progress.forEach((p) => {
    if (!p.completedAt) return
    const d = new Date(p.completedAt)
    const diffDays = Math.round((today - startOfDay(d)) / 86400000)
    if (diffDays >= 0 && diffDays < 7) {
      const idx = (d.getDay() + 6) % 7 // Пн = 0
      data[idx].xp += p.lesson?.xpReward ?? 10
      data[idx].lessons += 1
    }
  })
  return data
}

const axisTick = { fontSize: 12, fill: 'var(--color-text-muted)' }
const tooltipStyle = {
  background: 'var(--color-surface)',
  border: '1.5px solid var(--color-border)',
  borderRadius: 12,
  color: 'var(--color-text)',
}

export default function Progress() {
  const { childId } = useParams()
  const { t, lang, locale } = useI18n()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['childStats', childId],
    queryFn: () => api.get(`/children/${childId}/stats`).then((r) => r.data),
  })

  const { data: progress = [], isLoading: progressLoading } = useQuery({
    queryKey: ['childProgress', childId],
    queryFn: () => api.get(`/lessons/progress/${childId}`).then((r) => r.data),
  })

  if (statsLoading || progressLoading) return <Loader text={t('parent.progress.loading')} />

  const weeklyData = buildWeeklyData(progress, t('labels.days'))
  const xpToNext = stats?.xpToNextLevel ?? 100
  const xpPercent = Math.min(100, Math.max(5, 100 - xpToNext))

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/dashboard" className={styles.back}>{t('common.back')}</Link>
        <h1>{t('parent.progress.title')}</h1>
        <SettingsSwitcher className={styles.switcher} />
      </header>

      <main className={styles.main}>
        {/* Stat cards */}
        <div className={styles.statsGrid}>
          {[
            { icon: '⚡', label: t('parent.progress.totalXp'), value: stats?.totalXp ?? 0, color: '#6c63ff' },
            { icon: '🏆', label: t('parent.progress.level'), value: stats?.level ?? 1, color: '#ff9f43' },
            { icon: '🔥', label: t('parent.progress.streak'), value: stats?.streakDays ?? 0, color: '#ff6584' },
            { icon: '📖', label: t('parent.progress.completed'), value: stats?.completedLessons ?? 0, color: '#43d9ad' },
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
            <span>{t('parent.progress.levelN', { n: stats?.level ?? 1 })}</span>
            <span>{t('parent.progress.xpToNext', { n: xpToNext })}</span>
          </div>
          <div className={styles.xpBar}>
            <div className={styles.xpFill} style={{ width: `${xpPercent}%` }} />
          </div>
        </Card>

        {/* Charts */}
        <div className={styles.chartsGrid}>
          <Card className={styles.chartCard}>
            <h3>{t('parent.progress.chartXp')}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" tick={axisTick} stroke="var(--color-border)" />
                <YAxis tick={axisTick} stroke="var(--color-border)" />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: 'var(--color-tint)' }}
                  formatter={(v) => [`${v} XP`, 'XP']}
                />
                <Bar dataKey="xp" fill="#6c63ff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className={styles.chartCard}>
            <h3>{t('parent.progress.chartLessons')}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" tick={axisTick} stroke="var(--color-border)" />
                <YAxis tick={axisTick} stroke="var(--color-border)" allowDecimals={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v) => [t('labels.lessonsCount', { count: v }), t('parent.progress.lessonsSeries')]}
                />
                <Line type="monotone" dataKey="lessons" stroke="#43d9ad" strokeWidth={3} dot={{ r: 5, fill: '#43d9ad' }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Badges */}
        {stats?.badges?.length > 0 && (
          <div className={styles.section}>
            <h2>{t('parent.progress.badges')}</h2>
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
          <h2>{t('parent.progress.history')}</h2>
          {progress.length === 0 ? (
            <Card className={styles.emptyState}>
              <span>📭</span>
              <p>{t('parent.progress.empty')}</p>
            </Card>
          ) : (
            <Card className={styles.tableCard}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{t('parent.progress.colLesson')}</th>
                    <th>{t('parent.progress.colDifficulty')}</th>
                    <th>{t('parent.progress.colStatus')}</th>
                    <th>{t('parent.progress.colResult')}</th>
                    <th>{t('parent.progress.colDate')}</th>
                  </tr>
                </thead>
                <tbody>
                  {progress.map((p) => (
                    <tr key={p.id}>
                      <td><b>{localizeLesson(p.lesson, lang).title}</b></td>
                      <td>{t(`labels.difficulty.${p.lesson.difficulty}`)}</td>
                      <td>{t(`labels.status.${p.status}`)}</td>
                      <td>{p.score != null ? <span className={styles.score}>{p.score}%</span> : '—'}</td>
                      <td>{p.completedAt ? new Date(p.completedAt).toLocaleDateString(locale) : '—'}</td>
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
