import { useEffect, useRef } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useI18n } from '@/i18n'
import { useSpeech } from '@/hooks/useSpeech'
import { useSettings } from '@/app/settings'
import Button from '@/components/UI/Button'
import SettingsSwitcher from '@/components/SettingsSwitcher/SettingsSwitcher'
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
    let frame = 0
    const draw = () => {
      if (!running) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      pieces.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.angle += p.spin
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate((p.angle * Math.PI) / 180)
        ctx.fillStyle = p.color; ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h); ctx.restore()
      })
      frame = requestAnimationFrame(draw)
    }
    draw()
    const t = setTimeout(() => { running = false; ctx.clearRect(0, 0, canvas.width, canvas.height) }, 4000)
    return () => { running = false; cancelAnimationFrame(frame); clearTimeout(t) }
  }, [active])
  return <canvas ref={canvasRef} className={styles.confetti} aria-hidden="true" />
}

export default function Result() {
  const { childId, lessonId } = useParams()
  const navigate = useNavigate()
  const { state } = useLocation()
  const { t } = useI18n()
  const { speak } = useSpeech()
  const soundOn = useSettings((s) => s.soundOn)
  const score = state?.score ?? 0
  const message = score >= 80 ? t('child.result.great') : score >= 50 ? t('child.result.good') : t('child.result.keepGoing')

  // малыши не читают — поздравляем голосом
  useEffect(() => {
    if (!state || !soundOn) return undefined
    const id = setTimeout(() => speak(message), 500)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Данные результата передаются через navigate(state). После обновления страницы их нет —
  // раньше показывался «0%» и кнопка «Ещё раз» вела на /lesson/undefined.
  if (!state) return <Navigate to={`/play/${childId}/map`} replace />

  const newBadges = state.newBadges ?? []
  const lesson = state.lesson
  const xpAwarded = state.xpAwarded ?? lesson?.xpReward ?? 0
  const isPerfect = score === 100
  const emoji = score >= 80 ? '🏆' : score >= 50 ? '⭐' : '💪'
  const stars = score >= 80 ? 3 : score >= 50 ? 2 : 1

  return (
    <div className={styles.page}>
      <SettingsSwitcher floating />
      <Confetti active={isPerfect} />
      <div className={styles.card}>
        <div className={styles.bigEmoji}>{emoji}</div>
        <h1 className={styles.title}>{message}</h1>
        <div className={styles.stars}>
          {[1,2,3].map((s) => (
            <span key={s} className={[styles.star, s <= stars ? styles.starActive : ''].join(' ')} style={{ animationDelay: `${s*0.15}s` }}>⭐</span>
          ))}
        </div>
        {lesson && <p className={styles.lessonName}>📚 {lesson.title}</p>}
        <div className={styles.xpGained}>
          <span>{xpAwarded > 0 ? t('child.result.xpGained', { n: xpAwarded }) : t('child.result.xpRepeat')}</span>
        </div>
        {newBadges.length > 0 && (
          <div className={styles.badges}>
            <h3>{t('child.result.newBadges')}</h3>
            <div className={styles.badgeList}>
              {newBadges.map((b) => (
                <div key={b.id} className={styles.badge}><span>{b.iconUrl}</span><small>{b.name}</small></div>
              ))}
            </div>
          </div>
        )}
        {isPerfect && <div className={styles.perfectBanner}>{t('child.result.perfect')}</div>}
        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => navigate(`/play/${childId}/lesson/${lessonId}`)}>{t('child.result.again')}</Button>
          <Button onClick={() => navigate(`/play/${childId}/map`)}>{t('child.result.toMap')}</Button>
        </div>
      </div>
    </div>
  )
}
