// Byline — visible "By <author> · Last reviewed: <date>" line under page H1.
// Single source of truth for the same fields written into Article JSON-LD,
// so the date users see and the date LLMs read can never drift apart.

import Link from 'next/link'
import { formatReviewDate } from '@/lib/content-freshness'
import { defaultAuthor, type Author } from '@/lib/data/authors'

type Props = {
  lastReviewed: Date | string
  author?: Author
  className?: string
}

export function Byline({ lastReviewed, author = defaultAuthor, className = '' }: Props) {
  const date = typeof lastReviewed === 'string' ? new Date(lastReviewed) : lastReviewed
  return (
    <div
      className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 ${className}`.trim()}
    >
      <span>
        By{' '}
        <Link
          href={author.url}
          className="font-semibold text-slate-700 hover:text-green-600 transition-colors"
        >
          {author.name}
        </Link>
      </span>
      <span aria-hidden="true">·</span>
      <span>
        Last reviewed:{' '}
        <time dateTime={date.toISOString()}>{formatReviewDate(date)}</time>
      </span>
    </div>
  )
}
