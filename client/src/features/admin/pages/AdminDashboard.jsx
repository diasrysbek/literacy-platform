import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import Card from '@/components/UI/Card'
import Button from '@/components/UI/Button'
import Loader from '@/components/UI/Loader'
import styles from './AdminDashboard.module.css'

export default function AdminDashboard() {
  const { logout } = useAuth()
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
    onSuccess: () => qc.invalidateQueries(['adminUsers', 'adminStats']),
  })

  if (statsLoading || usersLoading) return <Loader text="Загрузка панели администратора..." />

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>📚 Admin</div>
        <nav className={styles.nav}>
          <span className={styles.navItem + ' ' + styles.active}>📊 Дашборд</span>
          <Link to="/admin/curriculum" className={styles.navItem}>📖 Уроки</Link>
        </nav>
        <Button variant="ghost" size="sm" onClick={logout} className={styles.logoutBtn}>
          Выйти
        </Button>
      </aside>

      <main className={styles.main}>
        <h1 className={styles.title}>Панель администратора</h1>

        {/* Stat cards */}
        <div className={styles.statsGrid}>
          {[
            { icon: '👥', label: 'Пользователей', value: stats?.totalUsers ?? 0, color: '#6c63ff' },
            { icon: '👶', label: 'Детей', value: stats?.totalChildren ?? 0, color: '#ff6584' },
            { icon: '📚', label: 'Уроков', value: stats?.totalLessons ?? 0, color: '#43d9ad' },
            { icon: '✅', label: 'Завершений', value: stats?.completedLessons ?? 0, color: '#ffd166' },
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

        {/* Users table */}
        <Card className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h2>Пользователи</h2>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Имя</th>
                  <th>Роль</th>
                  <th>Дата</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.email}</td>
                    <td>{u.parent ? `${u.parent.firstName} ${u.parent.lastName}` : '—'}</td>
                    <td>
                      <span className={[styles.roleBadge, u.role === 'ADMIN' ? styles.admin : ''].join(' ')}>
                        {u.role}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString('ru-RU')}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          if (confirm('Удалить пользователя?')) deleteUser.mutate(u.id)
                        }}
                      >
                        Удалить
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  )
}
