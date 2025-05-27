import jwt from 'jsonwebtoken'
import type { SessionUser } from '~/types/auth'

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key'

export function generateToken(user: SessionUser): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  )
}

export function verifyToken(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionUser
    return decoded
  } catch (error) {
    return null
  }
}

export function refreshToken(oldToken: string): string | null {
  const user = verifyToken(oldToken)
  if (!user) return null
  return generateToken(user)
}