// plugins/auth-directive.ts（改进版）
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('auth', {
    mounted(el, binding) {
      // 客户端逻辑
      const { auth } = useAuth();
      const requiredRole = binding.value;
      if (!auth.user || auth.user.role !== requiredRole) {
        el.parentNode?.removeChild(el);
      }
    },
    getSSRProps(binding) {
      // 服务端逻辑（返回空，避免错误）
      return {};
    },
  });
});