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

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' })
  }

  const status = err.status || 500
  const message = err.message || 'Internal server error'

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}
