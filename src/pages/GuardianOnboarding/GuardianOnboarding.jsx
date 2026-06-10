import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, HeartHandshake, MessageCircleHeart, TrendingUp } from 'lucide-react'
import robotFace from '../../assets/img/ai-robot-face.png'
import { getDefaultPathForRole } from '../../utils/authSession'
import { completeGuardianOnboarding } from '../../utils/guardianOnboarding'
import './guardianOnboarding.css'

const steps = [
  {
    icon: MessageCircleHeart,
    accentIcon: HeartHandshake,
    eyebrow: '어르신의 하루 가까이',
    title: '대화가 일상이 되도록',
    text: '정해진 시간, 익숙한 이야기로 AI 친구가 어르신의 하루에 자연스럽게 말을 걸어요.',
  },
  {
    icon: TrendingUp,
    accentIcon: HeartHandshake,
    eyebrow: '보호자의 안심 가까이',
    title: '작은 변화도 함께 살펴봐요',
    text: '초대코드로 어르신 계정을 연결하고, 이어진 대화와 변화의 흐름을 함께 확인할 수 있어요.',
  },
]

export default function GuardianOnboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const timerRef = useRef(null)
  const currentStep = steps[step]
  const CurrentIcon = currentStep.icon
  const AccentIcon = currentStep.accentIcon

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  const finish = () => {
    completeGuardianOnboarding()
    navigate(getDefaultPathForRole('guardian'), { replace: true })
  }

  const finishWithTransition = () => {
    if (transitioning || leaving) return
    setLeaving(true)
    timerRef.current = window.setTimeout(finish, 320)
  }

  const handleNext = () => {
    if (transitioning || leaving) return

    if (step === steps.length - 1) {
      finishWithTransition()
      return
    }

    setTransitioning(true)
    timerRef.current = window.setTimeout(() => {
      setStep((current) => current + 1)
      setTransitioning(false)
    }, 220)
  }

  return (
    <main className={`guardian-onboarding ${leaving ? 'guardian-onboarding--leaving' : ''}`}>
      <button
        className="guardian-onboarding__skip"
        type="button"
        onClick={finishWithTransition}
      >
        건너뛰기
      </button>

      <section className="guardian-onboarding__visual" aria-hidden="true">
        <div className="guardian-onboarding__connection guardian-onboarding__connection--left" />
        <div className="guardian-onboarding__connection guardian-onboarding__connection--right" />

        <div className="guardian-onboarding__side-icon guardian-onboarding__side-icon--left">
          <CurrentIcon size={23} strokeWidth={2.1} />
        </div>
        <div className="guardian-onboarding__robot">
          <img src={robotFace} alt="" />
        </div>
        <div className="guardian-onboarding__side-icon guardian-onboarding__side-icon--right">
          <AccentIcon size={23} strokeWidth={2.1} />
        </div>
      </section>

      <section
        key={step}
        className={`guardian-onboarding__copy ${
          transitioning ? 'guardian-onboarding__copy--exiting' : ''
        }`}
        aria-live="polite"
      >
        <p>{currentStep.eyebrow}</p>
        <h1>{currentStep.title}</h1>
        <span>{currentStep.text}</span>
      </section>

      <div className="guardian-onboarding__footer">
        <div className="guardian-onboarding__dots" aria-label="온보딩 진행 단계">
          {steps.map((item, index) => (
            <span key={item.title} className={index === step ? 'active' : ''} />
          ))}
        </div>

        <button
          className="guardian-onboarding__next"
          type="button"
          onClick={handleNext}
          disabled={transitioning || leaving}
        >
          {step === steps.length - 1 ? '마인드루틴 시작하기' : '다음으로'}
          <ArrowRight size={22} strokeWidth={2.4} />
        </button>
      </div>
    </main>
  )
}
