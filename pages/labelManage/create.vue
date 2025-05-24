<template>
  <div class="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
    <h2 class="text-xl font-bold mb-4">新增标签</h2>
    
    <form class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">标签名称</label>
        <Input
          type="text"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">描述</label>
        <Textarea
          rows="3"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="可选：标签用途说明"
        />
      </div>

      <div class="flex justify-end gap-2">
        <Button variant="outline" @click="goBack">取消</Button>
        <Button variant="primary" type="submit">保存</Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const goBack = () => {
  router.back();
};
</script>