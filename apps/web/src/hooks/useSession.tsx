import { useState, useCallback } from 'react'
import { listAgents, createSession } from '@/lib/api'

const ORG_SLUG = 'forsyte'

export type UseSessionReturn = {
  token: string | null
  sessionId: string | null
  sessionLoading: boolean
  sessionError: string | null
  handleLoginSuccess: (accessToken: string) => void
  handleClear: (pending: boolean) => void
  loadSession: (accessToken: string) => Promise<void>
}

const useSession = (): UseSessionReturn => {
  const [token, setToken] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionLoading, setSessionLoading] = useState(false)
  const [sessionError, setSessionError] = useState<string | null>(null)

  const loadSession = useCallback(async (accessToken: string) => {
    setSessionLoading(true)
    setSessionError(null)
    setSessionId(null)

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
    loadSession(accessToken)
  }

  const handleClear = (pending: boolean) => {
    if (pending || sessionLoading || !token) return
    loadSession(token)
  }

  return {
    token,
    sessionId,
    sessionLoading,
    sessionError,
    handleLoginSuccess,
    handleClear,
    loadSession,
  }
}

export default useSession