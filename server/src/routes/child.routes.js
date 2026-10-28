import { Router } from 'express'
import * as childController from '../controllers/child.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { roleMiddleware } from '../middleware/role.middleware.js'
import { childValidation, childUpdateValidation } from '../utils/validators.js'

const router = Router()

router.use(authMiddleware, roleMiddleware('PARENT'))

router.get('/', childController.getChildren)
router.get('/:id', childController.getChild)
router.post('/', childValidation, childController.createChild)
router.put('/:id', childUpdateValidation, childController.updateChild)
router.delete('/:id', childController.deleteChild)
router.get('/:id/stats', childController.getChildStats)

export default router
