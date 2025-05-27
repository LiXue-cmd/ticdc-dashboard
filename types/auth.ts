export interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'user'
  avatar?: string
  createdAt: Date
  lastLogin?: Date
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  success: boolean
  user?: User
  token?: string
  message?: string
}

export interface SessionUser {
  id: string
  username: string
  email: string
  role: 'admin' | 'user'
  avatar?: string
}