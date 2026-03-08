'use client'
import { useEffect } from 'react'

type ErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

const ErrorPage = ({ error, reset }: ErrorProps) => {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-screen items-center justify-center bg-stone-50 px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-sm font-semibold text-white">
          F
        </div>
        <div>
          <p className="text-sm font-medium text-stone-800">Something went wrong</p>
          <p className="mt-1 text-xs text-stone-400">{error.message}</p>
        </div>
        <button
          onClick={reset}
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-700"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

export default ErrorPage