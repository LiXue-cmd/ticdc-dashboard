<template>
  <div class="flex justify-between items-center mb-4">
    <Button variant="outline" @click="openCreateModal">
      <Icon name="i-lucide-plus" mode="svg" /> 新增密钥别名
    </Button>
  </div>
  <div class="overflow-x-auto bg-white rounded-lg shadow-md">
    <Table class="min-w-full table-fixed">
      <TableHeader>
        <TableRow>
          <TableHead class="px-6 py-3 text-center text-sm font-semibold text-gray-500 w-24">密钥ID</TableHead>
          <TableHead class="px-6 py-3 text-center text-sm font-semibold text-gray-500">密钥别名</TableHead>
          <TableHead class="px-6 py-3 text-center text-sm font-semibold text-gray-500">创建日期</TableHead>
          <TableHead class="px-6 py-3 text-center text-sm font-semibold text-gray-500">更新日期</TableHead>
          <TableHead class="px-6 py-3 text-right text-sm font-semibold text-gray-500">操作</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow
          v-for="item in invoices"
          :key="item.invoice"
          class="hover:bg-gray-50"
        >
          <TableCell class="px-6 py-4 text-center font-medium">{{ item.invoice }}</TableCell>
          <TableCell class="px-6 py-4 text-center font-medium">{{ item.keyAlias || "-" }}</TableCell>
          <TableCell class="px-6 py-4 text-center font-medium">{{ item.createDate || "-" }}</TableCell>
          <TableCell class="px-6 py-4 text-center font-medium">{{ item.updateDate || "-" }}</TableCell>
          <TableCell class="px-6 py-4 text-right">
            <button @click="openAssociateModal(item)"
              class="text-blue-600 hover:text-blue-800 mr-2">关联密码</button>
            <button
              @click="confirmDelete(item)"
              class="text-red-600 hover:text-red-800"
            >
              删除
            </button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>

  <!-- 新增弹窗（仅密码别名） -->
  <Dialog :open="isCreateModalOpen" @open-change="closeCreateModal">
    <DialogTrigger asChild>
      <template #trigger></template>
    </DialogTrigger>
    <DialogContent class="w-full max-w-md">
      <DialogTitle class="text-lg font-bold text-gray-800">新增密钥别名</DialogTitle>
      <form @submit.prevent class="mt-6 px-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">密钥别名</label>
          <Input
            type="text"
            v-model="newKeyAlias"
            placeholder="请输入密钥别名"
            class="mt-1 block w-full"
            required
          />
        </div>
        <div class="flex justify-end mt-6">
          <Button variant="outline" @click="closeCreateModal" class="mr-2">取消</Button>
          <Button type="primary" @click="handleCreate">创建</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>

  <!-- 关联密码弹窗（穿梭框） -->
  <Dialog :open="isAssociateModalOpen" @open-change="closeAssociateModal">
    <DialogTrigger asChild>
      <template #trigger></template>
    </DialogTrigger>
    <DialogContent class="w-full max-w-3xl">
      <DialogTitle class="text-lg font-bold text-gray-800">关联密码</DialogTitle>
      <Transfer
        :availablePasswords="availablePasswords"
        :selectedPasswords="currentSelectedPasswords"
        @update:selectedPasswords="updateSelectedPasswords"
        class="px-6 py-4"
      />
      <div class="flex justify-end mt-6 px-6">
        <Button variant="outline" @click="closeAssociateModal" class="mr-2">取消</Button>
        <Button type="primary" @click="saveAssociations">保存</Button>
      </div>
    </DialogContent>
  </Dialog>

  <!-- 删除确认提示框 -->
  <Dialog :open="isDeleteConfirmOpen">
    <DialogTrigger asChild>
      <template #trigger></template>
    </DialogTrigger>
    <DialogContent class="w-full max-w-md">
      <DialogTitle class="text-lg font-bold text-gray-800">删除确认</DialogTitle>
      <div class="px-6 py-4 text-gray-700">
        确认删除密钥 <span class="font-medium">{{ deletingItem?.keyAlias || "-" }}</span> 吗？
      </div>
      <div class="flex justify-end mt-6 px-6">
        <Button variant="outline" @click="cancelDelete" class="mr-2">取消</Button>
        <Button type="destructive" @click="handleDelete">删除</Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useToast } from "@/components/ui/toast/use-toast";
import Transfer from "./Transfer.vue"; // 穿梭框组件

const { toast } = useToast();

// 模拟数据
const invoices = ref([
  {
    invoice: "INV001",
    keyAlias: "订单支付密钥",
    createDate: "2023-06-15",
    updateDate: "2023-06-15",
    passwords: [] // 关联的密码ID列表
  },
]);

// 新增弹框状态及数据
const isCreateModalOpen = ref(false);
const newKeyAlias = ref("");

// 关联密码弹框状态
const isAssociateModalOpen = ref(false);
const currentItem = ref(null);
const availablePasswords = ref([ // 模拟可用密码列表
  { id: "PWD001", alias: "用户支付密码" },
  { id: "PWD002", alias: "API访问密码" },
  { id: "PWD003", alias: "数据库密码" },
]);
const currentSelectedPasswords = ref<string[]>([]);

// 删除确认状态
const isDeleteConfirmOpen = ref(false);
const deletingItem = ref(null);

// 打开新增弹框
const openCreateModal = () => {
  newKeyAlias.value = "";
  isCreateModalOpen.value = true;
};

// 处理新增
const handleCreate = () => {
  const newId = `INV${invoices.value.length + 101}`;
  invoices.value.unshift({
    invoice: newId,
    keyAlias: newKeyAlias.value,
    createDate: new Date().toISOString().split("T")[0],
    updateDate: "",
    passwords: []
  });
  closeCreateModal();
  toast({ description: "新增成功！" });
};

// 打开关联密码弹框
const openAssociateModal = (item) => {
  currentItem.value = item;
  currentSelectedPasswords.value = [...item.passwords];
  isAssociateModalOpen.value = true;
};

// 更新选中密码
const updateSelectedPasswords = (ids) => {
  currentSelectedPasswords.value = ids;
};

// 保存关联
const saveAssociations = () => {
  if (!currentItem.value) return;
  currentItem.value.passwords = currentSelectedPasswords.value;
  currentItem.value.updateDate = new Date().toISOString().split("T")[0];
  closeAssociateModal();
  toast({ description: "关联成功！" });
};

// 打开删除确认
const confirmDelete = (item) => {
  deletingItem.value = item;
  isDeleteConfirmOpen.value = true;
};

// 处理删除
const handleDelete = () => {
  if (!deletingItem.value) return;
  invoices.value = invoices.value.filter(item => item.invoice !== deletingItem.value.invoice);
  closeDeleteConfirm();
  toast({ 
    description: "删除成功！",
    variant: "destructive"
  });
};

// 取消删除
const cancelDelete = () => {
  closeDeleteConfirm();
};

// 关闭弹框方法
const closeCreateModal = () => {
  isCreateModalOpen.value = false;
};

const closeAssociateModal = () => {
  isAssociateModalOpen.value = false;
  currentItem.value = null;
};

const closeDeleteConfirm = () => {
  isDeleteConfirmOpen.value = false;
  deletingItem.value = null;
};
</script>