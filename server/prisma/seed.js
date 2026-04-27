import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function main() {
  console.log('🌱 Seeding database...')

  // ── ADMIN ──────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@literacy.com' },
    update: {},
    create: {
      email: 'admin@literacy.com',
      password: adminPassword,
      role: 'ADMIN',
      admin: { create: {} },
    },
  })
  console.log('✅ Admin: admin@literacy.com / admin123')

  // ── BADGES ─────────────────────────────────────────────
  const badgeData = [
    { id: 'badge-1', name: 'Первый урок',    description: 'Завершил первый урок',       iconUrl: '🌟', condition: { type: 'lessons_completed', count: 1 } },
    { id: 'badge-2', name: 'Пять уроков',    description: 'Завершил 5 уроков',           iconUrl: '📚', condition: { type: 'lessons_completed', count: 5 } },
    { id: 'badge-3', name: 'Десять уроков',  description: 'Завершил 10 уроков',          iconUrl: '🎓', condition: { type: 'lessons_completed', count: 10 } },
    { id: 'badge-4', name: 'XP Мастер',      description: 'Набрал 100 XP',              iconUrl: '⚡', condition: { type: 'xp_reached', amount: 100 } },
    { id: 'badge-5', name: 'XP Чемпион',     description: 'Набрал 300 XP',              iconUrl: '💎', condition: { type: 'xp_reached', amount: 300 } },
    { id: 'badge-6', name: 'Стрик 3 дня',    description: 'Занимался 3 дня подряд',     iconUrl: '🔥', condition: { type: 'streak', days: 3 } },
    { id: 'badge-7', name: 'Стрик неделя',   description: 'Занимался 7 дней подряд',    iconUrl: '🏆', condition: { type: 'streak', days: 7 } },
    { id: 'badge-8', name: 'Отличник',       description: 'Прошёл урок на 100%',        iconUrl: '🥇', condition: { type: 'lessons_completed', count: 1 } },
  ]
  for (const b of badgeData) {
    await prisma.badge.upsert({ where: { id: b.id }, update: {}, create: b })
  }
  console.log('✅ Badges:', badgeData.length)

  // ── LESSONS ────────────────────────────────────────────
  const lessons = [
    // PHONICS – буквы
    { id: 'l-01', title: 'Буква А', description: 'Учим букву А — арбуз, аист, апельсин', type: 'PHONICS', difficulty: 'EASY', xpReward: 10, order: 1, content: { exercises: [
      { type: 'multiple_choice', question: 'Какая это буква?  А', options: ['А','Б','В','Г'], answer: 'А' },
      { type: 'true_false', question: 'Слово "Арбуз" начинается с буквы А?', answer: 'true' },
      { type: 'multiple_choice', question: 'Что начинается на А?', options: ['Арбуз','Банан','Груша','Дыня'], answer: 'Арбуз' },
      { type: 'fill_blank', question: 'Напиши букву с которой начинается слово "Апельсин"', answer: 'а' },
    ]}},
    { id: 'l-02', title: 'Буква Б', description: 'Учим букву Б — банан, бабочка, белка', type: 'PHONICS', difficulty: 'EASY', xpReward: 10, order: 2, content: { exercises: [
      { type: 'multiple_choice', question: 'Что начинается на букву Б?', options: ['Банан','Арбуз','Виноград','Груша'], answer: 'Банан' },
      { type: 'true_false', question: 'Слово "Бабочка" начинается с буквы Б?', answer: 'true' },
      { type: 'fill_blank', question: 'Напиши первую букву слова "Белка"', answer: 'б' },
      { type: 'multiple_choice', question: 'Буква Б стоит в алфавите...', options: ['Второй','Первой','Третьей','Пятой'], answer: 'Второй' },
    ]}},
    { id: 'l-03', title: 'Буква В', description: 'Учим букву В — волк, ворона, вишня', type: 'PHONICS', difficulty: 'EASY', xpReward: 10, order: 3, content: { exercises: [
      { type: 'multiple_choice', question: 'Что начинается на В?', options: ['Волк','Слон','Кот','Пёс'], answer: 'Волк' },
      { type: 'true_false', question: 'Слово "Ворона" начинается с В?', answer: 'true' },
      { type: 'fill_blank', question: 'Напиши букву с которой начинается "Вишня"', answer: 'в' },
    ]}},
    { id: 'l-04', title: 'Буква Г', description: 'Учим букву Г — гусь, гриб, груша', type: 'PHONICS', difficulty: 'EASY', xpReward: 10, order: 4, content: { exercises: [
      { type: 'multiple_choice', question: 'Что начинается на Г?', options: ['Гусь','Утка','Кошка','Собака'], answer: 'Гусь' },
      { type: 'true_false', question: '"Гриб" начинается с буквы Г?', answer: 'true' },
      { type: 'fill_blank', question: 'Первая буква слова "Груша"', answer: 'г' },
    ]}},
    { id: 'l-05', title: 'Буква Д', description: 'Учим букву Д — дом, дерево, дельфин', type: 'PHONICS', difficulty: 'EASY', xpReward: 10, order: 5, content: { exercises: [
      { type: 'multiple_choice', question: 'Что начинается на Д?', options: ['Дом','Кот','Мяч','Стол'], answer: 'Дом' },
      { type: 'true_false', question: '"Дельфин" начинается с Д?', answer: 'true' },
      { type: 'fill_blank', question: 'Буква с которой начинается "Дерево"', answer: 'д' },
      { type: 'multiple_choice', question: 'В слове ДОМ сколько букв?', options: ['3','2','4','5'], answer: '3' },
    ]}},
    // READING – слова и предложения
    { id: 'l-06', title: 'Простые слова', description: 'Читаем слова из 3–4 букв', type: 'READING', difficulty: 'EASY', xpReward: 15, order: 6, content: { exercises: [
      { type: 'multiple_choice', question: 'Прочитай: М-А-М-А', options: ['Мама','Папа','Баба','Дядя'], answer: 'Мама' },
      { type: 'multiple_choice', question: 'Прочитай: П-А-П-А', options: ['Папа','Мама','Баба','Тётя'], answer: 'Папа' },
      { type: 'true_false', question: 'Слово "ДОМ" состоит из 3 букв?', answer: 'true' },
      { type: 'fill_blank', question: 'Допиши: МА__А', answer: 'мама' },
    ]}},
    { id: 'l-07', title: 'Слова про семью', description: 'Мама, папа, бабушка, дедушка', type: 'READING', difficulty: 'EASY', xpReward: 15, order: 7, content: { exercises: [
      { type: 'multiple_choice', question: 'Кто это: МАМА?', options: ['Мама','Папа','Дядя','Тётя'], answer: 'Мама' },
      { type: 'true_false', question: 'Бабушка — это мама мамы?', answer: 'true' },
      { type: 'multiple_choice', question: 'Как называется папа папы?', options: ['Дедушка','Дядя','Брат','Сын'], answer: 'Дедушка' },
      { type: 'fill_blank', question: 'Напиши слово: мама', answer: 'мама' },
    ]}},
    { id: 'l-08', title: 'Читаем предложения', description: 'Составляем и читаем простые предложения', type: 'READING', difficulty: 'MEDIUM', xpReward: 20, order: 8, content: { exercises: [
      { type: 'multiple_choice', question: 'Выбери правильное предложение:', options: ['Кошка пьёт молоко','Молоко кошка пьёт','Пьёт кошка молоко','Молоко пьёт'], answer: 'Кошка пьёт молоко' },
      { type: 'true_false', question: 'Предложение начинается с большой буквы?', answer: 'true' },
      { type: 'multiple_choice', question: 'Закончи: "Собака живёт в..."', options: ['Будке','Гнезде','Норе','Дупле'], answer: 'Будке' },
      { type: 'true_false', question: 'В конце предложения ставится точка?', answer: 'true' },
    ]}},
    // VOCABULARY – слова
    { id: 'l-09', title: 'Животные', description: 'Учим названия животных', type: 'VOCABULARY', difficulty: 'EASY', xpReward: 15, order: 9, content: { exercises: [
      { type: 'multiple_choice', question: 'Кто говорит "Мяу"?', options: ['Кошка','Собака','Корова','Лягушка'], answer: 'Кошка' },
      { type: 'multiple_choice', question: 'Кто говорит "Гав"?', options: ['Собака','Кошка','Утка','Петух'], answer: 'Собака' },
      { type: 'true_false', question: 'Рыба живёт в воде?', answer: 'true' },
      { type: 'multiple_choice', question: 'У кого есть хобот?', options: ['Слон','Жираф','Зебра','Лев'], answer: 'Слон' },
      { type: 'fill_blank', question: 'Детёныш кошки — это...', answer: 'котёнок' },
    ]}},
    { id: 'l-10', title: 'Цвета', description: 'Учим названия цветов', type: 'VOCABULARY', difficulty: 'EASY', xpReward: 10, order: 10, content: { exercises: [
      { type: 'multiple_choice', question: 'Какого цвета небо?', options: ['Голубое','Красное','Зелёное','Жёлтое'], answer: 'Голубое' },
      { type: 'multiple_choice', question: 'Какого цвета трава?', options: ['Зелёная','Синяя','Красная','Белая'], answer: 'Зелёная' },
      { type: 'true_false', question: 'Солнце жёлтое?', answer: 'true' },
      { type: 'fill_blank', question: 'Какого цвета снег?', answer: 'белый' },
    ]}},
    { id: 'l-11', title: 'Фрукты и овощи', description: 'Учим названия фруктов и овощей', type: 'VOCABULARY', difficulty: 'EASY', xpReward: 10, order: 11, content: { exercises: [
      { type: 'multiple_choice', question: 'Что из этого — фрукт?', options: ['Яблоко','Морковь','Огурец','Картошка'], answer: 'Яблоко' },
      { type: 'multiple_choice', question: 'Что из этого — овощ?', options: ['Морковь','Банан','Груша','Апельсин'], answer: 'Морковь' },
      { type: 'true_false', question: 'Арбуз — это фрукт?', answer: 'true' },
      { type: 'fill_blank', question: 'Как называется красный овощ с которым делают сок?', answer: 'томат' },
    ]}},
    { id: 'l-12', title: 'Транспорт', description: 'Машины, самолёты, корабли', type: 'VOCABULARY', difficulty: 'EASY', xpReward: 10, order: 12, content: { exercises: [
      { type: 'multiple_choice', question: 'Что летает?', options: ['Самолёт','Машина','Лодка','Велосипед'], answer: 'Самолёт' },
      { type: 'multiple_choice', question: 'Что плавает?', options: ['Корабль','Поезд','Автобус','Мотоцикл'], answer: 'Корабль' },
      { type: 'true_false', question: 'Поезд едет по рельсам?', answer: 'true' },
      { type: 'multiple_choice', question: 'Сколько колёс у машины?', options: ['4','2','6','3'], answer: '4' },
    ]}},
    // COMPREHENSION – понимание
    { id: 'l-13', title: 'Числа 1–5', description: 'Учим цифры от 1 до 5', type: 'COMPREHENSION', difficulty: 'EASY', xpReward: 15, order: 13, content: { exercises: [
      { type: 'multiple_choice', question: 'Сколько лап у кошки?', options: ['4','2','6','8'], answer: '4' },
      { type: 'multiple_choice', question: 'Сколько пальцев на руке?', options: ['5','4','6','3'], answer: '5' },
      { type: 'true_false', question: '3 больше чем 2?', answer: 'true' },
      { type: 'fill_blank', question: 'Сколько будет 2 + 1?', answer: '3' },
    ]}},
    { id: 'l-14', title: 'Числа 6–10', description: 'Учим цифры от 6 до 10', type: 'COMPREHENSION', difficulty: 'MEDIUM', xpReward: 20, order: 14, content: { exercises: [
      { type: 'multiple_choice', question: 'Сколько дней в неделе?', options: ['7','5','6','8'], answer: '7' },
      { type: 'multiple_choice', question: 'Сколько будет 5 + 3?', options: ['8','7','9','6'], answer: '8' },
      { type: 'true_false', question: '10 больше чем 6?', answer: 'true' },
      { type: 'fill_blank', question: 'Сколько будет 4 + 4?', answer: '8' },
    ]}},
    { id: 'l-15', title: 'Времена года', description: 'Зима, весна, лето, осень', type: 'COMPREHENSION', difficulty: 'EASY', xpReward: 15, order: 15, content: { exercises: [
      { type: 'multiple_choice', question: 'Когда идёт снег?', options: ['Зимой','Летом','Весной','Осенью'], answer: 'Зимой' },
      { type: 'multiple_choice', question: 'Когда распускаются цветы?', options: ['Весной','Зимой','Осенью','Летом'], answer: 'Весной' },
      { type: 'true_false', question: 'Летом бывает жарко?', answer: 'true' },
      { type: 'multiple_choice', question: 'Осенью листья...', options: ['Желтеют','Зеленеют','Белеют','Краснеют только'], answer: 'Желтеют' },
    ]}},
    { id: 'l-16', title: 'Части тела', description: 'Голова, руки, ноги и другие части тела', type: 'COMPREHENSION', difficulty: 'EASY', xpReward: 10, order: 16, content: { exercises: [
      { type: 'multiple_choice', question: 'Чем мы слышим?', options: ['Ушами','Глазами','Носом','Ртом'], answer: 'Ушами' },
      { type: 'multiple_choice', question: 'Чем мы видим?', options: ['Глазами','Ушами','Носом','Руками'], answer: 'Глазами' },
      { type: 'true_false', question: 'У человека 2 руки?', answer: 'true' },
      { type: 'fill_blank', question: 'Чем мы нюхаем?', answer: 'носом' },
    ]}},
    // WRITING – письмо
    { id: 'l-17', title: 'Составляем предложения', description: 'Учимся строить правильные предложения', type: 'WRITING', difficulty: 'MEDIUM', xpReward: 25, order: 17, content: { exercises: [
      { type: 'multiple_choice', question: 'Выбери правильное предложение:', options: ['Кошка пьёт молоко','Молоко пьёт','Пьёт молоко кошка','Кошка молоко'], answer: 'Кошка пьёт молоко' },
      { type: 'true_false', question: 'Предложение начинается с большой буквы?', answer: 'true' },
      { type: 'multiple_choice', question: 'Что ставим в конце предложения?', options: ['Точку','Запятую','Тире','Ничего'], answer: 'Точку' },
      { type: 'fill_blank', question: 'Мама варит... (суп)', answer: 'суп' },
    ]}},
    { id: 'l-18', title: 'Большие буквы', description: 'Когда пишем с большой буквы', type: 'WRITING', difficulty: 'MEDIUM', xpReward: 20, order: 18, content: { exercises: [
      { type: 'multiple_choice', question: 'С какой буквы пишем имя?', options: ['С большой','С маленькой','Неважно','С любой'], answer: 'С большой' },
      { type: 'true_false', question: 'Слово "Москва" пишется с большой буквы?', answer: 'true' },
      { type: 'multiple_choice', question: 'С какой буквы начинается предложение?', options: ['С большой','С маленькой','С любой','С цифры'], answer: 'С большой' },
      { type: 'fill_blank', question: 'Напиши первую букву своего имени (например А)', answer: 'а' },
    ]}},
    { id: 'l-19', title: 'Вопросы', description: 'Учим вопросительные слова: кто, что, где', type: 'WRITING', difficulty: 'MEDIUM', xpReward: 25, order: 19, content: { exercises: [
      { type: 'multiple_choice', question: 'Какое слово используем для вопроса о человеке?', options: ['Кто','Что','Где','Когда'], answer: 'Кто' },
      { type: 'multiple_choice', question: 'Какое слово используем для вопроса о месте?', options: ['Где','Кто','Что','Как'], answer: 'Где' },
      { type: 'true_false', question: 'В конце вопроса ставится "?"?', answer: 'true' },
      { type: 'multiple_choice', question: '"___ живёт в будке?" — вставь слово', options: ['Кто','Что','Где','Зачем'], answer: 'Кто' },
    ]}},
    { id: 'l-20', title: 'Слова-антонимы', description: 'Противоположные по смыслу слова', type: 'VOCABULARY', difficulty: 'MEDIUM', xpReward: 20, order: 20, content: { exercises: [
      { type: 'multiple_choice', question: 'Антоним слова "большой":', options: ['Маленький','Высокий','Толстый','Длинный'], answer: 'Маленький' },
      { type: 'multiple_choice', question: 'Антоним слова "день":', options: ['Ночь','Вечер','Утро','Полдень'], answer: 'Ночь' },
      { type: 'true_false', question: 'Антоним "горячий" — это "холодный"?', answer: 'true' },
      { type: 'fill_blank', question: 'Антоним слова "быстро" — это "м..."', answer: 'медленно' },
    ]}},
    { id: 'l-21', title: 'Буква Е и Ё', description: 'Сложные буквы Е и Ё', type: 'PHONICS', difficulty: 'MEDIUM', xpReward: 15, order: 21, content: { exercises: [
      { type: 'multiple_choice', question: 'С какой буквы начинается "Ёжик"?', options: ['Ё','Е','Э','И'], answer: 'Ё' },
      { type: 'true_false', question: '"Елка" начинается с буквы Е?', answer: 'true' },
      { type: 'multiple_choice', question: 'Что начинается на Ё?', options: ['Ёжик','Енот','Ива','Осёл'], answer: 'Ёжик' },
      { type: 'fill_blank', question: 'Первая буква слова "Ёлка"', answer: 'ё' },
    ]}},
    { id: 'l-22', title: 'Профессии', description: 'Учим названия профессий', type: 'VOCABULARY', difficulty: 'MEDIUM', xpReward: 20, order: 22, content: { exercises: [
      { type: 'multiple_choice', question: 'Кто лечит людей?', options: ['Врач','Учитель','Повар','Пилот'], answer: 'Врач' },
      { type: 'multiple_choice', question: 'Кто учит детей?', options: ['Учитель','Врач','Строитель','Водитель'], answer: 'Учитель' },
      { type: 'true_false', question: 'Пилот управляет самолётом?', answer: 'true' },
      { type: 'fill_blank', question: 'Кто готовит еду в ресторане?', answer: 'повар' },
    ]}},
    { id: 'l-23', title: 'Буква З и Ж', description: 'Учим буквы З и Ж', type: 'PHONICS', difficulty: 'MEDIUM', xpReward: 15, order: 23, content: { exercises: [
      { type: 'multiple_choice', question: 'С какой буквы начинается "Заяц"?', options: ['З','Ж','С','Ц'], answer: 'З' },
      { type: 'multiple_choice', question: 'С какой буквы начинается "Жираф"?', options: ['Ж','З','Г','Ч'], answer: 'Ж' },
      { type: 'true_false', question: '"Зебра" начинается с З?', answer: 'true' },
      { type: 'fill_blank', question: 'Первая буква слова "Жук"', answer: 'ж' },
    ]}},
    { id: 'l-24', title: 'Дни недели', description: 'Понедельник, вторник, среда...', type: 'COMPREHENSION', difficulty: 'HARD', xpReward: 30, order: 24, content: { exercises: [
      { type: 'multiple_choice', question: 'Какой день идёт после понедельника?', options: ['Вторник','Среда','Пятница','Воскресенье'], answer: 'Вторник' },
      { type: 'multiple_choice', question: 'Сколько дней в неделе?', options: ['7','5','6','8'], answer: '7' },
      { type: 'true_false', question: 'Суббота и воскресенье — выходные дни?', answer: 'true' },
      { type: 'multiple_choice', question: 'Какой день идёт перед пятницей?', options: ['Четверг','Среда','Суббота','Вторник'], answer: 'Четверг' },
    ]}},
    { id: 'l-25', title: 'Месяцы года', description: 'Январь, февраль, март...', type: 'COMPREHENSION', difficulty: 'HARD', xpReward: 30, order: 25, content: { exercises: [
      { type: 'multiple_choice', question: 'Первый месяц года?', options: ['Январь','Февраль','Март','Декабрь'], answer: 'Январь' },
      { type: 'multiple_choice', question: 'Сколько месяцев в году?', options: ['12','10','11','13'], answer: '12' },
      { type: 'true_false', question: 'Декабрь — последний месяц года?', answer: 'true' },
      { type: 'fill_blank', question: 'Какой месяц идёт после января?', answer: 'февраль' },
    ]}},
  ]

  for (const lesson of lessons) {
    await prisma.lesson.upsert({ where: { id: lesson.id }, update: {}, create: lesson })
  }
  console.log('✅ Lessons created:', lessons.length)

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
      { firstName: 'Дима',    lastName: 'Смирнов',  age: 8, lessonsCount: 25, streakDays: 14 },
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
  console.log('  Admin:  admin@literacy.com  / admin123')
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
