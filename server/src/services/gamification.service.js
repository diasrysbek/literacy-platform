import prisma from '../config/db.js'

export const getChildStats = async (childId) => {
  const child = await prisma.child.findUnique({
    where: { id: childId },
    include: {
      badges: { include: { badge: true } },
      progress: { where: { status: 'COMPLETED' } },
    },
  })
  if (!child) throw new Error('Child not found')

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

    const condition = badge.condition
    let earned = false

    if (condition.type === 'lessons_completed') {
      earned = child.progress.length >= condition.count
    } else if (condition.type === 'xp_reached') {
      earned = child.totalXp >= condition.amount
    } else if (condition.type === 'streak') {
      earned = child.streakDays >= condition.days
    }

    if (earned) {
      await prisma.childBadge.create({ data: { childId, badgeId: badge.id } })
      newBadges.push(badge)
    }
  }

  return newBadges
}

export const updateStreak = async (childId) => {
  const child = await prisma.child.findUnique({ where: { id: childId } })
  const now = new Date()
  const lastActive = child.lastActiveAt

  if (!lastActive) {
    await prisma.child.update({ where: { id: childId }, data: { streakDays: 1, lastActiveAt: now } })
    return 1
  }

  const diffMs = now - lastActive
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  let newStreak = child.streakDays
  if (diffDays === 1) {
    newStreak += 1
  } else if (diffDays > 1) {
    newStreak = 1
  }

  await prisma.child.update({ where: { id: childId }, data: { streakDays: newStreak, lastActiveAt: now } })
  return newStreak
}
