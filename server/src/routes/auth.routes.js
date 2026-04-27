import { Router } from 'express'
import * as authController from '../controllers/auth.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { registerValidation, loginValidation } from '../utils/validators.js'

const router = Router()

router.post('/register', registerValidation, authController.register)
router.post('/login', loginValidation, authController.login)
router.get('/me', authMiddleware, authController.getMe)

export default router
