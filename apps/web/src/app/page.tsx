'use client'

import { useState, useCallback } from 'react'
import { Message } from '@/types/message'
import MessageList from '@/components/MessageList'
import MessageInput from '@/components/MessageInput'
import LoginForm from '@/components/LoginForm'
import { listAgents, createSession, sendMessage, toMessage } from '@/lib/api'

const ORG_SLUG = 'forsyte'

const Home = () => {
  const [token, setToken] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionLoading, setSessionLoading] = useState(false)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bootstrapSession = useCallback(async (accessToken: string) => {
    setSessionLoading(true)
    setSessionError(null)
    setMessages([])

    try {
      const agents = await listAgents(ORG_SLUG, accessToken)
      if (!agents.length) throw new Error('No agents found for this organisation.')

      const agent = agents[0]
      const session = await createSession(ORG_SLUG, agent.id, accessToken)
      setSessionId(session.id)
    } catch (err) {
      setSessionError(
        err instanceof Error
          ? err.message
          : 'Failed to start a session. Please try again.'
      )
    } finally {
      setSessionLoading(false)
    }
  }, [])

  const handleLoginSuccess = (accessToken: string) => {
    setToken(accessToken)
    bootstrapSession(accessToken)
  }

  const handleClear = () => {
    if (pending || sessionLoading || !token) return
    bootstrapSession(token)
  }

  const handleSend = async (text: string) => {
    if (!sessionId || !token) return
    setError(null)

    const now = new Date()
    const nextSequenceId = Math.max(...messages.map((m) => m.sequenceId), 0) + 1

    // Optimistically append the user message
    const userMessage: Message = {
      id: `optimistic_${Date.now()}`,
      sessionId,
      role: 'user',
      sequenceId: nextSequenceId,
      content: { text },
      createdAt: now,
    }

    setMessages((prev) => [...prev, userMessage])
    setPending(true)

    try {
      const dto = await sendMessage(ORG_SLUG, sessionId, text, token)
      const agentMessage = toMessage(dto)

      // Replace optimistic user message with real sequenceId from API,
      // then append the agent reply
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== userMessage.id),
        { ...userMessage, id: `user_${dto.sequenceId - 1}`, sequenceId: nextSequenceId },
        agentMessage,
      ])
    } catch (err) {
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

  if (!token) {
    return <LoginForm onSuccess={handleLoginSuccess} />
  }

  if (sessionLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-sm font-semibold text-white">
            F
          </div>
          <div className="flex items-center gap-2 text-sm text-stone-500">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-stone-300 border-t-stone-600" />
            Starting session…
          </div>
        </div>
      </div>
    )
  }

  if (sessionError) {
    return (
      <div className="flex h-screen items-center justify-center bg-stone-50 px-4">
        <div className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-sm font-semibold text-white">
            F
          </div>
          <p className="text-sm text-stone-600">{sessionError}</p>
          <button
            onClick={() => token && bootstrapSession(token)}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-700"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-stone-50">
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
            disabled={pending || sessionLoading}
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

      <MessageList messages={messages} pending={pending} />

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

      <MessageInput onSend={handleSend} disabled={pending || !sessionId} />
    </div>
  )
}

export default Home