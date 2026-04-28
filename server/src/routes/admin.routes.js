import { Router } from 'express'
import * as adminController from '../controllers/admin.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { roleMiddleware } from '../middleware/role.middleware.js'

const router = Router()

router.use(authMiddleware, roleMiddleware('ADMIN'))

router.get('/stats', adminController.getStats)
router.get('/users', adminController.getAllUsers)
router.delete('/users/:id', adminController.deleteUser)
router.get('/badges', adminController.getBadges)
router.post('/badges', adminController.createBadge)

export default router

// Audit logs endpoint
router.get('/logs', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit
    const logs = await (await import('../config/db.js')).default.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    })
    const total = await (await import('../config/db.js')).default.auditLog.count()
    res.json({ logs, total, page, pages: Math.ceil(total / limit) })
  } catch (error) { next(error) }
})
