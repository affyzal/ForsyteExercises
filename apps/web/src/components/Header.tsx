const Header = ({ handleClear, pending, sessionLoading } : { handleClear: () => void; pending: boolean; sessionLoading: boolean }) => {
  return (
    <header className="flex flex-shrink-0 items-center justify-between border-b border-stone-200 bg-white px-6 py-3.5">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-sm font-semibold text-stone-800">Ask Forsyte</h1>
          <p className="text-xs text-stone-400">AI legal assistant</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleClear}
          disabled={pending || sessionLoading}
          className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-500 transition-colors hover:border-stone-300 hover:text-stone-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6"
          >
            <path
              d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM21.41 6.34a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
            />
            <circle cx="18" cy="6" r="1" fill="#fff"/>
          </svg>
          New conversation
        </button>
      </div>
    </header>
  )
}
export default Header