import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '@/services/api'
import Card from '@/components/UI/Card'
import Button from '@/components/UI/Button'
import Loader from '@/components/UI/Loader'
import styles from './CurriculumManager.module.css'

const TYPES = ['READING', 'WRITING', 'PHONICS', 'COMPREHENSION', 'VOCABULARY']
const DIFFS = ['EASY', 'MEDIUM', 'HARD']
const typeEmoji = { READING: '📖', WRITING: '✏️', PHONICS: '🔤', COMPREHENSION: '🧠', VOCABULARY: '📝' }

const emptyForm = {
  title: '', description: '', type: 'READING', difficulty: 'EASY', xpReward: 10,
  content: { exercises: [] },
}

export default function CurriculumManager() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editLesson, setEditLesson] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ['adminLessons'],
    queryFn: () => api.get('/lessons').then((r) => r.data),
  })

  const createLesson = useMutation({
    mutationFn: (data) => api.post('/lessons', data),
    onSuccess: () => { qc.invalidateQueries(['adminLessons']); closeForm() },
  })

  const updateLesson = useMutation({
    mutationFn: ({ id, data }) => api.put(`/lessons/${id}`, data),
    onSuccess: () => { qc.invalidateQueries(['adminLessons']); closeForm() },
  })

  const deleteLesson = useMutation({
    mutationFn: (id) => api.delete(`/lessons/${id}`),
    onSuccess: () => qc.invalidateQueries(['adminLessons']),
  })

  const closeForm = () => { setShowForm(false); setEditLesson(null); setForm(emptyForm) }

  const openEdit = (lesson) => {
    setEditLesson(lesson)
    setForm({ title: lesson.title, description: lesson.description || '', type: lesson.type, difficulty: lesson.difficulty, xpReward: lesson.xpReward, content: lesson.content })
    setShowForm(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editLesson) updateLesson.mutate({ id: editLesson.id, data: form })
    else createLesson.mutate(form)
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  if (isLoading) return <Loader text="Загрузка уроков..." />

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>📚 Admin</div>
        <nav className={styles.nav}>
          <Link to="/admin" className={styles.navItem}>📊 Дашборд</Link>
          <span className={styles.navItem + ' ' + styles.active}>📖 Уроки</span>
        </nav>
      </aside>

      <main className={styles.main}>
        <div className={styles.topBar}>
          <h1>Управление уроками</h1>
          <Button onClick={() => { setEditLesson(null); setForm(emptyForm); setShowForm(true) }}>
            + Новый урок
          </Button>
        </div>

        <div className={styles.lessonGrid}>
          {lessons.map((lesson) => (
            <Card key={lesson.id} className={styles.lessonCard}>
              <div className={styles.lessonTop}>
                <span className={styles.typeEmoji}>{typeEmoji[lesson.type]}</span>
                <span className={[styles.diff, styles[lesson.difficulty.toLowerCase()]].join(' ')}>
                  {lesson.difficulty}
                </span>
              </div>
              <h3>{lesson.title}</h3>
              <p className={styles.desc}>{lesson.description || 'Нет описания'}</p>
              <div className={styles.meta}>
                <span>⚡ {lesson.xpReward} XP</span>
                <span>❓ {lesson.content?.exercises?.length ?? 0} заданий</span>
              </div>
              <div className={styles.actions}>
                <Button variant="secondary" size="sm" onClick={() => openEdit(lesson)}>✏️ Редактировать</Button>
                <Button
                  variant="danger" size="sm"
                  onClick={() => { if (confirm('Удалить урок?')) deleteLesson.mutate(lesson.id) }}
                >
                  🗑️
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {lessons.length === 0 && (
          <div className={styles.empty}>
            <span>📭</span>
            <p>Уроков пока нет. Создайте первый!</p>
          </div>
        )}
      </main>

      {showForm && (
        <div className={styles.overlay} onClick={closeForm}>
          <Card className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>{editLesson ? '✏️ Редактировать урок' : '➕ Новый урок'}</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label>Название</label>
                <input value={form.title} onChange={set('title')} placeholder="Название урока" required />
              </div>
              <div className={styles.field}>
                <label>Описание</label>
                <input value={form.description} onChange={set('description')} placeholder="Краткое описание" />
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Тип</label>
                  <select value={form.type} onChange={set('type')}>
                    {TYPES.map((t) => <option key={t} value={t}>{typeEmoji[t]} {t}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Сложность</label>
                  <select value={form.difficulty} onChange={set('difficulty')}>
                    {DIFFS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label>XP награда</label>
                  <input type="number" min={1} max={500} value={form.xpReward} onChange={set('xpReward')} />
                </div>
              </div>
              <div className={styles.formBtns}>
                <Button variant="secondary" type="button" onClick={closeForm}>Отмена</Button>
                <Button type="submit" loading={createLesson.isPending || updateLesson.isPending}>
                  {editLesson ? 'Сохранить' : 'Создать'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
