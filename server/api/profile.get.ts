export default defineEventHandler(async (event) => {
  const session = await getSession(event)
  
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const user = findUserById(session.user.id)
  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found'
    })
  }

  return {
    success: true,
    data: {
      ...user,
      password: undefined
    }
  }
})