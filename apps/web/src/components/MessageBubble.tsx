'use client'

import ReactMarkdown from 'react-markdown'
import { Message } from '@/types/message'
import ResourceLinks from '@/components/ResourceLinks'
import ResourceData from '@/components/ResourceData'
import remarkGfm from 'remark-gfm'

type MessageBubbleProps = {
  message: Message
  token: string
}

export const ForsyteAvatar = () => (
  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-semibold tracking-tight text-white">
    F
  </div>
)

const ContinuationIndicator = () => (
  <div className="mt-2 flex items-center gap-1.5">
    <span className="h-px flex-1 bg-stone-200" />
    <span className="text-xs text-stone-400 italic">continues below</span>
    <span className="h-px flex-1 bg-stone-200" />
  </div>
)

const formatTime = (date: Date): string =>
  new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

const UserBubble = ({ message }: { message: Message }) => (
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

const AgentBubble = ({ message }: { message: Message }) => {
  const isContinuing = message.content.meta?.finishReason === 'length'
  const hasResources =
    message.content.resources && message.content.resources.length > 0

  return (
    <div className="flex items-start gap-2.5">
      <ForsyteAvatar />
      <div className="max-w-[70%]">
        <p className="mb-1 text-xs font-medium text-stone-500">Forsyte</p>
        <div className="rounded-2xl rounded-tl-sm border border-stone-200 bg-white px-4 py-2.5 shadow-sm">
          <div className="text-sm text-stone-800
            [&_p]:leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0
            [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:mb-2
            [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:mb-2
            [&_li]:mb-1
            [&_strong]:font-semibold [&_strong]:text-stone-900
            [&_code]:rounded [&_code]:bg-stone-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_code]:text-stone-700
            [&_pre]:bg-stone-900 [&_pre]:text-stone-100 [&_pre]:p-3 [&_pre]:rounded [&_pre]:overflow-x-auto
            [&_a]:text-stone-700 [&_a]:underline"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content.text}
            </ReactMarkdown>
          </div>
          {hasResources && (
            <>
              <ResourceLinks resources={message.content.resources!} />
              <ResourceData resources={message.content.resources!} />
            </>
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

const MessageBubble = ({ message, token }: MessageBubbleProps) => {
  if (message.role === 'user') {
    return <UserBubble message={message} />
  }
  return <AgentBubble message={message} />
}

export default MessageBubble