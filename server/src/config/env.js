import dotenv from 'dotenv'
dotenv.config()

const nodeEnv = process.env.NODE_ENV || 'development'

if (!process.env.JWT_SECRET) {
  // В production без собственного секрета токены можно подделать — не запускаемся.
  if (nodeEnv === 'production') {
    console.error('❌ JWT_SECRET не задан. Задайте длинный случайный секрет (например, openssl rand -hex 32).')
    process.exit(1)
  }
  console.warn('⚠️  JWT_SECRET не задан — используется демо-значение. Только для разработки!')
}

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv,
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  // Часовой пояс для подсчёта «дней подряд» (Казахстан = UTC+5)
  streakUtcOffsetHours: Number(process.env.STREAK_UTC_OFFSET ?? 5),
}
