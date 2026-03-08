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
  const [showPassword, setShowPassword] = useState(false)

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
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={pending}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 pr-9 text-sm text-stone-800 placeholder:text-stone-400 focus:border-stone-400 focus:bg-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
                      <path d="M3.27 3.27a.75.75 0 0 0-1.06 1.06l9.46 9.46a.75.75 0 1 0 1.06-1.06l-1.49-1.49A8.5 8.5 0 0 0 14.47 8a8.53 8.53 0 0 0-3.13-3.72L13.22 2.4a.75.75 0 0 0-1.06-1.06l-1.5 1.5A8.54 8.54 0 0 0 8 2.25C5.13 2.25 2.6 3.7 1.03 5.93a.75.75 0 0 0 0 .84 8.5 8.5 0 0 0 1.74 1.94L3.27 3.27Zm3.04 3.04 3.38 3.38A2.5 2.5 0 0 1 6.31 6.31Z" />
                      <path d="M8 5.5a2.5 2.5 0 0 1 2.5 2.5c0 .28-.05.55-.13.8l1.13 1.13A4 4 0 0 0 8 4a4 4 0 0 0-3 1.37l1.13 1.13c.24-.6.73-1.07 1.34-1.3A2.49 2.49 0 0 1 8 5.5Z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
                      <path d="M8 2.25C5.13 2.25 2.6 3.7 1.03 5.93a.75.75 0 0 0 0 .84C2.6 9.05 5.13 10.5 8 10.5s5.4-1.45 6.97-3.73a.75.75 0 0 0 0-.84C13.4 3.7 10.87 2.25 8 2.25ZM8 9a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
                    </svg>
                  )}
                </button>
              </div>
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