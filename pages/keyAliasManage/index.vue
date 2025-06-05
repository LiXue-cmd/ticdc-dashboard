<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">密钥别名管理</h2>
        <p class="text-muted-foreground">这里是密钥别名管理的描述</p>
      </div>
    </div>
    <DataTable
      :columns="columns"
      :data="keyaliasmanage"
      :filterColumns="filterColumns"
      addTaskRoute="/keyaliasmanage/create"
      addTaskText="新增密钥别名"
    />
     <!-- 删除确认对话框 -->
    <Dialog :open="isDeleteModalOpen" on-close="closeDeleteModal">
      <DialogContent class="w-80 -translate-x-1/2! -translate-y-1/2!">
        <DialogTitle class="text-lg font-medium">确认删除</DialogTitle>
        <DialogDescription class="mt-2 text-muted-foreground">
          确定要删除 <strong class="text-gray-900">{{ deletingItem.keyAlias }}</strong> 吗？<br />
          此操作不可撤销，且会同时删除关联的所有密钥。
        </DialogDescription>

        <div class="mt-4 flex justify-end gap-2">
          <Button variant="outline" @click="closeDeleteModal">
            取消
          </Button>
          <Button variant="destructive" @click="handleConfirmDelete">
            删除
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useToast } from "@/components/ui/toast/use-toast";
import DataTable from "@/components/tasks/components/DataTable.vue";
import type { ColumnDef } from "@tanstack/vue-table";
import { h } from "vue";
import { useFetch } from "#app";
import DataTableRowActions from "@/components/tasks/components/DataTableRowActions.vue";
import { useRouter } from "vue-router";

const router = useRouter();
const { toast } = useToast();
// 删除相关状态
const isDeleteModalOpen = ref(false);
const deletingItem = ref<any>({}); // 当前正在删除的项

const filterColumns = ref([
  { accessorKey: "keyAlias", header: "密钥别名" },
]);
const keyaliasmanage = ref<any[]>([
  {
    invoice: "MK-2023001",
    keyAlias: "系统默认密钥",
    createDate: "2023-06-15",
    updateDate: "2023-06-15",
  },
  {
    invoice: "MK-2023002",
    keyAlias: "用户数据加密",
    createDate: "2023-07-22",
    updateDate: "2023-06-15",
  },
  {
    invoice: "MK-2023003",
    keyAlias: "API签名密钥",
    createDate: "2023-08-05",
    updateDate: "2023-06-15",
  },
  {
    invoice: "MK-2023004",
    keyAlias: "支付系统密钥",
    createDate: "2023-09-10",
    updateDate: "2023-06-15",
  },
  {
    invoice: "MK-2023005",
    keyAlias: "日志加密密钥",
    createDate: "2023-10-15",
    updateDate: "2023-06-15",
  },
]);

const columns: ColumnDef<any>[] = [
  {
    accessorKey: "invoice",
    header: "密钥ID",
    cell: ({ row }) => h("div", { class: "w-40" }, row.getValue("invoice")),
    // 允许排序和隐藏
    canSort: true,
    canHide: true,
  },
  {
    accessorKey: "keyAlias",
    header: "密钥别名",
    cell: ({ row }) => row.getValue("keyAlias") || "-",
    canSort: true,
    canHide: true,
  },
  {
    accessorKey: "createDate",
    header: "创建日期",
    cell: ({ row }) => row.getValue("createDate") || "-",
    canSort: true, // 支持按日期排序
    canHide: true,
  },
  {
    accessorKey: "updateDate",
    header: "更新日期",
    cell: ({ row }) => row.getValue("updateDate") || "-",
    canSort: true, // 支持按日期排序
    canHide: true,
  },
  {
    id: "actions",
    header: "操作",
    cell: ({ row }) => {
      // 动态生成操作项
      const actions = [
        {
          type: "action",
          label: "关联密钥",
          icon: "i-radix-icons-edit",
          onClick: (task) => openEditModal(task.invoice), // 添加编辑功能
        },
        {
          type: "action",
          label: "删除",
          icon: "i-radix-icons-trash",
          onClick: (task) => handleDeleteRequest(task),
          variant: "destructive",
        },
      ];

      return h(DataTableRowActions, {
        row,
        actions,
        iconName: "i-radix-icons-dots-horizontal",
      });
    },
    canHide: true,
  },
];

async function loadMasterKeys() {
  const { data: feeds } = await useFetch("/api/cdc/keyaliasmanage");
  if (feeds.value) {
    keyaliasmanage.value = feeds.value;
  }
  console.debug("keyaliasmanage", keyaliasmanage.value);
}

onMounted(async () => {
  await loadMasterKeys();
});

// 关联密钥
const openEditModal = (invoice: any) => {
  // 这里可以添加打开详情弹窗的逻辑
  console.log("Open detail modal for", invoice);
  router.push(`/keyaliasmanage/association/${invoice}`);
  // router.push({ name: 'keyaliasmanage/association', params: { id: invoice } });
};

// 打开删除确认弹窗
function handleDeleteRequest(task: any) {
  deletingItem.value = task;
  isDeleteModalOpen.value = true;
}

// 关闭删除弹窗
function closeDeleteModal() {
  isDeleteModalOpen.value = false;
  deletingItem.value = {};
}

// 确认删除操作
async function handleConfirmDelete() {
  const { invoice } = deletingItem.value;
  if (!invoice) return;

  try {
    const { error } = await useFetch(`/api/cdc/deleteMasterKey/${invoice}`, {
      method: "DELETE",
    });

    if (error?.value) {
      toast({
        title: "删除失败",
        description: `错误信息: ${error.value.statusMessage}`,
        variant: "destructive",
      });
    } else {
      keyaliasmanage.value = keyaliasmanage.value.filter(
        (item) => item.invoice !== invoice
      );
      toast({
        description: "密钥别名已成功删除！",
        variant: "default",
      });
      closeDeleteModal();
    }
  } catch (error) {
    console.error("删除失败:", error);
    toast({
      title: "删除失败",
      description: "处理删除请求时发生错误",
      variant: "destructive",
    });
  }
}

// 模拟关闭创建模态框的函数
const closeCreateModal = () => {
  // 实际项目中需要实现关闭模态框的逻辑
  console.log("Close create modal");
};
</script>

<style scoped></style>    