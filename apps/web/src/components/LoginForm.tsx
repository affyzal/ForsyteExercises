'use client'

import { useState } from 'react'
import axios, { AxiosError } from 'axios'

const AUTH_URL = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8174'}/auth/login`

type LoginFormProps = {
  onSuccess: (token: string) => void
}

const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) return

    setError(null)
    setPending(true)

    try {
      const { data } = await axios.post<{ accessToken: string }>(AUTH_URL, {
        email: email.trim(),
        password,
      })
      onSuccess(data.accessToken)
    } catch (err) {
      if (err instanceof AxiosError) {
        const message = err.response?.data?.message
        setError(
          typeof message === 'string'
            ? message
            : 'Invalid email or password.',
        )
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setPending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo / heading */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-900 text-lg font-semibold text-white">
            F
          </div>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-stone-800">Ask Forsyte</h1>
            <p className="mt-0.5 text-sm text-stone-400">Sign in to continue</p>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-stone-600" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={pending}
                placeholder="you@forsyte.co"
                autoComplete="email"
                className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-stone-400 focus:bg-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-stone-600" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={pending}
                placeholder="••••••••"
                autoComplete="current-password"
                className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-stone-400 focus:bg-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={pending || !email.trim() || !password.trim()}
              className="flex items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {pending ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-stone-400">
          Use a seeded account, e.g.{' '}
          <span className="font-mono text-stone-500">buzz.aldrin@forsyte.co</span>
          <span className="mx-1 text-stone-300">/</span>
          <span className="font-mono text-stone-500">beeCompliant33</span>
        </p>
      </div>
    </div>
  )
}

export default LoginForm