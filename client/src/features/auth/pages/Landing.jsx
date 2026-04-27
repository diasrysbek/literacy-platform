import { Link } from 'react-router-dom'
import styles from './Landing.module.css'

const features = [
  { icon: '🔤', title: 'Фонетика', desc: 'Учим буквы и звуки через игры' },
  { icon: '📖', title: 'Чтение', desc: 'Простые слова и предложения' },
  { icon: '✏️', title: 'Письмо', desc: 'Составляем предложения' },
  { icon: '🧠', title: 'Понимание', desc: 'Развиваем мышление и словарь' },
]

const badges = ['🏆', '⭐', '🔥', '🎯', '💎', '🌟']

export default function Landing() {
  return (
    <div className={styles.page}>
      {/* NAV */}
      <nav className={styles.nav}>
        <div className={styles.navBrand}>📚 LiteracyPlatform</div>
        <div className={styles.navLinks}>
          <Link to="/login" className={styles.navLogin}>Войти</Link>
          <Link to="/register" className={styles.navCta}>Начать бесплатно</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBlob1} />
        <div className={styles.heroBlob2} />
        <div className={styles.heroBlob3} />

        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>🎉 Более 100+ уроков для детей 3–8 лет</div>
          <h1 className={styles.heroTitle}>
            Учим читать —<br />
            <span className={styles.heroAccent}>весело и с пользой!</span>
          </h1>
          <p className={styles.heroSub}>
            Интерактивная платформа для обучения грамоте. Ваш ребёнок будет учиться
            как в игре — с наградами, уровнями и персонажами!
          </p>
          <div className={styles.heroBtns}>
            <Link to="/register" className={styles.btnPrimary}>
              🚀 Начать бесплатно
            </Link>
            <Link to="/login" className={styles.btnSecondary}>
              Войти в аккаунт
            </Link>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}><b>500+</b><span>детей учатся</span></div>
            <div className={styles.heroDivider} />
            <div className={styles.heroStat}><b>100+</b><span>уроков</span></div>
            <div className={styles.heroDivider} />
            <div className={styles.heroStat}><b>4.9★</b><span>рейтинг</span></div>
          </div>
        </div>

        {/* Mascot */}
        <div className={styles.mascotWrap}>
          <div className={styles.mascot}>🦉</div>
          <div className={styles.mascotBubble}>Привет! Давай учиться вместе! 👋</div>
          <div className={styles.floatingBadge1}>⚡ +10 XP</div>
          <div className={styles.floatingBadge2}>🏆 Новый значок!</div>
          <div className={styles.floatingBadge3}>🔥 3 дня подряд!</div>
        </div>
      </section>

      {/* FEATURES */}
      <section className={styles.features}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Что умеет платформа?</h2>
          <p className={styles.sectionSub}>Четыре направления обучения для всестороннего развития</p>
          <div className={styles.featureGrid}>
            {features.map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={styles.how}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Как это работает?</h2>
          <div className={styles.steps}>
            {[
              { num: '1', icon: '👨‍👩‍👧', title: 'Регистрируйтесь', desc: 'Создайте аккаунт родителя и добавьте профиль ребёнка' },
              { num: '2', icon: '🗺️', title: 'Выбирайте урок', desc: 'Ребёнок видит карту уроков как в игре и выбирает следующий' },
              { num: '3', icon: '🎮', title: 'Учитесь играя', desc: 'Интерактивные задания, моментальная обратная связь' },
              { num: '4', icon: '🏆', title: 'Получайте награды', desc: 'XP, значки, уровни — мотивация продолжать каждый день' },
            ].map((s) => (
              <div key={s.num} className={styles.step}>
                <div className={styles.stepNum}>{s.num}</div>
                <div className={styles.stepIcon}>{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
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
              <h2 className={styles.sectionTitle}>Геймификация<br />мотивирует учиться</h2>
              <p className={styles.sectionSub}>Ребёнок получает награды за каждое достижение</p>
              <ul className={styles.gamifList}>
                <li>⚡ <b>XP очки</b> за каждый завершённый урок</li>
                <li>🏆 <b>Уровни</b> — каждые 100 XP новый уровень</li>
                <li>🔥 <b>Стрик</b> — серия дней обучения подряд</li>
                <li>🏅 <b>Значки</b> за особые достижения</li>
                <li>📊 <b>Прогресс</b> — родитель видит всё в дашборде</li>
              </ul>
              <Link to="/register" className={styles.btnPrimary}>
                Попробовать бесплатно →
              </Link>
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
          <h2>Начните обучение сегодня!</h2>
          <p>Присоединяйтесь к сотням семей которые уже учатся с нами</p>
          <Link to="/register" className={styles.btnPrimaryLg}>
            🚀 Создать бесплатный аккаунт
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>📚 LiteracyPlatform</div>
          <p>© 2025 LiteracyPlatform. Образование для детей 3–8 лет.</p>
        </div>
      </footer>
    </div>
  )
}
