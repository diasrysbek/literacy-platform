import prisma from '../config/db.js'

export const auditLog = (action, entity) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res)
    const before = req.params?.id
      ? await prisma[entity.toLowerCase()]?.findUnique({ where: { id: req.params.id } }).catch(() => null)
      : null

    res.json = async (data) => {
      try {
        if (req.user?.role === 'ADMIN') {
          await prisma.auditLog.create({
            data: {
              adminId: req.user.id,
              action,
              entity,
              entityId: req.params?.id || data?.id || null,
              before: before || undefined,
              after: data || undefined,
            },
          })
        }
      } catch (e) {
        console.error('Audit log error:', e)
      }
      return originalJson(data)
    }
    next()
  }
}
