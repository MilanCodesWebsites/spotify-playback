import Redis from "ioredis"

// Storage key for Spotify tokens
const TOKEN_KEY = "spotify_tokens"

interface TokenData {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

// Create Redis client using the connection URL
const redis = new Redis(process.env.spotify_tokens_REDIS_URL || "")

export const tokenStorage = {
  set: async (accessToken: string, refreshToken: string, expiresIn: number) => {
    const tokenData: TokenData = {
      accessToken,
      refreshToken,
      expiresAt: Date.now() + expiresIn * 1000,
    }
    await redis.set(TOKEN_KEY, JSON.stringify(tokenData))
  },

  get: async (): Promise<TokenData | null> => {
    const data = await redis.get(TOKEN_KEY)
    if (!data) return null
    return JSON.parse(data) as TokenData
  },

  clear: async () => {
    await redis.del(TOKEN_KEY)
  },

  isExpired: (tokenData: TokenData | null): boolean => {
    if (!tokenData) return true
    return Date.now() >= tokenData.expiresAt
  },
}
