import { useSessionContext } from "@/context/SessionContext"

type SessionErrorProps = {
  sessionError: string | null
  loadSession: (token: string) => void
}

const SessionError = ({ sessionError, loadSession }: SessionErrorProps) => {
  const { token } = useSessionContext()
  return (
    <div className="flex h-screen items-center justify-center bg-stone-50 px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-sm font-semibold text-white">
          F
        </div>
        <p className="text-sm text-stone-600">{sessionError}</p>
        <button
          onClick={() => token && loadSession(token)}
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-700"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
export default SessionError
    