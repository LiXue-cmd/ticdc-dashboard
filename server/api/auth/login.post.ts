import { Buffer } from 'node:buffer'
import { z } from 'zod'
import { createError } from 'h3'

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

// 定义用户角色枚举
const UserRole = z.enum(['superAdmin', 'normalUser'])

// 用户模式定义
const UserSchema = z.object({
  id: z.number(),
  role: UserRole,
  password: z.string(),
})

// 凭证验证模式
const credentialsSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

// 使用UserSchema验证用户数据库
const UsersDatabase = z.record(z.string(), UserSchema)
type UsersDatabase = z.infer<typeof UsersDatabase>

// 验证并类型安全的用户数据库
const users: UsersDatabase = {
  'admin': { id: 1, role: 'superAdmin', password: 'admin' },
  'normaluser': { id: 2, role: 'normalUser', password: 'normal' }
}

// 验证函数
function validateUser(username: string, password: string) {
  const user = users[username]
  return user?.password === password ? user : null
}

export default eventHandler(async (event) => {
  // 验证请求格式
  const result = credentialsSchema.safeParse(await readBody(event))
  
  if (!result.success) {
    return createError({
      statusCode: 400,
      statusMessage: '无效的请求格式',
      data: result.error.flatten()
    })
  }
  
  const { username, password } = result.data
  const user = validateUser(username, password)
  
  if (!user) {
    return createError({
      statusCode: 401,
      statusMessage: '认证失败，无效的凭证',
    })
  }
  
  // 生成令牌
  const tokenData = Buffer.from(`${username}:${password}`).toString('base64')

  // 管理用户令牌
  const userTokens: TokensByUser = tokensByUser.get(username) ?? {
    access: new Map(),
    refresh: new Map(),
  }
  
  userTokens.access.set(tokenData, tokenData)
  userTokens.refresh.set(tokenData, tokenData)
  tokensByUser.set(username, userTokens)
  
  // 返回响应前再次验证用户数据（可选增强）
  const safeUser = UserSchema.parse(user)
  
  return {
    data: {
      id: safeUser.id,
      role: safeUser.role,
      accessToken: tokenData,
      refreshToken: tokenData,
    }
  }
})