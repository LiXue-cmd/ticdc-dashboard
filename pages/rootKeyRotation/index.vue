<template>
  <div class="w-full max-w-2xl mx-auto p-6">
    <h2 class="text-2xl font-bold mb-4">系统根密钥轮换</h2>

    <!-- 显示当前根密钥信息 -->
    <div class="bg-white p-4 rounded shadow mb-4">
      <h3 class="text-lg font-bold mb-2">当前根密钥信息</h3>
      <p><strong>密钥别名:</strong> {{ currentRootKey.keyAlias }}</p>
      <p><strong>算法:</strong> {{ currentRootKey.algorithm }}</p>
      <p><strong>创建日期:</strong> {{ currentRootKey.createDate }}</p>
      <p><strong>状态:</strong> {{ currentRootKey.status }}</p>
    </div>

    <!-- 密钥轮换表单 -->
    <form class="mt-6 px-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">新密钥别名</label>
        <Input
          type="text"
          v-model="newRootKey.keyAlias"
          placeholder="请输入新密钥别名"
          class="mt-1 block w-full"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">新算法</label>
        <Input
          type="text"
          v-model="newRootKey.algorithm"
          placeholder="请输入新算法"
          class="mt-1 block w-full"
        />
      </div>
      <Button @click="rotateKey">开始轮换</Button>
    </form>

    <!-- 轮换结果提示 -->
    <div v-if="rotationResult" class="bg-green-100 p-4 rounded mt-4">
      <p>{{ rotationResult }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// 模拟当前根密钥数据
const currentRootKey = ref({
  keyAlias: "系统根密钥",
  algorithm: "RSA-4096",
  createDate: "2024-01-01",
  status: "active",
});

// 新根密钥数据
const newRootKey = ref({
  keyAlias: "",
  algorithm: "",
});

// 轮换结果提示
const rotationResult = ref("");

// 模拟密钥轮换操作
const rotateKey = () => {
  if (newRootKey.value.keyAlias && newRootKey.value.algorithm) {
    currentRootKey.value = {
      ...newRootKey.value,
      createDate: new Date().toISOString().split("T")[0],
      status: "active",
    };
    rotationResult.value = "密钥轮换成功！";
    newRootKey.value = {
      keyAlias: "",
      algorithm: "",
    };
  } else {
    rotationResult.value = "请输入有效的新密钥别名和算法。";
  }
};
</script>

<style scoped>
/* 样式可根据需要自定义 */
</style>