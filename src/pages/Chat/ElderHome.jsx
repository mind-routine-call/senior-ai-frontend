import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarClock, ChevronRight, Clock, PhoneCall, UserRound, X, Settings } from 'lucide-react'
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
  const [openPanel, setOpenPanel] = useState(null)

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
  const scheduleTime = formatTime(nextSchedule?.scheduled_time)
  const elderAge = home.elder?.age ? `${home.elder.age}세` : '나이 정보 없음'
  const elderGender = home.elder?.gender === 'M' ? '남성' : home.elder?.gender === 'F' ? '여성' : '성별 정보 없음'

  const togglePanel = (panelName) => {
    setOpenPanel((current) => (current === panelName ? null : panelName))
  }

  return (
    <main className="elder-shell elder-shell--home">
      <header className="home-titlebar">
        <p className="eyebrow">마인드루틴</p>
        <h1>AI 친구와 대화하기</h1>
        <span>{elderName}님, 오늘도 안부를 나눠요</span>
      </header>

      <section className="call-card">
        <ChatFace />
        <div className="call-card__copy">
          <p>AI 친구가</p>
          <h2>대화를 기다리고 있어요</h2>
        </div>
        <div className="call-card__time">
          <Clock size={35} strokeWidth={2.3} />
          <strong>{isLoading ? '확인 중' : scheduleTime}</strong>
        </div>
        <span className="call-card__date">{todayText}</span>
        <small>{nextSchedule?.scenario_title || '오늘 기분 묻기'} · {nextSchedule?.repeat_type || '매일'}</small>
      </section>

      <div className="home-actions">
        <button className="primary-action" type="button" onClick={() => navigate('/elder-chat')}>
          <PhoneCall size={27} strokeWidth={2.4} />
          지금 대화하기
        </button>
        <button
          className="secondary-action"
          type="button"
          onClick={() => togglePanel('schedule')}
          aria-expanded={openPanel === 'schedule'}
        >
          <CalendarClock size={24} strokeWidth={2.3} />
          대화 시간 보기
          <ChevronRight size={24} strokeWidth={2.3} />
        </button>
        <button
          className="secondary-action"
          type="button"
          onClick={() => togglePanel('profile')}
          aria-expanded={openPanel === 'profile'}
        >
          <UserRound size={24} strokeWidth={2.3} />
          내 정보 보기
          <ChevronRight size={24} strokeWidth={2.3} />
        </button>

        <button
          className="secondary-action"
          type="button"
          onClick={() => navigate('/mypage')}
        >
          <Settings size={24} strokeWidth={2.3} />
          마이페이지
          <ChevronRight size={24} strokeWidth={2.3} />
        </button>
      </div>

      {openPanel === 'schedule' && (
        <section className="home-detail-panel" aria-label="대화 시간 정보">
          <button className="panel-close-button" type="button" onClick={() => setOpenPanel(null)} aria-label="닫기">
            <X size={20} strokeWidth={2.5} />
          </button>
          <div className="section-title">
            <CalendarClock size={22} strokeWidth={2.3} />
            <h2>대화 시간</h2>
          </div>
          {isLoading ? (
            <p className="muted-text">일정을 불러오고 있어요.</p>
          ) : (
            <div className="detail-row">
              <span>다음 대화</span>
              <strong>{scheduleTime}</strong>
              <p>{nextSchedule?.scenario_title || '오늘 기분 묻기'} · {nextSchedule?.repeat_type || '매일'}</p>
            </div>
          )}
        </section>
      )}

      {openPanel === 'profile' && (
        <section className="home-detail-panel" aria-label="내 정보">
          <button className="panel-close-button" type="button" onClick={() => setOpenPanel(null)} aria-label="닫기">
            <X size={20} strokeWidth={2.5} />
          </button>
          <div className="section-title">
            <UserRound size={22} strokeWidth={2.3} />
            <h2>내 정보</h2>
          </div>
          <div className="profile-grid">
            <div>
              <span>이름</span>
              <strong>{elderName}</strong>
            </div>
            <div>
              <span>나이</span>
              <strong>{elderAge}</strong>
            </div>
            <div>
              <span>성별</span>
              <strong>{elderGender}</strong>
            </div>
            <div>
              <span>보호자</span>
              <strong>{home.guardian?.name || '보호자 정보 없음'}</strong>
            </div>
          </div>
          <p className="profile-note">{home.elder?.cognitive_note || '등록된 참고 메모가 없습니다.'}</p>
        </section>
      )}
    </main>
  )
}
