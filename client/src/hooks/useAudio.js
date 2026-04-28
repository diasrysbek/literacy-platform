// useAudio.js — звуковые эффекты через Web Audio API (без файлов)
import { useCallback } from 'react'

function createBeep(ctx, freq, duration, type = 'sine', gain = 0.3) {
  const osc = ctx.createOscillator()
  const gainNode = ctx.createGain()
  osc.connect(gainNode)
  gainNode.connect(ctx.destination)
  osc.frequency.value = freq
  osc.type = type
  gainNode.gain.setValueAtTime(gain, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + duration)
}

export const useAudio = () => {
  const playCorrect = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      // Весёлый звук правильного ответа — два тона вверх
      createBeep(ctx, 523, 0.15, 'sine', 0.3) // C5
      setTimeout(() => createBeep(ctx, 784, 0.2, 'sine', 0.3), 150) // G5
    } catch (e) {}
  }, [])

  const playWrong = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      // Мягкий звук неправильного ответа — один низкий тон
      createBeep(ctx, 300, 0.3, 'sine', 0.2)
    } catch (e) {}
  }, [])

  const playLevelUp = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      // Победная мелодия
      const notes = [523, 659, 784, 1047]
      notes.forEach((freq, i) => {
        setTimeout(() => createBeep(ctx, freq, 0.2, 'sine', 0.3), i * 150)
      })
    } catch (e) {}
  }, [])

  const playClick = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      createBeep(ctx, 800, 0.05, 'sine', 0.1)
    } catch (e) {}
  }, [])

  return { playCorrect, playWrong, playLevelUp, playClick }
}
