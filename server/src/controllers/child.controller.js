import * as childService from '../services/child.service.js'
import * as gamificationService from '../services/gamification.service.js'

export const getChildren = async (req, res, next) => {
  try {
    const parent = await import('../config/db.js').then((m) =>
      m.default.parent.findUnique({ where: { userId: req.user.id } })
    )
    const children = await childService.getChildren(parent.id)
    res.json(children)
  } catch (error) {
    next(error)
  }
}

export const getChild = async (req, res, next) => {
  try {
    const parent = await import('../config/db.js').then((m) =>
      m.default.parent.findUnique({ where: { userId: req.user.id } })
    )
    const child = await childService.getChildById(req.params.id, parent.id)
    res.json(child)
  } catch (error) {
    next(error)
  }
}

export const createChild = async (req, res, next) => {
  try {
    const parent = await import('../config/db.js').then((m) =>
      m.default.parent.findUnique({ where: { userId: req.user.id } })
    )
    const child = await childService.createChild(parent.id, req.body)
    res.status(201).json(child)
  } catch (error) {
    next(error)
  }
}

export const updateChild = async (req, res, next) => {
  try {
    const parent = await import('../config/db.js').then((m) =>
      m.default.parent.findUnique({ where: { userId: req.user.id } })
    )
    const child = await childService.updateChild(req.params.id, parent.id, req.body)
    res.json(child)
  } catch (error) {
    next(error)
  }
}

export const deleteChild = async (req, res, next) => {
  try {
    const parent = await import('../config/db.js').then((m) =>
      m.default.parent.findUnique({ where: { userId: req.user.id } })
    )
    await childService.deleteChild(req.params.id, parent.id)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

export const getChildStats = async (req, res, next) => {
  try {
    const stats = await gamificationService.getChildStats(req.params.id)
    res.json(stats)
  } catch (error) {
    next(error)
  }
}
