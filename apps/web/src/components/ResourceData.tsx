'use client'

import { useEffect, useState } from 'react'
import { listRiskAssessments, listMatters, RiskAssessmentDto, MatterDto } from '@/lib/api'
import { MessageResource } from '@/types/message'
import { useSessionContext } from '@/context/SessionContext'

type ResourceDataProps = {
  resources: MessageResource[]
  token: string
}

type ResourceResult =
  | { type: 'riskAssessments'; items: RiskAssessmentDto[] }
  | { type: 'matters'; items: MatterDto[] }

// --- Risk Assessments ---

const riskColour = (level?: string) => {
  if (level === 'high') return 'text-red-600 bg-red-50 border-red-200'
  if (level === 'medium') return 'text-amber-600 bg-amber-50 border-amber-200'
  return 'text-emerald-600 bg-emerald-50 border-emerald-200'
}

const RiskAssessmentTable = ({ items }: { items: RiskAssessmentDto[] }) => (
  <div className="mt-3 flex flex-col gap-1.5">
    <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
      Risk Assessments
    </p>
    <div className="flex flex-col gap-1.5">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-lg border border-stone-100 bg-stone-50 px-3 py-2"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs leading-snug text-stone-700">
              {item.description ?? item.id}
            </p>
            <div className="flex flex-shrink-0 items-center gap-1.5">
              {item.riskLevel && (
                <span className={`rounded border px-1.5 py-0.5 text-xs font-medium ${riskColour(item.riskLevel)}`}>
                  {item.riskLevel.charAt(0).toUpperCase() + item.riskLevel.slice(1)}
                </span>
              )}
              <span className="text-xs text-stone-400">
                {item.status === 'in_progress' ? 'In progress' : 'Completed'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

// --- Matters ---

const matterStatusColour = (status: string) => {
  if (status === 'active') return 'text-emerald-600 bg-emerald-50 border-emerald-200'
  if (status === 'pending') return 'text-amber-600 bg-amber-50 border-amber-200'
  return 'text-stone-500 bg-stone-50 border-stone-200'
}

const MatterTable = ({ items }: { items: MatterDto[] }) => (
  <div className="mt-3 flex flex-col gap-1.5">
    <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
      Matters
    </p>
    <div className="flex flex-col gap-1.5">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-lg border border-stone-100 bg-stone-50 px-3 py-2"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-stone-700">{item.reference}</p>
              <p className="text-xs leading-snug text-stone-500">{item.description}</p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-1.5">
              <span className={`rounded border px-1.5 py-0.5 text-xs font-medium ${matterStatusColour(item.status)}`}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </span>
              <span className="text-xs text-stone-400">{item.type}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

// --- Skeleton ---

const LoadingSkeleton = () => (
  <div className="mt-3 flex flex-col gap-1.5">
    <div className="h-3 w-28 animate-pulse rounded bg-stone-100" />
    <div className="h-9 animate-pulse rounded-lg bg-stone-50" />
    <div className="h-9 animate-pulse rounded-lg bg-stone-50" />
    <div className="h-9 animate-pulse rounded-lg bg-stone-50" />
  </div>
)

const isResolvable = (href: string) => !href.includes('{')
const isRiskAssessmentHref = (href: string) =>
  href.includes('/risk-assessments') && !href.includes('/flags')

const isMatterHref = (href: string) => href.includes('/matters')

const ResourceData = ({ resources }: ResourceDataProps) => {
  const [data, setData] = useState<ResourceResult | null>(null)
  const [loading, setLoading] = useState(false)
  const { token } =useSessionContext()

  useEffect(() => {
    const resolvable = resources.find((r) => isResolvable(r.href))
    if (!resolvable) return

    let cancelled = false
    setLoading(true)

    const fetchData = async () => {
      try {
        if (isRiskAssessmentHref(resolvable.href)) {
          const items = await listRiskAssessments('forsyte', token)
          if (!cancelled) setData({ type: 'riskAssessments', items })
        } else if (isMatterHref(resolvable.href)) {
          const items = await listMatters('forsyte', token)
          if (!cancelled) setData({ type: 'matters', items })
        }
      } catch {
        // fail silently — ResourceLinks already shows the fallback link
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [resources, token])

  if (loading) return <LoadingSkeleton />
  if (!data) return null
  if (data.type === 'riskAssessments') return <RiskAssessmentTable items={data.items} />
  if (data.type === 'matters') return <MatterTable items={data.items} />
  return null
}

export default ResourceData