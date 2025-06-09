<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <!-- 页面标题栏 -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">接口调用日志</h2>
        <p class="text-muted-foreground">查看系统API调用记录，支持按关键词和时间范围搜索</p>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <!-- <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="relative">
        <Input
          v-model="searchQuery"
          placeholder="搜索接口路径、请求ID或错误信息..."
          class="pl-9 w-full"
          :disabled="isLoading"
        >
          <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </Input>
      </div>
      
      <div class="flex gap-2">
        <DatePicker
          v-model="startDate"
          placeholder="开始日期"
          class="w-full"
          :disabled="isLoading"
        />
        <DatePicker
          v-model="endDate"
          placeholder="结束日期"
          class="w-full"
          :disabled="isLoading"
        />
      </div>
      
      <div class="flex gap-2">
        <Select
          v-model="statusFilter"
          :options="statusOptions"
          placeholder="选择状态"
          class="w-full"
          :disabled="isLoading"
        />
        <Button variant="outline" @click="clearFilters">
          重置
        </Button>
      </div>
    </div> -->

    <!-- 接口日志列表 -->
    <DataTable
      :columns="columns"
      :data="filteredLogs"
      :is-loading="isLoading"
      :filterColumns="filterColumns"
      no-data-text="暂无接口调用日志"
      class="mt-4"
      :statusFilterField="'status'"
      :statusOptions="[
        { label: '成功', value: 'success' },
        { label: '失败', value: 'error' },
        { label: '超时', value: 'timeout' },
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
const startDate = ref("");
const endDate = ref("");
const statusFilter = ref("all");

// 状态选项
const statusOptions = [
  { label: "全部", value: "all" },
  { label: "成功", value: "success" },
  { label: "失败", value: "error" },
  { label: "超时", value: "timeout" },
];

// 模拟接口日志数据
const logs = ref<any[]>([
  {
    id: 1,
    requestId: "REQ-20231201001",
    path: "/api/users/profile",
    method: "GET",
    status: "success",
    responseTime: 234,
    timestamp: "2023-12-01 09:15:30",
    clientIp: "192.168.1.100",
    user: "user001",
    errorMessage: "",
  },
  {
    id: 2,
    requestId: "REQ-20231201002",
    path: "/api/payments/process",
    method: "POST",
    status: "error",
    responseTime: 567,
    timestamp: "2023-12-01 10:30:15",
    clientIp: "10.0.0.5",
    user: "admin",
    errorMessage: "无效的支付参数",
  },
  {
    id: 3,
    requestId: "REQ-20231201003",
    path: "/api/products/list",
    method: "GET",
    status: "success",
    responseTime: 189,
    timestamp: "2023-12-01 11:45:40",
    clientIp: "172.16.0.2",
    user: "user002",
    errorMessage: "",
  },
  {
    id: 4,
    requestId: "REQ-20231201004",
    path: "/api/config/update",
    method: "PUT",
    status: "timeout",
    responseTime: 3000,
    timestamp: "2023-12-01 13:20:55",
    clientIp: "192.168.1.101",
    user: "admin",
    errorMessage: "请求处理超时",
  },
  {
    id: 5,
    requestId: "REQ-20231201005",
    path: "/api/auth/login",
    method: "POST",
    status: "success",
    responseTime: 412,
    timestamp: "2023-12-01 14:50:22",
    clientIp: "10.0.0.8",
    user: "user003",
    errorMessage: "",
  },
]);

// 过滤配置
const filterColumns = ref([
  { accessorKey: "path", header: "请求路径" },
  { accessorKey: "user", header: "用户" },
]);
// 过滤配置
const filteredLogs = computed(() => {
  let result = logs.value;
  
  // 关键词搜索
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(log => 
      log.path.toLowerCase().includes(query) ||
      log.requestId.toLowerCase().includes(query) ||
      log.errorMessage.toLowerCase().includes(query)
    );
  }
  
  // 时间范围筛选
  if (startDate.value && endDate.value) {
    result = result.filter(log => {
      const logTime = new Date(log.timestamp).getTime();
      const startTime = new Date(startDate.value).getTime();
      const endTime = new Date(endDate.value + " 23:59:59").getTime();
      return logTime >= startTime && logTime <= endTime;
    });
  }
  
  // 状态筛选
  if (statusFilter.value && statusFilter.value !== "all") {
    result = result.filter(log => log.status === statusFilter.value);
  }
  
  return result;
});

// 表格列定义
const columns: ColumnDef<any>[] = [
  {
    accessorKey: "timestamp",
    header: "请求时间",
    cell: ({ row }) => h("div", { class: "w-36" }, row.getValue("timestamp")),
  },
  {
    accessorKey: "requestId",
    header: "请求ID",
    cell: ({ row }) => h("div", { class: "w-40" }, row.getValue("requestId")),
  },
  {
    accessorKey: "path",
    header: "接口路径",
    cell: ({ row }) => h("div", { class: "max-w-[200px] overflow-ellipsis" }, row.getValue("path")),
  },
  {
    accessorKey: "method",
    header: "请求方法",
    cell: ({ row }) => {
      const method = String(row.getValue("method"));
      return h(
        "span",
        {
          class: `px-2 py-0.5 rounded-md text-xs font-medium ${getMethodClass(method)}`,
        },
        method
      );
    },
  },
  {
    accessorKey: "status",
    header: "状态",
    cell: ({ row }) => {
      const status = String(row.getValue("status"));
      return h(
        "span",
        {
          class: `px-2 py-0.5 rounded-full text-xs font-medium ${getStatusClass(status)}`,
        },
        getStatusText(status)
      );
    },
  },
  {
    accessorKey: "responseTime",
    header: "响应时间(ms)",
    cell: ({ row }) => row.getValue("responseTime") || "-",
  },
  {
    accessorKey: "clientIp",
    header: "客户端IP",
    cell: ({ row }) => row.getValue("clientIp") || "-",
  },
  {
    accessorKey: "user",
    header: "用户",
    cell: ({ row }) => row.getValue("user") || "-",
  },
  {
    accessorKey: "errorMessage",
    header: "错误信息",
    cell: ({ row }) => h("div", { class: "max-w-[300px] overflow-ellipsis" }, row.getValue("errorMessage") || "-"),
  },
];

// 辅助函数：获取HTTP方法样式
const getMethodClass = (method: string) => {
  switch (method.toUpperCase()) {
    case "GET": return "bg-blue-100 text-blue-800";
    case "POST": return "bg-green-100 text-green-800";
    case "PUT": return "bg-yellow-100 text-yellow-800";
    case "DELETE": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

// 辅助函数：获取状态样式
const getStatusClass = (status: string) => {
  switch (status) {
    case "success": return "bg-green-100 text-green-700";
    case "error": return "bg-red-100 text-red-700";
    case "timeout": return "bg-yellow-100 text-yellow-700";
    default: return "bg-gray-100 text-gray-700";
  }
};

// 辅助函数：获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case "success": return "成功";
    case "error": return "失败";
    case "timeout": return "超时";
    default: return status;
  }
};

// 重置筛选条件
const clearFilters = () => {
  searchQuery.value = "";
  startDate.value = "";
  endDate.value = "";
  statusFilter.value = "all";
};

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
/* 表格列样式已由 Tailwind 类替代，无需自定义样式 */
</style>