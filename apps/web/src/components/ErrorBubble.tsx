const ErrorBubble = ({ error, setError }: { error: string; setError: (error: string | null) => void }) => {
  return (
    <div className="mx-4 mb-2 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-2.5">
      <div className="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="h-3.5 w-3.5 flex-shrink-0 text-red-400"
        >
          <path
            fillRule="evenodd"
            d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-xs text-red-600">{error}</p>
      </div>
      <button
        onClick={() => setError(null)}
        className="ml-4 text-xs text-red-400 hover:text-red-600 transition-colors"
        aria-label="Dismiss error"
      >
        Dismiss
      </button>
    </div>
  )
}
export default ErrorBubble