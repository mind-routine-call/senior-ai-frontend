import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/img/mind_routine_logo.svg'
import Button from "../../components/Button"

const OPENING_DURATION_MS = 5700

function StaggeredText({ children, className = '' }) {
  return (
    <span className={`opening-staggered-text ${className}`} aria-label={children}>
      {Array.from(children).map((character, index) => (
        <span
          key={`${character}-${index}`}
          className="opening-character"
          style={{ '--character-index': index }}
          aria-hidden="true"
        >
          {character === ' ' ? '\u00A0' : character}
        </span>
      ))}
    </span>
  )
}

const Index = () => {
  const navigate = useNavigate()
  const [openingComplete, setOpeningComplete] = useState(false)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timerId = window.setTimeout(
      () => setOpeningComplete(true),
      prefersReducedMotion ? 100 : OPENING_DURATION_MS,
    )

    return () => window.clearTimeout(timerId)
  }, [])

  const handleLoginClick = () => {
    navigate('/login')
  }
  const handleGuardianSignupClick = () => {
    navigate('/account')
  }
  const handleElderSignupClick = () => {
    navigate('/account/elder')
  }

  return (
    <main
      className={`auth-page auth-page--welcome ${
        openingComplete ? 'auth-page--welcome-ready' : 'auth-page--welcome-waiting'
      }`}
    >
      {!openingComplete && (
        <section className="auth-opening" aria-label="마인드루틴 콜 시작 문구">
          <div className="opening-scene opening-scene--first">
            <StaggeredText>시간을 멈추는 마법은 없어도,</StaggeredText>
          </div>

          <div className="opening-scene opening-scene--second">
            <StaggeredText>서로라는 기적이 있으니까</StaggeredText>
          </div>

          <div className="opening-scene opening-scene--final">
            <div className="opening-final-copy">
              <StaggeredText className="opening-final-wish">
                오늘 하루도 건강하게
              </StaggeredText>
              <StaggeredText className="opening-final-title">
                마인드루틴 콜
              </StaggeredText>
            </div>
          </div>
        </section>
      )}

      <div className="welcome-logo">
        <img src={logo} alt="마인드루틴" />
      </div>
      <div className="welcome-actions">
        <Button title={"보호자로 회원가입하기"} main onClick={handleGuardianSignupClick} />
        <Button title={"어르신으로 회원가입하기"} main onClick={handleElderSignupClick} />
        <Button title={"로그인"} onClick={handleLoginClick}/>
      </div>
    </main>
  )
}

export default Index
