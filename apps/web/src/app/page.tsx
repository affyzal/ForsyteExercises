'use client'

import MessageList from '@/components/MessageList'
import MessageInput from '@/components/MessageInput'
import LoginForm from '@/components/LoginForm'
import ErrorBubble from '@/components/ErrorBubble'
import Header from '@/components/Header'
import LoadSession from '@/components/LoadSession'
import SessionError from '@/components/SessionError'
import useSession from '@/hooks/useSession'
import useMessages from '@/hooks/useMessages'

const Home = () => {
  const {     
    token,
    sessionId,
    sessionLoading,
    sessionError,
    handleLoginSuccess,
    handleClear,
    loadSession, 
  } = useSession()

  const {
    messages,
    pending,
    error,
    setError,
    handleSend,
  } = useMessages(sessionId, token)

  if (!token) {
    return (
      <LoginForm onSuccess={handleLoginSuccess} />
    )
  }

  if (sessionLoading) {
    return (
      <LoadSession />
    )
  }

  if (sessionError) {
    return (
      <SessionError sessionError={sessionError} loadSession={loadSession} token={token} />
    )
  }

  return (
    <div className="flex h-screen flex-col bg-stone-50">
      <Header handleClear={() => handleClear(pending)} pending={pending} sessionLoading={sessionLoading} />

      <MessageList messages={messages} pending={pending} onSuggestionClick={handleSend}/>

      {error && (
        <ErrorBubble error={error} setError={setError} />
      )}

      <MessageInput onSend={handleSend} disabled={pending || !sessionId || sessionLoading} />
    </div>
  )
}

export default Home