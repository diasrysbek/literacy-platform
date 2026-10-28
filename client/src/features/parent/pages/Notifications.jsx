import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '@/services/api'
import { useI18n } from '@/i18n'
import Card from '@/components/UI/Card'
import Loader from '@/components/UI/Loader'
import SettingsSwitcher from '@/components/SettingsSwitcher/SettingsSwitcher'
import styles from './Notifications.module.css'

const typeIcon = {
  lesson_complete: '📖',
  badge_earned: '🏅',
  level_up: '🏆',
  streak_risk: '🔥',
}

const typeColor = {
  lesson_complete: '#6c63ff',
  badge_earned: '#ffd166',
  level_up: '#43d9ad',
  streak_risk: '#ff6584',
}

export default function Notifications() {
  const qc = useQueryClient()
  const { t, locale } = useI18n()

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/parent/notifications').then((r) => r.data),
  })

  const refresh = () => qc.invalidateQueries({ queryKey: ['notifications'] })

  const markRead = useMutation({
    mutationFn: (id) => api.patch(`/parent/notifications/${id}/read`),
    onSuccess: refresh,
  })

  const markAllRead = useMutation({
    mutationFn: () =>
      Promise.all(
        notifications.filter((n) => !n.isRead).map((n) =>
          api.patch(`/parent/notifications/${n.id}/read`)
        )
      ),
    onSuccess: refresh,
  })

  if (isLoading) return <Loader text={t('parent.notifications.loading')} />

  const unread = notifications.filter((n) => !n.isRead)
  const read = notifications.filter((n) => n.isRead)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/dashboard" className={styles.back}>{t('common.back')}</Link>
        <div className={styles.headerRight}>
          <h1>{t('parent.notifications.title')}</h1>
          {unread.length > 0 && (
            <span className={styles.badge}>{t('parent.notifications.newCount', { n: unread.length })}</span>
          )}
        </div>
        {unread.length > 0 && (
          <button className={styles.markAllBtn} onClick={() => markAllRead.mutate()}>
            {t('parent.notifications.markAll')}
          </button>
        )}
        <SettingsSwitcher />
      </header>

      <main className={styles.main}>
        {notifications.length === 0 && (
          <Card className={styles.empty}>
            <div className={styles.emptyIcon}>🔕</div>
            <h3>{t('parent.notifications.emptyTitle')}</h3>
            <p>{t('parent.notifications.emptySub')}</p>
          </Card>
        )}

        {unread.length > 0 && (
          <div className={styles.group}>
            <h2>{t('parent.notifications.groupNew')}</h2>
            <div className={styles.list}>
              {unread.map((n) => (
                <div
                  key={n.id}
                  className={[styles.notif, styles.unread].join(' ')}
                  role="button"
                  tabIndex={0}
                  onClick={() => markRead.mutate(n.id)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && markRead.mutate(n.id)}
                >
                  <div
                    className={styles.notifIcon}
                    style={{ background: (typeColor[n.type] || '#6c63ff') + '20', color: typeColor[n.type] || '#6c63ff' }}
                  >
                    {typeIcon[n.type] || '🔔'}
                  </div>
                  <div className={styles.notifContent}>
                    <p>{n.message}</p>
                    <span>{new Date(n.createdAt).toLocaleString(locale)}</span>
                  </div>
                  <div className={styles.dot} />
                </div>
              ))}
            </div>
          </div>
        )}

        {read.length > 0 && (
          <div className={styles.group}>
            <h2>{t('parent.notifications.groupRead')}</h2>
            <div className={styles.list}>
              {read.map((n) => (
                <div key={n.id} className={[styles.notif, styles.readNotif].join(' ')}>
                  <div className={[styles.notifIcon, styles.notifIconRead].join(' ')}>
                    {typeIcon[n.type] || '🔔'}
                  </div>
                  <div className={styles.notifContent}>
                    <p>{n.message}</p>
                    <span>{new Date(n.createdAt).toLocaleString(locale)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
