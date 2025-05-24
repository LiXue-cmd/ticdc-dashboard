<template>
  <div class="flex justify-between items-center mb-4">
    <Button variant="outline" @click="openModal('create')">
      <Icon name="i-lucide-plus" mode="svg" /> 新增应用
    </Button>
  </div>

  <div class="overflow-x-auto bg-white rounded-lg shadow-md">
    <Table class="min-w-full table-fixed">
      <TableHeader>
        <TableRow>
          <TableHead class="px-6 py-3 text-center text-sm font-semibold text-gray-500 w-24">AppID</TableHead>
          <TableHead class="px-6 py-3 text-center text-sm font-semibold text-gray-500">应用名称</TableHead>
          <TableHead class="px-6 py-3 text-center text-sm font-semibold text-gray-500">描述</TableHead>
          <TableHead class="px-6 py-3 text-center text-sm font-semibold text-gray-500">创建日期</TableHead>
          <TableHead class="px-6 py-3 text-center text-sm font-semibold text-gray-500">更新日期</TableHead>
          <TableHead class="px-6 py-3 text-center text-sm font-semibold text-gray-500">状态</TableHead>
          <TableHead class="px-6 py-3 text-right text-sm font-semibold text-gray-500">操作</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow
          v-for="item in apps"
          :key="item.appId"
          class="hover:bg-gray-50"
        >
          <TableCell class="px-6 py-4 text-center font-medium">{{ item.appId }}</TableCell>
          <TableCell class="px-6 py-4 text-center font-medium">{{ item.appName || "-" }}</TableCell>
          <TableCell class="px-6 py-4 text-center font-medium">{{ item.description || "-" }}</TableCell>
          <TableCell class="px-6 py-4 text-center font-medium">{{ item.createDate || "-" }}</TableCell>
          <TableCell class="px-6 py-4 text-center font-medium">{{ item.updateDate || "-" }}</TableCell>
          <TableCell class="px-6 py-4 text-center">
            <Switch
              :checked="item.status === 'active'"
              @update:checked="toggleStatus(item)"
            />
          </TableCell>
          <TableCell class="px-6 py-4 text-right space-x-2 flex items-center justify-end">
            <button @click="openModal('edit', item)" class="text-blue-600 hover:text-blue-800">编辑</button>
            <button @click="resetAppSecret(item)" class="text-yellow-600 hover:text-yellow-800">重置AppSecret</button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>

  <!-- 通用操作弹窗 -->
  <Dialog :open="isModalOpen">
    <DialogTrigger asChild>
      <template #trigger></template>
    </DialogTrigger>
    <DialogContent class="w-full max-w-xl">
      <DialogTitle class="text-lg font-bold text-gray-800">
        {{ modalType === 'create' ? '新增应用' : '编辑应用' }}
      </DialogTitle>
      <form class="mt-6 px-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">AppID</label>
          <Input
            type="text"
            v-model="formData.appId"
            placeholder="请输入AppID"
            class="mt-1 block w-full"
            :disabled="modalType === 'edit'"
            :required="modalType === 'create'"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">应用名称</label>
          <Input
            type="text"
            v-model="formData.appName"
            placeholder="请输入应用名称"
            class="mt-1 block w-full"
            :required="true"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">描述</label>
          <Textarea
            v-model="formData.description"
            placeholder="请输入描述"
            class="mt-1 block w-full h-24"
          />
        </div>

        <div class="flex justify-end mt-6">
          <Button variant="outline" @click="closeModal" class="mr-2">取消</Button>
          <Button
            :type="modalType === 'create' ? 'primary' : 'secondary'"
            @click="handleSubmit"
          >
            {{ modalType === 'create' ? '创建' : '保存' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { toast } from "@/components/ui/toast";

// 模拟数据
const apps = ref([
  {
    appId: "APP001",
    appName: "支付系统",
    description: "用于在线支付业务",
    createDate: "2023-06-15",
    updateDate: "2023-06-20",
    status: "active",
  },
]);

// 弹窗状态
const isModalOpen = ref(false);
const modalType = ref<'create' | 'edit'>('create');
const formData = ref({
  appId: '',
  appName: '',
  description: '',
});

// 状态切换
const toggleStatus = (item: any) => {
  item.status = item.status === 'active' ? 'inactive' : 'active';
  item.updateDate = new Date().toISOString().split("T")[0];
  toast({
    description: `状态已更新为 ${item.status}`,
    variant: item.status === 'active' ? 'success' : 'destructive',
  });
};

// 打开弹窗
const openModal = (type: 'create' | 'edit', item?: any) => {
  modalType.value = type;
  if (type === 'edit' && item) {
    formData.value = { ...item }; // 填充编辑数据
  } else {
    formData.value = {
      appId: '',
      appName: '',
      description: '',
    }; // 重置新增数据
  }
  isModalOpen.value = true;
};

// 提交表单
const handleSubmit = () => {
  if (modalType.value === 'create') {
    // 新增逻辑
    const newApp = {
      ...formData.value,
      createDate: new Date().toISOString().split("T")[0],
      updateDate: '',
      status: 'active', // 默认启用状态
    };
    apps.value.unshift(newApp);
    toast({ description: "创建成功！", variant: "success" });
  } else {
    // 编辑逻辑
    const itemToUpdate = apps.value.find(item => item.appId === formData.value.appId);
    if (itemToUpdate) {
      Object.assign(itemToUpdate, formData.value);
      itemToUpdate.updateDate = new Date().toISOString().split("T")[0];
      toast({ description: "保存成功！", variant: "info" });
    }
  }
  closeModal();
};

// 关闭弹窗
const closeModal = () => {
  isModalOpen.value = false;
  formData.value = {};
};

// 重置AppSecret功能（示例：模拟生成新密钥）
const resetAppSecret = (item: any) => {
  const newSecret = generateSecret();
  toast({
    description: `AppSecret已重置为：${newSecret}`,
    variant: "warning",
    duration: 5000, // 延长提示显示时间
  });
};

// 模拟生成随机密钥
const generateSecret = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
</script>