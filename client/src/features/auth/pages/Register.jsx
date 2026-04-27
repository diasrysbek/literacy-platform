import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/UI/Button'
import styles from './Auth.module.css'

export default function Register() {
  const { register } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка регистрации')
    } finally {
      setLoading(false)
    }
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  return (
    <div className={styles.page}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      <div className={styles.card}>
        <div className={styles.logo}>🌟</div>
        <h1 className={styles.title}>Создать аккаунт</h1>
        <p className={styles.subtitle}>Начните обучение вашего ребёнка</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Имя</label>
              <input placeholder="Иван" value={form.firstName} onChange={set('firstName')} required />
            </div>
            <div className={styles.field}>
              <label>Фамилия</label>
              <input placeholder="Иванов" value={form.lastName} onChange={set('lastName')} required />
            </div>
          </div>
          <div className={styles.field}>
            <label>Email</label>
            <input type="email" placeholder="parent@example.com" value={form.email} onChange={set('email')} required />
          </div>
          <div className={styles.field}>
            <label>Пароль</label>
            <input type="password" placeholder="Минимум 6 символов" value={form.password} onChange={set('password')} required minLength={6} />
          </div>
          <Button type="submit" fullWidth loading={loading} size="lg">
            Зарегистрироваться
          </Button>
        </form>

        <p className={styles.link}>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  )
}
