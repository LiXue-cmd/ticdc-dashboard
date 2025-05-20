<template>
  <div class="flex justify-between items-center mb-4">
    <Button variant="outline" @click="openCreateModal">
      <Icon name="i-lucide-plus" mode="svg" /> 新增主密钥
    </Button>
  </div>
  <div class="overflow-x-auto bg-white rounded-lg shadow-md">
    <Table class="min-w-full table-fixed">
      <TableHeader>
        <TableRow>
          <!-- 表头所有列添加 text-center 类名（操作列保持右对齐） -->
          <TableHead
            class="px-6 py-3 text-center text-sm font-semibold text-gray-500 w-24"
            >密钥ID</TableHead
          >
          <TableHead
            class="px-6 py-3 text-center text-sm font-semibold text-gray-500"
            >密钥别名</TableHead
          >
          
          <TableHead
            class="px-6 py-3 text-center text-sm font-semibold text-gray-500"
            >创建日期</TableHead
          ><TableHead
            class="px-6 py-3 text-center text-sm font-semibold text-gray-500"
            >更新日期</TableHead
          >
          <!-- 操作列保持右对齐（text-right） -->
          <TableHead
            class="px-6 py-3 text-right text-sm font-semibold text-gray-500"
            >操作</TableHead
          >
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow
          v-for="item in invoices"
          :key="item.invoice"
          class="hover:bg-gray-50"
        >
          <!-- 表体所有列添加 text-center 类名（操作列保持右对齐） -->
          <TableCell class="px-6 py-4 text-center font-medium">{{
            item.invoice
          }}</TableCell>
          <TableCell class="px-6 py-4 text-center font-medium">{{
            item.keyAlias || "-"
          }}</TableCell>
          <TableCell class="px-6 py-4 text-center font-medium">{{
            item.createDate || "-"
          }}</TableCell>
          <TableCell class="px-6 py-4 text-center font-medium">{{
            item.updateDate || "-"
          }}</TableCell>
          <!-- 操作列按钮保持右对齐 -->
          <TableCell class="px-6 py-4 text-right">
            <button
              @click="openDetailModal(item)"
              class="text-blue-600 hover:text-blue-800"
            >
              详情
            </button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
  <!-- 详情弹窗 @open-change="closeDetailModal" -->
  <Dialog :open="isDetailModalOpen">
    <DialogTrigger asChild>
      <template #trigger></template>
    </DialogTrigger>
    <DialogContent class="w-full max-w-2xl">
      <DialogTitle>查看详情</DialogTitle>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 px-6">
        <div>
          <div class="text-sm font-medium text-gray-700">密钥ID</div>
          <div class="text-gray-800">{{ selectedInvoice.invoice || "-" }}</div>
        </div>
        <div>
          <div class="text-sm font-medium text-gray-700">密钥别名</div>
          <div class="text-gray-800">{{ selectedInvoice.keyAlias || "-" }}</div>
        </div>
        <div>
          <div class="text-sm font-medium text-gray-700">算法</div>
          <div class="text-gray-800">
            {{ selectedInvoice.algorithm || "-" }}
          </div>
        </div>
        <div>
          <div class="text-sm font-medium text-gray-700">标签</div>
          <div class="text-gray-800">{{ selectedInvoice.tags || "-" }}</div>
        </div>
        <div>
          <div class="text-sm font-medium text-gray-700">备注说明</div>
          <div class="text-gray-800">{{ selectedInvoice.notes || "-" }}</div>
        </div>
        <div>
          <div class="text-sm font-medium text-gray-700">创建日期</div>
          <div class="text-gray-800">
            {{ selectedInvoice.createDate || "-" }}
          </div>
        </div>
        <div>
          <div class="text-sm font-medium text-gray-700">版本</div>
          <div class="text-gray-800">{{ selectedInvoice.version || "-" }}</div>
        </div>
        <div>
          <div class="text-sm font-medium text-gray-700">状态</div>
          <div class="flex items-center gap-x-2">
            <span :class="getStatusClass(selectedInvoice.status)">{{
              getStatusText(selectedInvoice.status)
            }}</span>
          </div>
        </div>
      </div>
      <div class="flex justify-end mt-6 px-6">
        <Button @click="closeDetailModal"> 关闭 </Button>
      </div>
    </DialogContent>
  </Dialog>

  <!-- 新增弹窗 @open-change="closeCreateModal" -->
  <Dialog :open="isCreateModalOpen">
    <DialogTrigger asChild>
      <template #trigger></template>
    </DialogTrigger>
    <DialogContent class="w-full max-w-xl">
      <DialogTitle class="text-lg font-bold text-gray-800"
        >新增主密钥</DialogTitle
      >
      <form class="mt-6 px-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >密钥别名</label
          >
          <Input
            type="text"
            v-model="newKey.keyAlias"
            placeholder="请输入密钥别名"
            class="mt-1 block w-full"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">算法</label>
          <Input
            type="text"
            v-model="newKey.algorithm"
            placeholder="请输入算法"
            class="mt-1 block w-full"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700"
            >密钥类型</label
          >
          <RadioGroup
            default-value="option-one"
            v-model="newKey.keyType"
            class="flex flex-row space-x-4"
          >
            <div class="flex items-center space-x-2">
              <RadioGroupItem id="option-one" value="option-one" />
              <Label for="option-one">对称密钥</Label>
            </div>
            <div class="flex items-center space-x-2">
              <RadioGroupItem id="option-two" value="option-two" />
              <Label for="option-two">非对称密钥</Label>
            </div>
            <div class="flex items-center space-x-2">
              <RadioGroupItem id="option-three" value="option-three" />
              <Label for="option-three">HMAC</Label>
            </div>
          </RadioGroup>
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
          <label class="block text-sm font-medium text-gray-700"
            >备注说明</label
          >
          <Textarea
            v-model="newKey.notes"
            placeholder="请输入备注说明"
            class="mt-1 block w-full h-24"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">版本</label>
          <Input
            type="text"
            v-model="newKey.version"
            placeholder="请输入版本"
            class="mt-1 block w-full"
          />
        </div>

        <div class="flex justify-end mt-6">
          <Button variant="outline" @click="closeCreateModal"> 取消 </Button>
          <Button type="button" style="margin-left: 10px" @click="createKey"
            >创建</Button
          >
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { useToast } from "@/components/ui/toast/use-toast";
const { toast } = useToast();
const invoices = ref([
  {
    invoice: "INV001",
    keyAlias: "订单支付密钥",
    createDate: "2023-06-15",
    updateDate: "2023-06-15",
  },
]);
// 模态框状态
const isDetailModalOpen = ref(false);
const isCreateModalOpen = ref(false);
const selectedInvoice = ref<any>({});

// 新增表单数据
const newKey = ref({
  keyAlias: "",
  algorithm: "",
  keyType: "对称密钥",
  tags: "",
  notes: "",
  version: "",
  status: "active", // 默认启用
});
// 状态样式映射
const getStatusClass = (status: string) => {
  return {
    active: "bg-green-100 text-green-800",
    inactive: "bg-red-100 text-red-800",
  }[status];
};

// 状态文本映射
const getStatusText = (status: string) => {
  return status === "active" ? "启用" : "禁用";
};

// 切换状态
const toggleStatus = (data: any) => {
  console.log("===", data);
  data.status = data.status === "active" ? "inactive" : "active";
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
    keyAlias: "",
    algorithm: "",
    keyType: "对称密钥",
    tags: "",
    notes: "",
    status: "active",
    version: "",    
  };
  isCreateModalOpen.value = true;
};

// 创建新密钥
const createKey = () => {
  const newId = `INV${invoices.value.length + 101}`;
  const newInvoice = {
    invoice: newId,
    ...newKey.value,
    createDate: new Date().toISOString().split("T")[0],
    // version: "v1.0",
  };
  console.log("newInvoice", newInvoice);
  invoices.value.unshift(newInvoice);
  closeCreateModal();
  toast({
    description: "创建成功！",
  });
};
</script>
