import { Router } from 'express'
import * as adminController from '../controllers/admin.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { roleMiddleware } from '../middleware/role.middleware.js'
import prisma from '../config/db.js'

const router = Router()

router.use(authMiddleware, roleMiddleware('ADMIN'))

router.get('/stats', adminController.getStats)
router.get('/users', adminController.getAllUsers)
router.delete('/users/:id', adminController.deleteUser)
router.get('/badges', adminController.getBadges)
router.post('/badges', adminController.createBadge)

// Audit logs endpoint
router.get('/logs', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20))
    const skip = (page - 1) * limit
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: limit, skip }),
      prisma.auditLog.count(),
    ])
    res.json({ logs, total, page, pages: Math.ceil(total / limit) })
  } catch (error) { next(error) }
})

export default router
