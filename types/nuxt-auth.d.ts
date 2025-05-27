declare module '#auth-utils' {
  interface User {
    id: string
    username: string
    email: string
    role: 'admin' | 'user'
    avatar?: string
    accessToken?: string
  }

  interface UserSession {
    user: User
    accessToken?: string
  }
}

export {}