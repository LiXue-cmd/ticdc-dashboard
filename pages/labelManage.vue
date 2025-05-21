<template>
  <div class="flex justify-between items-center mb-4">
    <Button variant="outline" @click="openModal('create')">
      <Icon name="i-lucide-plus" mode="svg" /> 新增标签
    </Button>
  </div>

  <div class="overflow-x-auto bg-white rounded-lg shadow-md">
    <Table class="min-w-full table-fixed">
      <TableHeader>
        <TableRow>
          <TableHead
            class="px-6 py-3 text-center text-sm font-semibold text-gray-500 w-24"
            >ID</TableHead
          >
          <TableHead
            class="px-6 py-3 text-center text-sm font-semibold text-gray-500"
            >名称</TableHead
          >
          <TableHead
            class="px-6 py-3 text-center text-sm font-semibold text-gray-500"
            >描述</TableHead
          >
          <TableHead
            class="px-6 py-3 text-center text-sm font-semibold text-gray-500"
            >创建日期</TableHead
          >
          <TableHead
            class="px-6 py-3 text-center text-sm font-semibold text-gray-500"
            >更新日期</TableHead
          >
          <TableHead
            class="px-6 py-3 text-right text-sm font-semibold text-gray-500"
            >操作</TableHead
          >
        </TableRow>
      </TableHeader>

      <TableBody>
        <!-- 使用分页后的数据渲染 -->
        <TableRow
          v-for="item in invoices"
          :key="item.invoice"
          class="hover:bg-gray-50"
        >
          <TableCell class="px-6 py-4 text-center font-medium">{{
            item.invoice
          }}</TableCell>
          <TableCell class="px-6 py-4 text-center font-medium">{{
            item.keyAlias || "-"
          }}</TableCell>
          <TableCell class="px-6 py-4 text-center font-medium">{{
            item.notes || "-"
          }}</TableCell>
          <TableCell class="px-6 py-4 text-center font-medium">{{
            item.createDate || "-"
          }}</TableCell>
          <TableCell class="px-6 py-4 text-center font-medium">{{
            item.updateDate || "-"
          }}</TableCell>
          <TableCell
            class="px-6 py-4 text-right space-x-2 flex items-center justify-end"
          >
            <button
              @click="openModal('edit', item)"
              class="text-blue-600 hover:text-blue-800"
            >
              编辑
            </button>
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

  <!-- 新增/编辑弹窗 -->
  <Dialog :open="isModalOpen">
    <DialogTrigger asChild>
      <template #trigger></template>
    </DialogTrigger>
    <DialogContent class="w-full max-w-xl">
      <DialogTitle class="text-lg font-bold text-gray-800">
        {{ modalType === "create" ? "新增标签" : "编辑标签" }}
      </DialogTitle>
      <form @submit.prevent class="mt-6 px-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">名称</label>
          <Input
            type="text"
            v-model="formData.keyAlias"
            placeholder="请输入名称"
            class="mt-1 block w-full"
            :required="modalType === 'create'"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">描述</label>
          <Textarea
            v-model="formData.notes"
            placeholder="请输入描述"
            class="mt-1 block w-full h-24"
          />
        </div>
        <div class="flex justify-end mt-6">
          <Button variant="outline" @click="closeModal" class="mr-2"
            >取消</Button
          >
          <Button
            :type="modalType === 'create' ? 'primary' : 'secondary'"
            @click="handleSubmit"
          >
            {{ modalType === "create" ? "创建" : "保存" }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>

  <!-- 删除确认弹窗 -->
  <Dialog :open="isDeleteConfirmOpen">
    <DialogTrigger asChild>
      <template #trigger></template>
    </DialogTrigger>
    <DialogContent class="w-full max-w-md">
      <DialogTitle class="text-lg font-bold text-gray-800"
        >删除确认</DialogTitle
      >
      <div class="px-6 py-4 text-gray-700">
        确认删除密钥
        <span class="font-medium">{{ deletingItem.keyAlias || "-" }}</span> 吗？
      </div>
      <div class="flex justify-end mt-6 px-6">
        <Button variant="outline" @click="cancelDelete" class="mr-2"
          >取消</Button
        >
        <Button type="destructive" @click="handleDelete">删除</Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useToast } from "@/components/ui/toast/use-toast";

const { toast } = useToast();

// 模拟数据（增加更多条目用于分页测试）
const invoices = ref([
  {
    invoice: "INV001",
    keyAlias: "标签1",
    notes: "描述1",
    createDate: "2023-06-15",
    updateDate: "2023-06-15",
  },
  {
    invoice: "INV002",
    keyAlias: "标签2",
    notes: "描述2",
    createDate: "2023-06-16",
    updateDate: "2023-06-16",
  },
  {
    invoice: "INV003",
    keyAlias: "标签3",
    notes: "描述3",
    createDate: "2023-06-17",
    updateDate: "2023-06-17",
  },
  {
    invoice: "INV004",
    keyAlias: "标签4",
    notes: "描述4",
    createDate: "2023-06-18",
    updateDate: "2023-06-18",
  },
  {
    invoice: "INV005",
    keyAlias: "标签5",
    notes: "描述5",
    createDate: "2023-06-19",
    updateDate: "2023-06-19",
  },
  {
    invoice: "INV006",
    keyAlias: "标签6",
    notes: "描述6",
    createDate: "2023-06-20",
    updateDate: "2023-06-20",
  },
]);

// 新增、编辑、删除逻辑保持不变，数据更新后自动触发分页重新计算
const isModalOpen = ref(false);
const modalType = ref<string>("create");
const formData = ref({ keyAlias: "", notes: "" });

const openModal = (type: "create" | "edit", item?: any) => {
  modalType.value = type;
  formData.value = item ? { ...item } : { keyAlias: "", notes: "" };
  isModalOpen.value = true;
};

const handleSubmit = () => {
  if (modalType.value === "create") {
    const newId = `INV${invoices.value.length + 101}`;
    invoices.value.unshift({
      invoice: newId,
      ...formData.value,
      createDate: new Date().toISOString().split("T")[0],
      updateDate: "",
    });
    toast({ description: "创建成功！", variant: "success" });
  } else {
    const itemToUpdate = invoices.value.find(
      (item) => item.invoice === formData.value.invoice
    );
    if (itemToUpdate) {
      Object.assign(itemToUpdate, formData.value);
      itemToUpdate.updateDate = new Date().toISOString().split("T")[0];
      toast({ description: "保存成功！", variant: "info" });
    }
  }
  closeModal();
};

const closeModal = () => {
  isModalOpen.value = false;
  formData.value = {};
};

// 删除逻辑
const isDeleteConfirmOpen = ref(false);
const deletingItem = ref({});

const confirmDelete = (item) => {
  deletingItem.value = item;
  isDeleteConfirmOpen.value = true;
};

const handleDelete = () => {
  invoices.value = invoices.value.filter(
    (item) => item.invoice !== deletingItem.value.invoice
  );
  closeDeleteConfirm();
  toast({ description: "删除成功！", variant: "destructive" });
};

const closeDeleteConfirm = () => {
  isDeleteConfirmOpen.value = false;
};
</script>
