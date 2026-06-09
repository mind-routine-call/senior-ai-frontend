export const getSpeechRecognition = () => (
  window.SpeechRecognition || window.webkitSpeechRecognition || null
)

const ELDER_SETTINGS_STORAGE_KEY = 'elderAudioDisplaySettings'
const KOREAN_LOCALE_PREFIX = 'ko'
const PREFERRED_VOICE_NAMES = [
  ['natural', 80],
  ['google', 55],
  ['sunhi', 50],
  ['suna', 50],
  ['yuna', 45],
  ['sora', 45],
  ['heami', 40],
  ['microsoft', 30],
  ['samsung', 25],
]

let availableVoices = []

const refreshVoices = () => {
  if (!('speechSynthesis' in window)) return
  availableVoices = window.speechSynthesis.getVoices()
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  refreshVoices()
  window.speechSynthesis.addEventListener('voiceschanged', refreshVoices)
}

const readAudioSettings = () => {
  try {
    return JSON.parse(localStorage.getItem(ELDER_SETTINGS_STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export const scoreKoreanVoice = (voice) => {
  const language = String(voice?.lang || '').toLowerCase()
  const name = String(voice?.name || '').toLowerCase()

  if (!language.startsWith(KOREAN_LOCALE_PREFIX)) return -1

  let score = language === 'ko-kr' ? 120 : 100
  if (voice.default) score += 8
  if (voice.localService === false) score += 12

  PREFERRED_VOICE_NAMES.forEach(([keyword, weight]) => {
    if (name.includes(keyword)) score += weight
  })

  return score
}

export const selectKoreanVoice = (voices = availableVoices) => (
  [...voices]
    .map((voice) => ({ voice, score: scoreKoreanVoice(voice) }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => b.score - a.score)[0]?.voice || null
)

export const speakText = (text) => {
  if (!('speechSynthesis' in window)) return

  refreshVoices()
  const settings = readAudioSettings()
  const speechSpeed = clamp(Number(settings.speechSpeed ?? 50), 0, 100)
  const volume = clamp(Number(settings.volume ?? 70), 0, 100)

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'ko-KR'
  utterance.voice = selectKoreanVoice()
  utterance.rate = 0.72 + (speechSpeed / 100) * 0.36
  utterance.pitch = 1
  utterance.volume = volume / 100
  window.speechSynthesis.speak(utterance)
}

export const stopSpeaking = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

export const analyzeRecognizedText = ({ text, confidence = 0.9, responseDelayMs = 0 }) => {
  const normalized = text.replace(/[^\p{L}\p{N}\s]/gu, ' ').trim()
  const words = normalized.split(/\s+/).filter(Boolean)
  const repeatedWords = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1
    return acc
  }, {})

  const vagueTerms = ['그거', '저거', '뭐였지', '음', '어', '아', '그러니까']
  const repeatedWordCount = Object.values(repeatedWords).filter((count) => count > 1).length
  const vagueWordCount = words.filter((word) => vagueTerms.includes(word)).length
  const estimatedPronunciationIssueCount = confidence < 0.72 ? 1 : 0

  return {
    recognized_text: text,
    repeated_words: Object.fromEntries(
      Object.entries(repeatedWords).filter(([, count]) => count > 1)
    ),
    repeated_word_count: repeatedWordCount,
    filler_word_count: words.filter((word) => ['음', '어', '아'].includes(word)).length,
    vague_word_count: vagueWordCount,
    long_pause_estimated: responseDelayMs > 8000,
    estimated_pronunciation_issue_count: estimatedPronunciationIssueCount,
    stt_confidence: confidence,
    response_delay_ms: responseDelayMs,
  }
}
