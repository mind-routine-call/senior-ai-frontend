export const getSpeechRecognition = () => (
  window.SpeechRecognition || window.webkitSpeechRecognition || null
)

export const speakText = (text) => {
  if (!('speechSynthesis' in window)) return

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'ko-KR'
  utterance.rate = 0.88
  utterance.pitch = 0.95
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
