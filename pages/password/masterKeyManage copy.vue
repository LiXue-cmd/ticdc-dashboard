<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-4">
      <button @click="openCreateModal" class="btn btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m0 0h6m0-6H6" />
        </svg>
        新增密钥
      </button>
    </div>

    <div class="overflow-x-auto bg-white rounded-lg shadow-md">
      <!-- 关键修复：为Table添加固定列宽类名，并确保表头与表体列宽一致 -->
      <Table class="min-w-full table-fixed"> <!-- 添加 table-fixed 强制固定列宽 -->
        <TableHead>
          <TableRow>
            <TableHead class="px-6 py-3 text-left text-sm font-semibold text-gray-500 w-24">密钥ID</TableHead>
            <TableHead class="px-6 py-3 text-left text-sm font-semibold text-gray-500">密钥别名</TableHead>
            <TableHead class="px-6 py-3 text-left text-sm font-semibold text-gray-500">算法</TableHead>
            <TableHead class="px-6 py-3 text-left text-sm font-semibold text-gray-500">标签</TableHead>
            <TableHead class="px-6 py-3 text-left text-sm font-semibold text-gray-500">备注说明</TableHead>
            <TableHead class="px-6 py-3 text-left text-sm font-semibold text-gray-500">创建日期</TableHead>
            <TableHead class="px-6 py-3 text-left text-sm font-semibold text-gray-500">版本</TableHead>
            <TableHead class="px-6 py-3 text-left text-sm font-semibold text-gray-500">状态</TableHead>
            <TableHead class="px-6 py-3 text-right text-sm font-semibold text-gray-500 w-16">操作</TableHead>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow v-for="invoice in invoices" :key="invoice.invoice" class="hover:bg-gray-50">
            <TableCell class="px-6 py-4 font-medium">{{ invoice.invoice }}</TableCell> <!-- 添加 px-6 py-4 与表头内边距一致 -->
            <TableCell class="px-6 py-4 font-medium">{{ invoice.keyAlias || '-' }}</TableCell>
            <TableCell class="px-6 py-4 font-medium">{{ invoice.algorithm || '-' }}</TableCell>
            <TableCell class="px-6 py-4 font-medium">{{ invoice.tags || '-' }}</TableCell>
            <TableCell class="px-6 py-4 font-medium">{{ invoice.notes || '-' }}</TableCell>
            <TableCell class="px-6 py-4 font-medium">{{ invoice.createDate || '-' }}</TableCell>
            <TableCell class="px-6 py-4 font-medium">{{ invoice.version || '-' }}</TableCell>
            <TableCell class="px-6 py-4 text-right"> <!-- 添加 px-6 py-4 与表头内边距一致 -->
              <span :class="getStatusClass(invoice.status)">{{ getStatusText(invoice.status) }}</span>
              <Switch
                modelValue="active"
                :checked="invoice.status === 'active'"
                :indeterminate="false"
                @on-change="toggleStatus(invoice)"
              />
            </TableCell>
            <TableCell class="px-6 py-4 text-right"> <!-- 添加 px-6 py-4 与表头内边距一致 -->
              <button @click="openDetailModal(invoice)" class="text-blue-600 hover:text-blue-800">
                详情
              </button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- 详情弹窗 -->
    <!-- <Dialog open={isDetailModalOpen} on-open-change="closeDetailModal"> -->
    <Dialog :open="isDetailModalOpen" @open-change="closeDetailModal">
      <DialogTrigger asChild>
        <template #trigger></template>
      </DialogTrigger>
      <DialogContent class="w-full max-w-2xl">
        <DialogHeader class="text-lg font-bold text-gray-800">发票详情</DialogHeader>
        <DialogDescription class="mt-2 text-sm text-gray-500">查看密钥的详细信息</DialogDescription>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 px-6">
          <div>
            <div class="text-sm font-medium text-gray-700">密钥ID</div>
            <div class="text-gray-800">{{ selectedInvoice.invoice || '-' }}</div>
          </div>
          <div>
            <div class="text-sm font-medium text-gray-700">密钥别名</div>
            <div class="text-gray-800">{{ selectedInvoice.keyAlias || '-' }}</div>
          </div>
          <div>
            <div class="text-sm font-medium text-gray-700">算法</div>
            <div class="text-gray-800">{{ selectedInvoice.algorithm || '-' }}</div>
          </div>
          <div>
            <div class="text-sm font-medium text-gray-700">标签</div>
            <div class="text-gray-800">{{ selectedInvoice.tags || '-' }}</div>
          </div>
          <div>
            <div class="text-sm font-medium text-gray-700">备注说明</div>
            <div class="text-gray-800">{{ selectedInvoice.notes || '-' }}</div>
          </div>
          <div>
            <div class="text-sm font-medium text-gray-700">创建日期</div>
            <div class="text-gray-800">{{ selectedInvoice.createDate || '-' }}</div>
          </div>
          <div>
            <div class="text-sm font-medium text-gray-700">版本</div>
            <div class="text-gray-800">{{ selectedInvoice.version || '-' }}</div>
          </div>
          <div>
            <div class="text-sm font-medium text-gray-700">状态</div>
            <div class="flex items-center gap-x-2">
              <span :class="getStatusClass(selectedInvoice.status)">{{ getStatusText(selectedInvoice.status) }}</span>
              <span class="text-sm text-gray-500">{{ selectedInvoice.status === 'active' ? '启用' : '禁用' }}</span>
            </div>
          </div>
          <div class="md:col-span-2">
            <div class="text-sm font-medium text-gray-700">总金额</div>
            <div class="text-lg font-bold text-gray-800">{{ selectedInvoice.totalAmount || '-' }}</div>
          </div>
          <div class="md:col-span-2">
            <div class="text-sm font-medium text-gray-700">支付方式</div>
            <div class="text-gray-800">{{ selectedInvoice.paymentMethod || '-' }}</div>
          </div>
        </div>
        <div class="flex justify-end mt-6 px-6">
          <button @click="closeDetailModal" class="btn btn-secondary">关闭</button>
        </div>
      </DialogContent>
    </Dialog>

    <!-- 新增弹窗 -->
    <!-- <Dialog open={isCreateModalOpen} on-open-change="closeCreateModal"> -->
    <Dialog :open="isCreateModalOpen" @open-change="closeCreateModal">
      <DialogTrigger asChild>
        <template #trigger></template>
      </DialogTrigger>
      <DialogContent class="w-full max-w-xl">
        <DialogHeader class="text-lg font-bold text-gray-800">新增密钥</DialogHeader>
        <DialogDescription class="mt-2 text-sm text-gray-500">填写密钥的详细信息</DialogDescription>
        <form @submit.prevent="createKey" class="mt-6 px-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">密钥别名</label>
            <Input
              type="text"
              v-model="newKey.keyAlias"
              placeholder="请输入密钥别名"
              class="mt-1 block w-full"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">算法类型</label>
            <div class="mt-2 grid grid-cols-3 gap-4">
              <Label>
                <Radio value="对称密钥" v-model="newKey.algorithm" class="mt-0" />
                <span class="ml-2">对称密钥</span>
              </Label>
              <Label>
                <Radio value="非对称密钥" v-model="newKey.algorithm" class="mt-0" />
                <span class="ml-2">非对称密钥</span>
              </Label>
              <Label>
                <Radio value="HMAC" v-model="newKey.algorithm" class="mt-0" />
                <span class="ml-2">HMAC</span>
              </Label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">标签</label>
            <Input
              type="text"
              v-model="newKey.tags"
              placeholder="请输入标签，多个标签用逗号分隔"
              class="mt-1 block w-full"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">备注说明</label>
            <Textarea
              v-model="newKey.notes"
              placeholder="请输入备注说明"
              class="mt-1 block w-full h-24"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">状态</label>
            <div class="mt-2 flex items-center gap-x-4">
              <Switch
                modelValue="active"
                :checked="newKey.status === 'active'"
                @on-change="(e) => newKey.status = e ? 'active' : 'inactive'"
              />
              <span class="text-sm text-gray-500">启用/禁用</span>
            </div>
          </div>

          <div class="flex justify-end mt-6">
            <button type="button" @click="closeCreateModal" class="btn btn-secondary">取消</button>
            <button type="submit" class="btn btn-primary ml-3">创建</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// 初始化数据（状态字段改为 status: 'active'/'inactive'）
const invoices = ref([
  {
    invoice: 'INV001',
    keyAlias: '订单支付密钥',
    algorithm: '对称密钥',
    tags: '支付,订单',
    notes: '用于订单支付加密',
    createDate: '2023-06-15',
    version: 'v1.0',
    status: 'active', // 状态字段
    totalAmount: '$250.00',
    paymentMethod: 'Credit Card',
  },
  // 其他数据...
]);

// 模态框状态
const isDetailModalOpen = ref(false);
const isCreateModalOpen = ref(false);
const selectedInvoice = ref<any>({});

// 新增表单数据
const newKey = ref({
  keyAlias: '',
  algorithm: '对称密钥',
  tags: '',
  notes: '',
  status: 'active', // 默认启用
});

// 状态样式映射
const getStatusClass = (status: string) => {
  return {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-red-100 text-red-800',
  }[status];
};

// 状态文本映射
const getStatusText = (status: string) => {
  return status === 'active' ? '启用' : '禁用';
};

// 切换状态
const toggleStatus = (invoice: any) => {
  invoice.status = invoice.status === 'active' ? 'inactive' : 'active';
  console.log(`密钥 ${invoice.invoice} 状态已更新为: ${invoice.status}`);
  // 这里可添加API调用保存状态
};

// 打开详情弹窗
const openDetailModal = (invoice: any) => {
  selectedInvoice.value = { ...invoice };
  isDetailModalOpen.value = true;
};

// 关闭详情弹窗
const closeDetailModal = () => {
  isDetailModalOpen.value = false;
};

// 关闭详情弹窗
const closeCreateModal = () => {
  isCreateModalOpen.value = false;
};

// 打开创建弹窗
const openCreateModal = () => {
  newKey.value = {
    keyAlias: '',
    algorithm: '对称密钥',
    tags: '',
    notes: '',
    status: 'active',
  };
  isCreateModalOpen.value = true;
};

// 创建新密钥
const createKey = () => {
  const newId = `INV${invoices.value.length + 101}`;
  const newInvoice = {
    invoice: newId,
    ...newKey.value,
    createDate: new Date().toISOString().split('T')[0],
    version: 'v1.0',
    totalAmount: '$0.00',
    paymentMethod: 'Credit Card',
  };
  invoices.value.unshift(newInvoice);
  closeCreateModal();
  alert('密钥创建成功！');
};
</script>

<style scoped>
/* 状态标签基础样式（依赖Shadcn-Vue的默认样式） */
/* :deep(.status-tag) {
  display: inline-flex;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 0.375rem;
} */
/* 修复表头与表体边框错位（若使用带边框的表格） */
:deep(.table-fixed) {
  table-layout: fixed; /* 强制固定列宽 */
}

:deep(.TableHead, .TableCell) {
  border-bottom-width: 1px; /* 统一边框样式 */
  border-color: #e5e7eb; /* 浅色边框 */
}
</style>