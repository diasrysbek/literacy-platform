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
app.use(cors({ origin: config.clientUrl, credentials: true }))

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })
app.use('/api', limiter)

if (config.nodeEnv === 'development') app.use(morgan('dev'))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Swagger spec inline
const swaggerSpec = {
  openapi: '3.0.0',
  info: { title: 'Literacy Platform API', version: '1.0.0', description: 'API for Children Literacy Learning Platform' },
  servers: [{ url: `http://localhost:${config.port}`, description: 'Development' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      User: { type: 'object', properties: { id: { type: 'string' }, email: { type: 'string' }, role: { type: 'string', enum: ['PARENT','ADMIN'] } } },
      Child: { type: 'object', properties: { id: { type: 'string' }, firstName: { type: 'string' }, lastName: { type: 'string' }, age: { type: 'integer' }, totalXp: { type: 'integer' }, level: { type: 'integer' }, streakDays: { type: 'integer' } } },
      Lesson: { type: 'object', properties: { id: { type: 'string' }, title: { type: 'string' }, type: { type: 'string' }, difficulty: { type: 'string' }, xpReward: { type: 'integer' } } },
    }
  },
  paths: {
    '/api/auth/register': { post: { tags: ['Auth'], summary: 'Register parent', requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' }, firstName: { type: 'string' }, lastName: { type: 'string' } } } } } }, responses: { 201: { description: 'Registered successfully' } } } },
    '/api/auth/login': { post: { tags: ['Auth'], summary: 'Login', requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } } } } }, responses: { 200: { description: 'Login successful' } } } },
    '/api/auth/me': { get: { tags: ['Auth'], summary: 'Get current user', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Current user data' } } } },
    '/api/children': { get: { tags: ['Children'], summary: 'Get all children', security: [{ bearerAuth: [] }], responses: { 200: { description: 'List of children' } } }, post: { tags: ['Children'], summary: 'Create child', security: [{ bearerAuth: [] }], requestBody: { content: { 'application/json': { schema: { '$ref': '#/components/schemas/Child' } } } }, responses: { 201: { description: 'Child created' } } } },
    '/api/children/{id}': { get: { tags: ['Children'], summary: 'Get child by ID', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Child data' } } }, put: { tags: ['Children'], summary: 'Update child', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Updated' } } }, delete: { tags: ['Children'], summary: 'Delete child', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Deleted' } } } },
    '/api/children/{id}/stats': { get: { tags: ['Children'], summary: 'Get child stats & XP', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Stats' } } } },
    '/api/lessons': { get: { tags: ['Lessons'], summary: 'Get all lessons', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Lessons list' } } }, post: { tags: ['Lessons'], summary: 'Create lesson (Admin)', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Created' } } } },
    '/api/lessons/{id}': { get: { tags: ['Lessons'], summary: 'Get lesson by ID', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Lesson' } } } },
    '/api/lessons/{id}/start': { post: { tags: ['Lessons'], summary: 'Start a lesson', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { childId: { type: 'string' } } } } } }, responses: { 200: { description: 'Started' } } } },
    '/api/lessons/{id}/complete': { post: { tags: ['Lessons'], summary: 'Complete a lesson & award XP', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { childId: { type: 'string' }, score: { type: 'integer' } } } } } }, responses: { 200: { description: 'Completed, XP awarded' } } } },
    '/api/lessons/progress/{childId}': { get: { tags: ['Lessons'], summary: 'Get child progress', security: [{ bearerAuth: [] }], parameters: [{ name: 'childId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Progress list' } } } },
    '/api/leaderboard': { get: { tags: ['Leaderboard'], summary: 'Get XP leaderboard', security: [{ bearerAuth: [] }], parameters: [{ name: 'ageGroup', in: 'query', schema: { type: 'string', enum: ['young','middle','older'] } }], responses: { 200: { description: 'Leaderboard' } } } },
    '/api/parent/notifications': { get: { tags: ['Parent'], summary: 'Get notifications', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Notifications' } } } },
    '/api/admin/stats': { get: { tags: ['Admin'], summary: 'Platform statistics', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Stats' } } } },
    '/api/admin/users': { get: { tags: ['Admin'], summary: 'All users', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Users' } } } },
  }
}

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get('/docs.json', (req, res) => res.json(swaggerSpec))

// Routes
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
