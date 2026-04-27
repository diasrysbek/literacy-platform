import { Router } from 'express'
import * as lessonController from '../controllers/lesson.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { roleMiddleware } from '../middleware/role.middleware.js'

const router = Router()

router.use(authMiddleware)

// Parent & child accessible
router.get('/', lessonController.getLessons)
router.get('/:id', lessonController.getLesson)
router.post('/:id/start', lessonController.startLesson)
router.post('/:id/complete', lessonController.completeLesson)
router.get('/progress/:childId', lessonController.getChildProgress)

// Admin only
router.post('/', roleMiddleware('ADMIN'), lessonController.createLesson)
router.put('/:id', roleMiddleware('ADMIN'), lessonController.updateLesson)
router.delete('/:id', roleMiddleware('ADMIN'), lessonController.deleteLesson)

export default router
