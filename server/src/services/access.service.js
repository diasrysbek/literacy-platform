import prisma from '../config/db.js'
import { httpError } from '../utils/httpError.js'

// Убеждаемся, что ребёнок принадлежит родителю, который делает запрос.
// Раньше start/complete/progress/stats принимали любой childId от любого
// авторизованного пользователя — можно было читать и менять чужие данные.
export const assertChildAccess = async (userId, childId) => {
  if (!childId || typeof childId !== 'string') throw httpError(400, 'childId is required')
  const child = await prisma.child.findFirst({
    where: { id: childId, parent: { userId } },
    select: { id: true },
  })
  if (!child) throw httpError(404, 'Child not found')
  return child
}
