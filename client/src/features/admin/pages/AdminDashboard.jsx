import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/i18n'
import Card from '@/components/UI/Card'
import Button from '@/components/UI/Button'
import Loader from '@/components/UI/Loader'
import SettingsSwitcher from '@/components/SettingsSwitcher/SettingsSwitcher'
import styles from './AdminDashboard.module.css'

export default function AdminDashboard() {
  const { user: me, logout } = useAuth()
  const { t, locale } = useI18n()
  const qc = useQueryClient()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => api.get('/admin/stats').then((r) => r.data),
  })

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => api.get('/admin/users').then((r) => r.data),
  })

  const deleteUser = useMutation({
    mutationFn: (id) => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      // v5: объект с queryKey; раньше массив из двух ключей читался как ОДИН ключ и ничего не обновлял
      qc.invalidateQueries({ queryKey: ['adminUsers'] })
      qc.invalidateQueries({ queryKey: ['adminStats'] })
    },
  })

  if (statsLoading || usersLoading) return <Loader text={t('admin.loading')} />

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>📚 Admin</div>
        <nav className={styles.nav}>
          <span className={styles.navItem + ' ' + styles.active}>{t('admin.dashboard')}</span>
          <Link to="/admin/curriculum" className={styles.navItem}>{t('admin.lessons')}</Link>
        </nav>
        <SettingsSwitcher />
        <Button variant="ghost" size="sm" onClick={logout} className={styles.logoutBtn}>
          {t('common.logout')}
        </Button>
      </aside>

      <main className={styles.main}>
        <h1 className={styles.title}>{t('admin.title')}</h1>

        <div className={styles.statsGrid}>
          {[
            { icon: '👥', label: t('admin.stats.users'), value: stats?.totalUsers ?? 0, color: '#6c63ff' },
            { icon: '👶', label: t('admin.stats.children'), value: stats?.totalChildren ?? 0, color: '#ff6584' },
            { icon: '📚', label: t('admin.stats.lessons'), value: stats?.totalLessons ?? 0, color: '#43d9ad' },
            { icon: '✅', label: t('admin.stats.completions'), value: stats?.completedLessons ?? 0, color: '#ffd166' },
          ].map((s) => (
            <Card key={s.label} className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: s.color + '20', color: s.color }}>
                {s.icon}
              </div>
              <div className={styles.statVal}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </Card>
          ))}
        </div>

        <Card className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h2>{t('admin.users')}</h2>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('admin.colEmail')}</th>
                  <th>{t('admin.colName')}</th>
                  <th>{t('admin.colRole')}</th>
                  <th>{t('admin.colDate')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isMe = u.id === me?.id
                  return (
                    <tr key={u.id}>
                      <td>{u.email}</td>
                      <td>{u.parent ? `${u.parent.firstName} ${u.parent.lastName}` : '—'}</td>
                      <td>
                        <span className={[styles.roleBadge, u.role === 'ADMIN' ? styles.admin : ''].join(' ')}>
                          {u.role}
                        </span>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString(locale)}</td>
                      <td>
                        {isMe ? (
                          <span className={styles.statLabel}>{t('admin.you')}</span>
                        ) : (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              if (confirm(t('admin.confirmDeleteUser'))) deleteUser.mutate(u.id)
                            }}
                          >
                            {t('admin.delete')}
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  )
}
