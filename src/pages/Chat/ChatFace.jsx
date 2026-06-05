import { AudioLines } from 'lucide-react'

export default function ChatFace({ listening = false, compact = false }) {
  return (
    <div className={`chat-face ${listening ? 'chat-face--listening' : ''} ${compact ? 'chat-face--compact' : ''}`}>
      <div className="chat-face__screen">
        <span className="chat-face__eye" />
        <span className="chat-face__eye" />
        <span className="chat-face__mouth" />
      </div>
      <div className="chat-face__badge" aria-hidden="true">
        <AudioLines size={compact ? 14 : 18} strokeWidth={2.4} />
      </div>
    </div>
  )
}
