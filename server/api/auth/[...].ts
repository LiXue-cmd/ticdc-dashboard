import CredentialsProvider from '@auth/core/providers/credentials'
import { NuxtAuthHandler } from '#auth'
import { findUserByUsername, verifyPassword, updateLastLogin } from '~/utils/mockData'
import { generateToken } from '~/utils/jwt'

export default NuxtAuthHandler({
  secret: useRuntimeConfig().authSecret,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const user = findUserByUsername(credentials.username as string)
        if (!user) {
          return null
        }

        const isValidPassword = await verifyPassword(
          credentials.username as string,
          credentials.password as string
        )

        if (!isValidPassword) {
          return null
        }

        // 更新最后登录时间
        updateLastLogin(user.id)

        // 生成 JWT token
        const token = generateToken({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        })

        return {
          id: user.id,
          name: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          accessToken: token
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60 // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.avatar = user.avatar
        token.accessToken = user.accessToken
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub
        session.user.role = token.role
        session.user.avatar = token.avatar
        session.accessToken = token.accessToken
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  }
})