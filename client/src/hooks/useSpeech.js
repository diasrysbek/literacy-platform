// Озвучка вопросов для детей, которые ещё не умеют читать.
// Используем встроенный в браузер синтез речи (без файлов и без сервера).
// Русский и английский голоса есть почти везде, казахский — не на каждом устройстве:
// если казахского голоса нет, кнопка «послушать» не показывается. Для надёжной озвучки
// на казахском можно записать аудио и указать ссылку в поле `audio` задания.
import { useCallback, useEffect, useState } from 'react'
import { useI18n } from '@/i18n'

const SPEECH_LANG = { ru: 'ru-RU', kk: 'kk-KZ', en: 'en-US' }
const hasSynth = () => typeof window !== 'undefined' && 'speechSynthesis' in window

let currentAudio = null

export const stopSpeaking = () => {
  if (hasSynth()) window.speechSynthesis.cancel()
  if (currentAudio) { currentAudio.pause(); currentAudio = null }
}

export const useSpeech = () => {
  const { lang } = useI18n()
  const [voicesTick, setVoicesTick] = useState(0)

  // голоса в браузере подгружаются асинхронно
  useEffect(() => {
    if (!hasSynth()) return
    const onChange = () => setVoicesTick((n) => n + 1)
    window.speechSynthesis.addEventListener?.('voiceschanged', onChange)
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', onChange)
  }, [])

  const langCode = SPEECH_LANG[lang]
  const hasVoice = () => {
    if (!hasSynth()) return false
    const voices = window.speechSynthesis.getVoices()
    if (voices.length === 0) return lang !== 'kk' // список ещё грузится: ru/en пробуем, kk — нет
    return voices.some((v) => v.lang.toLowerCase().startsWith(lang))
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const canSpeak = useCallback(hasVoice, [lang, voicesTick])

  const speak = useCallback(
    (text, { audio } = {}) => {
      stopSpeaking()
      try {
        if (audio) {
          currentAudio = new Audio(audio)
          currentAudio.play().catch(() => {})
          return
        }
        if (!text || !hasSynth() || !hasVoice()) return
        const u = new SpeechSynthesisUtterance(text)
        u.lang = langCode
        u.rate = 0.85 // для малышей — помедленнее
        u.pitch = 1.1
        const voice = window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith(lang))
        if (voice) u.voice = voice
        window.speechSynthesis.speak(u)
      } catch {
        // озвучка не критична
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang, langCode, voicesTick]
  )

  return { speak, stop: stopSpeaking, canSpeak: canSpeak() }
}
