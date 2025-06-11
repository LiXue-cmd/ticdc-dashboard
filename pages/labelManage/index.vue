<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <!-- 页面标题栏 -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">标签管理</h2>
        <p class="text-muted-foreground">管理系统中所有标签，支持过滤、编辑和删除操作</p>
      </div>
      
      <!-- 新增按钮 -->
      <Button
        variant="default"
        :to="'/tags/create'"
        class="shrink-0"
      >
        <PlusIcon class="h-4 w-4 mr-2" />
        新增标签
      </Button>
    </div>

    <!-- 搜索过滤 -->
    <div class="w-full max-w-2xl">
      <Input
        v-model="searchQuery"
        placeholder="搜索标签名称..."
        class="pl-9 w-full"
        :disabled="isLoading"
      >
        <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      </Input>
    </div>

    <!-- 标签列表 -->
    <DataTable
      :columns="columns"
      :data="filteredTags"
      :is-loading="isLoading"
      no-data-text="暂无标签数据"
      class="mt-4"
    />

    <!-- 删除确认对话框 -->
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
import { h } from "vue";
import { useFetch } from "#app";
import { useRouter } from "vue-router";
import DataTableRowActions from "@/components/tasks/components/DataTableRowActions.vue";

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

// 删除相关状态
const isDeleteModalOpen = ref(false);
const deletingTag = ref<any>({});

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
    cell: ({ row }) => h("div", { class: "w-16 text-right" }, row.getValue("id")),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "name",
    header: "标签名称",
    cell: ({ row }) => row.getValue("name") || "-",
    enableSorting: true,
  },
  {
    accessorKey: "description",
    header: "描述",
    cell: ({ row }) =>
      h(
        "div",
        { class: "max-w-200px overflow-ellipsis" },
        row.getValue("description") || "-"
      ),
    enableSorting: true,
    // 限制描述宽度
  },
  {
    accessorKey: "createDate",
    header: "创建日期",
    cell: ({ row }) => row.getValue("createDate") || "-",
    enableSorting: true,
  },
  {
    accessorKey: "updateDate",
    header: "更新日期",
    cell: ({ row }) => row.getValue("updateDate") || "-",
    enableSorting: true,
  },
  {
    id: "actions",
    header: "操作",
    cell: ({ row }) => {
      const actions = [
        {
          type: 'action' as const,
          label: "编辑",
          icon: "i-radix-icons-edit",
          onClick: (tag: { id: number; }) => editTag(tag.id),
          variant: "outline",
        },
        {
          type: 'action' as const,
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
  },
];

// 筛选列定义
const filterColumns = ref([{ id: "name", header: "标签名称" }]);

// 生命周期钩子
onMounted(() => {
  loadTags();
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
  router.push(`/tags/edit/${id}`);
};

// 删除流程
const showDeleteConfirm = (tag: any) => {
  deletingTag.value = tag;
  isDeleteModalOpen.value = true;
};

const closeDeleteModal = (open?: boolean) => {
  // 如果传入参数，使用参数值；否则设为 false
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
}
</script>

<style scoped>
/* 表格列样式 */
.max-w-200px {
  max-width: 200px;
}

.overflow-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>