import prisma from '../config/db.js'

export const getLessons = async (filters = {}) => {
  const where = { isActive: true }
  if (filters.type) where.type = filters.type
  if (filters.difficulty) where.difficulty = filters.difficulty

  return prisma.lesson.findMany({
    where,
    orderBy: { order: 'asc' },
  })
}

export const getLessonById = async (id) => {
  const lesson = await prisma.lesson.findUnique({ where: { id } })
  if (!lesson) {
    const error = new Error('Lesson not found')
    error.status = 404
    throw error
  }
  return lesson
}

export const startLesson = async (childId, lessonId) => {
  return prisma.lessonProgress.upsert({
    where: { childId_lessonId: { childId, lessonId } },
    update: { status: 'IN_PROGRESS', attempts: { increment: 1 } },
    create: { childId, lessonId, status: 'IN_PROGRESS', attempts: 1 },
  })
}

export const completeLesson = async (childId, lessonId, score) => {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } })
  if (!lesson) throw new Error('Lesson not found')

  // Проверяем — был ли урок уже завершён раньше
  const existing = await prisma.lessonProgress.findUnique({
    where: { childId_lessonId: { childId, lessonId } },
  })
  const alreadyCompleted = existing?.status === 'COMPLETED'

  const progress = await prisma.lessonProgress.upsert({
    where: { childId_lessonId: { childId, lessonId } },
    update: {
      status: 'COMPLETED',
      score,
      completedAt: new Date(),
      attempts: { increment: 1 },
    },
    create: {
      childId,
      lessonId,
      status: 'COMPLETED',
      score,
      completedAt: new Date(),
      attempts: 1,
    },
  })

  // XP начисляем только если урок не был завершён раньше
  if (!alreadyCompleted) {
    await prisma.child.update({
      where: { id: childId },
      data: {
        totalXp: { increment: lesson.xpReward },
        lastActiveAt: new Date(),
      },
    })

    // Пересчитываем уровень
    const child = await prisma.child.findUnique({ where: { id: childId } })
    const newLevel = Math.floor(child.totalXp / 100) + 1
    if (newLevel > child.level) {
      await prisma.child.update({
        where: { id: childId },
        data: { level: newLevel },
      })
    }
  } else {
    // Просто обновляем lastActiveAt
    await prisma.child.update({
      where: { id: childId },
      data: { lastActiveAt: new Date() },
    })
  }

  return progress
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
    data: { ...data, order: (maxOrder._max.order || 0) + 1 },
  })
}

export const updateLesson = async (id, data) => {
  return prisma.lesson.update({ where: { id }, data })
}

export const deleteLesson = async (id) => {
  return prisma.lesson.delete({ where: { id } })
}