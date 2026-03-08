'use client'

import { MessageResource } from '@/types/message'

type ResourceLinksProps = {
  resources: MessageResource[]
}

// Converts a camelCase rel string to a readable label
// e.g. "mattersWithOutstandingRiskAssessments" → "Matters with outstanding risk assessments"
const formatRel = (rel: string): string => {
  return rel
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase())
    .trim()
}

const ResourceLinks = ({ resources }: ResourceLinksProps) => {
  if (resources.length === 0) return null

  return (
    <div className="mt-3 flex flex-col gap-1.5">
      <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
        References
      </p>
      <div className="flex flex-col gap-1">
        {resources.map((resource) => (
          <a
            key={resource.rel}
            href={resource.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 text-xs text-stone-500 transition-colors hover:text-stone-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-3 w-3 flex-shrink-0 text-stone-400 transition-colors group-hover:text-stone-600"
            >
              <path
                fillRule="evenodd"
                d="M8.914 6.025a.75.75 0 0 1 1.06 0 3.5 3.5 0 0 1 0 4.95l-2 2a3.5 3.5 0 0 1-4.95-4.95l1.5-1.5a.75.75 0 0 1 1.06 1.06L4.03 9.085a2 2 0 0 0 2.829 2.828l2-2a2 2 0 0 0 0-2.828.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
              <path
                fillRule="evenodd"
                d="M7.086 9.975a.75.75 0 0 1-1.06 0 3.5 3.5 0 0 1 0-4.95l2-2a3.5 3.5 0 0 1 4.95 4.95l-1.5 1.5a.75.75 0 1 1-1.06-1.06l1.5-1.5a2 2 0 0 0-2.829-2.828l-2 2a2 2 0 0 0 0 2.828.75.75 0 0 1 0 1.06Z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-mono text-stone-400 transition-colors group-hover:text-stone-500">
              {formatRel(resource.rel)}
            </span>
            <span className="truncate text-stone-400 transition-colors group-hover:text-stone-600">
              {resource.href}
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}
export default ResourceLinks