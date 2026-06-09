// Byline — intentionally not rendered.
// The visible "By <author> · Last reviewed: <date>" line has been removed
// site-wide. The component is kept as a no-op so existing call sites compile;
// structured-data (author / dateModified) still lives in the page JSON-LD.

import { type Author } from '@/lib/data/authors'

type Props = {
  lastReviewed?: Date | string
  author?: Author
  className?: string
}

export function Byline(_props: Props) {
  return null
}
