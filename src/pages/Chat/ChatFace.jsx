import { AudioLines } from 'lucide-react'
import robotFace from '../../assets/img/ai-robot-face.png'

export default function ChatFace({ listening = false, compact = false }) {
  return (
    <div className={`chat-face ${listening ? 'chat-face--listening' : ''} ${compact ? 'chat-face--compact' : ''}`}>
      <img className="chat-face__image" src={robotFace} alt="마인드루틴 AI 친구" />
      <div className="chat-face__badge" aria-hidden="true">
        <AudioLines size={compact ? 14 : 18} strokeWidth={2.4} />
      </div>
    </div>
  )
}
