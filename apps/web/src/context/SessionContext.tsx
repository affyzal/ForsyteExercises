'use client'

import { createContext, useContext } from 'react'
import useSession, { UseSessionReturn } from '@/hooks/useSession'

const SessionContext = createContext<UseSessionReturn | null>(null)

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const session = useSession()
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  )
}

export const useSessionContext = (): UseSessionReturn => {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSessionContext must be used within SessionProvider')
  return ctx
}