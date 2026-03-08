'use client'

import { useState, useEffect, useCallback } from 'react'
import { Message } from '@/types/message'
import { sendMessage, toMessage } from '@/lib/api'

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

  // Reset conversation when a new session starts
  useEffect(() => {
    setMessages([])
    setError(null)
  }, [sessionId])


  const handleSend = useCallback(async (text: string) => {
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
      // Send the message — API persists all parts but only returns the last one
      const lastDto = await sendMessage(ORG_SLUG, sessionId, text, token)
      const lastAgentMessage = toMessage(lastDto)

      const realUserMessage: Message = {
        ...userMessage,
        id: `user_${nextSequenceId}`,
        sequenceId: nextSequenceId,
      }

      // TEMP: simulate multi-part for Stage C testing
      // The API has no GET /sessions/:sessionId/messages endpoint so we
      // inject a fake first part when the gap between user and agent sequenceId > 1
      const isMultiPart = lastDto.sequenceId - nextSequenceId > 1
      const mockFirstPart: Message | null = isMultiPart ? {
        id: `mock_part1_${Date.now()}`,
        sessionId,
        role: 'agent',
        sequenceId: lastDto.sequenceId - 1,
        content: {
          text: 'Here are the seeded risk assessment flags for the Beekeeper employment contract:\n\n- Remote identity verification: accepted\n- Identity confidence: accepted\n- Sanctions screening: accepted\n- Adverse media: pending\n- High-risk third country residence: pending\n\nI will summarise what this means and suggested next steps next.',
          resources: [{ rel: 'riskAssessmentFlags', href: '/v1/risk-assessments/{beekeeperRiskId}/flags' }],
          meta: { model: lastDto.content.meta?.model ?? '', finishReason: 'length' },
        },
        createdAt: new Date(),
      } : null

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== userMessage.id),
        realUserMessage,
        ...(mockFirstPart ? [mockFirstPart] : []),
        lastAgentMessage,
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