import { useEffect, useRef } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Button from '@/components/UI/Button'
import styles from './Result.module.css'

function Confetti({ active }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width, y: -20,
      w: Math.random() * 12 + 6, h: Math.random() * 6 + 4,
      color: ['#6c63ff','#ff6584','#43d9ad','#ffd166','#ff9f43'][Math.floor(Math.random()*5)],
      vx: (Math.random() - 0.5) * 4, vy: Math.random() * 4 + 2,
      angle: Math.random() * 360, spin: (Math.random() - 0.5) * 8,
    }))
    let running = true
    const draw = () => {
      if (!running) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      pieces.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.angle += p.spin
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate((p.angle * Math.PI) / 180)
        ctx.fillStyle = p.color; ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h); ctx.restore()
      })
      requestAnimationFrame(draw)
    }
    draw()
    const t = setTimeout(() => { running = false }, 4000)
    return () => { running = false; clearTimeout(t) }
  }, [active])
  return <canvas ref={canvasRef} className={styles.confetti} />
}

export default function Result() {
  const { childId } = useParams()
  const navigate = useNavigate()
  const { state } = useLocation()
  const score = state?.score ?? 0
  const newBadges = state?.newBadges ?? []
  const lesson = state?.lesson
  const isPerfect = score === 100
  const emoji = score >= 80 ? '🏆' : score >= 50 ? '⭐' : '💪'
  const message = score >= 80 ? 'Отлично! Ты молодец!' : score >= 50 ? 'Хорошая работа!' : 'Не сдавайся!'
  const stars = score >= 80 ? 3 : score >= 50 ? 2 : 1

  return (
    <div className={styles.page}>
      <Confetti active={isPerfect} />
      <div className={styles.card}>
        <div className={styles.bigEmoji}>{emoji}</div>
        <h1 className={styles.title}>{message}</h1>
        <div className={styles.stars}>
          {[1,2,3].map((s) => (
            <span key={s} className={[styles.star, s <= stars ? styles.starActive : ''].join(' ')} style={{ animationDelay: `${s*0.15}s` }}>⭐</span>
          ))}
        </div>
        <div className={styles.scoreCircle}>
          <svg viewBox="0 0 120 120" className={styles.ring}>
            <circle cx="60" cy="60" r="54" fill="none" stroke="var(--color-border)" strokeWidth="10" />
            <circle cx="60" cy="60" r="54" fill="none"
              stroke={score >= 80 ? '#43d9ad' : score >= 50 ? '#ffd166' : '#ff6584'}
              strokeWidth="10" strokeLinecap="round"
              strokeDasharray={`${(score/100)*339} 339`}
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dasharray 1.2s ease', transitionDelay: '0.3s' }} />
          </svg>
          <div className={styles.scoreText}>{score}%</div>
        </div>
        {lesson && <p className={styles.lessonName}>📚 {lesson.title}</p>}
        <div className={styles.xpGained}>
          <span>⚡ +{lesson?.xpReward ?? 0} XP получено!</span>
        </div>
        {newBadges.length > 0 && (
          <div className={styles.badges}>
            <h3>🎉 Новые значки!</h3>
            <div className={styles.badgeList}>
              {newBadges.map((b) => (
                <div key={b.id} className={styles.badge}><span>{b.iconUrl}</span><small>{b.name}</small></div>
              ))}
            </div>
          </div>
        )}
        {isPerfect && <div className={styles.perfectBanner}>🎊 Идеальный результат! Ты настоящий чемпион!</div>}
        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => navigate(`/play/${childId}/lesson/${lesson?.id}`)}>🔄 Ещё раз</Button>
          <Button onClick={() => navigate(`/play/${childId}/map`)}>🗺️ На карту</Button>
        </div>
      </div>
    </div>
  )
}
