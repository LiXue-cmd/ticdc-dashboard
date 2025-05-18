// plugins/authorization-resolver.ts
export default defineNuxtPlugin({
  name: 'authorization-resolver',
  parallel: true,
  setup() {
    // 假设使用 localStorage 存储用户会话（需根据实际 auth 方案调整）
    const userSession = useLocalStorage<User | null>('user', null);

    return {
      provide: {
        authorization: {
          resolveClientUser: () => userSession.value, // 返回当前用户或 null
        },
      },
    };
  },
});