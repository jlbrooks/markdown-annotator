export function trackEvent(name, props) {
  if (typeof window === 'undefined') return
  if (typeof window.plausible !== 'function') return
  try {
    window.plausible(name, props ? { props } : undefined)
  } catch (err) {
    console.warn('Analytics event failed:', err)
  }
}
