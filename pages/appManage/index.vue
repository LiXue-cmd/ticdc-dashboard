<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <!-- 页面标题栏 -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">应用管理</h2>
        <p class="text-muted-foreground">
          管理系统中所有应用，支持过滤、编辑和删除操作
        </p>
      </div>
    </div>

    <!-- 应用列表 -->
    <DataTable
      ref="dataTable"
      :columns="columns"
      :data="filteredTags"
      :filterColumns="filterColumns"
      :is-loading="isLoading"
      no-data-text="暂无应用数据"
      addTaskRoute="/appmanage/create"
      addTaskText="新增应用"
      :statusFilterField="'status'"
      :statusOptions="statusOptions"
      @batch-delete="handleBatchDelete"
    />

    <!-- 删除确认对话框 -->
    <Dialog :open="isDeleteModalOpen" @update:open="closeDeleteModal">
      <DialogContent class="w-80 -translate-x-1/2! -translate-y-1/2!">
        <DialogTitle class="text-lg font-medium">确认删除</DialogTitle>
        <DialogDescription class="mt-2 text-muted-foreground">
          确定要删除
          <strong class="text-gray-900">{{ deletingTag.name }}</strong>
          吗？<br />
          此操作不可撤销，且会影响关联的所有资源。
        </DialogDescription>

        <div class="mt-4 flex justify-end gap-2">
          <Button variant="outline" @click="closeDeleteModal"> 取消 </Button>
          <Button variant="destructive" @click="handleDeleteTag"> 删除 </Button>
        </div>
      </DialogContent>
    </Dialog>

    <!-- 批量删除确认对话框 -->
    <Dialog :open="isBatchDeleteModalOpen" @update:open="closeBatchDeleteModal">
      <DialogContent class="w-96 -translate-x-1/2! -translate-y-1/2!">
        <DialogTitle class="text-lg font-medium">确认批量删除</DialogTitle>
        <DialogDescription class="mt-2 text-muted-foreground">
          确定要删除选中的 <strong class="text-gray-900">{{ batchDeleteIds.length }}</strong> 个应用吗？<br />
          <span class="text-sm text-gray-600 mt-2 block">
            包括：{{ getBatchDeleteNames() }}
          </span><br />
          此操作不可撤销，且会影响关联的所有资源。
        </DialogDescription>

        <div class="mt-4 flex justify-end gap-2">
          <Button variant="outline" @click="closeBatchDeleteModal"> 取消 </Button>
          <Button variant="destructive" @click="confirmBatchDelete"> 
            删除 {{ batchDeleteIds.length }} 个应用
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <!-- 重置AppSecret确认对话框 -->
    <Dialog :open="isResetModalOpen" @update:open="closeResetModal">
      <DialogContent class="w-80 -translate-x-1/2! -translate-y-1/2!">
        <DialogTitle class="text-lg font-medium">确认重置</DialogTitle>
        <DialogDescription class="mt-2 text-muted-foreground">
          确定要重置
          <strong class="text-gray-900">{{ resettingApp.name }}</strong>
          的AppSecret吗？<br />
          此操作将生成新的密钥，原密钥立即失效。
        </DialogDescription>

        <div class="mt-4 flex justify-end gap-2">
          <Button variant="outline" @click="closeResetModal"> 取消 </Button>
          <Button @click="handleResetAppSecret"> 确认重置 </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useToast } from "@/components/ui/toast/use-toast";
import DataTable from "@/components/tasks/components/DataTable.vue";
import type { ColumnDef } from "@tanstack/vue-table";
import DataTableRowActions from "@/components/tasks/components/DataTableRowActions.vue";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogTitle 
} from "@/components/ui/dialog";
import { h } from "vue";
import { useFetch } from "#app";
import { useRouter } from "vue-router";

// 状态管理
const router = useRouter();
const { toast } = useToast();
const isLoading = ref(false);
const searchQuery = ref("");
const dataTable = ref<InstanceType<typeof DataTable> | null>(null); // 修复类型

const appmanage = ref<any[]>([
  {
    id: 1,
    name: "系统应用",
    description: "默认系统应用",
    createDate: "2023-01-01",
    updateDate: "2023-01-05",
    status: "active",
  },
  {
    id: 2,
    name: "用户应用",
    description: "用于用户分类",
    createDate: "2023-02-15",
    updateDate: "2023-02-20",
    status: "active",
  },
  {
    id: 3,
    name: "权限应用",
    description: "控制权限范围",
    createDate: "2023-03-10",
    updateDate: "2023-03-12",
    status: "inactive",
  },
]);

// 删除相关状态
const isDeleteModalOpen = ref(false);
const deletingTag = ref<any>({});

// 批量删除相关状态
const isBatchDeleteModalOpen = ref(false);
const batchDeleteIds = ref<any[]>([]);

// 重置AppSecret相关状态
const isResetModalOpen = ref(false);
const resettingApp = ref<any>({});

// 状态选项配置
const statusOptions = ref([
  { label: "启用", value: "active" },
  { label: "禁用", value: "inactive" }
]);

const filterColumns = ref([{ accessorKey: "name", header: "应用名称" }]);

// 计算属性：过滤后的数据
const filteredTags = computed(() => {
  return appmanage.value.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// 表格列定义
const columns: ColumnDef<any>[] = [
  {
    accessorKey: "id",
    header: "APPID",
    cell: ({ row }) => row.getValue("id") || "-",
    meta: {
      canSort: true,
      canHide: true,
    },
  },
  {
    accessorKey: "name",
    header: "应用名称",
    cell: ({ row }) => row.getValue("name") || "-",
    meta: {
      canSort: true,
    },
  },
  {
    accessorKey: "description",
    header: "描述",
    cell: ({ row }) => row.getValue("description") || "-",
    meta: {
      canSort: true,
      cellProps: { class: "max-w-[200px] overflow-ellipsis" },
    },
  },
  {
    accessorKey: "createDate",
    header: "创建日期",
    cell: ({ row }) => row.getValue("createDate") || "-",
    meta: {
      canSort: true,
      cellProps: { class: "w-28" },
    },
  },
  {
    accessorKey: "updateDate",
    header: "更新日期",
    cell: ({ row }) => row.getValue("updateDate") || "-",
    meta: {
      canSort: true,
      cellProps: { class: "w-28" },
    },
  },
  {
    accessorKey: "status",
    header: "状态",
    cell: ({ row }) => {
      const status = row.getValue("status");
      return h(
        Badge,
        {
          variant: "outline",
          class:
            status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800",
        },
        () => (status === "active" ? "启用" : "禁用")
      );
    },
    meta: {
      canSort: true,
      canHide: true,
    },
  },
  {
    id: "actions",
    header: "操作",
    cell: ({ row }) => {
      const actions = [
        {
          type: "action",
          label: "编辑",
          icon: "i-radix-icons-edit",
          onClick: (tag: any) => editTag(tag.id),
          variant: "outline",
        },
        // 根据当前状态显示启用或禁用按钮
        row.getValue("status") === "active"
          ? {
              type: "action",
              label: "禁用",
              icon: "i-radix-icons-toggle-off",
              onClick: (task: any) => updateStatus(task, "inactive"),
              class: "text-red-600 hover:bg-red-50",
            }
          : {
              type: "action",
              label: "启用",
              icon: "i-radix-icons-toggle-on",
              onClick: (task: any) => updateStatus(task, "active"),
              class: "text-green-600 hover:bg-green-50",
            },
        {
          type: "action",
          label: "重置AppSecret",
          icon: "i-radix-icons-key",
          onClick: (tag: any) => showResetConfirm(tag),
          variant: "outline",
        },
        {
          type: "action",
          label: "删除",
          icon: "i-radix-icons-trash",
          onClick: (tag: any) => showDeleteConfirm(tag),
          variant: "destructive",
        },
      ];

      return h(DataTableRowActions, {
        row,
        actions,
        iconName: "i-radix-icons-dots-horizontal",
      });
    },
    meta: {
      canHide: true,
    },
  },
];

// 生命周期钩子
onMounted(() => {
  loadTags();
});

// 数据加载
async function loadTags() {
  isLoading.value = true;
  try {
    // 注释掉API调用，使用模拟数据
    // const { data } = await useFetch("/api/appmanage");
    // if (data.value) {
    //   appmanage.value = data.value;
    // }
    
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 500));
  } catch (error) {
    toast({
      title: "加载失败",
      description: "获取应用列表时出错",
      variant: "destructive",
    });
  } finally {
    isLoading.value = false;
  }
}

// 新增/编辑页面跳转
const editTag = (id: number) => {
  router.push(`/appmanage/edit/${id}`);
};

// 删除流程
const showDeleteConfirm = (tag: any) => {
  deletingTag.value = tag;
  isDeleteModalOpen.value = true;
};

const closeDeleteModal = (open?: boolean) => {
  isDeleteModalOpen.value = typeof open === 'boolean' ? open : false;
  deletingTag.value = {};
};

const handleDeleteTag = async () => {
  const { id } = deletingTag.value;
  if (!id) return;

  try {
    // 注释掉API调用，使用模拟删除
    // const { error } = await useFetch(`/api/appmanage/${id}`, {
    //   method: "DELETE",
    // });

    // 模拟删除成功
    appmanage.value = appmanage.value.filter((tag) => tag.id !== id);
    toast({
      description: "应用已成功删除！",
      variant: "default",
    });
    closeDeleteModal();
  } catch (error) {
    console.error("删除失败:", error);
    toast({
      title: "系统错误",
      description: "处理删除请求时发生未知错误",
      variant: "destructive",
    });
  }
};

// 批量删除流程
const handleBatchDelete = (selectedIds: any[]) => {
  if (selectedIds.length === 0) {
    toast({
      title: "提示",
      description: "请选择要删除的应用",
      variant: "default",
    });
    return;
  }
  batchDeleteIds.value = selectedIds;
  isBatchDeleteModalOpen.value = true;
};

const closeBatchDeleteModal = () => {
  isBatchDeleteModalOpen.value = false;
  batchDeleteIds.value = [];
};

const getBatchDeleteNames = () => {
  const names = batchDeleteIds.value
    .map(id => {
      const app = appmanage.value.find(item => item.id === id);
      return app?.name;
    })
    .filter(name => name)
    .slice(0, 3);
  
  const result = names.join('、');
  if (batchDeleteIds.value.length > 3) {
    return result + ' 等';
  }
  return result;
};

const confirmBatchDelete = async () => {
  try {
    // 模拟批量删除成功
    appmanage.value = appmanage.value.filter(
      (app) => !batchDeleteIds.value.includes(app.id)
    );

    toast({
      description: `成功删除 ${batchDeleteIds.value.length} 个应用！`,
      variant: "default",
    });

    // 清空选择状态
    if (dataTable.value) {
      dataTable.value.clearSelection();
    }

    closeBatchDeleteModal();
  } catch (error) {
    console.error("批量删除失败:", error);
    toast({
      title: "删除失败",
      description: "批量删除时发生错误",
      variant: "destructive",
    });
  }
};

// 重置AppSecret流程
const showResetConfirm = (app: any) => {
  resettingApp.value = app;
  isResetModalOpen.value = true;
};

const closeResetModal = () => {
  isResetModalOpen.value = false;
  resettingApp.value = {};
};

const handleResetAppSecret = () => {
  const { id } = resettingApp.value;
  if (!id) return;

  // 模拟重置逻辑
  appmanage.value = appmanage.value.map((app) =>
    app.id === id ? { ...app, appSecret: generateNewSecret() } : app
  );

  toast({
    title: "重置成功",
    description: "AppSecret已更新，请立即保存新密钥！",
    variant: "default",
  });
  closeResetModal();
};

// 模拟生成新密钥
const generateNewSecret = () => {
  return `APPSECRET-${Math.random().toString(36).substr(2, 16)}`;
};

const updateStatus = (task: any, targetStatus: string) => {
  const index = appmanage.value.findIndex(
    (item) => item.id === task.id
  );
  if (index === -1) {
    console.error("未找到对应的应用记录");
    return;
  }

  const newTask = {
    ...task,
    status: targetStatus,
  };

  appmanage.value = [
    ...appmanage.value.slice(0, index),
    newTask,
    ...appmanage.value.slice(index + 1),
  ];

  toast({
    description: `应用状态已更新为${targetStatus === 'active' ? '启用' : '禁用'}！`,
    variant: "default",
  });
};
</script>

<style scoped>
.max-w-[200px] {
  max-width: 200px;
}

.overflow-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>