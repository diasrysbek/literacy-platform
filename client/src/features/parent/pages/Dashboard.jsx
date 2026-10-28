import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import api from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/i18n'
import Card from '@/components/UI/Card'
import Button from '@/components/UI/Button'
import { SkeletonGrid } from '@/components/UI/Skeleton'
import SettingsSwitcher from '@/components/SettingsSwitcher/SettingsSwitcher'
import styles from './Dashboard.module.css'

const avatars = ['🦊', '🐼', '🦁', '🐸', '🐧', '🦄']

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { t } = useI18n()

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
            <Link to="/notifications">{t('parent.dashboard.notifications')}</Link>
            <Link to="/leaderboard">{t('parent.dashboard.leaders')}</Link>
            <Link to="/play">{t('parent.dashboard.play')}</Link>
          </nav>
          <div className={styles.userInfo}>
            <SettingsSwitcher />
            <span>👋 {user?.parent?.firstName}</span>
            <Button variant="ghost" size="sm" onClick={logout}>{t('common.logout')}</Button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.hero}>
          <div>
            <h1>{t('parent.dashboard.title')}</h1>
            <p>{t('parent.dashboard.sub')}</p>
          </div>
          <Button onClick={() => navigate('/play')}>{t('parent.dashboard.addChild')}</Button>
        </div>

        <div className={styles.section}>
          <h2>{t('parent.dashboard.myChildren')}</h2>

          {isLoading ? (
            <SkeletonGrid count={3} />
          ) : children.length === 0 ? (
            <Card className={styles.empty}>
              <div className={styles.emptyIcon}>👶</div>
              <h3>{t('parent.dashboard.emptyTitle')}</h3>
              <p>{t('parent.dashboard.emptySub')}</p>
              <Button onClick={() => navigate('/play')}>{t('parent.dashboard.emptyBtn')}</Button>
            </Card>
          ) : (
            <div className={styles.childGrid}>
              {children.map((child, i) => (
                <Card key={child.id} hoverable className={styles.childCard}
                  onClick={() => navigate(`/progress/${child.id}`)}>
                  <div className={styles.childAvatar}>{avatars[i % avatars.length]}</div>
                  <h3>{child.firstName} {child.lastName}</h3>
                  <p className={styles.childAge}>{t('labels.age', { count: child.age })}</p>

                  <div className={styles.stats}>
                    <div className={styles.stat}>
                      <span className={styles.statValue}>⚡ {child.totalXp}</span>
                      <span className={styles.statLabel}>XP</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statValue}>🏆 {child.level}</span>
                      <span className={styles.statLabel}>{t('parent.dashboard.statLevel')}</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statValue}>🔥 {child.streakDays}</span>
                      <span className={styles.statLabel}>{t('parent.dashboard.statStreak')}</span>
                    </div>
                  </div>

                  <div className={styles.xpBar}>
                    <div className={styles.xpFill} style={{ width: `${child.totalXp % 100}%` }} />
                  </div>
                  <p className={styles.xpLabel}>{t('parent.dashboard.toNext', { n: 100 - (child.totalXp % 100) })}</p>

                  <div className={styles.cardActions}>
                    <button className={styles.playBtn}
                      onClick={(e) => { e.stopPropagation(); navigate(`/play/${child.id}/map`) }}>
                      {t('parent.dashboard.playBtn')}
                    </button>
                    <button className={styles.progressBtn}
                      onClick={(e) => { e.stopPropagation(); navigate(`/progress/${child.id}`) }}>
                      {t('parent.dashboard.progressBtn')}
                    </button>
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
