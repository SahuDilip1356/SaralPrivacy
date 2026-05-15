// AnswerBlock — direct, 40–80 word answer card mounted near the top of content pages.
// Its job is to give LLM crawlers and Google AI Overviews a citable, self-contained
// answer to the question implied by the URL. The CSS class `.answer-block` and
// `data-speakable` attribute let speakableSchema target it for voice assistants.

type Variant = 'light' | 'on-dark'

type Props = {
  /** Optional eyebrow label, e.g. "DPDPA in one paragraph" */
  question?: string
  /** The 40–80 word direct answer. Prefer plain prose, no marketing fluff. */
  answer: string
  /** Visual variant — light for body sections, on-dark for hero overlays. */
  variant?: Variant
  className?: string
}

export function AnswerBlock({ question, answer, variant = 'light', className = '' }: Props) {
  const base =
    variant === 'on-dark'
      ? 'bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-slate-200'
      : 'bg-slate-50 border-l-4 border-green-400 rounded-r-xl px-5 py-4 text-slate-700'

  const eyebrowColor = variant === 'on-dark' ? 'text-green-300' : 'text-green-700'

  return (
    <div className={`answer-block ${base} ${className}`.trim()} data-speakable="true">
      {question && (
        <p className={`text-xs font-semibold ${eyebrowColor} uppercase tracking-wider mb-2`}>
          {question}
        </p>
      )}
      <p className="text-sm leading-relaxed">{answer}</p>
    </div>
  )
}
