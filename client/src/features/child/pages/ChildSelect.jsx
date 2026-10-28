import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '@/services/api'
import { useI18n, getErrorMessage } from '@/i18n'
import Card from '@/components/UI/Card'
import Button from '@/components/UI/Button'
import Loader from '@/components/UI/Loader'
import SettingsSwitcher from '@/components/SettingsSwitcher/SettingsSwitcher'
import styles from './ChildSelect.module.css'

const avatars = ['🦊', '🐼', '🦁', '🐸', '🐧', '🦄']
const emptyForm = { firstName: '', lastName: '', age: '' }

export default function ChildSelect() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { t } = useI18n()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const { data: children = [], isLoading } = useQuery({
    queryKey: ['children'],
    queryFn: () => api.get('/children').then((r) => r.data),
  })

  const createChild = useMutation({
    mutationFn: (data) => api.post('/children', data),
    onSuccess: () => {
      // TanStack Query v5: invalidateQueries принимает объект, а не массив —
      // со старым вызовом список детей не обновлялся
      qc.invalidateQueries({ queryKey: ['children'] })
      setShowForm(false)
      setForm(emptyForm)
    },
  })

  const closeForm = () => {
    setShowForm(false)
    createChild.reset()
  }

  const handleCreate = (e) => {
    e.preventDefault()
    createChild.mutate({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      age: Number(form.age),
    })
  }

  if (isLoading) return <Loader text={t('common.loading')} />

  return (
    <div className={styles.page}>
      <SettingsSwitcher floating />
      <div className={styles.blob} />
      <div className={styles.inner}>
        <h1 className={styles.title}>{t('child.select.title')}</h1>
        <p className={styles.sub}>{t('child.select.sub')}</p>

        <div className={styles.grid}>
          {children.map((child, i) => (
            <button
              key={child.id}
              className={styles.childBtn}
              onClick={() => navigate(`/play/${child.id}/map`)}
            >
              <div className={styles.avatar}>{avatars[i % avatars.length]}</div>
              <span>{child.firstName}</span>
              <div className={styles.level}>{t('child.select.level', { n: child.level })}</div>
            </button>
          ))}

          <button className={styles.addBtn} onClick={() => setShowForm(true)}>
            <span className={styles.plus}>+</span>
            <span>{t('child.select.newChild')}</span>
          </button>
        </div>

        {showForm && (
          <div className={styles.overlay} onClick={closeForm}>
            <Card className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h2>{t('child.select.addTitle')}</h2>
              <form onSubmit={handleCreate} className={styles.form}>
                <input
                  placeholder={t('child.select.firstName')}
                  aria-label={t('child.select.firstName')}
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                />
                <input
                  placeholder={t('child.select.lastName')}
                  aria-label={t('child.select.lastName')}
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                />
                <input
                  type="number"
                  placeholder={t('child.select.age')}
                  aria-label={t('child.select.age')}
                  min={3} max={7}
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  required
                />
                {createChild.isError && (
                  <p className={styles.formError} role="alert">{getErrorMessage(createChild.error, t)}</p>
                )}
                <div className={styles.formBtns}>
                  <Button variant="secondary" onClick={closeForm} type="button">{t('common.cancel')}</Button>
                  <Button type="submit" loading={createChild.isPending}>{t('child.select.add')}</Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        <button className={styles.backLink} onClick={() => navigate('/dashboard')}>
          {t('child.select.back')}
        </button>
      </div>
    </div>
  )
}
