// middleware/auth.global.ts
// import { useAuth } from '#auth'; // 正确导入路径
export default defineNuxtRouteMiddleware(async (to) => {
//   const { auth } = useAuth();
//   await auth.refresh(); // 等待认证状态初始化

//   if (to.meta.requiresAuth && !auth.isAuthenticated.value) {
//     return navigateTo('/login');
//   }
});