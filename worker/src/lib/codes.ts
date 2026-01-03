// Character set excluding confusable characters (0, 1, O, I, L)
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ' // 31 chars
const CODE_LENGTH = 6

export function generateCode(): string {
  let code = ''
  const array = new Uint8Array(CODE_LENGTH)
  crypto.getRandomValues(array)
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[array[i] % ALPHABET.length]
  }
  return code
}

export function normalizeCode(code: string): string {
  return code.toUpperCase().trim()
}

export function isValidCode(code: string): boolean {
  const normalized = normalizeCode(code)
  if (normalized.length !== CODE_LENGTH) return false
  return [...normalized].every(c => ALPHABET.includes(c))
}
