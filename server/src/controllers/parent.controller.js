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
    // отмечать можно только уведомления о своих детях (раньше — любое по id)
    const result = await prisma.notification.updateMany({
      where: { id: req.params.id, child: { parent: { userId: req.user.id } } },
      data: { isRead: true },
    })
    if (result.count === 0) return res.status(404).json({ message: 'Notification not found' })
    res.json({ id: req.params.id, isRead: true })
  } catch (error) {
    next(error)
  }
}
