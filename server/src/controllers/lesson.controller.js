import * as lessonService from '../services/lesson.service.js'
import * as gamificationService from '../services/gamification.service.js'
import * as notificationService from '../services/notification.service.js'
import prisma from '../config/db.js'

export const getLessons = async (req, res, next) => {
  try {
    const lessons = await lessonService.getLessons(req.query)
    res.json(lessons)
  } catch (error) { next(error) }
}

export const getLesson = async (req, res, next) => {
  try {
    const lesson = await lessonService.getLessonById(req.params.id)
    res.json(lesson)
  } catch (error) { next(error) }
}

export const startLesson = async (req, res, next) => {
  try {
    const { childId } = req.body
    const progress = await lessonService.startLesson(childId, req.params.id)
    res.json(progress)
  } catch (error) { next(error) }
}

export const completeLesson = async (req, res, next) => {
  try {
    const { childId, score } = req.body

    // Получаем уровень ДО завершения
    const childBefore = await prisma.child.findUnique({
      where: { id: childId },
      select: { level: true }
    })

    const progress = await lessonService.completeLesson(childId, req.params.id, score)

    // Получаем урок для уведомления
    const lesson = await lessonService.getLessonById(req.params.id)

    // 1. Уведомление о завершении урока
    await notificationService.notifyLessonComplete(childId, lesson.title, score)

    // 2. Проверяем повышение уровня
    const childAfter = await prisma.child.findUnique({
      where: { id: childId },
      select: { level: true }
    })
    if (childAfter.level > childBefore.level) {
      await notificationService.notifyLevelUp(childId, childAfter.level)
    }

    // 3. Обновляем стрик
    await gamificationService.updateStreak(childId)

    // 4. Проверяем и выдаём значки
    const newBadges = await gamificationService.checkAndAwardBadges(childId)

    // 5. Уведомления о новых значках
    for (const badge of newBadges) {
      await notificationService.notifyBadgeEarned(childId, badge.name, badge.iconUrl)
    }

    res.json({ progress, newBadges })
  } catch (error) { next(error) }
}

export const getChildProgress = async (req, res, next) => {
  try {
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
    await lessonService.deleteLesson(req.params.id)
    res.status(204).send()
  } catch (error) { next(error) }
}
