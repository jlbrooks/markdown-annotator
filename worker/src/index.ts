import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Bindings } from './types'
import { shareRoutes } from './routes/share'

const app = new Hono<{ Bindings: Bindings }>()

// CORS for frontend
app.use('/api/*', cors({
  origin: (origin, c) => {
    const frontendUrl = c.env.FRONTEND_URL
    const allowed = [frontendUrl, 'http://localhost:5173', 'http://localhost:4173']
    // Allow requests with no origin (e.g., curl, CLI tools)
    if (!origin) return frontendUrl
    return allowed.includes(origin) ? origin : null
  },
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}))

// Mount routes
app.route('/api/share', shareRoutes)

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }))

// 404 for everything else
app.notFound((c) => c.json({ error: 'not_found', message: 'Route not found' }, 404))

export default app
