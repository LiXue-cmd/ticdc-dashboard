import { Buffer } from 'node:buffer'
import { z } from 'zod'

export const ACCESS_TOKEN_TTL = 30

export interface User {
  name: string
  role: string
}

interface TokensByUser {
  access: Map<string, string>
  refresh: Map<string, string>
}

export const tokensByUser: Map<string, TokensByUser> = new Map()

const credentialsSchema = z.object({
  username: z.string().min(1),
  password: z.literal('admin'),
})

export default eventHandler(async (event) => {
  const result = credentialsSchema.safeParse(await readBody(event))
  console.log('credentials', result)
  if (!result.success) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unauthorized, hint: try `admin` as password',
    })
  }

  // Emulate login
  const { username, password } = result.data
  const tokenData = Buffer.from(`${username}:${password}`).toString('base64')

  // Naive implementation - please implement properly yourself!
  const userTokens: TokensByUser = tokensByUser.get(username) ?? {
    access: new Map(),
    refresh: new Map(),
  }
  userTokens.access.set(tokenData, tokenData)
  userTokens.refresh.set(tokenData, tokenData)
  tokensByUser.set(username, userTokens)

  return {
    token: {
      accessToken: tokenData,
      refreshToken: tokenData,
    },
  }
})
