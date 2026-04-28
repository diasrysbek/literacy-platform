import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import swaggerUi from 'swagger-ui-express'
import { config } from './config/env.js'
import { errorMiddleware } from './middleware/error.middleware.js'

import authRoutes from './routes/auth.routes.js'
import parentRoutes from './routes/parent.routes.js'
import childRoutes from './routes/child.routes.js'
import lessonRoutes from './routes/lesson.routes.js'
import adminRoutes from './routes/admin.routes.js'
import leaderboardRoutes from './routes/leaderboard.routes.js'

const app = express()

app.use(helmet({ contentSecurityPolicy: false }))

// CORS — allow all origins
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.options('*', cors())

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })
app.use('/api', limiter)

if (config.nodeEnv === 'development') app.use(morgan('dev'))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const swaggerSpec = {
  openapi: '3.0.0',
  info: { title: 'Literacy Platform API', version: '1.0.0', description: 'API for Children Literacy Learning Platform' },
  servers: [{ url: `http://localhost:${config.port}`, description: 'Development' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
  },
  paths: {
    '/api/auth/register': { post: { tags: ['Auth'], summary: 'Register parent', responses: { 201: { description: 'Registered' } } } },
    '/api/auth/login': { post: { tags: ['Auth'], summary: 'Login', responses: { 200: { description: 'OK' } } } },
    '/api/auth/me': { get: { tags: ['Auth'], summary: 'Get current user', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } } },
    '/api/children': { get: { tags: ['Children'], summary: 'Get children', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } } },
    '/api/lessons': { get: { tags: ['Lessons'], summary: 'Get lessons', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } } },
    '/api/lessons/{id}/complete': { post: { tags: ['Lessons'], summary: 'Complete lesson', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } } },
    '/api/leaderboard': { get: { tags: ['Leaderboard'], summary: 'Get leaderboard', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } } },
    '/api/admin/stats': { get: { tags: ['Admin'], summary: 'Platform stats', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } } },
    '/api/admin/logs': { get: { tags: ['Admin'], summary: 'Audit logs', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } } },
  }
}

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get('/docs.json', (req, res) => res.json(swaggerSpec))

app.use('/api/auth', authRoutes)
app.use('/api/parent', parentRoutes)
app.use('/api/children', childRoutes)
app.use('/api/lessons', lessonRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/leaderboard', leaderboardRoutes)

app.get('/health', (req, res) => res.json({ status: 'ok', env: config.nodeEnv }))
app.use((req, res) => res.status(404).json({ message: 'Route not found' }))
app.use(errorMiddleware)

export default app