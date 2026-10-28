import { Moon, Sun } from 'lucide-react'
import { useSettings, LANGS } from '@/app/settings'
import { useI18n } from '@/i18n'
import styles from './SettingsSwitcher.module.css'

const LANG_LABELS = { ru: 'RU', kk: 'ҚАЗ', en: 'EN' }
const LANG_NAMES = { ru: 'Русский', kk: 'Қазақша', en: 'English' }

// floating — закрепить в правом верхнем углу (для страниц без шапки)
export default function SettingsSwitcher({ floating = false, className = '' }) {
  const { t } = useI18n()
  const theme = useSettings((s) => s.theme)
  const lang = useSettings((s) => s.lang)
  const toggleTheme = useSettings((s) => s.toggleTheme)
  const setLang = useSettings((s) => s.setLang)

  const isDark = theme === 'dark'

  return (
    <div className={[styles.wrap, floating ? styles.floating : '', className].join(' ')}>
      <div className={styles.langs} role="group" aria-label={t('settings.language')}>
        {LANGS.map((code) => (
          <button
            key={code}
            type="button"
            className={[styles.langBtn, lang === code ? styles.langActive : ''].join(' ')}
            onClick={() => setLang(code)}
            aria-pressed={lang === code}
            title={LANG_NAMES[code]}
            lang={code}
          >
            {LANG_LABELS[code]}
          </button>
        ))}
      </div>
      <button
        type="button"
        className={styles.themeBtn}
        onClick={toggleTheme}
        aria-label={isDark ? t('settings.toLight') : t('settings.toDark')}
        title={isDark ? t('settings.toLight') : t('settings.toDark')}
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </div>
  )
}
