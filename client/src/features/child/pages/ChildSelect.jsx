import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '@/services/api'
import Card from '@/components/UI/Card'
import Button from '@/components/UI/Button'
import Loader from '@/components/UI/Loader'
import styles from './ChildSelect.module.css'

const avatars = ['🦊', '🐼', '🦁', '🐸', '🐧', '🦄']

export default function ChildSelect() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '', age: '' })

  const { data: children = [], isLoading } = useQuery({
    queryKey: ['children'],
    queryFn: () => api.get('/children').then((r) => r.data),
  })

  const createChild = useMutation({
    mutationFn: (data) => api.post('/children', data),
    onSuccess: () => {
      qc.invalidateQueries(['children'])
      setShowForm(false)
      setForm({ firstName: '', lastName: '', age: '' })
    },
  })

  const handleCreate = (e) => {
    e.preventDefault()
    createChild.mutate({ ...form, age: Number(form.age) })
  }

  if (isLoading) return <Loader text="Загрузка..." />

  return (
    <div className={styles.page}>
      <div className={styles.blob} />
      <div className={styles.inner}>
        <h1 className={styles.title}>Кто будет учиться? 🌟</h1>
        <p className={styles.sub}>Выберите профиль или добавьте нового ребёнка</p>

        <div className={styles.grid}>
          {children.map((child, i) => (
            <button
              key={child.id}
              className={styles.childBtn}
              onClick={() => navigate(`/play/${child.id}/map`)}
            >
              <div className={styles.avatar}>{avatars[i % avatars.length]}</div>
              <span>{child.firstName}</span>
              <div className={styles.level}>Ур. {child.level}</div>
            </button>
          ))}

          <button className={styles.addBtn} onClick={() => setShowForm(true)}>
            <span className={styles.plus}>+</span>
            <span>Новый ребёнок</span>
          </button>
        </div>

        {showForm && (
          <div className={styles.overlay} onClick={() => setShowForm(false)}>
            <Card className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h2>👶 Добавить ребёнка</h2>
              <form onSubmit={handleCreate} className={styles.form}>
                <input
                  placeholder="Имя"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                />
                <input
                  placeholder="Фамилия"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                />
                <input
                  type="number"
                  placeholder="Возраст"
                  min={3} max={18}
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  required
                />
                <div className={styles.formBtns}>
                  <Button variant="secondary" onClick={() => setShowForm(false)} type="button">Отмена</Button>
                  <Button type="submit" loading={createChild.isPending}>Добавить</Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        <button className={styles.backLink} onClick={() => navigate('/dashboard')}>
          ← Вернуться в панель
        </button>
      </div>
    </div>
  )
}
