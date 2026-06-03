import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarClock, ChevronRight, Clock, PhoneCall, UserRound } from 'lucide-react'
import { getElderHome } from '../../api/elderChat'
import { fallbackHome } from './chatMockData'
import ChatFace from './ChatFace'
import './elderChat.css'

const formatToday = () => {
  const today = new Date()
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(today)
}

const formatTime = (value) => {
  if (!value) return '오전 10:00'
  const [hourText, minuteText] = value.split(':')
  const hour = Number(hourText)
  const period = hour >= 12 ? '오후' : '오전'
  const displayHour = hour % 12 || 12
  return `${period} ${displayHour}:${minuteText}`
}

export default function ElderHome() {
  const navigate = useNavigate()
  const [home, setHome] = useState(fallbackHome)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadHome = async () => {
      try {
        const data = await getElderHome(1)
        setHome(data)
        const localDone = localStorage.getItem('elderOnboardingDone') === 'true'
        if (!localDone && data?.elder?.onboarding_completed === false) {
          navigate('/elder-onboarding', { replace: true })
        }
      } catch {
        const localDone = localStorage.getItem('elderOnboardingDone') === 'true'
        if (!localDone) {
          navigate('/elder-onboarding', { replace: true })
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadHome()
  }, [navigate])

  const nextSchedule = home.schedules?.[0]
  const elderName = home.elder?.name || '어르신'
  const todayText = useMemo(() => formatToday(), [])

  return (
    <main className="elder-shell">
      <header className="home-header">
        <div>
          <p className="eyebrow">마인드루틴</p>
          <h1>{elderName}님, 안녕하세요</h1>
        </div>
        <button className="icon-button" type="button" onClick={() => navigate('/dashboard')} aria-label="내 정보 보기">
          <UserRound size={25} strokeWidth={2.2} />
        </button>
      </header>

      <section className="assistant-summary">
        <div className="assistant-summary__face">
          <ChatFace compact />
        </div>
        <div>
          <p className="assistant-summary__label">듣고 있어요</p>
          <h2>오늘도 편하게 말씀해 주세요</h2>
        </div>
      </section>

      <section className="today-card">
        <p>오늘은</p>
        <strong>{todayText}</strong>
        <span>예정된 대화가 있으면 제가 알려드릴게요.</span>
      </section>

      <section className="schedule-panel">
        <div className="section-title">
          <CalendarClock size={22} strokeWidth={2.3} />
          <h2>다음 대화</h2>
        </div>
        {isLoading ? (
          <p className="muted-text">일정을 불러오고 있어요.</p>
        ) : (
          <div className="next-schedule">
            <Clock size={24} strokeWidth={2.3} />
            <div>
              <strong>{formatTime(nextSchedule?.scheduled_time)}</strong>
              <span>{nextSchedule?.scenario_title || '오늘 기분 묻기'} · {nextSchedule?.repeat_type || '매일'}</span>
            </div>
          </div>
        )}
      </section>

      <div className="home-actions">
        <button className="primary-action" type="button" onClick={() => navigate('/elder-chat')}>
          <PhoneCall size={27} strokeWidth={2.4} />
          지금 대화하기
        </button>
        <button className="secondary-action" type="button" onClick={() => navigate('/dashboard')}>
          <UserRound size={24} strokeWidth={2.3} />
          내 정보 보기
          <ChevronRight size={24} strokeWidth={2.3} />
        </button>
      </div>
    </main>
  )
}
