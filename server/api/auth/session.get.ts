// server/api/auth/session.get.ts
import { defineEventHandler, getCookie } from 'h3';
import { verify } from 'jsonwebtoken';

export default defineEventHandler(async (event) => {
  // 从 Cookie 或请求头获取令牌（根据你的存储方式调整）
  const token = getHeader(event, 'Authorization')?.replace('Bearer ', '') || getCookie(event, 'token');

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: '缺少认证令牌' });
  }

  try {
    // 验证 JWT
    const decoded = verify(token, useRuntimeConfig().jwtSecret);
    
    // 模拟数据库查询（实际需调用数据库）
    const user = await db.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
    
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: '用户不存在' });
    }

    return { user: { id: user.id, role: user.role, permissions: user.permissions } };
  } catch (error) {
    throw createError({ statusCode: 401, statusMessage: '认证失败' });
  }
});