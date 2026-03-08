'use client'

import { useState, KeyboardEvent, useRef, useEffect } from 'react'

type MessageInputProps = {
  onSend: (text: string) => void
  disabled: boolean
}

const MessageInput = ({ onSend, disabled }: MessageInputProps) => {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea as content grows
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [value])

  const canSend = value.trim().length > 0 && !disabled

  function handleSend() {
    if (!canSend) return
    onSend(value.trim())
    setValue('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-stone-200 bg-white px-4 py-3">
      <div
        className={`flex items-end gap-3 rounded-xl border px-4 py-3 transition-colors ${
          disabled
            ? 'border-stone-200 bg-stone-50'
            : 'border-stone-300 bg-white focus-within:border-stone-500'
        }`}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask Forsyte a question…"
          className="flex-1 resize-none bg-transparent text-sm leading-relaxed text-stone-800 placeholder:text-stone-400 focus:outline-none disabled:cursor-not-allowed disabled:text-stone-400"
          style={{ minHeight: '24px' }}
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          className={`mb-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-all ${
            canSend
              ? 'bg-stone-900 text-white hover:bg-stone-700 active:scale-95 cursor-pointer'
              : 'bg-stone-100 text-stone-300 cursor-not-allowed'
          }`}
        >
          {disabled ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-stone-300 border-t-stone-600" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-3.5 w-3.5"
            >
              <path d="M2.87 2.298a.75.75 0 0 0-.812.168.75.75 0 0 0-.156.8l2.36 5.288H10a.75.75 0 0 1 0 1.5H4.262l-2.36 5.288a.75.75 0 0 0 .156.8.75.75 0 0 0 .812.168l12.25-5.5a.75.75 0 0 0 0-1.372l-12.25-5.5Z" />
            </svg>
          )}
        </button>
      </div>
      <p className="mt-1.5 text-center text-xs text-stone-400">
        Press <kbd className="rounded bg-stone-100 px-1 py-0.5 font-mono text-xs text-stone-500">Enter</kbd> to send
        · <kbd className="rounded bg-stone-100 px-1 py-0.5 font-mono text-xs text-stone-500">Shift+Enter</kbd> for a new line
      </p>
    </div>
  )
}
export default MessageInput