import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { lessons, legacyLessonIds } from './curriculum.js'

const prisma = new PrismaClient()

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function main() {
  console.log('🌱 Seeding database...')

  // ── ADMIN ──────────────────────────────────────────────
  // Email и пароль админа задаются переменными ADMIN_EMAIL / ADMIN_PASSWORD.
  // Без ADMIN_PASSWORD используется демо-пароль — на продакшене это запрещено.
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@literacy.com'
  const usingDefaultAdminPassword = !process.env.ADMIN_PASSWORD
  if (usingDefaultAdminPassword && process.env.NODE_ENV === 'production') {
    throw new Error('Задайте ADMIN_PASSWORD: демо-пароль admin123 нельзя использовать в production.')
  }
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12)
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: adminPassword,
      role: 'ADMIN',
      admin: { create: {} },
    },
  })
  console.log(`✅ Admin: ${adminEmail}`)

  // ── BADGES ─────────────────────────────────────────────
  const badgeData = [
    { id: 'badge-1', name: 'Первый урок',    description: 'Завершил первый урок',       iconUrl: '🌟', condition: { type: 'lessons_completed', count: 1 } },
    { id: 'badge-2', name: 'Пять уроков',    description: 'Завершил 5 уроков',           iconUrl: '📚', condition: { type: 'lessons_completed', count: 5 } },
    { id: 'badge-3', name: 'Десять уроков',  description: 'Завершил 10 уроков',          iconUrl: '🎓', condition: { type: 'lessons_completed', count: 10 } },
    { id: 'badge-4', name: 'XP Мастер',      description: 'Набрал 100 XP',              iconUrl: '⚡', condition: { type: 'xp_reached', amount: 100 } },
    { id: 'badge-5', name: 'XP Чемпион',     description: 'Набрал 300 XP',              iconUrl: '💎', condition: { type: 'xp_reached', amount: 300 } },
    { id: 'badge-6', name: 'Стрик 3 дня',    description: 'Занимался 3 дня подряд',     iconUrl: '🔥', condition: { type: 'streak', days: 3 } },
    { id: 'badge-7', name: 'Стрик неделя',   description: 'Занимался 7 дней подряд',    iconUrl: '🏆', condition: { type: 'streak', days: 7 } },
    { id: 'badge-8', name: 'Отличник',       description: 'Прошёл урок на 100%',        iconUrl: '🥇', condition: { type: 'perfect_score' } },
  ]
  for (const b of badgeData) {
    // update: condition — чтобы исправленное условие «Отличника» применилось и в уже заполненной базе
    await prisma.badge.upsert({ where: { id: b.id }, update: { condition: b.condition }, create: b })
  }
  console.log('✅ Badges:', badgeData.length)

  // ── LESSONS (программа для детей 3–6 лет, см. curriculum.js) ──────────
  for (const lesson of lessons) {
    const { id, ...data } = lesson
    // update: data — программа обновляется при каждом запуске seed.
    // Если правили эти уроки через админку, правки будут перезаписаны.
    await prisma.lesson.upsert({ where: { id }, update: data, create: lesson })
  }
  // Старые «школьные» уроки скрываем (не удаляем — у детей может быть прогресс)
  await prisma.lesson.updateMany({ where: { id: { in: legacyLessonIds } }, data: { isActive: false } })
  console.log('✅ Lessons created:', lessons.length, '(старые уроки l-01…l-25 скрыты)')

  // Для «чистой» базы (продакшен, передача покупателю): SEED_DEMO=false
  if (process.env.SEED_DEMO === 'false') {
    console.log('ℹ️  Демо-родители и дети пропущены (SEED_DEMO=false).')
    console.log('🎉 Seeding complete!')
    return
  }

  // ── DEMO PARENTS + CHILDREN WITH RANDOM PROGRESS ───────
  const demoParents = [
    { email: 'anna@test.com', firstName: 'Анна',    lastName: 'Иванова',   children: [
      { firstName: 'Миша',    lastName: 'Иванов',   age: 6, lessonsCount: 15, streakDays: 7  },
      { firstName: 'Соня',    lastName: 'Иванова',  age: 5, lessonsCount: 8,  streakDays: 3  },
    ]},
    { email: 'boris@test.com', firstName: 'Борис',  lastName: 'Петров',    children: [
      { firstName: 'Артём',   lastName: 'Петров',   age: 7, lessonsCount: 20, streakDays: 12 },
    ]},
    { email: 'carla@test.com', firstName: 'Карина', lastName: 'Смирнова',  children: [
      { firstName: 'Алина',   lastName: 'Смирнова', age: 4, lessonsCount: 5,  streakDays: 2  },
      { firstName: 'Дима',    lastName: 'Смирнов',  age: 6, lessonsCount: 25, streakDays: 14 },
    ]},
    { email: 'david@test.com', firstName: 'Давид',  lastName: 'Козлов',    children: [
      { firstName: 'Злата',   lastName: 'Козлова',  age: 5, lessonsCount: 10, streakDays: 5  },
    ]},
    { email: 'elena@test.com', firstName: 'Елена',  lastName: 'Новикова',  children: [
      { firstName: 'Максим',  lastName: 'Новиков',  age: 6, lessonsCount: 18, streakDays: 9  },
      { firstName: 'Вика',    lastName: 'Новикова', age: 4, lessonsCount: 3,  streakDays: 1  },
    ]},
    { email: 'felix@test.com', firstName: 'Фёдор',  lastName: 'Морозов',   children: [
      { firstName: 'Кирилл',  lastName: 'Морозов',  age: 7, lessonsCount: 22, streakDays: 10 },
    ]},
  ]

  const parentPassword = await bcrypt.hash('test123', 12)

  for (const pd of demoParents) {
    const user = await prisma.user.upsert({
      where: { email: pd.email },
      update: {},
      create: {
        email: pd.email, password: parentPassword, role: 'PARENT',
        parent: { create: { firstName: pd.firstName, lastName: pd.lastName } },
      },
      include: { parent: true },
    })

    const parent = user.parent ?? await prisma.parent.findUnique({ where: { userId: user.id } })

    for (const cd of pd.children) {
      // Рандомный XP на основе количества уроков
      const totalXp = cd.lessonsCount * rand(8, 15)
      const level = Math.floor(totalXp / 100) + 1

      const existing = await prisma.child.findFirst({
        where: { parentId: parent.id, firstName: cd.firstName },
      })
      if (existing) continue

      const child = await prisma.child.create({
        data: {
          parentId: parent.id,
          firstName: cd.firstName,
          lastName: cd.lastName,
          age: cd.age,
          totalXp,
          level,
          streakDays: cd.streakDays,
          lastActiveAt: new Date(),
        },
      })

      // Случайный прогресс по урокам
      const shuffled = [...lessons].sort(() => Math.random() - 0.5)
      const toLock = shuffled.slice(0, cd.lessonsCount)

      for (const lesson of toLock) {
        const score = rand(60, 100)
        const daysAgo = rand(0, 14)
        const completedAt = new Date(Date.now() - daysAgo * 86400000)
        await prisma.lessonProgress.create({
          data: {
            childId: child.id,
            lessonId: lesson.id,
            status: 'COMPLETED',
            score,
            attempts: rand(1, 3),
            completedAt,
          },
        })
      }

      // Значки на основе прогресса
      if (cd.lessonsCount >= 1)  await prisma.childBadge.createMany({ data: [{ childId: child.id, badgeId: 'badge-1' }], skipDuplicates: true })
      if (cd.lessonsCount >= 5)  await prisma.childBadge.createMany({ data: [{ childId: child.id, badgeId: 'badge-2' }], skipDuplicates: true })
      if (cd.lessonsCount >= 10) await prisma.childBadge.createMany({ data: [{ childId: child.id, badgeId: 'badge-3' }], skipDuplicates: true })
      if (totalXp >= 100) await prisma.childBadge.createMany({ data: [{ childId: child.id, badgeId: 'badge-4' }], skipDuplicates: true })
      if (totalXp >= 300) await prisma.childBadge.createMany({ data: [{ childId: child.id, badgeId: 'badge-5' }], skipDuplicates: true })
      if (cd.streakDays >= 3) await prisma.childBadge.createMany({ data: [{ childId: child.id, badgeId: 'badge-6' }], skipDuplicates: true })
      if (cd.streakDays >= 7) await prisma.childBadge.createMany({ data: [{ childId: child.id, badgeId: 'badge-7' }], skipDuplicates: true })

      console.log(`  👶 ${child.firstName}: ${totalXp} XP, уровень ${level}, ${cd.lessonsCount} уроков, стрик ${cd.streakDays}`)
    }
  }

  console.log('')
  console.log('🎉 Seeding complete!')
  console.log('')
  console.log('Аккаунты для входа:')
  console.log(usingDefaultAdminPassword ? `  Admin:  ${adminEmail}  / admin123  (демо-пароль, смените!)` : `  Admin:  ${adminEmail}  (пароль из ADMIN_PASSWORD)`)
  console.log('  Parent: anna@test.com       / test123  (2 детей)')
  console.log('  Parent: boris@test.com      / test123  (1 ребёнок)')
  console.log('  Parent: carla@test.com      / test123  (2 детей)')
  console.log('  Parent: david@test.com      / test123  (1 ребёнок)')
  console.log('  Parent: elena@test.com      / test123  (2 детей)')
  console.log('  Parent: felix@test.com      / test123  (1 ребёнок)')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
