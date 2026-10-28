import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/i18n'
import SettingsSwitcher from '@/components/SettingsSwitcher/SettingsSwitcher'
import Card from '@/components/UI/Card'
import Button from '@/components/UI/Button'
import Loader from '@/components/UI/Loader'
import NewExerciseEditor, { NEW_TYPES, newExerciseTemplate } from '@/features/admin/components/NewExerciseEditor'
import styles from './CurriculumManager.module.css'

const TYPES = ['READING', 'WRITING', 'PHONICS', 'COMPREHENSION', 'VOCABULARY']
const DIFFS = ['EASY', 'MEDIUM', 'HARD']
const typeEmoji = { READING: '📖', WRITING: '✏️', PHONICS: '🔤', COMPREHENSION: '🧠', VOCABULARY: '📝' }

const emptyExercise = { type: 'multiple_choice', question: '', options: ['', '', '', ''], answer: '' }

const emptyForm = {
  title: '', description: '', type: 'PHONICS', difficulty: 'EASY', xpReward: 10,
  isActive: true, content: { exercises: [] }, translationsText: '',
}

export default function CurriculumManager() {
  const qc = useQueryClient()
  const { logout } = useAuth()
  const { t } = useI18n()
  const [formError, setFormError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editLesson, setEditLesson] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [activeTab, setActiveTab] = useState('info') // 'info' | 'exercises'

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ['adminLessons'],
    // includeInactive: иначе скрытые уроки пропадали из админки и их нельзя было вернуть
    queryFn: () => api.get('/lessons', { params: { includeInactive: true } }).then((r) => r.data),
  })

  const createLesson = useMutation({
    mutationFn: (data) => api.post('/lessons', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adminLessons'] }); closeForm() },
    onError: () => setFormError(t('admin.curriculum.saveError')),
  })

  const updateLesson = useMutation({
    mutationFn: ({ id, data }) => api.put(`/lessons/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adminLessons'] }); closeForm() },
    onError: () => setFormError(t('admin.curriculum.saveError')),
  })

  const deleteLesson = useMutation({
    mutationFn: (id) => api.delete(`/lessons/${id}`),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['adminLessons'] })
      if (res?.data?.deactivated) alert(t('admin.curriculum.deactivated'))
    },
  })

  const closeForm = () => {
    setShowForm(false)
    setEditLesson(null)
    setForm(emptyForm)
    setActiveTab('info')
    setFormError('')
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
      translationsText: lesson.translations ? JSON.stringify(lesson.translations, null, 2) : '',
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
    setFormError('')

    // чистим и проверяем задания перед отправкой
    const exercises = (form.content.exercises || []).map((ex) => {
      if (NEW_TYPES.includes(ex.type)) return { ...ex, question: ex.question.trim() } // картинки не трогаем
      return {
        ...ex,
        question: ex.question.trim(),
        answer: String(ex.answer ?? '').trim(),
        ...(ex.type === 'multiple_choice'
          ? { options: (ex.options || []).map((o) => o.trim()).filter(Boolean) }
          : { options: undefined }),
      }
    })
    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i]
      const fail = (key) => { setFormError(t(key, { n: i + 1 })); setActiveTab('exercises') }
      if (NEW_TYPES.includes(ex.type)) {
        if (ex.type === 'match_pairs') {
          const ok = (ex.pairs || []).filter((p) => p.left.trim() && p.right.trim())
          if (ok.length < 2) return fail('admin.curriculum.needPairs')
          ex.pairs = ok
        } else {
          const key = ex.type === 'choose_picture' || ex.type === 'odd_one_out' ? 'emoji' : 'text'
          // пустые варианты убираем, а индекс правильного пересчитываем
          const kept = []
          let newAnswer = -1
          ;(ex.options || []).forEach((o, k) => {
            if (String(o[key] ?? '').trim()) { if (k === ex.answer) newAnswer = kept.length; kept.push(o) }
          })
          if (kept.length < 2) return fail('admin.curriculum.needOptions')
          if (newAnswer < 0) return fail('admin.curriculum.needAnswer')
          ex.options = kept
          ex.answer = newAnswer
        }
        continue
      }
      if (ex.type === 'multiple_choice' && ex.options.length < 2) return fail('admin.curriculum.needOptions')
      if (!ex.answer || (ex.type === 'multiple_choice' && !ex.options.includes(ex.answer))) return fail('admin.curriculum.needAnswer')
    }

    let translations = null
    if (form.translationsText.trim()) {
      try {
        translations = JSON.parse(form.translationsText)
        if (typeof translations !== 'object' || Array.isArray(translations)) throw new Error('not an object')
      } catch {
        setFormError(t('admin.curriculum.translationsInvalid')); setActiveTab('translations'); return
      }
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      difficulty: form.difficulty,
      // поле number отдаёт строку, а Prisma ждёт Int — раньше сохранение падало с 500
      xpReward: Math.max(1, Math.min(500, Number(form.xpReward) || 10)),
      isActive: form.isActive,
      content: { ...form.content, exercises },
      ...(translations ? { translations } : {}),
    }
    if (editLesson) updateLesson.mutate({ id: editLesson.id, data: payload })
    else createLesson.mutate(payload)
  }

  const setField = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  // Exercise management
  const addExercise = () => {
    setForm({
      ...form,
      content: {
        ...form.content,
        exercises: [...(form.content.exercises || []), { ...emptyExercise, options: ['', '', '', ''] }]
      }
    })
  }

  const removeExercise = (idx) => {
    const exercises = form.content.exercises.filter((_, i) => i !== idx)
    setForm({ ...form, content: { ...form.content, exercises } })
  }

  const updateExercise = (idx, key, value) => {
    const exercises = form.content.exercises.map((ex, i) =>
      i === idx ? { ...ex, [key]: value } : ex
    )
    setForm({ ...form, content: { ...form.content, exercises } })
  }

  const updateOption = (exIdx, optIdx, value) => {
    const exercises = form.content.exercises.map((ex, i) => {
      if (i !== exIdx) return ex
      const options = ex.options.map((o, j) => j === optIdx ? value : o)
      // если правим вариант, отмеченный правильным, ответ должен меняться вместе с ним
      const answer = ex.answer === ex.options[optIdx] ? value : ex.answer
      return { ...ex, options, answer }
    })
    setForm({ ...form, content: { ...form.content, exercises } })
  }

  // при смене типа структура задания меняется целиком, вопрос сохраняем
  const changeType = (idx, type) => {
    const old = form.content.exercises[idx]
    const next = NEW_TYPES.includes(type)
      ? newExerciseTemplate(type, old.question)
      : { ...emptyExercise, options: ['', '', '', ''], type, question: old.question, answer: type === 'true_false' ? 'true' : '' }
    const exercises = form.content.exercises.map((ex, i) => (i === idx ? next : ex))
    setForm({ ...form, content: { ...form.content, exercises } })
  }

  const replaceExercise = (idx, ex) => {
    const exercises = form.content.exercises.map((e, i) => (i === idx ? ex : e))
    setForm({ ...form, content: { ...form.content, exercises } })
  }

  const moveExercise = (idx, dir) => {
    const exercises = [...form.content.exercises]
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= exercises.length) return
    ;[exercises[idx], exercises[newIdx]] = [exercises[newIdx], exercises[idx]]
    setForm({ ...form, content: { ...form.content, exercises } })
  }

  const formFooter = (
    <>
      {formError && <p className={styles.formError} role="alert">{formError}</p>}
      <div className={styles.formBtns}>
        <Button variant="secondary" type="button" onClick={closeForm}>{t('common.cancel')}</Button>
        <Button type="submit" loading={createLesson.isPending || updateLesson.isPending}>
          {editLesson ? t('admin.curriculum.save') : t('admin.curriculum.create')}
        </Button>
      </div>
    </>
  )

  if (isLoading) return <Loader text={t('admin.curriculum.loading')} />

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>📚 Admin</div>
        <nav className={styles.nav}>
          <Link to="/admin" className={styles.navItem}>{t('admin.dashboard')}</Link>
          <span className={styles.navItem + ' ' + styles.active}>{t('admin.lessons')}</span>
        </nav>
        <SettingsSwitcher />
        <Button variant="ghost" size="sm" onClick={logout} className={styles.logoutBtn}>{t('common.logout')}</Button>
      </aside>

      <main className={styles.main}>
        <div className={styles.topBar}>
          <div>
            <h1>{t('admin.curriculum.title')}</h1>
            <p className={styles.subtitle}>{t('admin.curriculum.count', { n: t('labels.lessonsCount', { count: lessons.length }) })}</p>
          </div>
          <Button onClick={openCreate}>{t('admin.curriculum.newLesson')}</Button>
        </div>

        <div className={styles.lessonGrid}>
          {lessons.map((lesson) => (
            <Card key={lesson.id} className={styles.lessonCard}>
              <div className={styles.lessonTop}>
                <span className={styles.typeEmoji}>{typeEmoji[lesson.type]}</span>
                <div className={styles.lessonBadges}>
                  <span className={[styles.diff, styles[lesson.difficulty.toLowerCase()]].join(' ')}>
                    {t(`labels.difficulty.${lesson.difficulty}`)}
                  </span>
                  <span className={lesson.isActive ? styles.lessonActive : styles.inactive}>
                    {lesson.isActive ? t('admin.curriculum.active') : t('admin.curriculum.hidden')}
                  </span>
                </div>
              </div>
              <h3>{lesson.title}</h3>
              <p className={styles.desc}>{lesson.description || t('admin.curriculum.noDesc')}</p>
              <div className={styles.meta}>
                <span>⚡ {lesson.xpReward} XP</span>
                <span>❓ {t('labels.tasksCount', { count: lesson.content?.exercises?.length ?? 0 })}</span>
              </div>
              <div className={styles.cardActions}>
                <Button variant="secondary" size="sm" onClick={() => openEdit(lesson)}>
                  {t('admin.curriculum.edit')}
                </Button>
                <Button variant="danger" size="sm"
                  onClick={() => { if (confirm(t('admin.curriculum.confirmDelete'))) deleteLesson.mutate(lesson.id) }}>
                  🗑️
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {lessons.length === 0 && (
          <div className={styles.empty}>
            <span>📭</span>
            <p>{t('admin.curriculum.empty')}</p>
          </div>
        )}
      </main>

      {showForm && (
        <div className={styles.overlay} onClick={closeForm}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editLesson ? t('admin.curriculum.modalEdit') : t('admin.curriculum.modalNew')}</h2>
              <button className={styles.closeBtn} onClick={closeForm}>✕</button>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
              <button
                className={[styles.tab, activeTab === 'info' ? styles.tabActive : ''].join(' ')}
                onClick={() => setActiveTab('info')}>
                {t('admin.curriculum.tabInfo')}
              </button>
              <button
                className={[styles.tab, activeTab === 'exercises' ? styles.tabActive : ''].join(' ')}
                onClick={() => setActiveTab('exercises')}>
                {t('admin.curriculum.tabExercises', { n: form.content.exercises?.length || 0 })}
              </button>
              <button
                className={[styles.tab, activeTab === 'translations' ? styles.tabActive : ''].join(' ')}
                onClick={() => setActiveTab('translations')}>
                {t('admin.curriculum.tabTranslations')}
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* INFO TAB */}
              {activeTab === 'info' && (
                <div className={styles.tabContent}>
                  <div className={styles.field}>
                    <label>{t('admin.curriculum.name')}</label>
                    <input value={form.title} onChange={setField('title')} placeholder={t('admin.curriculum.namePh')} required />
                  </div>
                  <div className={styles.field}>
                    <label>{t('admin.curriculum.desc')}</label>
                    <textarea value={form.description} onChange={setField('description')}
                      placeholder={t('admin.curriculum.descPh')} rows={3} />
                  </div>
                  <div className={styles.row3}>
                    <div className={styles.field}>
                      <label>{t('admin.curriculum.type')}</label>
                      <select value={form.type} onChange={setField('type')}>
                        {TYPES.map((ty) => <option key={ty} value={ty}>{typeEmoji[ty]} {t(`labels.type.${ty}`)}</option>)}
                      </select>
                    </div>
                    <div className={styles.field}>
                      <label>{t('admin.curriculum.difficulty')}</label>
                      <select value={form.difficulty} onChange={setField('difficulty')}>
                        {DIFFS.map((d) => <option key={d} value={d}>{t(`labels.difficultyPlain.${d}`)}</option>)}
                      </select>
                    </div>
                    <div className={styles.field}>
                      <label>{t('admin.curriculum.xp')}</label>
                      <input type="number" min={1} max={500} value={form.xpReward} onChange={setField('xpReward')} />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.checkboxLabel}>
                      <input type="checkbox" checked={form.isActive}
                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                      {t('admin.curriculum.isActive')}
                    </label>
                  </div>
                  <div className={styles.tabNav}>
                    <Button type="button" variant="secondary" onClick={() => setActiveTab('exercises')}>
                      {t('admin.curriculum.next')}
                    </Button>
                  </div>
                </div>
              )}

              {/* EXERCISES TAB */}
              {activeTab === 'exercises' && (
                <div className={styles.tabContent}>
                  <div className={styles.exercisesHeader}>
                    <p>{t('admin.curriculum.exercisesHint')}</p>
                    <Button type="button" size="sm" onClick={addExercise}>{t('admin.curriculum.addExercise')}</Button>
                  </div>

                  {form.content.exercises?.length === 0 && (
                    <div className={styles.noExercises}>
                      <span>❓</span>
                      <p>{t('admin.curriculum.noExercises')}</p>
                    </div>
                  )}

                  {form.content.exercises?.map((ex, idx) => (
                    <div key={idx} className={styles.exerciseBlock}>
                      <div className={styles.exerciseBlockHeader}>
                        <span className={styles.exerciseNum}>{t('admin.curriculum.exerciseN', { n: idx + 1 })}</span>
                        <div className={styles.exerciseControls}>
                          <button type="button" onClick={() => moveExercise(idx, -1)} disabled={idx === 0}>↑</button>
                          <button type="button" onClick={() => moveExercise(idx, 1)}
                            disabled={idx === form.content.exercises.length - 1}>↓</button>
                          <button type="button" className={styles.removeBtn}
                            onClick={() => removeExercise(idx)}>✕</button>
                        </div>
                      </div>

                      <div className={styles.field}>
                        <label>{t('admin.curriculum.exType')}</label>
                        <select value={ex.type} onChange={(e) => changeType(idx, e.target.value)}>
                          <optgroup label={t('admin.curriculum.groupKids')}>
                            <option value="choose_picture">{t('admin.curriculum.typePicture')}</option>
                            <option value="odd_one_out">{t('admin.curriculum.typeOdd')}</option>
                            <option value="choose_letter">{t('admin.curriculum.typeLetter')}</option>
                            <option value="count">{t('admin.curriculum.typeCount')}</option>
                            <option value="match_pairs">{t('admin.curriculum.typePairs')}</option>
                          </optgroup>
                          <optgroup label={t('admin.curriculum.groupSchool')}>
                            <option value="multiple_choice">{t('admin.curriculum.typeMc')}</option>
                            <option value="true_false">{t('admin.curriculum.typeTf')}</option>
                            <option value="fill_blank">{t('admin.curriculum.typeFb')}</option>
                          </optgroup>
                        </select>
                      </div>

                      <div className={styles.field}>
                        <label>{t('admin.curriculum.question')}</label>
                        <input value={ex.question}
                          onChange={(e) => updateExercise(idx, 'question', e.target.value)}
                          placeholder={t('admin.curriculum.questionPh')} required />
                      </div>

                      {NEW_TYPES.includes(ex.type) && (
                        <NewExerciseEditor ex={ex} onChange={(next) => replaceExercise(idx, next)} />
                      )}

                      {ex.type === 'multiple_choice' && (
                        <div className={styles.optionsGrid}>
                          <label>{t('admin.curriculum.options')}</label>
                          {(ex.options || ['', '', '', '']).map((opt, oi) => (
                            <div key={oi} className={styles.optionRow}>
                              <span className={styles.optionLetter}>{t('admin.curriculum.letters')[oi]}</span>
                              <input value={opt}
                                onChange={(e) => updateOption(idx, oi, e.target.value)}
                                placeholder={t('admin.curriculum.optionPh', { n: oi + 1 })} />
                              <button type="button"
                                className={[styles.answerBtn, ex.answer === opt && opt ? styles.answerSelected : ''].join(' ')}
                                onClick={() => updateExercise(idx, 'answer', opt)}
                                title={t('admin.curriculum.markCorrect')}>
                                {ex.answer === opt && opt ? '✅' : '○'}
                              </button>
                            </div>
                          ))}
                          {ex.answer && <p className={styles.answerHint}>{t('admin.curriculum.correctIs', { a: ex.answer })}</p>}
                        </div>
                      )}

                      {ex.type === 'true_false' && (
                        <div className={styles.field}>
                          <label>{t('admin.curriculum.correctAnswer')}</label>
                          <div className={styles.tfButtons}>
                            <button type="button"
                              className={[styles.tfBtn, ex.answer === 'true' ? styles.tfSelected : ''].join(' ')}
                              onClick={() => updateExercise(idx, 'answer', 'true')}>
                              {t('child.exercise.true')}
                            </button>
                            <button type="button"
                              className={[styles.tfBtn, ex.answer === 'false' ? styles.tfSelected : ''].join(' ')}
                              onClick={() => updateExercise(idx, 'answer', 'false')}>
                              {t('child.exercise.false')}
                            </button>
                          </div>
                        </div>
                      )}

                      {ex.type === 'fill_blank' && (
                        <div className={styles.field}>
                          <label>{t('admin.curriculum.correctAnswer')}</label>
                          <input value={ex.answer}
                            onChange={(e) => updateExercise(idx, 'answer', e.target.value.toLowerCase())}
                            placeholder={t('admin.curriculum.fillPh')} />
                        </div>
                      )}
                    </div>
                  ))}

                  {formFooter}
                </div>
              )}

              {/* TRANSLATIONS TAB */}
              {activeTab === 'translations' && (
                <div className={styles.tabContent}>
                  <p className={styles.answerHint}>{t('admin.curriculum.translationsHint')}</p>
                  <textarea
                    className={styles.jsonArea}
                    value={form.translationsText}
                    onChange={setField('translationsText')}
                    rows={16}
                    spellCheck={false}
                    placeholder={'{\n  "kk": { "title": "...", "description": "...", "exercises": [ ... ] },\n  "en": { "title": "...", "description": "...", "exercises": [ ... ] }\n}'}
                  />
                  {formFooter}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
