export default defineEventHandler(async (event) => {
  // 验证管理员权限
  const session = await getSession(event)
  
  if (!session || session.user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied. Admin role required.'
    })
  }

  return {
    success: true,
    data: mockUsers.map(user => ({
      ...user,
      password: undefined // 不返回密码信息
    }))
  }
})