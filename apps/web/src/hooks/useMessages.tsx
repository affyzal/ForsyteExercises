import { useState, useEffect, useCallback, useRef } from 'react'
import { Message } from '@/types/message'
import { sendMessage, toMessage } from '@/lib/api'
import axios from 'axios'

const ORG_SLUG = 'forsyte'

export type UseMessagesReturn = {
  messages: Message[]
  pending: boolean
  error: string | null
  setError: (error: string | null) => void
  handleSend: (text: string) => Promise<void>
}

const useMessages = (
  sessionId: string | null,
  token: string | null
): UseMessagesReturn => {
  const [messages, setMessages] = useState<Message[]>([])
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    setMessages([])
    setError(null)
    return () => abortControllerRef.current?.abort()
  }, [sessionId])


  const handleSend = useCallback(async (text: string) => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()
    if (!sessionId || !token) return
    setError(null)

    const now = new Date()
    const nextSequenceId = Math.max(...messages.map((m) => m.sequenceId), 0) + 1

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
      const lastDto = await sendMessage(ORG_SLUG, sessionId, text, token)
      const lastAgentMessage = toMessage(lastDto)
      const realUserMessage: Message = {
          ...userMessage,
          id: `user_${nextSequenceId}`,
          sequenceId: nextSequenceId,
      }
      setMessages((prev) => [
          ...prev.filter((m) => m.id !== userMessage.id),
          realUserMessage,
          lastAgentMessage,
      ])
    } catch (err) {
      if (axios.isCancel(err)) return
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id))

      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      const isUnsupported = message.toLowerCase().includes('seeded')

      if (isUnsupported) {
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== userMessage.id),
          { ...userMessage, id: `user_${nextSequenceId}`, sequenceId: nextSequenceId },
          {
            id: `agent_unsupported_${Date.now()}`,
            sessionId: sessionId!,
            role: 'agent',
            sequenceId: nextSequenceId + 1,
            content: { text: 'I can only answer questions about your active matters and risk assessments. Try asking about high-risk jurisdictions, outstanding risk assessments, or specific contract flags.' },
            createdAt: new Date(),
          },
        ])
      } else {
        setError(message)
      }
    } finally {
      setPending(false)
    }
  }, [sessionId, token, messages])

  return {
    messages,
    pending,
    error,
    setError,
    handleSend,
  }
}

export default useMessages