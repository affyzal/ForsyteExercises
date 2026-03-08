const SkeletonBubble = ({ align, wide }: { align: 'left' | 'right', wide?: boolean }) => (
  <div className={`flex ${align === 'right' ? 'justify-end' : 'items-start gap-2.5'}`}>
    {align === 'left' && (
      <div className="h-7 w-7 flex-shrink-0 animate-pulse rounded-full bg-stone-200" />
    )}
    <div className={`h-14 animate-pulse rounded-2xl bg-stone-200 ${wide ? 'w-2/3' : 'w-1/2'}`} />
  </div>
)

const LoadSession = () => (
  <div className="flex h-screen flex-col bg-stone-50">
    <div className="flex flex-shrink-0 items-center justify-between border-b border-stone-200 bg-white px-6 py-3.5">
      <div className="flex items-center gap-3">
        <div className="flex flex-col gap-1.5">
          <div className="h-3.5 w-20 animate-pulse rounded bg-stone-200" />
          <div className="h-3 w-24 animate-pulse rounded bg-stone-100" />
        </div>
      </div>
      <div className="h-7 w-36 animate-pulse rounded-lg bg-stone-100" />
    </div>

    <div className="flex flex-1 flex-col gap-4 px-4 py-6">
      <SkeletonBubble align="right" />
      <SkeletonBubble align="left" wide />
      <SkeletonBubble align="right" />
      <SkeletonBubble align="left" wide />
    </div>

    <div className="border-t border-stone-200 bg-white px-4 py-3">
      <div className="flex items-end gap-3 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
        <div className="h-6 flex-1 animate-pulse rounded bg-stone-200" />
        <div className="mb-0.5 h-8 w-8 flex-shrink-0 animate-pulse rounded-lg bg-stone-200" />
      </div>
      <div className="mt-1.5 h-3 w-48 animate-pulse rounded bg-stone-100 mx-auto" />
    </div>
  </div>
)

export default LoadSession