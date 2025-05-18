// server/api/auth/login.ts
import { defineEventHandler } from 'nitro';
import { authorize } from 'nuxt-authorization'; // 服务端授权函数

export default defineEventHandler(async (event) => {
  const { username, password } = await readBody(event);
  
  // 模拟用户验证（实际需对接数据库）
  const user = await db.query<User>().where('username', username).first();
  
  if (!user || user.password !== password) {
    throw createError({ statusCode: 401, statusMessage: '认证失败' });
  }

  // 登录成功后，存储用户会话（如写入 Cookie 或 JWT）
  event.cookies.set('session_token', user.session_token, { maxAge: 86400 });
  
  // 返回用户信息及权限列表（可选）
  return {
    user: { id: user.id, role: user.role },
    abilities: {
      canListPosts: canListPosts.handler(user), // 预校验权限（可选）
      canEditPost: (postId: string) => canEditPost.handler(user, { id: postId, authorId: user.id }), // 动态权限函数
    },
  };
});