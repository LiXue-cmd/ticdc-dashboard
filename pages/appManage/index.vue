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
      :columns="columns"
      :data="filteredTags"
      :filterColumns="filterColumns"
      :is-loading="isLoading"
      no-data-text="暂无应用数据"
      addTaskRoute="/appManage/create"
      addTaskText="新增应用"
    />

    <!-- 删除确认对话框 -->
    <Dialog :open="isDeleteModalOpen" on-close="closeDeleteModal">
      <DialogContent class="w-80">
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

    <!-- 重置AppSecret确认对话框 -->
    <Dialog :open="isResetModalOpen" on-close="closeResetModal">
      <DialogContent class="w-80">
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
import { h } from "vue";
import { useFetch } from "#app";
import { useRouter } from "vue-router";

// 状态管理
const router = useRouter();
const { toast } = useToast();
const isLoading = ref(false);
const searchQuery = ref("");
const appManage = ref<any[]>([
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
    status: "active",
  },
]);

// 删除相关状态
const isDeleteModalOpen = ref(false);
const deletingTag = ref<any>({});

// 重置AppSecret相关状态
const isResetModalOpen = ref(false);
const resettingApp = ref<any>({});

const filterColumns = ref([{ accessorKey: "name", header: "应用名称" }]);

// 计算属性：过滤后的数据
const filteredTags = computed(() => {
  return appManage.value.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// 表格列定义
const columns: ColumnDef<any>[] = [
  {
    accessorKey: "id",
    header: "APPID",
    cell: ({ row }) => row.getValue("id") || "-",
    canSort: true,
    canHide: true,
  },
  {
    accessorKey: "name",
    header: "应用名称",
    cell: ({ row }) => row.getValue("name") || "-",
    canSort: true,
  },
  {
    accessorKey: "description",
    header: "描述",
    cell: ({ row }) => row.getValue("description") || "-",
    canSort: true,
    cellProps: { class: "max-w-[200px] overflow-ellipsis" }, // 限制描述宽度
  },
  {
    accessorKey: "createDate",
    header: "创建日期",
    cell: ({ row }) => row.getValue("createDate") || "-",
    canSort: true,
    cellProps: { class: "w-28" },
  },
  {
    accessorKey: "updateDate",
    header: "更新日期",
    cell: ({ row }) => row.getValue("updateDate") || "-",
    canSort: true,
    cellProps: { class: "w-28" },
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
          // class: status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
        },
        () => (status === "active" ? "启用" : "禁用")
      );
    },
    canSort: true, // 支持按状态排序
    canHide: true,
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
          onClick: (tag) => editTag(tag.id),
          variant: "outline",
        },
        {
          type: "submenu",
          label: "状态",
          subType: "status",
          statuses: ["active", "inactive"],
          onStatusChange: (task, status) => updateStatus(task, status),
        },
        {
          type: "action",
          label: "重置AppSecret",
          icon: "i-radix-icons-key",
          onClick: (tag) => showResetConfirm(tag), // 新增重置点击事件
          variant: "outline",
        },
        // {
        //   type: "action",
        //   label: "删除",
        //   icon: "i-radix-icons-trash",
        //   onClick: (tag) => showDeleteConfirm(tag),
        //   variant: "destructive",
        // },
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

// 生命周期钩子
onMounted(() => {
  loadTags();
});

// 数据加载
async function loadTags() {
  isLoading.value = true;
  try {
    const { data } = await useFetch("/api/appManage");
    if (data.value) {
      appManage.value = data.value;
    }
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
  router.push(`/appManage/edit/${id}`);
};

// 删除流程
const showDeleteConfirm = (tag: any) => {
  deletingTag.value = tag;
  isDeleteModalOpen.value = true;
};

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false;
  deletingTag.value = {};
};

const handleDeleteTag = async () => {
  const { id } = deletingTag.value;
  if (!id) return;

  try {
    const { error } = await useFetch(`/api/appManage/${id}`, {
      method: "DELETE",
    });

    if (error?.value) {
      toast({
        title: "删除失败",
        description: error.value.statusMessage,
        variant: "destructive",
      });
    } else {
      appManage.value = appManage.value.filter((tag) => tag.id !== id);
      toast({
        description: "应用已成功删除！",
        variant: "default",
      });
      closeDeleteModal();
    }
  } catch (error) {
    console.error("删除失败:", error);
    toast({
      title: "系统错误",
      description: "处理删除请求时发生未知错误",
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

  // 模拟重置逻辑（实际需调用API）
  appManage.value = appManage.value.map((app) =>
    app.id === id ? { ...app, appSecret: generateNewSecret() } : app
  );

  toast({
    title: "重置成功",
    description: "AppSecret已更新，请立即保存新密钥！",
    variant: "default",
  });
  closeResetModal();
};

// 模拟生成新密钥（实际需替换为安全的密钥生成逻辑）
const generateNewSecret = () => {
  return `APPSECRET-${Math.random().toString(36).substr(2, 16)}`;
};

const updateStatus = (task: any, targetStatus: string) => {
  const index = appManage.value.findIndex(
    (item) => item.invoice === task.invoice
  );
  if (index === -1) {
    console.error("未找到对应的密钥记录");
    return;
  }

  // 创建新对象并更新状态
  const newTask = {
    ...task,
    status: targetStatus,
  };

  // 更新 appManage 数组，触发响应式更新
  appManage.value = [
    ...appManage.value.slice(0, index),
    newTask,
    ...appManage.value.slice(index + 1),
  ];
};
</script>

<style scoped>
/* 表格列样式 */
.max-w-[200px] {
  max-width: 200px;
}

.overflow-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
