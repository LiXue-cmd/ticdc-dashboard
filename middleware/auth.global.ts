// middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const { $auth } = useNuxtApp();
  
  // 如果访问登录页但用户已登录，重定向到首页
  if (to.path === '/login' && $auth.loggedIn) {
    return navigateTo('/');
  }
  
  // 如果访问需要认证的页面但用户未登录，重定向到登录页
  if (to.meta.requiresAuth && !$auth.loggedIn) {
    return navigateTo('/login');
  }
  
  // 如果访问需要特定角色的页面
  if (to.meta.requiresRole) {
    const user = $auth.user as User;
    if (!user || user.role !== to.meta.requiresRole) {
      return navigateTo('/'); // 或显示403页面
    }
  }
});