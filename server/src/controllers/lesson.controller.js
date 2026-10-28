import * as lessonService from '../services/lesson.service.js'
import * as gamificationService from '../services/gamification.service.js'
import * as notificationService from '../services/notification.service.js'
import { assertChildAccess } from '../services/access.service.js'
import { httpError } from '../utils/httpError.js'
import prisma from '../config/db.js'

const isAdmin = (req) => req.user?.role === 'ADMIN'

export const getLessons = async (req, res, next) => {
  try {
    const lessons = await lessonService.getLessons(req.query, { isAdmin: isAdmin(req) })
    res.json(lessons)
  } catch (error) { next(error) }
}

export const getLesson = async (req, res, next) => {
  try {
    const lesson = await lessonService.getLessonById(req.params.id, { isAdmin: isAdmin(req) })
    res.json(lesson)
  } catch (error) { next(error) }
}

export const startLesson = async (req, res, next) => {
  try {
    const { childId } = req.body
    await assertChildAccess(req.user.id, childId)
    await lessonService.getLessonById(req.params.id)
    const progress = await lessonService.startLesson(childId, req.params.id)
    res.json(progress)
  } catch (error) { next(error) }
}

export const completeLesson = async (req, res, next) => {
  try {
    const { childId, score } = req.body
    await assertChildAccess(req.user.id, childId)
    if (!Number.isInteger(score) || score < 0 || score > 100) {
      throw httpError(400, 'score must be an integer between 0 and 100')
    }
    await lessonService.getLessonById(req.params.id)

    const childBefore = await prisma.child.findUnique({
      where: { id: childId },
      select: { level: true },
    })

    const { progress, xpAwarded } = await lessonService.completeLesson(childId, req.params.id, score)
    const lesson = await lessonService.getLessonById(req.params.id)

    await notificationService.notifyLessonComplete(childId, lesson.title, score)

    const childAfter = await prisma.child.findUnique({
      where: { id: childId },
      select: { level: true },
    })
    if (childAfter.level > childBefore.level) {
      await notificationService.notifyLevelUp(childId, childAfter.level)
    }

    await gamificationService.updateStreak(childId)

    const newBadges = await gamificationService.checkAndAwardBadges(childId)
    for (const badge of newBadges) {
      await notificationService.notifyBadgeEarned(childId, badge.name, badge.iconUrl)
    }

    res.json({ progress, xpAwarded, newBadges })
  } catch (error) { next(error) }
}

export const getChildProgress = async (req, res, next) => {
  try {
    await assertChildAccess(req.user.id, req.params.childId)
    const progress = await lessonService.getChildProgress(req.params.childId)
    res.json(progress)
  } catch (error) { next(error) }
}

export const createLesson = async (req, res, next) => {
  try {
    const lesson = await lessonService.createLesson(req.body)
    res.status(201).json(lesson)
  } catch (error) { next(error) }
}

export const updateLesson = async (req, res, next) => {
  try {
    const lesson = await lessonService.updateLesson(req.params.id, req.body)
    res.json(lesson)
  } catch (error) { next(error) }
}

export const deleteLesson = async (req, res, next) => {
  try {
    const result = await lessonService.deleteLesson(req.params.id)
    res.json(result)
  } catch (error) { next(error) }
}
