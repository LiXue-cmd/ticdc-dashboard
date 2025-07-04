<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <!-- 页面标题栏 -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">标签管理</h2>
        <p class="text-muted-foreground">管理系统中所有标签，支持过滤、编辑和删除操作</p>
      </div>
    </div>

    <!-- 标签列表 -->
    <DataTable
      :columns="columns"
      :data="filteredTags"      
      :filterColumns="filterColumns"
      :is-loading="isLoading"
      no-data-text="暂无标签数据"
      addTaskRoute="/tags/create"
      addTaskText="新增标签"
      @batch-delete="handleBatchDelete"
      :hideBatchDelete="false"
    />

    <!-- 单个删除确认对话框 -->
    <Dialog :open="isDeleteModalOpen" @update:open="closeDeleteModal">
      <DialogContent class="w-80 -translate-x-1/2! -translate-y-1/2!">
        <DialogTitle class="text-lg font-medium">确认删除</DialogTitle>
        <DialogDescription class="mt-2 text-muted-foreground">
          确定要删除 <strong class="text-gray-900">{{ deletingTag.name }}</strong> 吗？<br />
          此操作不可撤销，且会影响关联的所有资源。
        </DialogDescription>

        <div class="mt-4 flex justify-end gap-2">
          <Button variant="outline" @click="closeDeleteModal">
            取消
          </Button>
          <Button variant="destructive" @click="handleDeleteTag">
            删除
          </Button>
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
import { h } from "vue";
import { useFetch } from "#app";
import { useRouter } from "vue-router";

// 状态管理
const router = useRouter();
const { toast } = useToast();
const isLoading = ref(false);
const searchQuery = ref("");
const tags = ref<any[]>([
  {
    id: 1,
    name: "系统标签",
    description: "默认系统标签",
    createDate: "2023-01-01",
    updateDate: "2023-01-05",
  },
  {
    id: 2,
    name: "用户标签",
    description: "用于用户分类",
    createDate: "2023-02-15",
    updateDate: "2023-02-20",
  },
  {
    id: 3,
    name: "权限标签",
    description: "控制权限范围",
    createDate: "2023-03-10",
    updateDate: "2023-03-12",
  },
]);

// 单个删除相关状态
const isDeleteModalOpen = ref(false);
const deletingTag = ref<any>({});

const filterColumns = ref([{ accessorKey: "name", header: "标签名称" }]);

// 计算属性：过滤后的数据
const filteredTags = computed(() => {
  return tags.value.filter(tag => 
    tag.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// 表格列定义
const columns: ColumnDef<any>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => h("div", { class: "w-16" }, row.getValue("id")),
  },
  {
    accessorKey: "name",
    header: "标签名称",
    cell: ({ row }) => row.getValue("name") || "-",
  },
  {
    accessorKey: "description",
    header: "描述",
    cell: ({ row }) => h("div", { class: "max-w-[200px] overflow-ellipsis" }, row.getValue("description") || "-"),
  },
  {
    accessorKey: "createDate",
    header: "创建日期",
    cell: ({ row }) => row.getValue("createDate") || "-",
  },
  {
    accessorKey: "updateDate",
    header: "更新日期",
    cell: ({ row }) => row.getValue("updateDate") || "-",
  },
  {
    id: "actions",
    header: "操作",
    cell: ({ row }) => {
      const actions = [
        {
          type: "action" as const,
          label: "编辑",
          icon: "i-radix-icons-edit",
          onClick: (tag: any) => editTag(tag.id),
          variant: "outline",
        },
        {
          type: "action" as const,
          label: "删除",
          icon: "i-radix-icons-trash",
          onClick: (tag: any) => showDeleteConfirm(tag),
          variant: "destructive",
        },
      ];
      return h(DataTableRowActions, { row, actions, iconName: "i-radix-icons-dots-horizontal" });
    },
  },
];

// 生命周期钩子
onMounted(() => {
  // loadTags();
});

// 数据加载
async function loadTags() {
  isLoading.value = true;
  try {
    const { data } = await useFetch("/api/tags");
    if (Array.isArray(data.value)) {
      tags.value = data.value;
    } else {
      tags.value = [];
    }
  } catch (error) {
    toast({
      title: "加载失败",
      description: "获取标签列表时出错",
      variant: "destructive",
    });
  } finally {
    isLoading.value = false;
  }
}

// 新增/编辑页面跳转
const editTag = (id: number) => {
  console.log("编辑标签 ID:", id);
  router.push(`/tags/edit/${id}`);
};

// 单个删除流程
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
    const { error } = await useFetch(`/api/tags/${id}`, {
      method: "DELETE",
    });

    if (error?.value) {
      toast({
        title: "删除失败",
        description: error.value.statusMessage,
        variant: "destructive",
      });
    } else {
      tags.value = tags.value.filter(tag => tag.id !== id);
      toast({
        description: "标签已成功删除！",
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

// 批量删除处理函数 - 简化版本，只处理API调用
const handleBatchDelete = async (selectedIds: number[]) => {
  console.log("收到批量删除请求，选中的ID:",  );
  
  if (!selectedIds || selectedIds.length === 0) {
    toast({
      title: "请选择要删除的标签",
      description: "至少选择一个标签进行删除操作",
      variant: "destructive",
    });
    return;
  }

  try {
    // 批量删除 API 请求
    const { error } = await useFetch("/api/tags/batch-delete", {
      method: "DELETE",
      body: {
        ids: selectedIds
      },
    });

    if (error?.value) {
      toast({
        title: "批量删除失败",
        description: error.value.statusMessage || "删除过程中发生错误",
        variant: "destructive",
      });
    } else {
      // 从本地数据中移除已删除的标签
      tags.value = tags.value.filter(tag => !selectedIds.includes(tag.id));
      
      toast({
        description: `成功删除 ${selectedIds.length} 个标签！`,
        variant: "default",
      });
    }
  } catch (error) {
    console.error("批量删除失败:", error);
    toast({
      title: "系统错误",
      description: "批量删除请求处理失败",
      variant: "destructive",
    });
  }
};
</script>

<style scoped>
/* 表格列样式已由 Tailwind 类替代，无需自定义样式 */
</style>