import type { EngineDef } from './types'

/**
 * The 4 frontier engines being measured.
 * All routed via OpenRouter for unified billing + simpler integration.
 *
 * NOTE: For non-Perplexity models, OpenRouter's :online plugin wraps the prompt
 * with Exa-powered web search before invoking the model. The citations therefore
 * reflect "model + generic web search", not the engine's native citation behavior
 * (e.g. ChatGPT.com's actual search index). Useful as a proxy; not strictly
 * ground-truth. Add native API clients in a future sprint for calibration.
 */
export const ENGINES: readonly EngineDef[] = [
  {
    key: 'perplexity',
    label: 'Perplexity',
    // Sonar Pro does its own search — citations are native to the response.
    model: 'perplexity/sonar-pro',
    nativeSearch: true,
  },
  {
    key: 'claude',
    label: 'Claude',
    model: 'anthropic/claude-sonnet-4.5:online',
    nativeSearch: false,
  },
  {
    key: 'chatgpt',
    label: 'ChatGPT',
    model: 'openai/gpt-5:online',
    nativeSearch: false,
  },
  {
    key: 'gemini',
    label: 'Gemini',
    model: 'google/gemini-2.5-pro:online',
    nativeSearch: false,
  },
] as const
