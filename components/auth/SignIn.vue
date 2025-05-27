<script setup lang="ts">
import { Loader2 } from "lucide-vue-next";
import PasswordInput from "~/components/PasswordInput.vue";
import axios from "~/utils/axios";

definePageMeta({
  auth: false,
  layout: false
})
const { login, isAuthenticated } = useAuthStore()
const router = useRouter()

const username = ref("admin");
const password = ref("admin123");
const isLoading = ref(false);
const error = ref('')

// 如果已登录，重定向到首页
watchEffect(() => {
  if (isAuthenticated.value) {
    router.push('/')
  }
})
async function onSubmit(event: Event) {
  event.preventDefault();
  if (!username.value || !password.value) {
    error.value = '请填写账号和密码'
    return
  }
  isLoading.value = true
  error.value = ''

  try {
    const result = await login({
      username: username.value,
      password: password.value,
    })
    
    if (result.success) {
      await router.push('/')
    } else {
      error.value = result.error || '登录失败'
    }
  } catch (err) {
    error.value = '发生错误，请稍后再试'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <form class="grid gap-6" @submit="onSubmit">
    <div class="grid gap-2">
      <Label for="username"> 账号 </Label>
      <Input
        id="username"
        v-model="username"
        type="text"
        placeholder="请输入账号"
        :disabled="isLoading"
        auto-capitalize="none"
        auto-complete="username"
        auto-correct="off"
      />
    </div>
    <div class="grid gap-2">
      <div class="flex items-center">
        <Label for="password"> 密码 </Label>
        <NuxtLink
          to="/forgot-password"
          class="ml-auto inline-block text-sm underline"
        >
          忘记密码?
        </NuxtLink>
      </div>
      <PasswordInput id="password" v-model="password" />
    </div>
    <div v-if="error" class="text-red-600 text-sm text-center">
      {{ error }}
    </div>
    <Button type="submit" class="w-full" :disabled="isLoading">
      <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
      {{ isLoading ? '登 录 中...' : '登 录' }}
    </Button>
  </form>
</template>

<style scoped></style>
