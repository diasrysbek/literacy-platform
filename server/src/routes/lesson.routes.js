import { Router } from 'express'
import * as lessonController from '../controllers/lesson.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { roleMiddleware } from '../middleware/role.middleware.js'
import { lessonValidation } from '../utils/validators.js'

const router = Router()

router.use(authMiddleware)

// Список и карточка урока доступны родителю и админу
router.get('/', lessonController.getLessons)
router.get('/progress/:childId', roleMiddleware('PARENT'), lessonController.getChildProgress)
router.get('/:id', lessonController.getLesson)

// Прогресс ребёнка меняет только его родитель (проверка владения — в контроллере)
router.post('/:id/start', roleMiddleware('PARENT'), lessonController.startLesson)
router.post('/:id/complete', roleMiddleware('PARENT'), lessonController.completeLesson)

// Admin only
router.post('/', roleMiddleware('ADMIN'), lessonValidation(false), lessonController.createLesson)
router.put('/:id', roleMiddleware('ADMIN'), lessonValidation(true), lessonController.updateLesson)
router.delete('/:id', roleMiddleware('ADMIN'), lessonController.deleteLesson)

export default router
