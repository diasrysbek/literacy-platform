import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '@/services/api'
import { useStore } from '@/app/store'
import { useI18n } from '@/i18n'
import Card from '@/components/UI/Card'
import Loader from '@/components/UI/Loader'
import SettingsSwitcher from '@/components/SettingsSwitcher/SettingsSwitcher'
import styles from './Leaderboard.module.css'

const avatars = ['🦊', '🐼', '🦁', '🐸', '🐧', '🦄', '🐯', '🦋']
const medals = ['🥇', '🥈', '🥉']

export default function Leaderboard() {
  const { t } = useI18n()
  const role = useStore((s) => s.user?.role)

  const { data: leaders = [], isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => api.get('/leaderboard').then((r) => r.data),
  })

  if (isLoading) return <Loader text={t('child.leaderboard.loading')} />

  // Один и тот же ребёнок теперь всегда с одним и тем же аватаром:
  // на подиуме раньше использовался rank, а в списке — индекс, и аватары не совпадали.
  const avatarFor = (index) => avatars[index % avatars.length]

  return (
    <div className={styles.page}>
      <SettingsSwitcher floating />
      <div className={styles.bg} />
      <div className={styles.inner}>
        <Link to={role === 'ADMIN' ? '/admin' : '/dashboard'} className={styles.back}>{t('common.back')}</Link>
        <h1 className={styles.title}>{t('child.leaderboard.title')}</h1>
        <p className={styles.sub}>{t('child.leaderboard.sub')}</p>

        {leaders.length === 0 ? (
          <Card className={styles.empty}>
            <span>📭</span>
            <p>{t('child.leaderboard.empty')}</p>
          </Card>
        ) : (
          <>
            {/* Top 3 podium */}
            {leaders.length >= 3 && (
              <div className={styles.podium}>
                {[1, 0, 2].map((idx) => {
                  const child = leaders[idx]
                  const rank = idx + 1
                  return (
                    <div key={child.id} className={[styles.podiumItem, styles[`rank${rank}`]].join(' ')}>
                      <div className={styles.podiumAvatar}>{avatarFor(idx)}</div>
                      <div className={styles.podiumMedal}>{medals[idx]}</div>
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
                  <div className={styles.avatar}>{avatarFor(i)}</div>
                  <div className={styles.info}>
                    <div className={styles.name}>{child.firstName}</div>
                    <div className={styles.level}>{t('child.leaderboard.level', { n: child.level })}</div>
                  </div>
                  <div className={styles.right}>
                    <div className={styles.xp}>⚡ {child.totalXp} XP</div>
                    <div className={styles.streak}>🔥 {t('labels.streakDays', { count: child.streakDays })}</div>
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
