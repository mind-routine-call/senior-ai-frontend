import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Headphones,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  Volume2,
  X,
} from 'lucide-react'
import {
  endChatSession,
  saveChatTurn,
  saveUtteranceAnalysis,
  startChatSession,
} from '../../api/elderChat'
import { analyzeRecognizedText, getSpeechRecognition, speakText, stopSpeaking } from './speechUtils'
import { calmReplies, starterQuestions } from './chatMockData'
import ChatFace from './ChatFace'
import './elderChat.css'

const createMessage = (speaker, text, meta = {}) => ({
  id: `${speaker}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  speaker,
  text,
  ...meta,
})

export default function ElderChat() {
  const navigate = useNavigate()
  const recognitionRef = useRef(null)
  const listenStartedAtRef = useRef(null)
  const turnOrderRef = useRef(1)
  const [callId, setCallId] = useState(null)
  const [turnIndex, setTurnIndex] = useState(0)
  const [messages, setMessages] = useState([
    createMessage('ai', starterQuestions[0], { kind: 'question' }),
  ])
  const [mode, setMode] = useState('idle')
  const [liveText, setLiveText] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [ended, setEnded] = useState(false)

  const currentQuestion = starterQuestions[turnIndex] || starterQuestions[starterQuestions.length - 1]
  const speechSupported = useMemo(() => Boolean(getSpeechRecognition()), [])

  useEffect(() => {
    const start = async () => {
      try {
        const session = await startChatSession({ elderId: 1, scenarioId: 1 })
        setCallId(session?.call_id)
      } catch {
        setCallId(null)
      }
    }
    start()
    speakText(starterQuestions[0])

    return () => {
      recognitionRef.current?.abort?.()
      stopSpeaking()
    }
  }, [])

  const appendAiMessage = (text) => {
    setMessages((prev) => [...prev, createMessage('ai', text, { kind: 'question' })])
    speakText(text)
  }

  const persistTurn = async ({ answer, reply, confidence, responseDelayMs }) => {
    if (!callId) return

    try {
      const turn = await saveChatTurn(callId, {
        turn_order: turnOrderRef.current,
        ai_question: currentQuestion,
        user_answer_text: answer,
        ai_response_text: reply,
        stt_confidence: confidence,
        response_delay_ms: responseDelayMs,
      })
      turnOrderRef.current += 1

      if (turn?.turn_id) {
        await saveUtteranceAnalysis(turn.turn_id, analyzeRecognizedText({
          text: answer,
          confidence,
          responseDelayMs,
        }))
      }
    } catch {
      // 시연 중 백엔드 연결이 불안정해도 대화 UI는 끊지 않는다.
    }
  }

  const handleRecognizedAnswer = async (answer, confidence = 0.86) => {
    const trimmed = answer.trim()
    if (!trimmed) {
      setMode('retry')
      setErrorMessage('말씀을 잘 듣지 못했어요. 조용한 곳에서 다시 말씀해 주세요.')
      return
    }

    const responseDelayMs = listenStartedAtRef.current
      ? Date.now() - listenStartedAtRef.current
      : 0
    const nextIndex = Math.min(turnIndex + 1, starterQuestions.length - 1)
    const reply = turnIndex >= starterQuestions.length - 1
      ? '오늘 이야기 잘 들었어요. 이제 편히 쉬셔도 됩니다.'
      : calmReplies[turnIndex % calmReplies.length]
    const nextQuestion = starterQuestions[nextIndex]

    setMessages((prev) => [
      ...prev,
      createMessage('elder', trimmed, {
        analysis: analyzeRecognizedText({ text: trimmed, confidence, responseDelayMs }),
      }),
      createMessage('ai', reply, { kind: 'reply' }),
    ])

    await persistTurn({ answer: trimmed, reply, confidence, responseDelayMs })
    setLiveText('')

    if (turnIndex >= starterQuestions.length - 1) {
      setMode('done')
      setEnded(true)
      speakText(reply)
      return
    }

    setTurnIndex(nextIndex)
    setMode('idle')
    window.setTimeout(() => appendAiMessage(nextQuestion), 900)
  }

  const startListening = () => {
    const Recognition = getSpeechRecognition()

    if (!Recognition) {
      setMode('retry')
      setErrorMessage('이 브라우저에서는 음성 인식을 사용할 수 없어요. 크롬에서 다시 열어 주세요.')
      return
    }

    recognitionRef.current?.abort?.()
    const recognition = new Recognition()
    recognition.lang = 'ko-KR'
    recognition.interimResults = true
    recognition.continuous = false
    recognition.maxAlternatives = 1
    recognitionRef.current = recognition
    listenStartedAtRef.current = Date.now()
    setLiveText('')
    setErrorMessage('')
    setMode('listening')

    let finalText = ''
    let confidence = 0.86

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || '')
        .join('')
      const latest = event.results[event.results.length - 1]
      if (latest?.isFinal) {
        finalText = transcript
        confidence = latest[0]?.confidence || confidence
      }
      setLiveText(transcript)
    }

    recognition.onerror = () => {
      setMode('retry')
      setErrorMessage('주변 소리가 커서 잘 듣지 못했어요. 다시 말씀해 주세요.')
    }

    recognition.onend = () => {
      if (mode === 'retry') return
      if (!finalText && !liveText) {
        setMode('retry')
        setErrorMessage('말씀을 감지하지 못했어요. 마이크 버튼을 누르고 다시 말씀해 주세요.')
        return
      }
      handleRecognizedAnswer(finalText || liveText, confidence)
    }

    recognition.start()
  }

  const stopListening = () => {
    recognitionRef.current?.stop?.()
  }

  const endChat = async () => {
    setEnded(true)
    setMode('done')
    stopSpeaking()
    if (callId) {
      try {
        await endChatSession(callId)
      } catch {
        // 종료 API 실패 시에도 화면 종료는 유지한다.
      }
    }
  }

  if (ended) {
    return (
      <main className="elder-shell elder-shell--center">
        <ChatFace />
        <section className="finish-panel">
          <CheckCircle2 size={38} strokeWidth={2.2} />
          <h1>오늘 대화가 끝났어요</h1>
          <p>말씀해 주신 내용은 보호자가 확인할 수 있도록 정리됩니다.</p>
        </section>
        <button className="primary-action" type="button" onClick={() => navigate('/elder-home')}>
          홈으로 돌아가기
        </button>
      </main>
    )
  }

  return (
    <main className="elder-shell elder-shell--chat">
      <header className="chat-header">
        <button className="icon-button" type="button" onClick={() => navigate('/elder-home')} aria-label="홈으로 돌아가기">
          <ArrowLeft size={24} strokeWidth={2.4} />
        </button>
        <div>
          <p className="eyebrow">AI 대화</p>
          <h1>{mode === 'listening' ? '말씀을 듣고 있어요' : '천천히 대화해요'}</h1>
        </div>
        <button className="icon-button" type="button" onClick={endChat} aria-label="대화 종료">
          <X size={24} strokeWidth={2.4} />
        </button>
      </header>

      <section className="chat-stage">
        <ChatFace listening={mode === 'listening'} />
        <div className="status-pill">
          <Headphones size={18} strokeWidth={2.4} />
          {mode === 'listening' ? '듣는 중' : '대기 중'}
        </div>
      </section>

      <section className="message-list" aria-live="polite">
        {messages.map((message) => (
          <article key={message.id} className={`message-bubble message-bubble--${message.speaker}`}>
            <span>{message.speaker === 'ai' ? '마인드루틴' : '나'}</span>
            <p>{message.text}</p>
            {message.analysis && (
              <small>
                반복 단어 {message.analysis.repeated_word_count}개 · 불명확 표현 {message.analysis.vague_word_count}개
              </small>
            )}
          </article>
        ))}
        {liveText && mode === 'listening' && (
          <article className="message-bubble message-bubble--elder message-bubble--live">
            <span>인식 중</span>
            <p>{liveText}</p>
          </article>
        )}
      </section>

      {mode === 'retry' && (
        <section className="retry-panel">
          <MicOff size={30} strokeWidth={2.4} />
          <p>{errorMessage}</p>
          <button type="button" onClick={startListening}>
            <RotateCcw size={22} strokeWidth={2.4} />
            다시 말하기
          </button>
        </section>
      )}

      <footer className="voice-controls">
        <button className="control-button" type="button" onClick={() => speakText(currentQuestion)}>
          <Volume2 size={23} strokeWidth={2.4} />
          다시 듣기
        </button>
        <button
          className={`mic-action ${mode === 'listening' ? 'mic-action--active' : ''}`}
          type="button"
          onClick={mode === 'listening' ? stopListening : startListening}
        >
          {mode === 'listening' ? <Send size={30} strokeWidth={2.4} /> : <Mic size={34} strokeWidth={2.4} />}
          {mode === 'listening' ? '말씀 끝났어요' : '말하기'}
        </button>
        <p className="support-note">
          {speechSupported ? '마이크를 누르고 편하게 말씀해 주세요.' : '크롬 브라우저에서 음성 인식을 사용할 수 있어요.'}
        </p>
      </footer>
    </main>
  )
}
