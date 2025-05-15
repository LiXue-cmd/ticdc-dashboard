import { Buffer } from 'node:buffer'

export default eventHandler((event) => {
  const authorizationHeader = getRequestHeader(event, 'Authorization')
  if (typeof authorizationHeader === 'undefined') {
    throw createError({ statusCode: 403, statusMessage: 'Need to pass valid Bearer-authorization header to access this endpoint' })
  }

  // 解析 basic auth header
  const [type, token] = authorizationHeader.split(' ')
  if (type !== 'Basic' || !token) {
    throw createError({ statusCode: 403, statusMessage: 'Need to pass valid Bearer-authorization header to access this endpoint' })
  }

  // Extract username and password from base64 token
  const [username, password] = Buffer.from(token, 'base64').toString().split(':')

  if (username !== 'admin' || password !== 'admin') {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized, user is not logged in',
    })
  }

  // All checks successful
  return {
    name: username,
    role: 'admin',
  }
})
