import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '@/services/api'
import Card from '@/components/UI/Card'
import Loader from '@/components/UI/Loader'
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

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/parent/notifications').then((r) => r.data),
  })

  const markRead = useMutation({
    mutationFn: (id) => api.patch(`/parent/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries(['notifications']),
  })

  const markAllRead = useMutation({
    mutationFn: () =>
      Promise.all(
        notifications.filter((n) => !n.isRead).map((n) =>
          api.patch(`/parent/notifications/${n.id}/read`)
        )
      ),
    onSuccess: () => qc.invalidateQueries(['notifications']),
  })

  if (isLoading) return <Loader text="Загрузка уведомлений..." />

  const unread = notifications.filter((n) => !n.isRead)
  const read = notifications.filter((n) => n.isRead)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/dashboard" className={styles.back}>← Назад</Link>
        <div className={styles.headerRight}>
          <h1>🔔 Уведомления</h1>
          {unread.length > 0 && (
            <span className={styles.badge}>{unread.length} новых</span>
          )}
        </div>
        {unread.length > 0 && (
          <button className={styles.markAllBtn} onClick={() => markAllRead.mutate()}>
            Прочитать все
          </button>
        )}
      </header>

      <main className={styles.main}>
        {notifications.length === 0 && (
          <Card className={styles.empty}>
            <div className={styles.emptyIcon}>🔕</div>
            <h3>Нет уведомлений</h3>
            <p>Когда ребёнок пройдёт урок или получит значок — вы увидите это здесь</p>
          </Card>
        )}

        {unread.length > 0 && (
          <div className={styles.group}>
            <h2>🆕 Новые</h2>
            <div className={styles.list}>
              {unread.map((n) => (
                <div
                  key={n.id}
                  className={[styles.notif, styles.unread].join(' ')}
                  onClick={() => markRead.mutate(n.id)}
                >
                  <div
                    className={styles.notifIcon}
                    style={{ background: (typeColor[n.type] || '#6c63ff') + '20', color: typeColor[n.type] || '#6c63ff' }}
                  >
                    {typeIcon[n.type] || '🔔'}
                  </div>
                  <div className={styles.notifContent}>
                    <p>{n.message}</p>
                    <span>{new Date(n.createdAt).toLocaleString('ru-RU')}</span>
                  </div>
                  <div className={styles.dot} />
                </div>
              ))}
            </div>
          </div>
        )}

        {read.length > 0 && (
          <div className={styles.group}>
            <h2>✅ Прочитанные</h2>
            <div className={styles.list}>
              {read.map((n) => (
                <div key={n.id} className={[styles.notif, styles.readNotif].join(' ')}>
                  <div
                    className={styles.notifIcon}
                    style={{ background: '#f0f0f0', color: '#aaa' }}
                  >
                    {typeIcon[n.type] || '🔔'}
                  </div>
                  <div className={styles.notifContent}>
                    <p>{n.message}</p>
                    <span>{new Date(n.createdAt).toLocaleString('ru-RU')}</span>
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
