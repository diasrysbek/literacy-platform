import app from './app.js'
import { config } from './config/env.js'
import prisma from './config/db.js'

const start = async () => {
  try {
    await prisma.$connect()
    console.log('✅ Database connected')

    app.listen(config.port, () => {
      console.log(`🚀 Server running on http://localhost:${config.port}`)
      console.log(`🌍 Environment: ${config.nodeEnv}`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

start()
