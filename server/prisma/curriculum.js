// Программа для детей 3–6 лет (детский сад).
//
// Принципы:
//  • ребёнок не умеет читать — вопрос озвучивается, ответы это КАРТИНКИ, а не текст;
//  • никаких «неверно» — при ошибке можно попробовать ещё раз;
//  • один и тот же урок на трёх языках: русский хранится в основной части урока,
//    казахский и английский — в поле translations;
//  • уроки про буквы собираются отдельно для каждого языка (алфавиты разные).
//
// Типы заданий (поле type):
//  choose_picture — выбери картинку:   { question, options:[{emoji,label}], answer:<индекс> }
//  odd_one_out    — найди лишнее:      то же самое
//  choose_letter  — найди букву:       { question, options:[{text}], answer:<индекс> }
//  count          — сосчитай:          { question, emoji, count, options:[{text}], answer:<индекс> }
//  match_pairs    — соедини пары:      { question, pairs:[{left,right}] }
//  show (необязательно) — большая картинка над вариантами ответа.

const LANGS = ['ru', 'kk', 'en']

/* ─────────────── вспомогательные функции ─────────────── */

// детерминированный генератор — программа одинакова при каждом запуске seed
function rng(seedStr) {
  let h = 1779033703 ^ seedStr.length
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  let a = h >>> 0
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const shuffle = (arr, r) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)
const upperFirst = (s) => s.charAt(0).toUpperCase()

// кладём правильный ответ на «случайное» место и возвращаем { options, answer }
const place = (correct, others, r) => {
  const options = shuffle([correct, ...others], r)
  return { options, answer: options.indexOf(correct) }
}

/* ─────────────── слова: { e: эмодзи, ru, kk, en } ─────────────── */

const W = {
  animals: {
    dog: { e: '🐶', ru: 'собака', kk: 'ит', en: 'dog' },
    cat: { e: '🐱', ru: 'кошка', kk: 'мысық', en: 'cat' },
    cow: { e: '🐮', ru: 'корова', kk: 'сиыр', en: 'cow' },
    pig: { e: '🐷', ru: 'свинья', kk: 'шошқа', en: 'pig' },
    hen: { e: '🐔', ru: 'курица', kk: 'тауық', en: 'chicken' },
    sheep: { e: '🐑', ru: 'овца', kk: 'қой', en: 'sheep' },
    horse: { e: '🐴', ru: 'лошадь', kk: 'жылқы', en: 'horse' },
    rabbit: { e: '🐰', ru: 'заяц', kk: 'қоян', en: 'rabbit' },
    bear: { e: '🐻', ru: 'медведь', kk: 'аю', en: 'bear' },
    lion: { e: '🦁', ru: 'лев', kk: 'арыстан', en: 'lion' },
    frog: { e: '🐸', ru: 'лягушка', kk: 'бақа', en: 'frog' },
    duck: { e: '🦆', ru: 'утка', kk: 'үйрек', en: 'duck' },
    elephant: { e: '🐘', ru: 'слон', kk: 'піл', en: 'elephant' },
    monkey: { e: '🐒', ru: 'обезьяна', kk: 'маймыл', en: 'monkey' },
    camel: { e: '🐫', ru: 'верблюд', kk: 'түйе', en: 'camel' },
    wolf: { e: '🐺', ru: 'волк', kk: 'қасқыр', en: 'wolf' },
    fox: { e: '🦊', ru: 'лиса', kk: 'түлкі', en: 'fox' },
  },
  fruits: {
    apple: { e: '🍎', ru: 'яблоко', kk: 'алма', en: 'apple' },
    banana: { e: '🍌', ru: 'банан', kk: 'банан', en: 'banana' },
    grapes: { e: '🍇', ru: 'виноград', kk: 'жүзім', en: 'grapes', enAre: true },
    orange: { e: '🍊', ru: 'апельсин', kk: 'апельсин', en: 'orange' },
    strawberry: { e: '🍓', ru: 'клубника', kk: 'құлпынай', en: 'strawberry' },
    watermelon: { e: '🍉', ru: 'арбуз', kk: 'қарбыз', en: 'watermelon' },
    pear: { e: '🍐', ru: 'груша', kk: 'алмұрт', en: 'pear' },
    lemon: { e: '🍋', ru: 'лимон', kk: 'лимон', en: 'lemon' },
    cherry: { e: '🍒', ru: 'вишня', kk: 'шие', en: 'cherries', enAre: true },
  },
  veg: {
    carrot: { e: '🥕', ru: 'морковь', kk: 'сәбіз', en: 'carrot' },
    cucumber: { e: '🥒', ru: 'огурец', kk: 'қияр', en: 'cucumber' },
    tomato: { e: '🍅', ru: 'помидор', kk: 'қызанақ', en: 'tomato' },
    potato: { e: '🥔', ru: 'картошка', kk: 'картоп', en: 'potato' },
    corn: { e: '🌽', ru: 'кукуруза', kk: 'жүгері', en: 'corn' },
    broccoli: { e: '🥦', ru: 'брокколи', kk: 'брокколи', en: 'broccoli' },
    onion: { e: '🧅', ru: 'лук', kk: 'пияз', en: 'onion' },
  },
  vehicles: {
    car: { e: '🚗', ru: 'машина', kk: 'көлік', en: 'car' },
    bus: { e: '🚌', ru: 'автобус', kk: 'автобус', en: 'bus' },
    train: { e: '🚂', ru: 'поезд', kk: 'пойыз', en: 'train' },
    plane: { e: '✈️', ru: 'самолёт', kk: 'ұшақ', en: 'airplane' },
    ship: { e: '🚢', ru: 'корабль', kk: 'кеме', en: 'ship' },
    bike: { e: '🚲', ru: 'велосипед', kk: 'велосипед', en: 'bicycle' },
    heli: { e: '🚁', ru: 'вертолёт', kk: 'тікұшақ', en: 'helicopter' },
    rocket: { e: '🚀', ru: 'ракета', kk: 'зымыран', en: 'rocket' },
    tractor: { e: '🚜', ru: 'трактор', kk: 'трактор', en: 'tractor' },
  },
  body: {
    eyes: { e: '👀', ru: 'глаза', kk: 'көз', en: 'eyes', enAre: true },
    nose: { e: '👃', ru: 'нос', kk: 'мұрын', en: 'nose' },
    ear: { e: '👂', ru: 'ухо', kk: 'құлақ', en: 'ear' },
    mouth: { e: '👄', ru: 'рот', kk: 'ауыз', en: 'mouth' },
    hand: { e: '✋', ru: 'рука', kk: 'қол', en: 'hand' },
    foot: { e: '🦶', ru: 'нога', kk: 'аяқ', en: 'foot' },
  },
  family: {
    mom: { e: '👩', ru: 'мама', kk: 'ана', en: 'mom', enQ: 'Where is mom?' },
    dad: { e: '👨', ru: 'папа', kk: 'әке', en: 'dad', enQ: 'Where is dad?' },
    grandma: { e: '👵', ru: 'бабушка', kk: 'әже', en: 'grandma', enQ: 'Where is grandma?' },
    grandpa: { e: '👴', ru: 'дедушка', kk: 'ата', en: 'grandpa', enQ: 'Where is grandpa?' },
    baby: { e: '👶', ru: 'малыш', kk: 'сәби', en: 'baby' },
    boy: { e: '👦', ru: 'мальчик', kk: 'ұл бала', en: 'boy' },
    girl: { e: '👧', ru: 'девочка', kk: 'қыз бала', en: 'girl' },
  },
  clothes: {
    shirt: { e: '👕', ru: 'футболка', kk: 'жейде', en: 'T-shirt' },
    pants: { e: '👖', ru: 'штаны', kk: 'шалбар', en: 'pants', enAre: true },
    socks: { e: '🧦', ru: 'носки', kk: 'шұлық', en: 'socks', enAre: true },
    hat: { e: '🧢', ru: 'кепка', kk: 'кепка', en: 'cap' },
    shoes: { e: '👟', ru: 'обувь', kk: 'аяқ киім', en: 'shoes', enAre: true },
    coat: { e: '🧥', ru: 'куртка', kk: 'күрте', en: 'jacket' },
    dress: { e: '👗', ru: 'платье', kk: 'көйлек', en: 'dress' },
    gloves: { e: '🧤', ru: 'перчатки', kk: 'қолғап', en: 'gloves', enAre: true },
  },
  food: {
    milk: { e: '🥛', ru: 'молоко', kk: 'сүт', en: 'milk' },
    bread: { e: '🍞', ru: 'хлеб', kk: 'нан', en: 'bread' },
    cheese: { e: '🧀', ru: 'сыр', kk: 'ірімшік', en: 'cheese' },
    egg: { e: '🥚', ru: 'яйцо', kk: 'жұмыртқа', en: 'egg' },
    candy: { e: '🍬', ru: 'конфета', kk: 'кәмпит', en: 'candy' },
    cake: { e: '🍰', ru: 'торт', kk: 'торт', en: 'cake' },
    meat: { e: '🍖', ru: 'мясо', kk: 'ет', en: 'meat' },
    soup: { e: '🍲', ru: 'суп', kk: 'сорпа', en: 'soup' },
  },
  weather: {
    sun: { e: '☀️', ru: 'солнце', kk: 'күн', en: 'sun' },
    rain: { e: '🌧️', ru: 'дождь', kk: 'жаңбыр', en: 'rain' },
    snow: { e: '❄️', ru: 'снег', kk: 'қар', en: 'snow' },
    rainbow: { e: '🌈', ru: 'радуга', kk: 'кемпірқосақ', en: 'rainbow' },
    wind: { e: '💨', ru: 'ветер', kk: 'жел', en: 'wind' },
    cloud: { e: '☁️', ru: 'облако', kk: 'бұлт', en: 'cloud' },
    moon: { e: '🌙', ru: 'луна', kk: 'ай', en: 'moon' },
    star: { e: '⭐', ru: 'звезда', kk: 'жұлдыз', en: 'star' },
  },
  jobs: {
    doctor: { e: '👨‍⚕️', ru: 'врач', kk: 'дәрігер', en: 'doctor' },
    cook: { e: '👩‍🍳', ru: 'повар', kk: 'аспаз', en: 'cook' },
    fire: { e: '👨‍🚒', ru: 'пожарный', kk: 'өрт сөндіруші', en: 'firefighter' },
    police: { e: '👮', ru: 'полицейский', kk: 'полиция қызметкері', en: 'police officer' },
    teacher: { e: '👩‍🏫', ru: 'учитель', kk: 'мұғалім', en: 'teacher' },
    farmer: { e: '👨‍🌾', ru: 'фермер', kk: 'диқан', en: 'farmer' },
    builder: { e: '👷', ru: 'строитель', kk: 'құрылысшы', en: 'builder' },
    pilot: { e: '👨‍✈️', ru: 'лётчик', kk: 'ұшқыш', en: 'pilot' },
  },
  shapes: {
    circle: { e: '🔴', ru: 'круг', kk: 'дөңгелек', en: 'circle' },
    star: { e: '⭐', ru: 'звезда', kk: 'жұлдыз', en: 'star' },
    heart: { e: '❤️', ru: 'сердце', kk: 'жүрек', en: 'heart' },
    triangle: { e: '🔺', ru: 'треугольник', kk: 'үшбұрыш', en: 'triangle' },
    square: { e: '🟦', ru: 'квадрат', kk: 'шаршы', en: 'square' },
  },
}

const COLORS = {
  red: { e: '🔴', ru: 'красный', kk: 'қызыл', en: 'red' },
  yellow: { e: '🟡', ru: 'жёлтый', kk: 'сары', en: 'yellow' },
  green: { e: '🟢', ru: 'зелёный', kk: 'жасыл', en: 'green' },
  blue: { e: '🔵', ru: 'синий', kk: 'көк', en: 'blue' },
  orange: { e: '🟠', ru: 'оранжевый', kk: 'қызғылт сары', en: 'orange' },
  purple: { e: '🟣', ru: 'фиолетовый', kk: 'күлгін', en: 'purple' },
}
// предмет → его цвет (вопрос «какого цвета банан?»)
const COLOR_OBJECTS = [
  { e: '🍌', color: 'yellow', ru: 'банан', kk: 'банан', en: 'banana' },
  { e: '🍓', color: 'red', ru: 'клубника', kk: 'құлпынай', en: 'strawberry' },
  { e: '🥒', color: 'green', ru: 'огурец', kk: 'қияр', en: 'cucumber' },
  { e: '🍇', color: 'purple', ru: 'виноград', kk: 'жүзім', en: 'grape' },
  { e: '🥕', color: 'orange', ru: 'морковь', kk: 'сәбіз', en: 'carrot' },
  { e: '🍋', color: 'yellow', ru: 'лимон', kk: 'лимон', en: 'lemon' },
  { e: '🍅', color: 'red', ru: 'помидор', kk: 'қызанақ', en: 'tomato' },
  { e: '🐸', color: 'green', ru: 'лягушка', kk: 'бақа', en: 'frog' },
]

// что считаем: ru — родительный падеж мн. числа («Сколько яблок?»)
const COUNT_OBJECTS = [
  { e: '🍎', ru: 'яблок', kk: 'алма', en: 'apples' },
  { e: '⚽', ru: 'мячей', kk: 'доп', en: 'balls' },
  { e: '🌸', ru: 'цветов', kk: 'гүл', en: 'flowers' },
  { e: '⭐', ru: 'звёзд', kk: 'жұлдыз', en: 'stars' },
  { e: '🚗', ru: 'машин', kk: 'көлік', en: 'cars' },
  { e: '🐟', ru: 'рыбок', kk: 'балық', en: 'fish' },
  { e: '🎈', ru: 'шариков', kk: 'шар', en: 'balloons' },
  { e: '🦋', ru: 'бабочек', kk: 'көбелек', en: 'butterflies' },
  { e: '🐦', ru: 'птичек', kk: 'құс', en: 'birds' },
  { e: '🍐', ru: 'груш', kk: 'алмұрт', en: 'pears' },
]

// пары для «соедини»
const PAIR_SETS = {
  eats: [['🐰', '🥕'], ['🐻', '🍯'], ['🐒', '🍌'], ['🐶', '🦴'], ['🐱', '🐟'], ['🐮', '🌿']],
  homes: [['🐶', '🏠'], ['🐦', '🌳'], ['🐟', '🌊'], ['🐝', '🌸'], ['🕷️', '🕸️'], ['🐻', '🌲']],
  needs: [['🌧️', '☂️'], ['☀️', '🕶️'], ['❄️', '🧤'], ['🌙', '🛏️'], ['👟', '🧦'], ['🪥', '🦷']],
}

/* ─────────────── шаблоны вопросов ─────────────── */

const Q = {
  find: {
    ru: (w) => `Где ${w.ru}?`,
    kk: (w) => `${cap(w.kk)} қайсы?`,
    en: (w) => w.enQ ?? `Where ${w.enAre ? 'are' : 'is'} the ${w.en}?`,
  },
  findColor: {
    ru: (c) => `Где ${c.ru} цвет?`,
    kk: (c) => `${cap(c.kk)} түс қайсы?`,
    en: (c) => `Which one is ${c.en}?`,
  },
  colorOf: {
    ru: (o) => `Какого цвета ${o.ru}?`,
    kk: (o) => `${cap(o.kk)} қандай түсті?`,
    en: (o) => `What color is the ${o.en}?`,
  },
  count: {
    ru: (o) => `Сколько ${o.ru}?`,
    kk: (o) => `Қанша ${o.kk}?`,
    en: (o) => `How many ${o.en}?`,
  },
  odd: { ru: 'Что лишнее?', kk: 'Қайсысы артық?', en: 'Which one is different?' },
  more: { ru: 'Где больше?', kk: 'Қайсысы көп?', en: 'Which has more?' },
  less: { ru: 'Где меньше?', kk: 'Қайсысы аз?', en: 'Which has less?' },
  pairs: { ru: 'Соедини пары', kk: 'Жұптарды қос', en: 'Match the pairs' },
  letter: {
    ru: (L) => `Найди букву ${L}`,
    kk: (L) => `${L} әрпін тап`,
    en: (L) => `Find the letter ${L}`,
  },
  sound: {
    ru: (L) => `Что начинается на звук ${L}?`,
    kk: (L) => `${L} дыбысынан қандай сөз басталады?`,
    en: (L) => `What starts with the sound ${L}?`,
  },
}

const label = (w, lang) => w[lang]
const pic = (w, lang) => ({ emoji: w.e, label: label(w, lang) })

/* ─────────────── генераторы заданий (по одному на «вид» урока) ─────────────── */

const N_EXERCISES = 5

// найди картинку: «Где яблоко?»
function genVocab(spec, lang) {
  const r = rng(spec.id + ':vocab')               // тот же план для всех языков
  const pool = Object.values(W[spec.pool])
  const targets = shuffle(pool, r).slice(0, N_EXERCISES)
  return targets.map((target) => {
    const others = shuffle(pool.filter((w) => w !== target), r).slice(0, spec.choices - 1)
    const { options, answer } = place(target, others, r)
    return {
      type: 'choose_picture',
      question: Q.find[lang](target),
      options: options.map((w) => pic(w, lang)),
      answer,
    }
  })
}

// цвета: найди цвет и «какого цвета предмет?»
function genColors(spec, lang) {
  const r = rng(spec.id + ':colors')
  const colorList = Object.values(COLORS)
  const out = []
  shuffle(colorList, r).slice(0, 3).forEach((target) => {
    const others = shuffle(colorList.filter((c) => c !== target), r).slice(0, spec.choices - 1)
    const { options, answer } = place(target, others, r)
    out.push({
      type: 'choose_picture',
      question: Q.findColor[lang](target),
      options: options.map((c) => ({ emoji: c.e, label: c[lang] })),
      answer,
    })
  })
  shuffle(COLOR_OBJECTS, r).slice(0, 2).forEach((obj) => {
    const target = COLORS[obj.color]
    const others = shuffle(colorList.filter((c) => c !== target), r).slice(0, spec.choices - 1)
    const { options, answer } = place(target, others, r)
    out.push({
      type: 'choose_picture',
      question: Q.colorOf[lang](obj),
      show: obj.e,
      options: options.map((c) => ({ emoji: c.e, label: c[lang] })),
      answer,
    })
  })
  return shuffle(out, r)
}

// счёт: «Сколько яблок?»
function genCount(spec, lang) {
  const r = rng(spec.id + ':count')
  const objs = shuffle(COUNT_OBJECTS, r)
  const nums = shuffle(
    Array.from({ length: spec.max - spec.min + 1 }, (_, i) => spec.min + i), r
  )
  return Array.from({ length: N_EXERCISES }, (_, i) => {
    const count = nums[i % nums.length]
    const obj = objs[i % objs.length]
    const pool = Array.from({ length: spec.max - spec.min + 1 }, (_, k) => spec.min + k)
    const others = shuffle(pool.filter((n) => n !== count), r).slice(0, spec.choices - 1)
    const { options, answer } = place(count, others, r)
    // варианты по возрастанию — так проще ребёнку
    const sorted = [...options].sort((a, b) => a - b)
    return {
      type: 'count',
      question: Q.count[lang](obj),
      emoji: obj.e,
      count,
      options: sorted.map((n) => ({ text: String(n) })),
      answer: sorted.indexOf(count),
    }
  })
}

// найди лишнее: три предмета из одной группы и один из другой
function genOdd(spec, lang) {
  const r = rng(spec.id + ':odd')
  return Array.from({ length: N_EXERCISES }, (_, i) => {
    const [catA, catB] = spec.categories[i % spec.categories.length]
    const same = shuffle(Object.values(W[catA]), r).slice(0, 3)
    const odd = shuffle(Object.values(W[catB]), r)[0]
    const { options, answer } = place(odd, same, r)
    return {
      type: 'odd_one_out',
      question: Q.odd[lang],
      options: options.map((w) => ({ emoji: w.e })),   // без подписей — иначе подсказка
      answer,
    }
  })
}

// где больше / меньше
function genMore(spec, lang) {
  const r = rng(spec.id + ':more')
  const emojis = ['🍎', '⭐', '🎈', '🐟', '🌸']
  return Array.from({ length: N_EXERCISES }, (_, i) => {
    const e = emojis[i % emojis.length]
    const wantMore = i % 2 === 0
    const groups = shuffle([1, 2, 3, 4, 5, 6], r).slice(0, spec.choices)
    const target = wantMore ? Math.max(...groups) : Math.min(...groups)
    return {
      type: 'choose_picture',
      question: wantMore ? Q.more[lang] : Q.less[lang],
      options: groups.map((n) => ({ text: e.repeat(n) })),
      answer: groups.indexOf(target),
    }
  })
}

// соедини пары
function genPairs(spec, lang) {
  const r = rng(spec.id + ':pairs')
  return spec.sets.map((setName, i) => ({
    type: 'match_pairs',
    question: Q.pairs[lang],
    pairs: shuffle(PAIR_SETS[setName], r).slice(0, spec.pairCount - (i % 2 === 1 ? 1 : 0))
      .map(([left, right]) => ({ left, right })),
  }))
}

/* ─────────────── буквы: свой набор слов для каждого языка ─────────────── */

const LETTER_WORDS = {
  ru: [
    ['арбуз', '🍉'], ['апельсин', '🍊'], ['облако', '☁️'], ['огурец', '🥒'], ['утка', '🦆'],
    ['ухо', '👂'], ['улитка', '🐌'], ['банан', '🍌'], ['мяч', '⚽'], ['кот', '🐱'],
    ['слон', '🐘'], ['лиса', '🦊'], ['рыба', '🐟'], ['дом', '🏠'], ['груша', '🍐'],
    ['виноград', '🍇'], ['яблоко', '🍎'], ['зебра', '🦓'], ['жук', '🐞'],
  ],
  kk: [
    ['алма', '🍎'], ['әтеш', '🐓'], ['ұшақ', '✈️'], ['бақа', '🐸'], ['мысық', '🐱'],
    ['қоян', '🐰'], ['түйе', '🐫'], ['жылқы', '🐴'], ['шар', '🎈'], ['ит', '🐶'],
    ['үй', '🏠'], ['нан', '🍞'], ['гүл', '🌸'], ['сиыр', '🐮'], ['піл', '🐘'],
    ['көбелек', '🦋'], ['қарбыз', '🍉'], ['балық', '🐟'], ['өрмекші', '🕷️'],
  ],
  en: [
    ['apple', '🍎'], ['ant', '🐜'], ['bear', '🐻'], ['banana', '🍌'], ['cat', '🐱'],
    ['car', '🚗'], ['dog', '🐶'], ['duck', '🦆'], ['elephant', '🐘'], ['egg', '🥚'],
    ['fish', '🐟'], ['frog', '🐸'], ['grapes', '🍇'], ['goat', '🐐'], ['house', '🏠'],
    ['hat', '🧢'], ['monkey', '🐒'], ['moon', '🌙'], ['sun', '☀️'], ['lion', '🦁'],
  ],
}
const LETTER_SETS = {
  ru: [['А', 'О', 'У'], ['М', 'Б', 'К'], ['С', 'Л', 'Р']],
  kk: [['А', 'Ә', 'Ұ'], ['Б', 'М', 'Қ'], ['Т', 'Ж', 'Ш']],
  en: [['A', 'B', 'C'], ['D', 'E', 'F'], ['G', 'H', 'M']],
}

function genLetters(spec, lang) {
  const r = rng(`${spec.id}:letters:${lang}`)
  const letters = LETTER_SETS[lang][spec.letterSet]
  const words = LETTER_WORDS[lang].map(([w, e]) => ({ w, e, L: upperFirst(w) }))

  const pictureFor = (L, skip = -1) => {
    const candidates = words.filter((x) => x.L === L)
    const target = candidates[Math.min(skip < 0 ? 0 : skip, candidates.length - 1)]
    const others = shuffle(words.filter((x) => x.L !== L), r).slice(0, 2)
    const { options, answer } = place(target, others, r)
    return {
      type: 'choose_picture',
      question: Q.sound[lang](L),
      options: options.map((x) => ({ emoji: x.e, label: x.w })),
      answer,
    }
  }
  const letterFor = (L) => {
    const others = letters.filter((x) => x !== L)
    const { options, answer } = place(L, others, r)
    return {
      type: 'choose_letter',
      question: Q.letter[lang](L),
      options: options.map((x) => ({ text: x })),
      answer,
    }
  }
  const [a, b, c] = letters
  return [letterFor(a), pictureFor(a), letterFor(b), pictureFor(b), pictureFor(c, 1), letterFor(c)]
}

/* ─────────────── список уроков ─────────────── */

const GEN = { vocab: genVocab, colors: genColors, count: genCount, odd: genOdd, more: genMore, pairs: genPairs, letters: genLetters }

const SPECS = [
  { id: 'k-01', kind: 'vocab', pool: 'animals', choices: 2, type: 'VOCABULARY', difficulty: 'EASY', xp: 10,
    title: { ru: 'Животные', kk: 'Жануарлар', en: 'Animals' },
    desc: { ru: 'Находим животных по картинкам', kk: 'Суреттен жануарларды табамыз', en: 'Finding animals in pictures' } },
  { id: 'k-02', kind: 'vocab', pool: 'fruits', choices: 2, type: 'VOCABULARY', difficulty: 'EASY', xp: 10,
    title: { ru: 'Фрукты', kk: 'Жемістер', en: 'Fruits' },
    desc: { ru: 'Яблоко, банан, виноград и другие', kk: 'Алма, банан, жүзім және басқалар', en: 'Apple, banana, grapes and more' } },
  { id: 'k-03', kind: 'colors', choices: 3, type: 'VOCABULARY', difficulty: 'EASY', xp: 10,
    title: { ru: 'Цвета', kk: 'Түстер', en: 'Colors' },
    desc: { ru: 'Красный, жёлтый, зелёный и другие цвета', kk: 'Қызыл, сары, жасыл және басқа түстер', en: 'Red, yellow, green and other colors' } },
  { id: 'k-04', kind: 'count', min: 1, max: 3, choices: 3, type: 'COMPREHENSION', difficulty: 'EASY', xp: 10,
    title: { ru: 'Считаем до 3', kk: '3-ке дейін санаймыз', en: 'Counting to 3' },
    desc: { ru: 'Считаем предметы: один, два, три', kk: 'Заттарды санаймыз: бір, екі, үш', en: 'Counting things: one, two, three' } },
  { id: 'k-05', kind: 'vocab', pool: 'vehicles', choices: 3, type: 'VOCABULARY', difficulty: 'EASY', xp: 10,
    title: { ru: 'Транспорт', kk: 'Көлік', en: 'Vehicles' },
    desc: { ru: 'Машина, поезд, самолёт и другие', kk: 'Көлік, пойыз, ұшақ және басқалар', en: 'Car, train, airplane and more' } },
  { id: 'k-06', kind: 'vocab', pool: 'body', choices: 3, type: 'VOCABULARY', difficulty: 'EASY', xp: 10,
    title: { ru: 'Моё тело', kk: 'Менің денем', en: 'My body' },
    desc: { ru: 'Глаза, нос, уши, руки и ноги', kk: 'Көз, мұрын, құлақ, қол және аяқ', en: 'Eyes, nose, ears, hands and feet' } },
  { id: 'k-07', kind: 'vocab', pool: 'family', choices: 3, type: 'VOCABULARY', difficulty: 'EASY', xp: 10,
    title: { ru: 'Моя семья', kk: 'Менің отбасым', en: 'My family' },
    desc: { ru: 'Мама, папа, бабушка, дедушка', kk: 'Ана, әке, әже, ата', en: 'Mom, dad, grandma, grandpa' } },
  { id: 'k-08', kind: 'odd', categories: [['fruits', 'vehicles'], ['animals', 'veg'], ['vehicles', 'animals']], type: 'COMPREHENSION', difficulty: 'EASY', xp: 10,
    title: { ru: 'Найди лишнее', kk: 'Артығын тап', en: 'Find the odd one' },
    desc: { ru: 'Какая картинка не подходит к остальным?', kk: 'Қай сурет қалғандарына сәйкес келмейді?', en: 'Which picture does not belong?' } },
  { id: 'k-09', kind: 'pairs', sets: ['eats', 'eats', 'homes'], pairCount: 3, type: 'COMPREHENSION', difficulty: 'EASY', xp: 10,
    title: { ru: 'Кто что любит', kk: 'Кім нені жақсы көреді', en: 'Who likes what' },
    desc: { ru: 'Соединяем животных с их едой', kk: 'Жануарларды тамағымен қосамыз', en: 'Matching animals with their food' } },
  { id: 'k-10', kind: 'vocab', pool: 'veg', choices: 3, type: 'VOCABULARY', difficulty: 'EASY', xp: 10,
    title: { ru: 'Овощи', kk: 'Көкөністер', en: 'Vegetables' },
    desc: { ru: 'Морковь, огурец, помидор и другие', kk: 'Сәбіз, қияр, қызанақ және басқалар', en: 'Carrot, cucumber, tomato and more' } },
  { id: 'k-11', kind: 'vocab', pool: 'shapes', choices: 3, type: 'COMPREHENSION', difficulty: 'MEDIUM', xp: 15,
    title: { ru: 'Фигуры', kk: 'Пішіндер', en: 'Shapes' },
    desc: { ru: 'Круг, звезда, сердце, треугольник', kk: 'Дөңгелек, жұлдыз, жүрек, үшбұрыш', en: 'Circle, star, heart, triangle' } },
  { id: 'k-12', kind: 'count', min: 1, max: 5, choices: 3, type: 'COMPREHENSION', difficulty: 'MEDIUM', xp: 15,
    title: { ru: 'Считаем до 5', kk: '5-ке дейін санаймыз', en: 'Counting to 5' },
    desc: { ru: 'Считаем предметы до пяти', kk: 'Заттарды беске дейін санаймыз', en: 'Counting things up to five' } },
  { id: 'k-13', kind: 'vocab', pool: 'clothes', choices: 3, type: 'VOCABULARY', difficulty: 'MEDIUM', xp: 15,
    title: { ru: 'Одежда', kk: 'Киім', en: 'Clothes' },
    desc: { ru: 'Футболка, штаны, носки, шапка', kk: 'Жейде, шалбар, шұлық, кепка', en: 'T-shirt, pants, socks, cap' } },
  { id: 'k-14', kind: 'vocab', pool: 'weather', choices: 4, type: 'VOCABULARY', difficulty: 'MEDIUM', xp: 15,
    title: { ru: 'Погода и небо', kk: 'Ауа райы және аспан', en: 'Weather and sky' },
    desc: { ru: 'Солнце, дождь, снег, радуга', kk: 'Күн, жаңбыр, қар, кемпірқосақ', en: 'Sun, rain, snow, rainbow' } },
  { id: 'k-15', kind: 'letters', letterSet: 0, type: 'PHONICS', difficulty: 'MEDIUM', xp: 15,
    title: { ru: 'Буквы А, О, У', kk: 'А, Ә, Ұ әріптері', en: 'Letters A, B, C' },
    desc: { ru: 'Знакомимся с первыми буквами и звуками', kk: 'Алғашқы әріптер мен дыбыстармен танысамыз', en: 'Meeting the first letters and sounds' } },
  { id: 'k-16', kind: 'pairs', sets: ['homes', 'eats', 'homes'], pairCount: 4, type: 'COMPREHENSION', difficulty: 'MEDIUM', xp: 15,
    title: { ru: 'Кто где живёт', kk: 'Кім қайда тұрады', en: 'Who lives where' },
    desc: { ru: 'Соединяем животных с их домом', kk: 'Жануарларды үйімен қосамыз', en: 'Matching animals with their homes' } },
  { id: 'k-17', kind: 'more', choices: 2, type: 'COMPREHENSION', difficulty: 'MEDIUM', xp: 15,
    title: { ru: 'Больше и меньше', kk: 'Көп және аз', en: 'More and less' },
    desc: { ru: 'Где больше, а где меньше?', kk: 'Қайсысы көп, қайсысы аз?', en: 'Which has more, which has less?' } },
  { id: 'k-18', kind: 'letters', letterSet: 1, type: 'PHONICS', difficulty: 'MEDIUM', xp: 15,
    title: { ru: 'Буквы М, Б, К', kk: 'Б, М, Қ әріптері', en: 'Letters D, E, F' },
    desc: { ru: 'Ищем буквы и слова на эти звуки', kk: 'Осы дыбыстардан басталатын сөздерді табамыз', en: 'Finding letters and words for these sounds' } },
  { id: 'k-19', kind: 'vocab', pool: 'food', choices: 3, type: 'VOCABULARY', difficulty: 'MEDIUM', xp: 15,
    title: { ru: 'Еда', kk: 'Тамақ', en: 'Food' },
    desc: { ru: 'Молоко, хлеб, сыр, яйцо', kk: 'Сүт, нан, ірімшік, жұмыртқа', en: 'Milk, bread, cheese, egg' } },
  { id: 'k-20', kind: 'count', min: 3, max: 10, choices: 4, type: 'COMPREHENSION', difficulty: 'HARD', xp: 20,
    title: { ru: 'Считаем до 10', kk: '10-ға дейін санаймыз', en: 'Counting to 10' },
    desc: { ru: 'Считаем предметы до десяти', kk: 'Заттарды онға дейін санаймыз', en: 'Counting things up to ten' } },
  { id: 'k-21', kind: 'odd', categories: [['fruits', 'veg'], ['veg', 'fruits'], ['clothes', 'food'], ['animals', 'family']], type: 'COMPREHENSION', difficulty: 'HARD', xp: 20,
    title: { ru: 'Найди лишнее 2', kk: 'Артығын тап 2', en: 'Find the odd one 2' },
    desc: { ru: 'Теперь чуть сложнее', kk: 'Енді сәл қиынырақ', en: 'A little harder now' } },
  { id: 'k-22', kind: 'letters', letterSet: 2, type: 'PHONICS', difficulty: 'HARD', xp: 20,
    title: { ru: 'Буквы С, Л, Р', kk: 'Т, Ж, Ш әріптері', en: 'Letters G, H, M' },
    desc: { ru: 'Новые буквы и звуки', kk: 'Жаңа әріптер мен дыбыстар', en: 'New letters and sounds' } },
  { id: 'k-23', kind: 'pairs', sets: ['needs', 'needs', 'eats'], pairCount: 4, type: 'COMPREHENSION', difficulty: 'HARD', xp: 20,
    title: { ru: 'Что нужно', kk: 'Не қажет', en: 'What do we need' },
    desc: { ru: 'Что нужно в дождь, в жару, перед сном', kk: 'Жаңбырда, ыстықта, ұйқы алдында не қажет', en: 'What we need in rain, heat, at bedtime' } },
  { id: 'k-24', kind: 'colors', choices: 4, type: 'VOCABULARY', difficulty: 'HARD', xp: 20,
    title: { ru: 'Цвета 2', kk: 'Түстер 2', en: 'Colors 2' },
    desc: { ru: 'Повторяем цвета — теперь с большим выбором', kk: 'Түстерді қайталаймыз — таңдау көбірек', en: 'Colors again — with more choices' } },
  { id: 'k-25', kind: 'vocab', pool: 'jobs', choices: 4, type: 'VOCABULARY', difficulty: 'HARD', xp: 20,
    title: { ru: 'Профессии', kk: 'Мамандықтар', en: 'Jobs' },
    desc: { ru: 'Врач, повар, пожарный, лётчик', kk: 'Дәрігер, аспаз, өрт сөндіруші, ұшқыш', en: 'Doctor, cook, firefighter, pilot' } },
]

// Собираем готовые записи для таблицы Lesson
export const lessons = SPECS.map((spec, i) => {
  const gen = GEN[spec.kind]
  const built = Object.fromEntries(LANGS.map((lang) => [lang, gen(spec, lang)]))
  return {
    id: spec.id,
    title: spec.title.ru,
    description: spec.desc.ru,
    type: spec.type,
    difficulty: spec.difficulty,
    xpReward: spec.xp,
    order: i + 1,
    isActive: true,
    content: { exercises: built.ru },
    translations: {
      kk: { title: spec.title.kk, description: spec.desc.kk, exercises: built.kk },
      en: { title: spec.title.en, description: spec.desc.en, exercises: built.en },
    },
  }
})

// старые уроки для школьников — скрываем, а не удаляем, чтобы не потерять прогресс
export const legacyLessonIds = Array.from({ length: 25 }, (_, i) => `l-${String(i + 1).padStart(2, '0')}`)
