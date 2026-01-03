export type Bindings = {
  SHARES: KVNamespace
  FRONTEND_URL: string
}

export interface ShareRecord {
  markdown: string
  createdAt: number
}

export interface CreateShareResponse {
  code: string
  url: string
  expiresAt: string
}

export interface GetShareResponse {
  markdown: string
  createdAt: string
  expiresAt: string
}

export interface ErrorResponse {
  error: string
  message: string
}
