// useAudio.js — звуковые эффекты через Web Audio API (без файлов)
import { useCallback } from 'react'
import { useSettings } from '@/app/settings'

// Один общий AudioContext на всё приложение. Раньше на каждый звук создавался
// новый контекст и никогда не закрывался — браузер ограничивает их число и память утекала.
let sharedCtx = null
const getCtx = () => {
  const Ctx = window.AudioContext || window.webkitAudioContext
  if (!Ctx) return null
  if (!sharedCtx) sharedCtx = new Ctx()
  if (sharedCtx.state === 'suspended') sharedCtx.resume().catch(() => {})
  return sharedCtx
}

function createBeep(ctx, freq, duration, type = 'sine', gain = 0.3, delay = 0) {
  const osc = ctx.createOscillator()
  const gainNode = ctx.createGain()
  osc.connect(gainNode)
  gainNode.connect(ctx.destination)
  osc.frequency.value = freq
  osc.type = type
  const start = ctx.currentTime + delay
  gainNode.gain.setValueAtTime(gain, start)
  gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration)
  osc.start(start)
  osc.stop(start + duration)
}

const play = (notes) => {
  try {
    if (!useSettings.getState().soundOn) return // звук выключен в настройках
    const ctx = getCtx()
    if (!ctx) return
    notes.forEach(([freq, duration, gain, delay]) => createBeep(ctx, freq, duration, 'sine', gain, delay))
  } catch {
    // звук не критичен — молча игнорируем
  }
}

export const useAudio = () => {
  // Весёлый звук правильного ответа — два тона вверх (C5, G5)
  const playCorrect = useCallback(() => play([[523, 0.15, 0.3, 0], [784, 0.2, 0.3, 0.15]]), [])
  // Мягкий звук неправильного ответа — один низкий тон
  const playWrong = useCallback(() => play([[300, 0.3, 0.2, 0]]), [])
  // Победная мелодия
  const playLevelUp = useCallback(
    () => play([523, 659, 784, 1047].map((f, i) => [f, 0.2, 0.3, i * 0.15])),
    []
  )
  const playClick = useCallback(() => play([[800, 0.05, 0.1, 0]]), [])

  return { playCorrect, playWrong, playLevelUp, playClick }
}
