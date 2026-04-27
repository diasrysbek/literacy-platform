import prisma from '../config/db.js'

export const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalChildren, totalLessons, completedLessons] = await Promise.all([
      prisma.user.count(),
      prisma.child.count(),
      prisma.lesson.count(),
      prisma.lessonProgress.count({ where: { status: 'COMPLETED' } }),
    ])

    res.json({ totalUsers, totalChildren, totalLessons, completedLessons })
  } catch (error) {
    next(error)
  }
}

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, createdAt: true, parent: true },
      orderBy: { createdAt: 'desc' },
    })
    res.json(users)
  } catch (error) {
    next(error)
  }
}

export const deleteUser = async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

export const createBadge = async (req, res, next) => {
  try {
    const badge = await prisma.badge.create({ data: req.body })
    res.status(201).json(badge)
  } catch (error) {
    next(error)
  }
}

export const getBadges = async (req, res, next) => {
  try {
    const badges = await prisma.badge.findMany()
    res.json(badges)
  } catch (error) {
    next(error)
  }
}
