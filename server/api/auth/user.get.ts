// server/api/auth/user.get.ts
export default defineEventHandler((event) => {
  const token = getCookie(event, 'auth_token');
  
  // 验证 token (实际项目中应使用 JWT 库验证)
  if (!token || token !== 'fake-jwt-token') {
    throw createError({
      statusCode: 401,
      message: '未授权'
    });
  }
  
  // 返回用户信息
  return {
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    permissions: ['manage-users', 'view-dashboard']
  };
});