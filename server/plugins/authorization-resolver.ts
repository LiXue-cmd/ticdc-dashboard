// server/plugins/authorization-resolver.ts
import { defineNitroPlugin } from 'nitro';
import type { User } from '#types/user';

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', async (event) => {
    // 服务端仅处理 session/cookie，不直接导入客户端模块
    const sessionToken = event.cookies.get('session_token');
    let user: User | null = null;

    if (sessionToken) {
      // 从数据库或缓存获取用户（纯服务端逻辑）
      user = await db.query<User>().where('session_token', sessionToken).first();
    }

    event.context.$authorization = {
      resolveServerUser: () => user,
    };
  });
});