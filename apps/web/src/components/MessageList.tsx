'use client'

import { useEffect, useMemo, useRef } from 'react'
import { Message } from '@/types/message'
import MessageBubble from '@/components/MessageBubble'

type MessageListProps = {
  messages: Message[]
  pending: boolean
  onSuggestionClick?: (suggestion: string) => void
}

const TypingIndicator = () => {
  return (
    <div className="flex items-start gap-2.5">
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-semibold tracking-tight text-white">
        F
      </div>
      <div>
        <p className="mb-1 text-xs font-medium text-stone-500">Forsyte</p>
        <div className="rounded-2xl rounded-tl-sm border border-stone-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400 [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400 [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400 [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    </div>
  )
}

const EmptyState = ({ onSuggestionClick }: { onSuggestionClick?: (s: string) => void }) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-900 text-lg font-semibold text-white">
        F
      </div>
      <div>
        <p className="text-sm font-medium text-stone-700">Ask Forsyte anything</p>
        <p className="mt-0.5 text-xs text-stone-400">
          Questions about matters, risk assessments, jurisdictions, and more.
        </p>
      </div>
      <div className="mt-2 flex flex-col gap-1.5">
        {[
          'Do I have matters in high risk jurisdictions?',
          'How many of those have outstanding risk assessments?',
          'Summarise the matters with outstanding items and suggest next steps',
          'Show the risk assessment flags for the Beekeeper employment contract',
        ].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSuggestionClick?.(suggestion)}
            className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-500 italic cursor-pointer hover:bg-stone-100 hover:text-stone-700 transition-colors"
          >
            "{suggestion}"
          </button>
        ))}
      </div>
    </div>
  )
}

const MessageList = ({ messages, pending, onSuggestionClick }: MessageListProps) => {
  const bottomRef = useRef<HTMLDivElement>(null)

  // Sort by sequenceId as the source of truth for ordering
  const sorted = useMemo(
    () => [...messages].sort((a, b) => a.sequenceId - b.sequenceId),
    [messages]
  )

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pending])

  if (sorted.length === 0 && !pending) {
    return <EmptyState onSuggestionClick={onSuggestionClick} />
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        {sorted.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {pending && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
export default MessageList