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
  const liveTextRef = useRef('')
  const finalTextRef = useRef('')
  const confidenceRef = useRef(0.86)
  const recognitionErrorRef = useRef(false)
  const turnOrderRef = useRef(1)
  const [callId, setCallId] = useState(null)
  const [turnIndex, setTurnIndex] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(starterQuestions[0])
  const [messages, setMessages] = useState([])
  const [mode, setMode] = useState('idle')
  const [liveText, setLiveText] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [ended, setEnded] = useState(false)

  const speechSupported = useMemo(() => Boolean(getSpeechRecognition()), [])

  useEffect(() => {
    let isMounted = true

    const start = async () => {
      let firstQuestion = starterQuestions[0]

      try {
        const session = await startChatSession({ scenarioId: 1 })
        if (!isMounted) return
        setCallId(session?.call_id)
        firstQuestion = session?.initial_question || firstQuestion
      } catch {
        if (!isMounted) return
        setCallId(null)
      }

      setCurrentQuestion(firstQuestion)
      setMessages([createMessage('ai', firstQuestion, { kind: 'question' })])
      speakText(firstQuestion)
    }

    start()

    return () => {
      isMounted = false
      recognitionRef.current?.abort?.()
      stopSpeaking()
    }
  }, [])

  const appendAiMessage = (text, kind = 'reply') => {
    setCurrentQuestion(text)
    setMessages((prev) => [...prev, createMessage('ai', text, { kind })])
    speakText(text)
  }

  const persistTurn = async ({ answer, confidence, responseDelayMs }) => {
    if (!callId) return null

    try {
      const turn = await saveChatTurn(callId, {
        turn_order: turnOrderRef.current,
        ai_question: currentQuestion,
        user_answer_text: answer,
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

      return turn
    } catch {
      // 시연 중 백엔드 연결이 불안정해도 대화 UI는 끊지 않는다.
      return null
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
    const fallbackReply = calmReplies[turnIndex % calmReplies.length]

    setMessages((prev) => [
      ...prev,
      createMessage('elder', trimmed, {
        analysis: analyzeRecognizedText({ text: trimmed, confidence, responseDelayMs }),
      }),
    ])
    setLiveText('')
    setMode('thinking')

    const turn = await persistTurn({ answer: trimmed, confidence, responseDelayMs })
    const reply = turn?.ai_response_text || fallbackReply
    setTurnIndex((prev) => prev + 1)
    setMode('idle')
    window.setTimeout(() => appendAiMessage(reply), 500)
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
    recognition.continuous = true
    recognition.maxAlternatives = 1
    recognitionRef.current = recognition
    listenStartedAtRef.current = Date.now()
    liveTextRef.current = ''
    finalTextRef.current = ''
    confidenceRef.current = 0.86
    recognitionErrorRef.current = false
    setLiveText('')
    setErrorMessage('')
    setMode('listening')

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || '')
        .join('')
      const latest = event.results[event.results.length - 1]
      if (latest?.isFinal) {
        finalTextRef.current = transcript
        confidenceRef.current = latest[0]?.confidence || confidenceRef.current
      }
      liveTextRef.current = transcript
      setLiveText(transcript)
    }

    recognition.onerror = () => {
      recognitionErrorRef.current = true
      setMode('retry')
      setErrorMessage('주변 소리가 커서 잘 듣지 못했어요. 다시 말씀해 주세요.')
    }

    recognition.onend = () => {
      if (recognitionErrorRef.current) return

      const capturedText = finalTextRef.current || liveTextRef.current
      if (!capturedText) {
        setMode('retry')
        setErrorMessage('말씀을 감지하지 못했어요. 말하기 버튼을 누르고 다시 말씀해 주세요.')
        return
      }
      handleRecognizedAnswer(capturedText, confidenceRef.current)
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
      <section className="chat-top-panel">
        <header className="chat-header">
          <button className="icon-button icon-button--flat" type="button" onClick={() => navigate('/elder-home')} aria-label="홈으로 돌아가기">
            <ArrowLeft size={24} strokeWidth={2.4} />
          </button>
          <h1>대화 중</h1>
          <button className="end-call-button" type="button" onClick={endChat} aria-label="대화 종료">
            <X size={20} strokeWidth={2.7} />
            대화 종료
          </button>
        </header>

        <div className="chat-profile">
          <ChatFace listening={mode === 'listening'} compact />
          <div>
            <h2>AI 친구</h2>
            <p>
              <span className="live-dot" />
              {mode === 'listening'
                ? '말씀을 듣고 있어요'
                : mode === 'thinking'
                  ? '답변을 준비하고 있어요'
                  : '이야기 중이에요'}
            </p>
          </div>
        </div>
      </section>

      <section className="chat-conversation">
        <div className="status-pill">
          <Headphones size={18} strokeWidth={2.4} />
          {mode === 'listening' ? '듣는 중' : mode === 'thinking' ? '생각 중' : '대기 중'}
        </div>

        <div className="message-list" aria-live="polite">
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
        </div>
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
          aria-pressed={mode === 'listening'}
          disabled={mode === 'thinking'}
        >
          {mode === 'listening' ? <Send size={30} strokeWidth={2.4} /> : <Mic size={34} strokeWidth={2.4} />}
          {mode === 'listening' ? '말하기 끝내기' : '말하기 시작'}
        </button>
        <p className="support-note">
          {speechSupported ? '한 번 누르고 말씀하신 뒤, 끝나면 다시 눌러 주세요.' : '크롬 브라우저에서 음성 인식을 사용할 수 있어요.'}
        </p>
      </footer>
    </main>
  )
}
