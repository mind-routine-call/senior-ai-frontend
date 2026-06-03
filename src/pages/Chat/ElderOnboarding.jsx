import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Ear, Mic, Volume2 } from 'lucide-react'
import { completeElderOnboarding } from '../../api/elderChat'
import ChatFace from './ChatFace'
import './elderChat.css'

const steps = [
  {
    icon: Ear,
    title: '천천히 들어요',
    text: '질문을 크게 읽어드리고, 대답하실 시간을 충분히 기다립니다.',
  },
  {
    icon: Mic,
    title: '말씀을 글자로 바꿔요',
    text: '마이크 버튼을 누르고 말씀하시면 대화 내용이 화면에 기록됩니다.',
  },
  {
    icon: Volume2,
    title: '다시 들을 수 있어요',
    text: '못 들으셨거나 주변이 시끄러우면 다시 듣기와 다시 말하기를 누르면 됩니다.',
  },
]

export default function ElderOnboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const CurrentIcon = steps[step].icon

  const finishOnboarding = async () => {
    localStorage.setItem('elderOnboardingDone', 'true')
    try {
      await completeElderOnboarding(1)
    } catch {
      // 백엔드가 꺼져 있어도 온보딩 체험 흐름은 계속 진행한다.
    }
    navigate('/elder-home')
  }

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep((prev) => prev + 1)
      return
    }
    finishOnboarding()
  }

  return (
    <main className="elder-shell elder-shell--soft">
      <section className="onboarding-hero">
        <ChatFace />
        <p className="eyebrow">처음 오셨나요</p>
        <h1>제가 곁에서 천천히 도와드릴게요</h1>
      </section>

      <section className="onboarding-panel" aria-live="polite">
        <div className="onboarding-icon">
          <CurrentIcon size={34} strokeWidth={2.2} />
        </div>
        <h2>{steps[step].title}</h2>
        <p>{steps[step].text}</p>
      </section>

      <div className="step-dots" aria-label="온보딩 진행 단계">
        {steps.map((item, index) => (
          <span key={item.title} className={index === step ? 'active' : ''} />
        ))}
      </div>

      <button className="primary-action" type="button" onClick={handleNext}>
        {step === steps.length - 1 ? '시작하기' : '다음으로'}
        <ChevronRight size={26} strokeWidth={2.5} />
      </button>
    </main>
  )
}
