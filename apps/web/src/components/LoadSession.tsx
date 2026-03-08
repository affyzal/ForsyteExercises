const LoadSession = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-stone-50">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-sm font-semibold text-white">
          F
        </div>
        <div className="flex items-center gap-2 text-sm text-stone-500">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-stone-300 border-t-stone-600" />
          Starting session…
        </div>
      </div>
    </div>
  )
}
export default LoadSession