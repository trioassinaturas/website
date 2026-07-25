// Type safety for `window.posthog` when PostHog is installed via the HTML
// snippet (see src/components/PostHog.astro) rather than the posthog-js package.
// https://posthog.com/docs/libraries/js/types
import type { PostHog } from "@posthog/types"

declare global {
  interface Window {
    posthog?: PostHog
  }
}

export {}
