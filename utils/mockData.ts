import bcrypt from 'bcryptjs'
import type { User } from '~/types/auth'

// 模拟用户数据
export const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=0ea5e9&color=fff',
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date()
  },
  {
    id: '2',
    username: 'user1',
    email: 'user1@example.com',
    role: 'user',
    avatar: 'https://ui-avatars.com/api/?name=User1&background=10b981&color=fff',
    createdAt: new Date('2024-01-15'),
    lastLogin: new Date()
  },
  {
    id: '3',
    username: 'user2',
    email: 'user2@example.com',
    role: 'user',
    avatar: 'https://ui-avatars.com/api/?name=User2&background=f59e0b&color=fff',
    createdAt: new Date('2024-02-01')
  }
]

// 模拟密码数据 (实际项目中应该加密存储)
export const mockPasswords: Record<string, string> = {
  'admin': bcrypt.hashSync('admin123', 10),
  'user1': bcrypt.hashSync('user123', 10),
  'user2': bcrypt.hashSync('user123', 10)
}

// 模拟活跃会话
export const activeSessions: Set<string> = new Set()

// 用户查找函数
export function findUserByUsername(username: string): User | undefined {
  return mockUsers.find(user => user.username === username)
}

export function findUserById(id: string): User | undefined {
  return mockUsers.find(user => user.id === id)
}

// 验证密码
export async function verifyPassword(username: string, password: string): Promise<boolean> {
  const hashedPassword = mockPasswords[username]
  if (!hashedPassword) return false
  return await bcrypt.compare(password, hashedPassword)
}

// 更新用户最后登录时间
export function updateLastLogin(userId: string) {
  const user = findUserById(userId)
  if (user) {
    user.lastLogin = new Date()
  }
}