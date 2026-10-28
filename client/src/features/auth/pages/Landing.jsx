import { Link } from 'react-router-dom'
import { useI18n } from '@/i18n'
import SettingsSwitcher from '@/components/SettingsSwitcher/SettingsSwitcher'
import styles from './Landing.module.css'

const badges = ['🏆', '⭐', '🔥', '🎯', '💎', '🌟']

// Только проверяемые цифры: уроков в программе, языков интерфейса, возраст.
// Не добавляйте число пользователей или рейтинг, пока их нет в реальности.
const STATS = { lessons: '25', languages: '3', ages: '3–6' }

export default function Landing() {
  const { t } = useI18n()

  const features = [
    { icon: '🔤', key: 'phonics' },
    { icon: '📖', key: 'reading' },
    { icon: '✏️', key: 'writing' },
    { icon: '🧠', key: 'comprehension' },
  ]

  const steps = [
    { num: '1', icon: '👨‍👩‍👧', key: 's1' },
    { num: '2', icon: '🗺️', key: 's2' },
    { num: '3', icon: '🎮', key: 's3' },
    { num: '4', icon: '🏆', key: 's4' },
  ]

  const gamifItems = [
    { icon: '⚡', key: 'li1' },
    { icon: '🏆', key: 'li2' },
    { icon: '🔥', key: 'li3' },
    { icon: '🏅', key: 'li4' },
    { icon: '📊', key: 'li5' },
  ]

  return (
    <div className={styles.page}>
      {/* NAV */}
      <nav className={styles.nav}>
        <div className={styles.navBrand}>
          📚 <span className={styles.navBrandText}>LiteracyPlatform</span>
        </div>
        <div className={styles.navLinks}>
          <SettingsSwitcher />
          <Link to="/login" className={styles.navLogin}>{t('landing.nav.login')}</Link>
          <Link to="/register" className={styles.navCta}>{t('landing.nav.start')}</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBlob1} />
        <div className={styles.heroBlob2} />
        <div className={styles.heroBlob3} />

        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>{t('landing.hero.badge', { lessons: STATS.lessons })}</div>
          <h1 className={styles.heroTitle}>
            {t('landing.hero.title1')}<br />
            <span className={styles.heroAccent}>{t('landing.hero.title2')}</span>
          </h1>
          <p className={styles.heroSub}>{t('landing.hero.sub')}</p>
          <div className={styles.heroBtns}>
            <Link to="/register" className={styles.btnPrimary}>{t('landing.hero.btnStart')}</Link>
            <Link to="/login" className={styles.btnSecondary}>{t('landing.hero.btnLogin')}</Link>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}><b>{STATS.languages}</b><span>{t('landing.hero.statKids')}</span></div>
            <div className={styles.heroDivider} />
            <div className={styles.heroStat}><b>{STATS.lessons}</b><span>{t('landing.hero.statLessons')}</span></div>
            <div className={styles.heroDivider} />
            <div className={styles.heroStat}><b>{STATS.ages}</b><span>{t('landing.hero.statRating')}</span></div>
          </div>
        </div>

        {/* Mascot */}
        <div className={styles.mascotWrap}>
          <div className={styles.mascot}>🦉</div>
          <div className={styles.mascotBubble}>{t('landing.mascot.bubble')}</div>
          <div className={styles.floatingBadge1}>{t('landing.mascot.xp')}</div>
          <div className={styles.floatingBadge2}>{t('landing.mascot.badge')}</div>
          <div className={styles.floatingBadge3}>{t('landing.mascot.streak')}</div>
        </div>
      </section>

      {/* FEATURES */}
      <section className={styles.features}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>{t('landing.features.title')}</h2>
          <p className={styles.sectionSub}>{t('landing.features.sub')}</p>
          <div className={styles.featureGrid}>
            {features.map((f) => (
              <div key={f.key} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3>{t(`landing.features.${f.key}.title`)}</h3>
                <p>{t(`landing.features.${f.key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={styles.how}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>{t('landing.how.title')}</h2>
          <div className={styles.steps}>
            {steps.map((s) => (
              <div key={s.num} className={styles.step}>
                <div className={styles.stepNum}>{s.num}</div>
                <div className={styles.stepIcon}>{s.icon}</div>
                <h3>{t(`landing.how.${s.key}.title`)}</h3>
                <p>{t(`landing.how.${s.key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GAMIFICATION */}
      <section className={styles.gamification}>
        <div className={styles.sectionInner}>
          <div className={styles.gamifContent}>
            <div>
              <h2 className={styles.sectionTitle}>
                {t('landing.gamif.title1')}<br />{t('landing.gamif.title2')}
              </h2>
              <p className={styles.sectionSub}>{t('landing.gamif.sub')}</p>
              <ul className={styles.gamifList}>
                {gamifItems.map((item) => (
                  <li key={item.key}>
                    {item.icon} <span><b>{t(`landing.gamif.${item.key}.b`)}</b> {t(`landing.gamif.${item.key}.t`)}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register" className={styles.btnPrimary}>{t('landing.gamif.try')}</Link>
            </div>
            <div className={styles.badgeShowcase}>
              {badges.map((b, i) => (
                <div key={i} className={styles.badgeItem} style={{ animationDelay: `${i * 0.1}s` }}>
                  {b}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <div className={styles.ctaMascot}>🦉</div>
          <h2>{t('landing.cta.title')}</h2>
          <p>{t('landing.cta.sub')}</p>
          <Link to="/register" className={styles.btnPrimaryLg}>{t('landing.cta.btn')}</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>📚 LiteracyPlatform</div>
          <p>{t('landing.footer', { year: new Date().getFullYear() })}</p>
        </div>
      </footer>
    </div>
  )
}
