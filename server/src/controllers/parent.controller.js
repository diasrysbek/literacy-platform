import prisma from '../config/db.js'

export const getProfile = async (req, res, next) => {
  try {
    const parent = await prisma.parent.findUnique({
      where: { userId: req.user.id },
      include: { children: true },
    })
    res.json(parent)
  } catch (error) {
    next(error)
  }
}

export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName } = req.body
    const parent = await prisma.parent.update({
      where: { userId: req.user.id },
      data: { firstName, lastName },
    })
    res.json(parent)
  } catch (error) {
    next(error)
  }
}

export const getNotifications = async (req, res, next) => {
  try {
    const parent = await prisma.parent.findUnique({ where: { userId: req.user.id } })
    const children = await prisma.child.findMany({ where: { parentId: parent.id }, select: { id: true } })
    const childIds = children.map((c) => c.id)

    const notifications = await prisma.notification.findMany({
      where: { childId: { in: childIds } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    res.json(notifications)
  } catch (error) {
    next(error)
  }
}

export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    })
    res.json(notification)
  } catch (error) {
    next(error)
  }
}
