import { Router } from 'express'
import * as parentController from '../controllers/parent.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { roleMiddleware } from '../middleware/role.middleware.js'

const router = Router()

router.use(authMiddleware, roleMiddleware('PARENT'))

router.get('/profile', parentController.getProfile)
router.put('/profile', parentController.updateProfile)
router.get('/notifications', parentController.getNotifications)
router.patch('/notifications/:id/read', parentController.markNotificationRead)

export default router
