// API configuration
// In development, the worker runs on port 8787
// In production, uses the same domain with /api/* routing
export const API_URL = import.meta.env.VITE_API_URL || 'https://specmark.dev'
