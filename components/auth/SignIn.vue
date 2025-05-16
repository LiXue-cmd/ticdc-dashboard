<!-- components/auth/SignIn.vue -->
<script setup lang="ts">
const { login, error } = useAuth(); // 引入 nuxt-authorization 的登录方法
const form = ref<Record<'username' | 'password', string>>({
  username: 'admin',
  password: 'admin',
});

const handleSubmit = async () => {
  try {
    // 使用 nuxt-authorization 提供的登录方法
    await login('local', form.value); // 'local' 对应策略名称
    navigateTo('/'); // 登录成功跳转首页
  } catch (err) {
    console.error('登录失败:', err);
  }
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="grid gap-6">
    <div>
      <label class="block text-sm font-medium text-gray-700">用户名</label>
      <div class="mt-1">
        <input
          v-model="form.username"
          type="text"
          class="appearance-none block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700">密码</label>
      <div class="mt-1">
        <input
          v-model="form.password"
          type="password"
          class="appearance-none block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>
    </div>
    <button
      type="submit"
      class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md"
    >
      登录
    </button>
    <!-- 错误提示 -->
    <div v-if="error.value" class="text-red-500 text-sm mt-2">
      {{ error.value.message || '登录失败，请检查凭证' }}
    </div>
  </form>
</template>