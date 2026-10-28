import prisma from '../config/db.js'
import { config } from '../config/env.js'
import { httpError } from '../utils/httpError.js'

export const getChildStats = async (childId) => {
  const child = await prisma.child.findUnique({
    where: { id: childId },
    include: {
      badges: { include: { badge: true } },
      progress: { where: { status: 'COMPLETED' } },
    },
  })
  if (!child) throw httpError(404, 'Child not found')

  const completedLessons = child.progress.length
  const xpToNextLevel = (child.level * 100) - child.totalXp

  return {
    totalXp: child.totalXp,
    level: child.level,
    xpToNextLevel: Math.max(0, xpToNextLevel),
    streakDays: child.streakDays,
    completedLessons,
    badges: child.badges,
  }
}

export const checkAndAwardBadges = async (childId) => {
  const child = await prisma.child.findUnique({
    where: { id: childId },
    include: {
      progress: { where: { status: 'COMPLETED' } },
      badges: true,
    },
  })

  const badges = await prisma.badge.findMany()
  const earnedBadgeIds = child.badges.map((b) => b.badgeId)
  const newBadges = []

  for (const badge of badges) {
    if (earnedBadgeIds.includes(badge.id)) continue

    const condition = badge.condition || {}
    let earned = false

    if (condition.type === 'lessons_completed') {
      earned = child.progress.length >= condition.count
    } else if (condition.type === 'xp_reached') {
      earned = child.totalXp >= condition.amount
    } else if (condition.type === 'streak') {
      earned = child.streakDays >= condition.days
    } else if (condition.type === 'perfect_score') {
      // значок «Отличник»: раньше у него было то же условие, что и у «Первого урока»,
      // и он выдавался за любой первый урок, а не за 100%
      earned = child.progress.some((p) => p.score === 100)
    }

    if (earned) {
      await prisma.childBadge.create({ data: { childId, badgeId: badge.id } })
      newBadges.push(badge)
    }
  }

  return newBadges
}

// Номер «календарного дня» с учётом часового пояса (по умолчанию UTC+5)
const dayNumber = (date) =>
  Math.floor((date.getTime() + config.streakUtcOffsetHours * 3600000) / 86400000)

export const updateStreak = async (childId) => {
  const child = await prisma.child.findUnique({ where: { id: childId } })
  const now = new Date()

  let newStreak
  if (!child.lastActiveAt) {
    newStreak = 1
  } else {
    // Считаем разницу в календарных днях, а не в 24-часовых отрезках:
    // занятие в 21:00 и затем в 08:00 следующего дня — это уже «два дня подряд»
    const diffDays = dayNumber(now) - dayNumber(child.lastActiveAt)
    if (diffDays <= 0) newStreak = Math.max(child.streakDays, 1)
    else if (diffDays === 1) newStreak = child.streakDays + 1
    else newStreak = 1
  }

  await prisma.child.update({
    where: { id: childId },
    data: { streakDays: newStreak, lastActiveAt: now },
  })
  return newStreak
}
