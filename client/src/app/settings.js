import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { translations } from '@/i18n/translations'

export const LANGS = ['ru', 'kk', 'en']
export const THEMES = ['light', 'dark']

const detectTheme = () => {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

const detectLang = () => {
  const nav = (navigator.language || 'ru').toLowerCase()
  if (nav.startsWith('kk')) return 'kk'
  if (nav.startsWith('en')) return 'en'
  return 'ru'
}

// Применяем тему/язык к <html> и обновляем title вкладки
export const applyToDocument = ({ theme, lang }) => {
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  root.setAttribute('lang', lang)
  document.title = translations[lang]?.meta?.title ?? 'LiteracyPlatform'
}

export const useSettings = create(
  persist(
    (set) => ({
      theme: detectTheme(),
      lang: detectLang(),
      soundOn: true, // озвучка вопросов и звуковые эффекты
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setLang: (lang) => set({ lang }),
      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
    }),
    {
      name: 'literacy-settings',
      partialize: (s) => ({ theme: s.theme, lang: s.lang, soundOn: s.soundOn }),
      // защита от испорченного/устаревшего значения в localStorage
      merge: (persisted, current) => {
        const p = persisted || {}
        return {
          ...current,
          theme: THEMES.includes(p.theme) ? p.theme : current.theme,
          lang: LANGS.includes(p.lang) ? p.lang : current.lang,
          soundOn: typeof p.soundOn === 'boolean' ? p.soundOn : current.soundOn,
        }
      },
    }
  )
)

// первый запуск + любые изменения
applyToDocument(useSettings.getState())
useSettings.subscribe((state) => applyToDocument(state))
