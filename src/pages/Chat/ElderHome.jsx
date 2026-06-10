import { useEffect, useMemo, useRef, useState } from 'react'
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

const getAge = (birthDate) => {
  if (!birthDate) return null
  const birth = new Date(birthDate)
  if (Number.isNaN(birth.getTime())) return null

  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1
  }
  return age
}

const getGenderLabel = (gender) => {
  if (gender === '남' || gender === 'M') return '남성'
  if (gender === '여' || gender === 'F') return '여성'
  return '성별 정보 없음'
}

export default function ElderHome() {
  const navigate = useNavigate()
  const [home, setHome] = useState(fallbackHome)
  const [isLoading, setIsLoading] = useState(true)
  const [openPanel, setOpenPanel] = useState(null)
  const detailPanelRef = useRef(null)

  useEffect(() => {
    const loadHome = async () => {
      try {
        const data = await getElderHome()
        setHome(data)
        if (data?.elder?.elder_id) {
          localStorage.setItem('elder_id', String(data.elder.elder_id))
          localStorage.setItem('selectedElderId', String(data.elder.elder_id))
        }
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
  const elderAgeValue = home.elder?.age || getAge(home.elder?.birth_date)
  const elderAge = elderAgeValue ? `${elderAgeValue}세` : '나이 정보 없음'
  const elderGender = getGenderLabel(home.elder?.gender)

  const togglePanel = (panelName) => {
    setOpenPanel((current) => (current === panelName ? null : panelName))
  }

  useEffect(() => {
    if (!openPanel) return

    const scrollTimer = window.setTimeout(() => {
      detailPanelRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }, 80)

    return () => window.clearTimeout(scrollTimer)
  }, [openPanel])

  const handleStartChat = () => {
    navigate('/elder-chat', {
      state: {
        nextSchedule: nextSchedule
          ? {
              scheduleId: nextSchedule.schedule_id,
              scenarioId: nextSchedule.scenario_id,
              scenarioTitle: nextSchedule.scenario_title,
              scheduledTime: nextSchedule.scheduled_time,
            }
          : null,
      },
    })
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
        <button className="primary-action" type="button" onClick={handleStartChat}>
          <PhoneCall size={31} strokeWidth={2.5} />
          지금 대화하기
        </button>

        <div className="home-action-group">
          <button
            className={`secondary-action ${openPanel === 'schedule' ? 'secondary-action--open' : ''}`}
            type="button"
            onClick={() => togglePanel('schedule')}
            aria-expanded={openPanel === 'schedule'}
          >
            <CalendarClock size={24} strokeWidth={2.3} />
            대화 시간 보기
            <ChevronRight
              className="secondary-action__chevron"
              size={24}
              strokeWidth={2.3}
            />
          </button>

          {openPanel === 'schedule' && (
            <section
              ref={detailPanelRef}
              className="home-detail-panel home-detail-panel--inline"
              aria-label="대화 시간 정보"
            >
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
        </div>

        <div className="home-action-group">
          <button
            className={`secondary-action ${openPanel === 'profile' ? 'secondary-action--open' : ''}`}
            type="button"
            onClick={() => togglePanel('profile')}
            aria-expanded={openPanel === 'profile'}
          >
            <UserRound size={24} strokeWidth={2.3} />
            내 정보 보기
            <ChevronRight
              className="secondary-action__chevron"
              size={24}
              strokeWidth={2.3}
            />
          </button>

          {openPanel === 'profile' && (
            <section
              ref={detailPanelRef}
              className="home-detail-panel home-detail-panel--inline"
              aria-label="내 정보"
            >
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
            </section>
          )}
        </div>

        <button
          className="secondary-action"
          type="button"
          onClick={() => navigate('/mypage')}
        >
          <Settings size={24} strokeWidth={2.3} />
          마이페이지
          <ChevronRight
            className="secondary-action__chevron"
            size={24}
            strokeWidth={2.3}
          />
        </button>
      </div>
    </main>
  )
}
