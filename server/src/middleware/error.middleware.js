export const errorMiddleware = (err, req, res, next) => {
  console.error(err.stack)

  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'Resource already exists' })
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Resource not found' })
    }
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Invalid token' })
  }

  const status = err.status || 500
  // В проде не раскрываем внутренние сообщения 500-х ошибок (SQL, пути и т.п.)
  const message =
    status >= 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error'

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}
