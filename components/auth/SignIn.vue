<script setup lang="ts">
import { Loader2 } from "lucide-vue-next";
import PasswordInput from "~/components/PasswordInput.vue";
import axios from "~/utils/axios";

const username = ref("admin");
const password = ref("admin");
const isLoading = ref(false);

async function onSubmit(event: Event) {
  event.preventDefault();
  if (!username.value || !password.value) return;
  const res = await axios.post("/auth/login", {
    username: username.value,
    password: password.value,
  });
  console.log('res',res)
  localStorage.setItem("accessToken", res.data.accessToken);
  localStorage.setItem("refreshToken", res.data.refreshToken);
  navigateTo("/");
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
