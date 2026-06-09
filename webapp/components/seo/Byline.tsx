// Byline — visible "By <author>" line under page H1.
// (The review-date is intentionally not shown; structured-data dateModified
// still lives in the page JSON-LD via the schema helpers.)

import Link from 'next/link'
import { defaultAuthor, type Author } from '@/lib/data/authors'

type Props = {
  // Accepted for backwards-compat with callers; no longer rendered.
  lastReviewed?: Date | string
  author?: Author
  className?: string
}

export function Byline({ author = defaultAuthor, className = '' }: Props) {
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
    </div>
  )
}
