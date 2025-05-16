// server/api/auth/login.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  // 模拟用户验证逻辑
  if (body.email === 'admin@example.com' && body.password === 'password') {
    // 生成 JWT token (实际项目中应使用适当的 JWT 库)
    const token = 'fake-jwt-token';
    
    // 设置 cookie
    setCookie(event, 'auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1天
      path: '/'
    });
    
    return {
      token,
      user: {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        permissions: ['manage-users', 'view-dashboard']
      }
    };
  }
  
  // 验证失败
  throw createError({
    statusCode: 401,
    message: '无效的凭证'
  });
});