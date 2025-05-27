import type { H3Event } from 'h3'
import { getServerSession } from '#auth'

export async function requireAuth(event: H3Event) {
  const session = await getServerSession(event)
  
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }
  
  return session
}

export async function requireAdmin(event: H3Event) {
  const session = await requireAuth(event)
  
  if (session.user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required'
    })
  }
  
  return session
}

// export async function getSession(event: H3Event) {
//   return await getServerSession(event)
// }