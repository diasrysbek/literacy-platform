import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useI18n, getErrorMessage } from '@/i18n'
import Button from '@/components/UI/Button'
import SettingsSwitcher from '@/components/SettingsSwitcher/SettingsSwitcher'
import styles from './Auth.module.css'

export default function Register() {
  const { register } = useAuth()
  const { t } = useI18n()
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({
        ...form,
        email: form.email.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
      })
    } catch (err) {
      setError(getErrorMessage(err, t))
    } finally {
      setLoading(false)
    }
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  return (
    <div className={styles.page}>
      <SettingsSwitcher floating />
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      <div className={styles.card}>
        <div className={styles.logo}>🌟</div>
        <h1 className={styles.title}>{t('auth.register.title')}</h1>
        <p className={styles.subtitle}>{t('auth.register.subtitle')}</p>

        {error && <div className={styles.error} role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="reg-first">{t('auth.register.firstName')}</label>
              <input id="reg-first" autoComplete="given-name" placeholder={t('auth.register.firstNamePh')} value={form.firstName} onChange={set('firstName')} required />
            </div>
            <div className={styles.field}>
              <label htmlFor="reg-last">{t('auth.register.lastName')}</label>
              <input id="reg-last" autoComplete="family-name" placeholder={t('auth.register.lastNamePh')} value={form.lastName} onChange={set('lastName')} required />
            </div>
          </div>
          <div className={styles.field}>
            <label htmlFor="reg-email">{t('auth.email')}</label>
            <input id="reg-email" type="email" autoComplete="email" placeholder="parent@example.com" value={form.email} onChange={set('email')} required />
          </div>
          <div className={styles.field}>
            <label htmlFor="reg-password">{t('auth.password')}</label>
            <input id="reg-password" type="password" autoComplete="new-password" placeholder={t('auth.register.passwordPh')} value={form.password} onChange={set('password')} required minLength={6} />
          </div>
          <Button type="submit" fullWidth loading={loading} size="lg">
            {t('auth.register.submit')}
          </Button>
        </form>

        <p className={styles.link}>
          {t('auth.register.haveAccount')} <Link to="/login">{t('auth.register.login')}</Link>
        </p>
      </div>
    </div>
  )
}
