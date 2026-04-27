import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '@/services/api'
import Card from '@/components/UI/Card'
import Loader from '@/components/UI/Loader'
import styles from './Leaderboard.module.css'

const avatars = ['🦊', '🐼', '🦁', '🐸', '🐧', '🦄', '🐯', '🦋']
const medals = ['🥇', '🥈', '🥉']

export default function Leaderboard() {
  const { data: leaders = [], isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => api.get('/leaderboard').then((r) => r.data),
  })

  if (isLoading) return <Loader text="Загрузка таблицы лидеров..." />

  return (
    <div className={styles.page}>
      <div className={styles.bg} />
      <div className={styles.inner}>
        <Link to="/dashboard" className={styles.back}>← Назад</Link>
        <h1 className={styles.title}>🏆 Таблица лидеров</h1>
        <p className={styles.sub}>Топ учеников по XP очкам</p>

        {leaders.length === 0 ? (
          <Card className={styles.empty}>
            <span>📭</span>
            <p>Пока нет данных</p>
          </Card>
        ) : (
          <>
            {/* Top 3 podium */}
            {leaders.length >= 3 && (
              <div className={styles.podium}>
                {[leaders[1], leaders[0], leaders[2]].map((child, i) => {
                  const rank = i === 1 ? 1 : i === 0 ? 2 : 3
                  return (
                    <div key={child.id} className={[styles.podiumItem, styles[`rank${rank}`]].join(' ')}>
                      <div className={styles.podiumAvatar}>{avatars[rank % avatars.length]}</div>
                      <div className={styles.podiumMedal}>{medals[rank - 1]}</div>
                      <div className={styles.podiumName}>{child.firstName}</div>
                      <div className={styles.podiumXp}>⚡ {child.totalXp} XP</div>
                      <div className={styles.podiumBlock} style={{ height: rank === 1 ? 120 : rank === 2 ? 90 : 70 }} />
                    </div>
                  )
                })}
              </div>
            )}

            {/* Full list */}
            <div className={styles.list}>
              {leaders.map((child, i) => (
                <Card key={child.id} className={[styles.row, i < 3 ? styles.topRow : ''].join(' ')}>
                  <div className={styles.rank}>
                    {i < 3 ? medals[i] : <span className={styles.rankNum}>{i + 1}</span>}
                  </div>
                  <div className={styles.avatar}>{avatars[i % avatars.length]}</div>
                  <div className={styles.info}>
                    <div className={styles.name}>{child.firstName}</div>
                    <div className={styles.level}>Уровень {child.level}</div>
                  </div>
                  <div className={styles.right}>
                    <div className={styles.xp}>⚡ {child.totalXp} XP</div>
                    <div className={styles.streak}>🔥 {child.streakDays} дней</div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
