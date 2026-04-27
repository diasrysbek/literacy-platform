import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import prisma from '../config/db.js'

const router = Router()

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { ageGroup } = req.query
    const where = {}
    if (ageGroup === 'young') where.age = { lte: 5 }
    else if (ageGroup === 'middle') where.age = { gte: 6, lte: 7 }
    else if (ageGroup === 'older') where.age = { gte: 8 }

    const leaders = await prisma.child.findMany({
      where,
      orderBy: { totalXp: 'desc' },
      take: 20,
      select: { id: true, firstName: true, totalXp: true, level: true, streakDays: true, age: true },
    })
    res.json(leaders)
  } catch (error) {
    next(error)
  }
})

export default router
