// Полностью удаляет СТАРЫЕ школьные уроки (l-01 … l-25) вместе с прогрессом детей по ним.
// Запуск:  npm run prisma:remove-legacy
//
// XP, уровни и значки детей не меняются (они уже начислены), пропадает только
// история прохождения именно этих старых уроков. Новые уроки k-01…k-25 не затрагиваются.
import { PrismaClient } from '@prisma/client'
import { legacyLessonIds } from './curriculum.js'

const prisma = new PrismaClient()

async function main() {
  const lessons = await prisma.lesson.findMany({
    where: { id: { in: legacyLessonIds } },
    select: { id: true, title: true },
  })
  if (lessons.length === 0) {
    console.log('Старых уроков в базе нет — удалять нечего.')
    return
  }

  const [progress, lessonsDeleted] = await prisma.$transaction([
    prisma.lessonProgress.deleteMany({ where: { lessonId: { in: legacyLessonIds } } }),
    prisma.lesson.deleteMany({ where: { id: { in: legacyLessonIds } } }),
  ])
  console.log(`✅ Удалено уроков: ${lessonsDeleted.count}, записей прогресса: ${progress.count}`)

  const left = await prisma.lesson.count()
  console.log(`В базе осталось уроков: ${left}`)
}

main()
  .catch((e) => { console.error('❌ Ошибка:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
