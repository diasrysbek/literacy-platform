import prisma from '../config/db.js'
import { hashPassword, comparePassword } from '../utils/hash.js'
import { generateToken } from '../utils/jwt.js'

export const register = async ({ email, password, firstName, lastName }) => {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    const error = new Error('Email already in use')
    error.status = 409
    throw error
  }

  const hashed = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      role: 'PARENT',
      parent: {
        create: { firstName, lastName },
      },
    },
    include: { parent: true },
  })

  const token = generateToken({ userId: user.id, role: user.role })
  return { token, user: { id: user.id, email: user.email, role: user.role, parent: user.parent } }
}

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { parent: true, admin: true },
  })

  if (!user) {
    const error = new Error('Invalid credentials')
    error.status = 401
    throw error
  }

  const valid = await comparePassword(password, user.password)
  if (!valid) {
    const error = new Error('Invalid credentials')
    error.status = 401
    throw error
  }

  const token = generateToken({ userId: user.id, role: user.role })
  const { password: _, ...safeUser } = user
  return { token, user: safeUser }
}

export const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { parent: true, admin: true },
  })
  if (!user) {
    const error = new Error('User not found')
    error.status = 404
    throw error
  }
  const { password: _, ...safeUser } = user
  return safeUser
}