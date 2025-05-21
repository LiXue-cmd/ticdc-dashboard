<template>
  <div class="overflow-x-auto bg-white rounded-lg shadow-md">
    <Table class="min-w-full table-fixed">
      <TableHeader>
        <TableRow>
          <TableHead
            class="px-6 py-3 text-center text-sm font-semibold text-gray-500 w-24"
            >日志ID</TableHead
          >
          <TableHead
            class="px-6 py-3 text-center text-sm font-semibold text-gray-500"
            >操作类型</TableHead
          >
          <TableHead
            class="px-6 py-3 text-center text-sm font-semibold text-gray-500"
            >操作对象</TableHead
          >
          <TableHead
            class="px-6 py-3 text-center text-sm font-semibold text-gray-500"
            >操作时间</TableHead
          >
          <TableHead
            class="px-6 py-3 text-center text-sm font-semibold text-gray-500"
            >操作人</TableHead
          >
          <TableHead
            class="px-6 py-3 text-center text-sm font-semibold text-gray-500"
            >状态</TableHead
          >
          <TableHead
            class="px-6 py-3 text-right text-sm font-semibold text-gray-500"
            >操作</TableHead
          >
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow
          v-for="log in paginatedLogs"
          :key="log.logId"
          class="hover:bg-gray-50"
        >
          <TableCell class="px-6 py-4 text-center font-medium">{{
            log.logId
          }}</TableCell>
          <TableCell class="px-6 py-4 text-center font-medium">
            {{ getOperationTypeText(log.operationType) }}
          </TableCell>
          <TableCell class="px-6 py-4 text-center font-medium">
            {{ log.target || "无" }}
          </TableCell>
          <TableCell class="px-6 py-4 text-center font-medium">
            {{ formatDate(log.operationTime) }}
          </TableCell>
          <TableCell class="px-6 py-4 text-center font-medium">{{
            log.operator || "系统"
          }}</TableCell>
          <TableCell class="px-6 py-4 text-center">
            <span :class="getStatusClass(log.status)">
              {{ getStatusText(log.status) }}
            </span>
          </TableCell>
          <TableCell class="px-6 py-4 text-right">
            <button
              @click="openLogDetail(log)"
              class="text-blue-600 hover:text-blue-800"
            >
              查看详情
            </button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>

  <!-- 日志详情弹窗 -->
  <Dialog :open="isDetailModalOpen">
    <DialogTrigger asChild>
      <template #trigger></template>
    </DialogTrigger>
    <DialogContent class="w-full max-w-2xl">
      <DialogTitle>日志详情</DialogTitle>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 px-6">
        <div>
          <div class="text-sm font-medium text-gray-700">日志ID</div>
          <div class="text-gray-800">{{ currentLog.logId || "-" }}</div>
        </div>
        <div>
          <div class="text-sm font-medium text-gray-700">操作类型</div>
          <div class="text-gray-800">
            {{ getOperationTypeText(currentLog.operationType) }}
          </div>
        </div>
        <div>
          <div class="text-sm font-medium text-gray-700">操作对象</div>
          <div class="text-gray-800">{{ currentLog.target || "-" }}</div>
        </div>
        <div>
          <div class="text-sm font-medium text-gray-700">操作时间</div>
          <div class="text-gray-800">
            {{ formatDate(currentLog.operationTime) }}
          </div>
        </div>
        <div>
          <div class="text-sm font-medium text-gray-700">操作人</div>
          <div class="text-gray-800">{{ currentLog.operator || "-" }}</div>
        </div>
        <div>
          <div class="text-sm font-medium text-gray-700">状态</div>
          <div class="text-gray-800">
            <span :class="getStatusClass(currentLog.status)">
              {{ getStatusText(currentLog.status) }}
            </span>
          </div>
        </div>
        <div>
          <div class="text-sm font-medium text-gray-700">详细描述</div>
          <div class="text-gray-800">{{ currentLog.description || "-" }}</div>
        </div>
      </div>
      <div class="flex justify-end mt-6 px-6">
        <Button @click="closeDetailModal">关闭</Button>
      </div>
    </DialogContent>
  </Dialog>

  <!-- 分页组件 -->
  <div class="flex justify-end mt-4">
    <Pagination
      v-model="currentPage"
      :total="totalLogs"
      :items-per-page="itemsPerPage"
      :sibling-count="1"
      show-edges
      class="flex items-center gap-1 text-stone-700 dark:text-white"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useToast } from "@/components/ui/toast/use-toast";
// import { Pagination } from "@shadcn/vue/pagination"; // 引入Shadcn-Vue分页组件
// import { Dialog } from "@shadcn/vue/dialog"; // 确保引入Dialog组件

const { toast } = useToast();

// 模拟操作日志数据
const logs = ref([
  {
    logId: "LOG001",
    operationType: "CREATE",
    target: "主密钥 INV001",
    operationTime: "2023-10-01T12:30:00",
    operator: "admin",
    status: "success",
    description: "创建主密钥成功",
  },
  {
    logId: "LOG002",
    operationType: "UPDATE",
    target: "主密钥 INV001",
    operationTime: "2023-10-02T09:15:00",
    operator: "user_001",
    status: "success",
    description: "更新密钥别名",
  },
  {
    logId: "LOG003",
    operationType: "DELETE",
    target: "主密钥 INV002",
    operationTime: "2023-10-03T14:45:00",
    operator: "admin",
    status: "failed",
    description: "删除失败：密钥正在使用中",
  },
]);

// 分页状态
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalLogs = computed(() => logs.value.length);

// 计算分页数据
const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return logs.value.slice(start, start + itemsPerPage.value);
});

// 模态框状态
const isDetailModalOpen = ref(false);
const currentLog = ref({});

// 状态映射
const getStatusClass = (status: string) => {
  return {
    success: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    pending: "bg-yellow-100 text-yellow-800",
  }[status];
};

const getStatusText = (status: string) => {
  return {
    success: "成功",
    failed: "失败",
    pending: "进行中",
  }[status];
};

// 操作类型映射
const getOperationTypeText = (type: string) => {
  return {
    CREATE: "创建",
    UPDATE: "更新",
    DELETE: "删除",
    ACTIVATE: "启用",
    DEACTIVATE: "禁用",
  }[type];
};

// 日期格式化
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString();
};

// 打开详情弹窗
const openLogDetail = (log: any) => {
  currentLog.value = { ...log };
  isDetailModalOpen.value = true;
};

// 关闭弹窗
const closeDetailModal = () => {
  isDetailModalOpen.value = false;
  currentLog.value = {};
};
</script>
