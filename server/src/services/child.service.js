import prisma from '../config/db.js'

export const getChildren = async (parentId) => {
  return prisma.child.findMany({
    where: { parentId },
    include: {
      progress: { include: { lesson: true } },
      badges: { include: { badge: true } },
    },
    orderBy: { createdAt: 'asc' },
  })
}

export const getChildById = async (childId, parentId) => {
  const child = await prisma.child.findFirst({
    where: { id: childId, parentId },
    include: {
      progress: { include: { lesson: true } },
      badges: { include: { badge: true } },
    },
  })
  if (!child) {
    const error = new Error('Child not found')
    error.status = 404
    throw error
  }
  return child
}

export const createChild = async (parentId, data) => {
  return prisma.child.create({
    data: { ...data, parentId },
  })
}

export const updateChild = async (childId, parentId, data) => {
  const child = await prisma.child.findFirst({ where: { id: childId, parentId } })
  if (!child) {
    const error = new Error('Child not found')
    error.status = 404
    throw error
  }
  return prisma.child.update({ where: { id: childId }, data })
}

export const deleteChild = async (childId, parentId) => {
  const child = await prisma.child.findFirst({ where: { id: childId, parentId } })
  if (!child) {
    const error = new Error('Child not found')
    error.status = 404
    throw error
  }
  return prisma.child.delete({ where: { id: childId } })
}
