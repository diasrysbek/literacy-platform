import prisma from '../config/db.js'
import { httpError } from '../utils/httpError.js'

// Родитель может задавать только эти поля. Раньше в БД уходило всё тело запроса,
// и можно было создать ребёнка с любым totalXp / level / streakDays.
const pickChildData = (data = {}) => {
  const out = {}
  for (const key of ['firstName', 'lastName', 'age', 'avatarUrl']) {
    if (data[key] !== undefined) out[key] = data[key]
  }
  if (out.age !== undefined) out.age = Number(out.age)
  return out
}

// без содержимого уроков (там правильные ответы и много лишних данных)
const lessonBrief = { select: { id: true, title: true, type: true, difficulty: true, xpReward: true } }

export const getChildren = async (parentId) => {
  return prisma.child.findMany({
    where: { parentId },
    include: {
      progress: { include: { lesson: lessonBrief } },
      badges: { include: { badge: true } },
    },
    orderBy: { createdAt: 'asc' },
  })
}

export const getChildById = async (childId, parentId) => {
  const child = await prisma.child.findFirst({
    where: { id: childId, parentId },
    include: {
      progress: { include: { lesson: lessonBrief } },
      badges: { include: { badge: true } },
    },
  })
  if (!child) {
    throw httpError(404, 'Child not found')
  }
  return child
}

export const createChild = async (parentId, data) => {
  return prisma.child.create({
    data: { ...pickChildData(data), parentId },
  })
}

export const updateChild = async (childId, parentId, data) => {
  const child = await prisma.child.findFirst({ where: { id: childId, parentId } })
  if (!child) {
    throw httpError(404, 'Child not found')
  }
  return prisma.child.update({ where: { id: childId }, data: pickChildData(data) })
}

export const deleteChild = async (childId, parentId) => {
  const child = await prisma.child.findFirst({ where: { id: childId, parentId } })
  if (!child) {
    throw httpError(404, 'Child not found')
  }
  return prisma.child.delete({ where: { id: childId } })
}
