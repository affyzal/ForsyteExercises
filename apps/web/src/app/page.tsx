'use client'

import { useState } from 'react'
import { Message } from '@/types/message'
import { mockConversation, MOCK_SESSION_ID, MOCK_AGENT_MODEL } from '@/fixtures/mock-conversation'
import MessageList from '@/components/MessageList'
import MessageInput from '@/components/MessageInput'

// Mock agent replies for any new messages typed during the session.
// In Exercise 2 this entire map is replaced by a real POST to the API.
const MOCK_REPLIES: Omit<Message, 'id' | 'sessionId' | 'sequenceId' | 'createdAt' | 'role'>[] = [
  {
    content: {
      text: 'I can help with that. For a full answer, please ask one of the suggested questions below.',
      meta: { model: MOCK_AGENT_MODEL, finishReason: 'stop' },
    },
  },
]

let mockIdCounter = 100
function nextMockId(): string {
  return `agm_mock_${++mockIdCounter}`
}

const Home = () => {
  const [messages, setMessages] = useState<Message[]>(mockConversation)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // The seam: in Exercise 2, replace this with a real createSession() call from api.ts.
  function handleClear() {
    if (pending) return
    setMessages([])
    setError(null)
  }

  // The seam: in Exercise 2, replace this function body with real API calls.
  async function handleSend(text: string) {
    setError(null)

    const now = new Date()
    const nextSequenceId = Math.max(...messages.map((m) => m.sequenceId), 0) + 1

    // 1. Append user message immediately
    const userMessage: Message = {
      id: nextMockId(),
      sessionId: MOCK_SESSION_ID,
      role: 'user',
      sequenceId: nextSequenceId,
      content: { text },
      createdAt: now,
    }

    setMessages((prev) => [...prev, userMessage])
    setPending(true)

    try {
      // 2. Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 900))

      // 3. Append mocked agent reply(s)
      const agentMessages: Message[] = MOCK_REPLIES.map((template, i) => ({
        ...template,
        id: nextMockId(),
        sessionId: MOCK_SESSION_ID,
        role: 'agent' as const,
        sequenceId: nextSequenceId + 1 + i,
        createdAt: new Date(now.getTime() + (i + 1) * 1000),
      }))

      setMessages((prev) => [...prev, ...agentMessages])
    } catch (err) {
      // Roll back the optimistically added user message on failure
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id))
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex h-screen flex-col bg-stone-50">
      {/* Header */}
      <header className="flex flex-shrink-0 items-center justify-between border-b border-stone-200 bg-white px-6 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-900 text-sm font-semibold text-white">
            F
          </div>
          <div>
            <h1 className="text-sm font-semibold text-stone-800">Ask Forsyte</h1>
            <p className="text-xs text-stone-400">AI legal assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs text-stone-400">Ready</span>
          </div>
          <button
            onClick={handleClear}
            disabled={pending}
            className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-500 transition-colors hover:border-stone-300 hover:text-stone-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-3 w-3"
            >
              <path
                fillRule="evenodd"
                d="M8 3.5c-.771 0-1.537.022-2.297.066a1.124 1.124 0 0 0-1.058 1.028l-.018.214a.75.75 0 1 1-1.495-.12l.018-.221a2.624 2.624 0 0 1 2.467-2.399 41.628 41.628 0 0 1 4.766 0 2.624 2.624 0 0 1 2.467 2.399l.056.662a.75.75 0 0 1-1.495.12l-.056-.662A1.124 1.124 0 0 0 10.297 3.566 40.7 40.7 0 0 0 8 3.5ZM6.81 6.813a.75.75 0 0 1 .814.68l.208 2.5a.75.75 0 1 1-1.494.125l-.208-2.5a.75.75 0 0 1 .68-.805Zm2.37 0a.75.75 0 0 1 .68.805l-.208 2.5a.75.75 0 1 1-1.494-.124l.208-2.5a.75.75 0 0 1 .815-.681Z"
                clipRule="evenodd"
              />
              <path d="M2.265 4.227a.75.75 0 0 1 .809-.687l10.855 1.18a.75.75 0 0 1-.163 1.492L2.91 5.031a.75.75 0 0 1-.645-.804ZM3.5 9.75c0-.414.336-.75.75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5h-7.5Z" />
            </svg>
            New conversation
          </button>
        </div>
      </header>

      {/* Message feed */}
      <MessageList messages={messages} pending={pending} />

      {/* Error banner */}
      {error && (
        <div className="mx-4 mb-2 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-3.5 w-3.5 flex-shrink-0 text-red-400"
            >
              <path
                fillRule="evenodd"
                d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-xs text-red-600">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="ml-4 text-xs text-red-400 hover:text-red-600 transition-colors"
            aria-label="Dismiss error"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Input */}
      <MessageInput onSend={handleSend} disabled={pending} />
    </div>
  )
}

export default Home