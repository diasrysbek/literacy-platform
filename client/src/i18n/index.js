import { useCallback } from 'react'
import { useSettings } from '@/app/settings'
import { translations } from './translations'

const LOCALES = { ru: 'ru-RU', kk: 'kk-KZ', en: 'en-US' }

const lookup = (dict, key) =>
  key.split('.').reduce((acc, part) => (acc == null ? acc : acc[part]), dict)

// t('map.days', { count: 3 })  — поддерживает {параметры} и формы множественного числа
export const translate = (lang, key, params = {}) => {
  let value = lookup(translations[lang], key)
  if (value === undefined) value = lookup(translations.ru, key) // запасной вариант
  if (value === undefined) return key
  if (Array.isArray(value)) return value // списки (например, названия дней недели)

  if (value && typeof value === 'object') {
    const rule = new Intl.PluralRules(LOCALES[lang]).select(Number(params.count ?? 0))
    value = value[rule] ?? value.other ?? Object.values(value)[0]
  }

  return String(value).replace(/\{(\w+)\}/g, (_, name) =>
    params[name] !== undefined ? params[name] : `{${name}}`
  )
}

export const useI18n = () => {
  const lang = useSettings((s) => s.lang)
  const t = useCallback((key, params) => translate(lang, key, params), [lang])
  return { t, lang, locale: LOCALES[lang] }
}

// Человекопонятная ошибка по HTTP-статусу (тексты сервера не локализованы)
export const getErrorMessage = (err, t, fallbackKey = 'errors.generic') => {
  const status = err?.response?.status
  if (!err?.response) return t('errors.network')
  if (status === 409) return t('errors.emailTaken')
  if (status === 429) return t('errors.tooMany')
  if (status === 400) return t('errors.validation')
  if (status === 401) return t('errors.invalidCredentials')
  return t(fallbackKey)
}
