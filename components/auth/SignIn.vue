<script setup lang="ts">
import { Loader2 } from "lucide-vue-next";
import PasswordInput from "~/components/PasswordInput.vue";
import axios from "~/utils/axios";

const username = ref("demo@gmail.com");
const password = ref("admin");
const isLoading = ref(false);

async function onSubmit(event: Event) {
  event.preventDefault();
  if (!username.value || !password.value) return;
  try {
    const response = await axios.post("/auth/login", {
      username: username.value,
      password: password.value,
    });

    console.log("Login response - Status:", response.status);
    console.log("Login response - Headers:", response.headers);
    console.log("Login response - Data:", response.data);
  } catch (err) {
    console.log("Login error:", err);
  }
  // const res = await useFetch("/api/auth/login", {
  //   method: "POST",
  //   body: { username: username.value, password: password.value },
  // });

  // // 检查请求是否成功
  // if (!res.error.value) {
  //   // 获取返回的数据
  //   const responseData = res.data.value;
  //   console.log("登录成功:", responseData);

  //   // 处理登录逻辑，例如存储 token
  //   if (responseData.token) {
  //     localStorage.setItem("accessToken", responseData.token.accessToken);
  //     localStorage.setItem("refreshToken", responseData.token.refreshToken);
  //     navigateTo('/')
  //   }
  // } else {
  //   // 处理错误
  //   console.error("登录失败:", res.error.value);

  //   // 显示错误信息
  //   if (res.error.value.statusCode === 401) {
  //     alert("用户名或密码错误");
  //   } else {
  //     alert("登录失败，请稍后重试");
  //   }
  // }
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
    <Button type="submit" class="w-full" :disabled="isLoading">
      <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
      登 录
    </Button>
  </form>
</template>

<style scoped></style>
