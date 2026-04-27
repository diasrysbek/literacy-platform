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
