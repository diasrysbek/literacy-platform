// Урок хранит русский текст в основных полях, а казахский/английский — в translations:
//   translations: { kk: { title, description, exercises: [...] }, en: { ... } }
// Если перевода нет — показываем русский.
export const localizeLesson = (lesson, lang) => {
  if (!lesson || lang === 'ru') return lesson
  const tr = lesson.translations?.[lang]
  if (!tr) return lesson

  const baseExercises = lesson.content?.exercises ?? []
  // переведённое задание накладывается поверх основного (общие поля — эмодзи, ответы —
  // можно не повторять); если в переводе другой набор заданий (уроки про буквы), берём его
  const exercises = Array.isArray(tr.exercises)
    ? tr.exercises.map((ex, i) => ({ ...(baseExercises[i] ?? {}), ...ex }))
    : baseExercises

  return {
    ...lesson,
    title: tr.title || lesson.title,
    description: tr.description ?? lesson.description,
    content: { ...lesson.content, exercises },
  }
}
