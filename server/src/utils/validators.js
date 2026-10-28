import { body, validationResult } from 'express-validator'

export const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const list = errors.array()
    // message нужен клиенту, errors — для отладки
    return res.status(400).json({ message: list[0].msg === 'Invalid value' ? `Invalid ${list[0].path}` : list[0].msg, errors: list })
  }
  next()
}

export const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6, max: 128 }).withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().trim().isLength({ max: 60 }),
  body('lastName').notEmpty().trim().isLength({ max: 60 }),
  validate,
]

export const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate,
]

export const childValidation = [
  body('firstName').notEmpty().trim().isLength({ max: 60 }),
  body('lastName').notEmpty().trim().isLength({ max: 60 }),
  body('age').isInt({ min: 3, max: 7 }),
  validate,
]

export const childUpdateValidation = [
  body('firstName').optional().notEmpty().trim().isLength({ max: 60 }),
  body('lastName').optional().notEmpty().trim().isLength({ max: 60 }),
  body('age').optional().isInt({ min: 3, max: 7 }),
  validate,
]

const TYPES = ['READING', 'WRITING', 'PHONICS', 'COMPREHENSION', 'VOCABULARY']
const DIFFS = ['EASY', 'MEDIUM', 'HARD']

export const lessonValidation = (partial = false) => {
  const opt = (chain) => (partial ? chain.optional() : chain)
  return [
    opt(body('title').notEmpty().trim().isLength({ max: 120 })),
    opt(body('type').isIn(TYPES)),
    opt(body('difficulty').isIn(DIFFS)).optional(),
    body('xpReward').optional().isInt({ min: 1, max: 500 }),
    body('isActive').optional().isBoolean(),
    body('content').optional().isObject(),
    body('translations').optional({ nullable: true }).isObject(),
    validate,
  ]
}
