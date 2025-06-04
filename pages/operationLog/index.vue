<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <!-- 页面标题栏 -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">操作日志管理</h2>
        <p class="text-muted-foreground">查看系统操作日志，支持按关键词搜索</p>
      </div>
    </div>

    <!-- 日志列表 -->
    <DataTable
      :columns="columns"
      :data="filteredLogs"
      :is-loading="isLoading"
      :filterColumns="filterColumns"
      no-data-text="暂无操作日志"
      class="mt-4"
      :statusFilterField="'status'"
      :statusOptions="[
        { label: '成功', value: 'success' },
        { label: '失败', value: 'error' },
      ]"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useToast } from "@/components/ui/toast/use-toast";
import DataTable from "@/components/tasks/components/DataTable.vue";
import type { ColumnDef } from "@tanstack/vue-table";
// import { SearchIcon } from "@heroicons/vue/24/solid";
import { h } from "vue";
import { useFetch } from "#app";

// 状态管理
const isLoading = ref(false);
const searchQuery = ref("");

// 模拟操作日志数据
const logs = ref<any[]>([
  {
    id: 1,
    timestamp: "2023-12-01 14:30:45",
    operator: "admin",
    operation: "创建应用",
    resource: "APP-2023001",
    status: "success",
    notes: "用户通过后台管理界面创建新应用",
  },
  {
    id: 2,
    timestamp: "2023-12-02 09:15:20",
    operator: "user_001",
    operation: "修改密钥",
    resource: "MK-2023002",
    status: "success",
    notes: "用户更新了API签名密钥的算法",
  },
  {
    id: 3,
    timestamp: "2023-12-02 11:45:50",
    operator: "system",
    operation: "删除标签",
    resource: "TAG-2023003",
    status: "error",
    notes: "因权限不足导致删除失败",
  },
  {
    id: 4,
    timestamp: "2023-12-03 16:20:00",
    operator: "admin",
    operation: "重置AppSecret",
    resource: "APP-2023001",
    status: "success",
    notes: "手动重置应用的访问密钥",
  },
]);

// 过滤配置
const filterColumns = ref([
  { accessorKey: "operator", header: "操作人" },
  // { accessorKey: "operation", header: "操作类型" },
  // { accessorKey: "resource", header: "操作资源" },
]);

// 计算属性：过滤后的数据
const filteredLogs = computed(() => {
  return logs.value.filter(log => 
    log.operator.includes(searchQuery.value) ||
    log.operation.includes(searchQuery.value) ||
    log.resource.includes(searchQuery.value)
  );
});

// 表格列定义（仅展示字段，无操作栏）
const columns: ColumnDef<any>[] = [
  {
    accessorKey: "timestamp",
    header: "操作时间",
    cell: ({ row }) => h("div", { class: "w-45" }, row.getValue("timestamp")),
    canSort: true,
  },
  {
    accessorKey: "operator",
    header: "操作人",
    cell: ({ row }) => row.getValue("operator") || "-",
    canSort: true,
  },
  {
    accessorKey: "operation",
    header: "操作类型",
    cell: ({ row }) => row.getValue("operation") || "-",
    canSort: true,
  },
  {
    accessorKey: "resource",
    header: "操作资源",
    cell: ({ row }) => row.getValue("resource") || "-",
    canSort: true,
  },
  {
    accessorKey: "status",
    header: "状态",
    cell: ({ row }) => {
      const status = row.getValue("status");
      return h(
        "span",
        {
          class: `px-2 py-0.5 rounded-full ${
            status === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`,
        },
        status === "success" ? "成功" : "失败"
      );
    },
    canSort: true,
  },
  {
    accessorKey: "notes",
    header: "备注",
    cell: ({ row }) => h("div", { class: "max-w-[400px] overflow-ellipsis" }, row.getValue("notes") || "-"),
    canHide: true,
  },
];

// 生命周期钩子
onMounted(() => {
  // 模拟数据加载
  isLoading.value = true;
  setTimeout(() => {
    isLoading.value = false;
  }, 1000);
});
</script>

<style scoped>
.max-w-[400px] { max-width: 400px; }
.overflow-ellipsis { 
  overflow: hidden; 
  text-overflow: ellipsis; 
  white-space: nowrap; 
}
</style>