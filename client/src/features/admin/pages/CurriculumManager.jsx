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
const diffLabel = { EASY: '🟢 Лёгкий', MEDIUM: '🟡 Средний', HARD: '🔴 Сложный' }

const emptyExercise = { type: 'multiple_choice', question: '', options: ['', '', '', ''], answer: '' }

const emptyForm = {
  title: '', description: '', type: 'PHONICS', difficulty: 'EASY', xpReward: 10,
  isActive: true, content: { exercises: [] },
}

export default function CurriculumManager() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editLesson, setEditLesson] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [activeTab, setActiveTab] = useState('info') // 'info' | 'exercises'

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

  const closeForm = () => {
    setShowForm(false)
    setEditLesson(null)
    setForm(emptyForm)
    setActiveTab('info')
  }

  const openEdit = (lesson) => {
    setEditLesson(lesson)
    setForm({
      title: lesson.title,
      description: lesson.description || '',
      type: lesson.type,
      difficulty: lesson.difficulty,
      xpReward: lesson.xpReward,
      isActive: lesson.isActive,
      content: lesson.content || { exercises: [] },
    })
    setShowForm(true)
    setActiveTab('info')
  }

  const openCreate = () => {
    setEditLesson(null)
    setForm(emptyForm)
    setShowForm(true)
    setActiveTab('info')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editLesson) updateLesson.mutate({ id: editLesson.id, data: form })
    else createLesson.mutate(form)
  }

  const setField = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  // Exercise management
  const addExercise = () => {
    setForm({
      ...form,
      content: {
        exercises: [...(form.content.exercises || []), { ...emptyExercise, options: ['', '', '', ''] }]
      }
    })
  }

  const removeExercise = (idx) => {
    const exercises = form.content.exercises.filter((_, i) => i !== idx)
    setForm({ ...form, content: { exercises } })
  }

  const updateExercise = (idx, key, value) => {
    const exercises = form.content.exercises.map((ex, i) =>
      i === idx ? { ...ex, [key]: value } : ex
    )
    setForm({ ...form, content: { exercises } })
  }

  const updateOption = (exIdx, optIdx, value) => {
    const exercises = form.content.exercises.map((ex, i) => {
      if (i !== exIdx) return ex
      const options = ex.options.map((o, j) => j === optIdx ? value : o)
      return { ...ex, options }
    })
    setForm({ ...form, content: { exercises } })
  }

  const moveExercise = (idx, dir) => {
    const exercises = [...form.content.exercises]
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= exercises.length) return
    ;[exercises[idx], exercises[newIdx]] = [exercises[newIdx], exercises[idx]]
    setForm({ ...form, content: { exercises } })
  }

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
          <div>
            <h1>Управление уроками</h1>
            <p className={styles.subtitle}>{lessons.length} уроков в системе</p>
          </div>
          <Button onClick={openCreate}>+ Новый урок</Button>
        </div>

        <div className={styles.lessonGrid}>
          {lessons.map((lesson) => (
            <Card key={lesson.id} className={styles.lessonCard}>
              <div className={styles.lessonTop}>
                <span className={styles.typeEmoji}>{typeEmoji[lesson.type]}</span>
                <div className={styles.lessonBadges}>
                  <span className={[styles.diff, styles[lesson.difficulty.toLowerCase()]].join(' ')}>
                    {diffLabel[lesson.difficulty]}
                  </span>
                  <span className={lesson.isActive ? styles.active : styles.inactive}>
                    {lesson.isActive ? '✅ Активен' : '❌ Скрыт'}
                  </span>
                </div>
              </div>
              <h3>{lesson.title}</h3>
              <p className={styles.desc}>{lesson.description || 'Нет описания'}</p>
              <div className={styles.meta}>
                <span>⚡ {lesson.xpReward} XP</span>
                <span>❓ {lesson.content?.exercises?.length ?? 0} заданий</span>
              </div>
              <div className={styles.cardActions}>
                <Button variant="secondary" size="sm" onClick={() => openEdit(lesson)}>
                  ✏️ Редактировать
                </Button>
                <Button variant="danger" size="sm"
                  onClick={() => { if (confirm('Удалить урок?')) deleteLesson.mutate(lesson.id) }}>
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
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editLesson ? '✏️ Редактировать урок' : '➕ Новый урок'}</h2>
              <button className={styles.closeBtn} onClick={closeForm}>✕</button>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
              <button
                className={[styles.tab, activeTab === 'info' ? styles.tabActive : ''].join(' ')}
                onClick={() => setActiveTab('info')}>
                📋 Основное
              </button>
              <button
                className={[styles.tab, activeTab === 'exercises' ? styles.tabActive : ''].join(' ')}
                onClick={() => setActiveTab('exercises')}>
                ❓ Задания ({form.content.exercises?.length || 0})
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* INFO TAB */}
              {activeTab === 'info' && (
                <div className={styles.tabContent}>
                  <div className={styles.field}>
                    <label>Название *</label>
                    <input value={form.title} onChange={setField('title')} placeholder="Буква А" required />
                  </div>
                  <div className={styles.field}>
                    <label>Описание</label>
                    <textarea value={form.description} onChange={setField('description')}
                      placeholder="Краткое описание урока" rows={3} />
                  </div>
                  <div className={styles.row3}>
                    <div className={styles.field}>
                      <label>Тип</label>
                      <select value={form.type} onChange={setField('type')}>
                        {TYPES.map((t) => <option key={t} value={t}>{typeEmoji[t]} {t}</option>)}
                      </select>
                    </div>
                    <div className={styles.field}>
                      <label>Сложность</label>
                      <select value={form.difficulty} onChange={setField('difficulty')}>
                        {DIFFS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className={styles.field}>
                      <label>XP награда</label>
                      <input type="number" min={1} max={500} value={form.xpReward} onChange={setField('xpReward')} />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.checkboxLabel}>
                      <input type="checkbox" checked={form.isActive}
                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                      Урок активен (виден детям)
                    </label>
                  </div>
                  <div className={styles.tabNav}>
                    <Button type="button" variant="secondary" onClick={() => setActiveTab('exercises')}>
                      Далее: Задания →
                    </Button>
                  </div>
                </div>
              )}

              {/* EXERCISES TAB */}
              {activeTab === 'exercises' && (
                <div className={styles.tabContent}>
                  <div className={styles.exercisesHeader}>
                    <p>Добавьте задания для урока</p>
                    <Button type="button" size="sm" onClick={addExercise}>+ Добавить задание</Button>
                  </div>

                  {form.content.exercises?.length === 0 && (
                    <div className={styles.noExercises}>
                      <span>❓</span>
                      <p>Нет заданий. Нажмите "+ Добавить задание"</p>
                    </div>
                  )}

                  {form.content.exercises?.map((ex, idx) => (
                    <div key={idx} className={styles.exerciseBlock}>
                      <div className={styles.exerciseBlockHeader}>
                        <span className={styles.exerciseNum}>Задание {idx + 1}</span>
                        <div className={styles.exerciseControls}>
                          <button type="button" onClick={() => moveExercise(idx, -1)} disabled={idx === 0}>↑</button>
                          <button type="button" onClick={() => moveExercise(idx, 1)}
                            disabled={idx === form.content.exercises.length - 1}>↓</button>
                          <button type="button" className={styles.removeBtn}
                            onClick={() => removeExercise(idx)}>✕</button>
                        </div>
                      </div>

                      <div className={styles.field}>
                        <label>Тип задания</label>
                        <select value={ex.type} onChange={(e) => updateExercise(idx, 'type', e.target.value)}>
                          <option value="multiple_choice">🔘 Выбор ответа</option>
                          <option value="true_false">✅ Верно/Неверно</option>
                          <option value="fill_blank">✍️ Вписать ответ</option>
                        </select>
                      </div>

                      <div className={styles.field}>
                        <label>Вопрос *</label>
                        <input value={ex.question}
                          onChange={(e) => updateExercise(idx, 'question', e.target.value)}
                          placeholder="Введите вопрос..." required />
                      </div>

                      {ex.type === 'multiple_choice' && (
                        <div className={styles.optionsGrid}>
                          <label>Варианты ответов</label>
                          {(ex.options || ['', '', '', '']).map((opt, oi) => (
                            <div key={oi} className={styles.optionRow}>
                              <span className={styles.optionLetter}>{['А','Б','В','Г'][oi]}</span>
                              <input value={opt}
                                onChange={(e) => updateOption(idx, oi, e.target.value)}
                                placeholder={`Вариант ${oi + 1}`} />
                              <button type="button"
                                className={[styles.answerBtn, ex.answer === opt && opt ? styles.answerSelected : ''].join(' ')}
                                onClick={() => updateExercise(idx, 'answer', opt)}
                                title="Отметить как правильный ответ">
                                {ex.answer === opt && opt ? '✅' : '○'}
                              </button>
                            </div>
                          ))}
                          {ex.answer && <p className={styles.answerHint}>✅ Правильный ответ: {ex.answer}</p>}
                        </div>
                      )}

                      {ex.type === 'true_false' && (
                        <div className={styles.field}>
                          <label>Правильный ответ</label>
                          <div className={styles.tfButtons}>
                            <button type="button"
                              className={[styles.tfBtn, ex.answer === 'true' ? styles.tfSelected : ''].join(' ')}
                              onClick={() => updateExercise(idx, 'answer', 'true')}>
                              ✅ Верно
                            </button>
                            <button type="button"
                              className={[styles.tfBtn, ex.answer === 'false' ? styles.tfSelected : ''].join(' ')}
                              onClick={() => updateExercise(idx, 'answer', 'false')}>
                              ❌ Неверно
                            </button>
                          </div>
                        </div>
                      )}

                      {ex.type === 'fill_blank' && (
                        <div className={styles.field}>
                          <label>Правильный ответ</label>
                          <input value={ex.answer}
                            onChange={(e) => updateExercise(idx, 'answer', e.target.value.toLowerCase())}
                            placeholder="Введите правильный ответ (строчными буквами)" />
                        </div>
                      )}
                    </div>
                  ))}

                  <div className={styles.formBtns}>
                    <Button variant="secondary" type="button" onClick={closeForm}>Отмена</Button>
                    <Button type="submit" loading={createLesson.isPending || updateLesson.isPending}>
                      {editLesson ? '💾 Сохранить' : '✨ Создать урок'}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
