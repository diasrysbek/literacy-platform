// Проверка ответов для «школьных» типов заданий (выбор текста, ввод, верно/неверно).
// Новые задания для малышей (картинки, счёт, пары) проверяются прямо в ExerciseCard.
export const normalize = (value) => String(value ?? '').trim().toLowerCase()

export const isAnswerCorrect = (exercise, answer) => {
  // информационные карточки без ответа считаем пройденными
  if (!exercise || exercise.answer === undefined || exercise.answer === null || exercise.answer === '') {
    return true
  }
  return normalize(answer) === normalize(exercise.answer)
}

// results — массив { correct: boolean }: ответил ли ребёнок верно с первой попытки
export const calculateScore = (exercises, results) => {
  if (!exercises.length) return 100
  const correct = exercises.filter((_, i) => results[i]?.correct).length
  return Math.round((correct / exercises.length) * 100)
}
