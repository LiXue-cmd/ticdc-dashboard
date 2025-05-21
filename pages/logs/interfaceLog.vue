<template>
  <div class="flex flex-col space-y-6">
    <!-- 搜索栏 -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm">
      <div class="flex flex-wrap gap-4">
        <div class="w-full md:w-48">
          <Label for="interfaceId" class="block text-sm font-medium text-gray-700 mb-1">接口ID</Label>
          <Input type="text" v-model="searchParams.interfaceId" placeholder="请输入接口ID" id="interfaceId" />
        </div>
        <div class="w-full md:w-48">
          <Label for="method" class="block text-sm font-medium text-gray-700 mb-1">请求方法</Label>
          <Select v-model="searchParams.method" id="method">
            <SelectItem value="">全部</SelectItem>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </Select>
        </div>
        <div class="w-full md:w-48">
          <Label for="status" class="block text-sm font-medium text-gray-700 mb-1">状态码</Label>
          <Select v-model="searchParams.status" id="status">
            <SelectItem value="">全部</SelectItem>
            <SelectItem value="200">200</SelectItem>
            <SelectItem value="400">400</SelectItem>
            <SelectItem value="401">401</SelectItem>
            <SelectItem value="403">403</SelectItem>
            <SelectItem value="404">404</SelectItem>
            <SelectItem value="500">500</SelectItem>
          </Select>
        </div>
        <div class="w-full md:w-48">
          <Label for="timeRange" class="block text-sm font-medium text-gray-700 mb-1">时间范围</Label>
          <div class="flex gap-2">
            <Input type="date" v-model="searchParams.startDate" id="startDate" />
            <Input type="date" v-model="searchParams.endDate" id="endDate" />
          </div>
        </div>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" @click="resetSearch">重置</Button>
        <Button @click="search">搜索</Button>
      </div>
    </div>

    <!-- 表格内容 -->
    <div class="overflow-x-auto bg-white rounded-lg shadow-md">
      <Table class="min-w-full table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead class="px-6 py-3 text-center text-sm font-semibold text-gray-500 w-24">日志ID</TableHead>
            <TableHead class="px-6 py-3 text-center text-sm font-semibold text-gray-500 w-32">接口ID</TableHead>
            <TableHead class="px-6 py-3 text-center text-sm font-semibold text-gray-500">请求方法</TableHead>
            <TableHead class="px-6 py-3 text-center text-sm font-semibold text-gray-500">接口路径</TableHead>
            <TableHead class="px-6 py-3 text-center text-sm font-semibold text-gray-500">请求IP</TableHead>
            <TableHead class="px-6 py-3 text-center text-sm font-semibold text-gray-500">状态码</TableHead>
            <TableHead class="px-6 py-3 text-center text-sm font-semibold text-gray-500">响应时间(ms)</TableHead>
            <TableHead class="px-6 py-3 text-center text-sm font-semibold text-gray-500">请求时间</TableHead>
            <TableHead class="px-6 py-3 text-right text-sm font-semibold text-gray-500">操作</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow
            v-for="log in paginatedLogs"
            :key="log.logId"
            class="hover:bg-gray-50"
          >
            <TableCell class="px-6 py-4 text-center font-medium">{{ log.logId }}</TableCell>
            <TableCell class="px-6 py-4 text-center font-medium">{{ log.interfaceId }}</TableCell>
            <TableCell class="px-6 py-4 text-center font-medium">
              <span :class="getMethodClass(log.method)">{{ log.method }}</span>
            </TableCell>
            <TableCell class="px-6 py-4 text-center font-medium truncate max-w-24">{{ log.path }}</TableCell>
            <TableCell class="px-6 py-4 text-center font-medium">{{ log.ip }}</TableCell>
            <TableCell class="px-6 py-4 text-center font-medium">
              <span :class="getStatusClass(log.status)">{{ log.status }}</span>
            </TableCell>
            <TableCell class="px-6 py-4 text-center font-medium">{{ log.responseTime }}</TableCell>
            <TableCell class="px-6 py-4 text-center font-medium">{{ formatDate(log.requestTime) }}</TableCell>
            <TableCell class="px-6 py-4 text-right">
              <button @click="openDetail(log)" class="text-blue-600 hover:text-blue-800">查看详情</button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- 分页 -->
    <div class="flex justify-between items-center mt-4">
      <div class="text-sm text-gray-500">
        显示 {{ (currentPage - 1) * itemsPerPage + 1 }} 到 {{ Math.min(currentPage * itemsPerPage, totalLogs) }} 条，共 {{ totalLogs }} 条
      </div>
      <Pagination
        v-model="currentPage"
        :total="totalLogs"
        :items-per-page="itemsPerPage"
        class="flex items-center gap-1 text-stone-700 dark:text-white"
      />
    </div>

    <!-- 详情弹窗 -->
    <Dialog :open="isDetailOpen">
      <DialogTrigger asChild>
        <template #trigger></template>
      </DialogTrigger>
      <DialogContent class="w-full max-w-4xl">
        <DialogTitle>接口日志详情</DialogTitle>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 px-6">
          <div>
            <div class="text-sm font-medium text-gray-700">日志ID</div>
            <div class="text-gray-800">{{ currentLog.logId || "-" }}</div>
          </div>
          <div>
            <div class="text-sm font-medium text-gray-700">接口ID</div>
            <div class="text-gray-800">{{ currentLog.interfaceId || "-" }}</div>
          </div>
          <div>
            <div class="text-sm font-medium text-gray-700">请求方法</div>
            <div class="text-gray-800">
              <span :class="getMethodClass(currentLog.method)">{{ currentLog.method }}</span>
            </div>
          </div>
          <div>
            <div class="text-sm font-medium text-gray-700">接口路径</div>
            <div class="text-gray-800">{{ currentLog.path || "-" }}</div>
          </div>
          <div>
            <div class="text-sm font-medium text-gray-700">请求IP</div>
            <div class="text-gray-800">{{ currentLog.ip || "-" }}</div>
          </div>
          <div>
            <div class="text-sm font-medium text-gray-700">状态码</div>
            <div class="text-gray-800">
              <span :class="getStatusClass(currentLog.status)">{{ currentLog.status }}</span>
            </div>
          </div>
          <div>
            <div class="text-sm font-medium text-gray-700">响应时间</div>
            <div class="text-gray-800">{{ currentLog.responseTime || "-" }}ms</div>
          </div>
          <div>
            <div class="text-sm font-medium text-gray-700">请求时间</div>
            <div class="text-gray-800">{{ formatDate(currentLog.requestTime) }}</div>
          </div>
        </div>

        <div class="mt-6 px-6">
          <div class="text-sm font-medium text-gray-700 mb-2">请求参数</div>
          <CodeBlock :code="currentLog.requestParams || '{}'" language="json" />
        </div>

        <div class="mt-6 px-6">
          <div class="text-sm font-medium text-gray-700 mb-2">响应内容</div>
          <CodeBlock :code="currentLog.responseData || '{}'" language="json" />
        </div>

        <div class="mt-6 px-6">
          <div class="text-sm font-medium text-gray-700 mb-2">错误信息</div>
          <CodeBlock :code="currentLog.errorMessage || ''" language="text" />
        </div>

        <div class="flex justify-end mt-6 px-6">
          <Button @click="closeDetail">关闭</Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from "vue";
import { useToast } from "@/components/ui/toast/use-toast";
// import { Pagination } from "@shadcn/vue/pagination";
// import { Dialog } from "@shadcn/vue/dialog";
// import { CodeBlock } from "@/components/ui/code-block"; // 假设项目中有代码高亮组件

const { toast } = useToast();

// 模拟接口日志数据
const mockLogs = [
  {
    logId: "LOG001",
    interfaceId: "API001",
    method: "GET",
    path: "/api/v1/users",
    ip: "192.168.1.100",
    status: 200,
    responseTime: 120,
    requestTime: "2023-10-01T10:30:00",
    requestParams: { page: 1, size: 10 },
    responseData: { code: 200, message: "成功", data: [{ id: 1, name: "张三" }] },
    errorMessage: "",
  },
  {
    logId: "LOG002",
    interfaceId: "API002",
    method: "POST",
    path: "/api/v1/orders",
    ip: "192.168.1.101",
    status: 500,
    responseTime: 350,
    requestTime: "2023-10-01T11:15:00",
    requestParams: { productId: 1001, quantity: 2 },
    responseData: {},
    errorMessage: "服务器内部错误",
  },
  {
    logId: "LOG003",
    interfaceId: "API003",
    method: "PUT",
    path: "/api/v1/products/1001",
    ip: "192.168.1.102",
    status: 200,
    responseTime: 85,
    requestTime: "2023-10-01T13:45:00",
    requestParams: { name: "更新后的产品名称", price: 99.99 },
    responseData: { code: 200, message: "更新成功" },
    errorMessage: "",
  },
];

// 状态管理
const logs = ref(mockLogs);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalLogs = computed(() => filteredLogs.value.length);

// 搜索参数
const searchParams = reactive({
  interfaceId: "",
  method: "",
  status: "",
  startDate: "",
  endDate: "",
});

// 过滤后的日志
const filteredLogs = computed(() => {
  return logs.value.filter(log => {
    return (
      (!searchParams.interfaceId || log.interfaceId.includes(searchParams.interfaceId)) &&
      (!searchParams.method || log.method === searchParams.method) &&
      (!searchParams.status || log.status.toString() === searchParams.status) &&
      (!searchParams.startDate || new Date(log.requestTime) >= new Date(searchParams.startDate)) &&
      (!searchParams.endDate || new Date(log.requestTime) <= new Date(`${searchParams.endDate}T23:59:59`))
    );
  });
});

// 分页数据
const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredLogs.value.slice(start, start + itemsPerPage.value);
});

// 详情弹窗
const isDetailOpen = ref(false);
const currentLog = ref({});

// 请求方法样式映射
const getMethodClass = (method: string) => {
  return {
    GET: "bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium",
    POST: "bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium",
    PUT: "bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-medium",
    DELETE: "bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs font-medium",
  }[method] || "";
};

// 状态码样式映射
const getStatusClass = (status: number) => {
  if (status >= 200 && status < 300) return "bg-green-100 text-green-800";
  if (status >= 400 && status < 500) return "bg-yellow-100 text-yellow-800";
  if (status >= 500) return "bg-red-100 text-red-800";
  return "";
};

// 日期格式化
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString();
};

// 打开详情
const openDetail = (log: any) => {
  currentLog.value = { ...log };
  isDetailOpen.value = true;
};

// 关闭详情
const closeDetail = () => {
  isDetailOpen.value = false;
  currentLog.value = {};
};

// 搜索操作
const search = () => {
  currentPage.value = 1; // 重置到第一页
};

// 重置搜索
const resetSearch = () => {
  searchParams.interfaceId = "";
  searchParams.method = "";
  searchParams.status = "";
  searchParams.startDate = "";
  searchParams.endDate = "";
  currentPage.value = 1;
};

// 页面加载时设置默认日期范围（近7天）
onMounted(() => {
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);
  
  searchParams.endDate = today.toISOString().split('T')[0];
  searchParams.startDate = weekAgo.toISOString().split('T')[0];
});
</script>