import prisma from '../config/db.js'

// Найти parentId по childId
const getParentId = async (childId) => {
  const child = await prisma.child.findUnique({
    where: { id: childId },
    select: { parentId: true, firstName: true },
  })
  return child
}

// Создать уведомление
export const createNotification = async (childId, type, message) => {
  try {
    await prisma.notification.create({
      data: { childId, type, message },
    })
  } catch (e) {
    console.error('Notification error:', e)
  }
}

// Урок завершён
export const notifyLessonComplete = async (childId, lessonTitle, score) => {
  const child = await getParentId(childId)
  if (!child) return
  await createNotification(
    childId,
    'lesson_complete',
    `🎉 ${child.firstName} завершил урок "${lessonTitle}" с результатом ${score}%!`
  )
}

// Получен значок
export const notifyBadgeEarned = async (childId, badgeName, badgeIcon) => {
  const child = await getParentId(childId)
  if (!child) return
  await createNotification(
    childId,
    'badge_earned',
    `${badgeIcon} ${child.firstName} получил новый значок: "${badgeName}"!`
  )
}

// Повышение уровня
export const notifyLevelUp = async (childId, newLevel) => {
  const child = await getParentId(childId)
  if (!child) return
  await createNotification(
    childId,
    'level_up',
    `🏆 ${child.firstName} достиг уровня ${newLevel}! Отличная работа!`
  )
}

// Стрик в опасности (можно вызывать по расписанию)
export const notifyStreakAtRisk = async (childId, streakDays) => {
  const child = await getParentId(childId)
  if (!child) return
  await createNotification(
    childId,
    'streak_risk',
    `🔥 ${child.firstName} не занимался сегодня! Стрик ${streakDays} дней под угрозой!`
  )
}
