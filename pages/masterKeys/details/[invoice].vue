<template>
  <div class="w-full max-w-2xl mx-auto p-6">
    <div class="flex flex-wrap items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold">主密钥详情</h2>
        <p class="text-muted-foreground">密钥ID：{{ activeKey.invoice }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <!-- 基础信息 -->
      <div class="bg-white p-6 rounded-md shadow">
        <h3 class="text-lg font-medium mb-4">基础信息</h3>
        <div class="space-y-4">
          <div class="flex items-start space-x-4">
            <span class="font-medium">密钥别名：</span>
            <span>{{ activeKey.keyAlias || "-" }}</span>
          </div>
          <div class="flex items-start space-x-4">
            <span class="font-medium">算法：</span>
            <span>{{ activeKey.algorithm || "-" }}</span>
          </div>
          <div class="flex items-start space-x-4">
            <span class="font-medium">密钥类型：</span>
            <span>{{ mapKeyType(activeKey.keyType) || "-" }}</span>
          </div>
          <div class="flex items-start space-x-4">
            <span class="font-medium">状态：</span>
            <Badge
              :variant="activeKey.status === 'active' ? 'success' : 'error'"
              class="mt-0.5"
            >
              {{ activeKey.status === "active" ? "启用" : "禁用" }}
            </Badge>
          </div>
        </div>
      </div>

      <!-- 详细信息 -->
      <div class="bg-white p-6 rounded-md shadow">
        <h3 class="text-lg font-medium mb-4">详细信息</h3>
        <div class="space-y-4">
          <div class="flex items-start space-x-4">
            <span class="font-medium">标签：</span>
            <span v-if="activeKey.tags">{{
              activeKey.tags.split(",").join(", ")
            }}</span>
            <span v-else>-</span>
          </div>
          <div class="flex items-start space-x-4">
            <span class="font-medium">版本：</span>
            <span>{{ activeKey.version || "-" }}</span>
          </div>
          <div class="flex items-start space-x-4">
            <span class="font-medium">创建日期：</span>
            <span>{{ activeKey.createDate || "-" }}</span>
          </div>
          <div class="flex items-start space-y-2">
            <span class="font-medium">备注说明：</span>
            <p class="text-muted-foreground">
              {{ activeKey.notes || "无备注" }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="flex justify-end mt-6">
      <NuxtLink to="/masterkeys">
        <Button type="button">返回列表</Button>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { Badge } from "@/components/ui/badge";
import { useFetch } from "#app";

// 获取路由参数中的密钥ID
const route = useRoute();
const invoice = route.params.invoice as string;

// 响应式存储当前密钥详情
const activeKey = ref<any>({});

// 映射密钥类型（与创建页保持一致）
const mapKeyType = (keyType: string) => {
  switch (keyType) {
    case "symmetric":
      return "对称密钥";
    case "asymmetric":
      return "非对称密钥";
    case "hmac":
      return "HMAC";
    default:
      return "-";
  }
};

onMounted(async () => {
  if (!invoice) return;

  // 模拟接口请求（实际需替换为真实API）
  const { data, error } = await useFetch(`/api/cdc/masterkeys/${invoice}`);

  if (error.value) {
    console.error("获取密钥详情失败:", error.value);
    return;
  }

  activeKey.value = data.value || {};
});
</script>

<style scoped>
/* 详情页样式 */
.grid {
  gap: 40px;
}

.bg-white {
  background-color: #ffffff !important;
}

.shadow {
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
}

.Badge {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
}

.success {
  background-color: #ecfdf5;
  color: #22c55e;
  border-color: #d1fae5;
}

.error {
  background-color: #fef2f2;
  color: #dc2626;
  border-color: #fee2e2;
}
</style>
