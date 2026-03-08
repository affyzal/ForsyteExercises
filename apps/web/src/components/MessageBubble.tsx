'use client'

import { Message } from '@/types/message'
import ResourceLinks from '@/components/ResourceLinks'

type MessageBubbleProps = {
  message: Message
}

const ForsyteAvatar = () => {
  return (
    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-semibold tracking-tight text-white">
      F
    </div>
  )
}

const ContinuationIndicator = () => {
  return (
    <div className="mt-2 flex items-center gap-1.5">
      <span className="h-px flex-1 bg-stone-200" />
      <span className="text-xs text-stone-400 italic">continues below</span>
      <span className="h-px flex-1 bg-stone-200" />
    </div>
  )
}

const UserBubble = ({ message }: { message: Message }) => {
  return (
    <div className="flex justify-end">
      <div className="max-w-[70%]">
        <div className="rounded-2xl rounded-tr-sm bg-stone-900 px-4 py-2.5">
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-white">
            {message.content.text}
          </p>
        </div>
        <p className="mt-1 text-right text-xs text-stone-400">
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  )
}

const AgentBubble = ({ message }: { message: Message }) => {
  const isContinuing = message.content.meta?.finishReason === 'length'

  return (
    <div className="flex items-start gap-2.5">
      <ForsyteAvatar />
      <div className="max-w-[70%]">
        <p className="mb-1 text-xs font-medium text-stone-500">Forsyte</p>
        <div className="rounded-2xl rounded-tl-sm border border-stone-200 bg-white px-4 py-2.5 shadow-sm">
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-stone-800">
            {message.content.text}
          </p>
          {message.content.resources && message.content.resources.length > 0 && (
            <ResourceLinks resources={message.content.resources} />
          )}
          {isContinuing && <ContinuationIndicator />}
        </div>
        {!isContinuing && (
          <p className="mt-1 text-xs text-stone-400">
            {formatTime(message.createdAt)}
            {message.content.meta?.model && (
              <span className="ml-1.5 text-stone-300">· {message.content.meta.model}</span>
            )}
          </p>
        )}
      </div>
    </div>
  )
}

const formatTime = (date: Date): string => {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  if (message.role === 'user') {
    return <UserBubble message={message} />
  }
  return <AgentBubble message={message} />
}

export default MessageBubble

