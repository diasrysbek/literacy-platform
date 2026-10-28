import prisma from '../config/db.js'
import { httpError } from '../utils/httpError.js'

// Поля, которые можно менять через API (защита от mass-assignment)
const pickLessonData = (data = {}) => {
  const out = {}
  for (const key of ['title', 'description', 'type', 'difficulty', 'xpReward', 'isActive', 'content', 'translations']) {
    if (data[key] === undefined) continue
    if (key === 'translations' && data[key] === null) continue // Prisma не принимает обычный null для Json
    out[key] = data[key]
  }
  if (out.xpReward !== undefined) out.xpReward = Number(out.xpReward)
  return out
}

export const getLessons = async (filters = {}, { isAdmin = false } = {}) => {
  const where = {}
  // скрытые уроки видит только админ и только по явному запросу
  if (!(isAdmin && String(filters.includeInactive) === 'true')) where.isActive = true
  if (filters.type) where.type = filters.type
  if (filters.difficulty) where.difficulty = filters.difficulty

  return prisma.lesson.findMany({
    where,
    orderBy: { order: 'asc' },
  })
}

export const getLessonById = async (id, { isAdmin = false } = {}) => {
  const lesson = await prisma.lesson.findUnique({ where: { id } })
  if (!lesson || (!lesson.isActive && !isAdmin)) throw httpError(404, 'Lesson not found')
  return lesson
}

export const startLesson = async (childId, lessonId) => {
  const existing = await prisma.lessonProgress.findUnique({
    where: { childId_lessonId: { childId, lessonId } },
  })

  // Раньше повторный «старт» сбрасывал COMPLETED в IN_PROGRESS — урок переставал считаться
  // пройденным и при следующем завершении XP начислялся снова (накрутка XP).
  if (existing) {
    return prisma.lessonProgress.update({
      where: { id: existing.id },
      data: {
        attempts: { increment: 1 },
        ...(existing.status !== 'COMPLETED' && { status: 'IN_PROGRESS' }),
      },
    })
  }
  return prisma.lessonProgress.create({
    data: { childId, lessonId, status: 'IN_PROGRESS', attempts: 1 },
  })
}

export const completeLesson = async (childId, lessonId, score) => {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } })
  if (!lesson) throw httpError(404, 'Lesson not found')

  const where = { childId_lessonId: { childId, lessonId } }

  // гарантируем, что строка прогресса существует
  await prisma.lessonProgress.upsert({
    where,
    update: {},
    create: { childId, lessonId, status: 'IN_PROGRESS', attempts: 0 },
  })

  // Атомарно «занимаем» первое завершение: updateMany сработает ровно для одного из
  // параллельных запросов, поэтому двойной клик не даст двойной XP.
  const claim = await prisma.lessonProgress.updateMany({
    where: { childId, lessonId, status: { not: 'COMPLETED' } },
    data: { status: 'COMPLETED', score, completedAt: new Date(), attempts: { increment: 1 } },
  })
  const firstCompletion = claim.count === 1

  if (!firstCompletion) {
    await prisma.lessonProgress.update({
      where,
      data: { score, completedAt: new Date(), attempts: { increment: 1 } },
    })
  }

  let xpAwarded = 0
  if (firstCompletion) {
    const child = await prisma.child.update({
      where: { id: childId },
      data: { totalXp: { increment: lesson.xpReward } },
    })
    xpAwarded = lesson.xpReward
    const newLevel = Math.floor(child.totalXp / 100) + 1
    if (newLevel !== child.level) {
      await prisma.child.update({ where: { id: childId }, data: { level: newLevel } })
    }
  }
  // lastActiveAt здесь больше не трогаем: им управляет updateStreak.
  // Раньше он перезаписывался до подсчёта стрика, и серия дней никогда не росла.

  const progress = await prisma.lessonProgress.findUnique({ where })
  return { progress, xpAwarded }
}

export const getChildProgress = async (childId) => {
  return prisma.lessonProgress.findMany({
    where: { childId },
    include: { lesson: true },
    orderBy: { updatedAt: 'desc' },
  })
}

export const createLesson = async (data) => {
  const maxOrder = await prisma.lesson.aggregate({ _max: { order: true } })
  return prisma.lesson.create({
    data: { ...pickLessonData(data), order: (maxOrder._max.order || 0) + 1 },
  })
}

export const updateLesson = async (id, data) => {
  return prisma.lesson.update({ where: { id }, data: pickLessonData(data) })
}

// Если у урока есть прогресс детей, физически удалить его нельзя (внешний ключ) —
// раньше это заканчивалось ошибкой 500. Такой урок просто скрываем.
export const deleteLesson = async (id) => {
  const used = await prisma.lessonProgress.count({ where: { lessonId: id } })
  if (used > 0) {
    await prisma.lesson.update({ where: { id }, data: { isActive: false } })
    return { deactivated: true }
  }
  await prisma.lesson.delete({ where: { id } })
  return { deactivated: false }
}
