import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import api from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import Card from '@/components/UI/Card'
import Button from '@/components/UI/Button'
import { SkeletonGrid } from '@/components/UI/Skeleton'
import styles from './Dashboard.module.css'

const avatars = ['🦊', '🐼', '🦁', '🐸', '🐧', '🦄']

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const { data: children = [], isLoading } = useQuery({
    queryKey: ['children'],
    queryFn: () => api.get('/children').then((r) => r.data),
  })

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>📚 LiteracyPlatform</div>
          <nav className={styles.nav}>
            <Link to="/notifications">🔔 Уведомления</Link>
            <Link to="/leaderboard">🏆 Лидеры</Link>
            <Link to="/play">🎮 Играть</Link>
          </nav>
          <div className={styles.userInfo}>
            <span>👋 {user?.parent?.firstName}</span>
            <Button variant="ghost" size="sm" onClick={logout}>Выйти</Button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.hero}>
          <div>
            <h1>Панель родителя</h1>
            <p>Следите за прогрессом ваших детей</p>
          </div>
          <Button onClick={() => navigate('/play')}>+ Добавить ребёнка</Button>
        </div>

        <div className={styles.section}>
          <h2>Мои дети</h2>

          {isLoading ? (
            <SkeletonGrid count={3} />
          ) : children.length === 0 ? (
            <Card className={styles.empty}>
              <div className={styles.emptyIcon}>👶</div>
              <h3>Нет детей</h3>
              <p>Добавьте ребёнка, чтобы начать обучение</p>
              <Button onClick={() => navigate('/play')}>Добавить ребёнка</Button>
            </Card>
          ) : (
            <div className={styles.childGrid}>
              {children.map((child, i) => (
                <Card key={child.id} hoverable className={styles.childCard}
                  onClick={() => navigate(`/progress/${child.id}`)}>
                  <div className={styles.childAvatar}>{avatars[i % avatars.length]}</div>
                  <h3>{child.firstName} {child.lastName}</h3>
                  <p className={styles.childAge}>{child.age} лет</p>

                  <div className={styles.stats}>
                    <div className={styles.stat}>
                      <span className={styles.statValue}>⚡ {child.totalXp}</span>
                      <span className={styles.statLabel}>XP</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statValue}>🏆 {child.level}</span>
                      <span className={styles.statLabel}>Уровень</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statValue}>🔥 {child.streakDays}</span>
                      <span className={styles.statLabel}>Стрик</span>
                    </div>
                  </div>

                  <div className={styles.xpBar}>
                    <div className={styles.xpFill} style={{ width: `${child.totalXp % 100}%` }} />
                  </div>
                  <p className={styles.xpLabel}>До следующего уровня: {100 - (child.totalXp % 100)} XP</p>

                  <div className={styles.cardActions}>
                    <button className={styles.playBtn}
                      onClick={(e) => { e.stopPropagation(); navigate(`/play/${child.id}/map`) }}>
                      🎮 Играть
                    </button>
                    <button className={styles.progressBtn}>📊 Прогресс</button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
