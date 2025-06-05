<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <!-- 页面标题栏 -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">数据备份管理</h2>
        <p class="text-muted-foreground">对系统数据进行备份和还原操作</p>
      </div>
    </div>

    <!-- 数据列表 -->
    <DataTable :columns="columns" :data="filteredData" :filterColumns="filterColumns" :is-loading="isLoading"
      no-data-text="暂无数据">
      <template #extra-actions>
        <Button variant="outline" @click="backupData" size="sm">备份数据</Button>
        <Button variant="outline" @click="restoreData" size="sm">还原数据</Button>
      </template>
    </DataTable>

    <!-- 备份确认对话框 -->
    <Dialog :open="isBackupModalOpen" on-close="closeBackupModal">
      <DialogContent class="w-80 -translate-x-1/2! -translate-y-1/2!">
        <DialogTitle class="text-lg font-medium">确认备份</DialogTitle>
        <DialogDescription class="mt-2 text-muted-foreground">
          确定要备份当前数据吗？<br />
          此操作会覆盖之前的备份数据。
        </DialogDescription>

        <div class="mt-4 flex justify-end gap-2">
          <Button variant="outline" @click="closeBackupModal"> 取消 </Button>
          <Button variant="default" @click="performBackup"> 确认备份 </Button>
        </div>
      </DialogContent>
    </Dialog>

    <!-- 还原确认对话框 -->
    <Dialog :open="isRestoreModalOpen" on-close="closeRestoreModal">
      <DialogContent class="w-80 -translate-x-1/2! -translate-y-1/2!">
        <DialogTitle class="text-lg font-medium">确认还原</DialogTitle>
        <DialogDescription class="mt-2 text-muted-foreground">
          确定要还原到之前的备份数据吗？<br />
          此操作会覆盖当前数据，且不可撤销。
        </DialogDescription>

        <div class="mt-4 flex justify-end gap-2">
          <Button variant="outline" @click="closeRestoreModal"> 取消 </Button>
          <Button variant="destructive" @click="performRestore">
            确认还原
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
import { Badge } from "@/components/ui/badge";
import { h } from "vue";
import { useFetch } from "#app";

// 模拟数据
const mockData = [
  {
    id: 1,
    name: "数据记录1",
    type: "类型A",
    createDate: "2024-01-01",
    status: "active",
  },
  {
    id: 2,
    name: "数据记录2",
    type: "类型B",
    createDate: "2024-02-15",
    status: "inactive",
  },
  {
    id: 3,
    name: "数据记录3",
    type: "类型A",
    createDate: "2024-03-10",
    status: "active",
  },
  {
    id: 4,
    name: "数据记录4",
    type: "类型C",
    createDate: "2024-04-20",
    status: "active",
  },
  {
    id: 5,
    name: "数据记录5",
    type: "类型B",
    createDate: "2024-05-05",
    status: "inactive",
  },
];

// 状态管理
const { toast } = useToast();
const isLoading = ref(false);
const searchQuery = ref("");
const data = ref<any[]>([]);
const backupDataStore = ref<any[]>([]);

// 备份和还原对话框状态
const isBackupModalOpen = ref(false);
const isRestoreModalOpen = ref(false);

const filterColumns = ref([{ accessorKey: "name", header: "数据名称" }]);

// 计算属性：过滤后的数据
const filteredData = computed(() => {
  if (!Array.isArray(data.value)) {
    console.error("data.value 不是数组:", data.value);
    return [];
  }

  return data.value.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// 表格列定义
const columns: ColumnDef<any>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => row.getValue("id") || "-",
    canSort: true,
    canHide: true,
  },
  {
    accessorKey: "name",
    header: "名称",
    cell: ({ row }) => row.getValue("name") || "-",
    canSort: true,
  },
  {
    accessorKey: "type",
    header: "类型",
    cell: ({ row }) => row.getValue("type") || "-",
    canSort: true,
  },
  {
    accessorKey: "createDate",
    header: "创建日期",
    cell: ({ row }) => row.getValue("createDate") || "-",
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
          class:
            status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800",
        },
        () => (status === "active" ? "启用" : "禁用")
      );
    },
    canSort: true,
  },
];

// 生命周期钩子
onMounted(() => loadData());

// 数据加载 - 使用模拟数据
const loadData = async () => {
  isLoading.value = true;

  try {
    // 模拟API请求延迟
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 使用模拟数据
    data.value = mockData;

    toast({
      title: "数据加载成功",
      description: "已使用模拟数据",
      variant: "default",
    });
  } catch (error) {
    console.error("获取数据列表失败:", error);
    // 出错时仍使用模拟数据
    data.value = mockData;
    toast({
      title: "加载失败",
      description: "使用模拟数据替代",
      variant: "warning",
    });
  } finally {
    isLoading.value = false;
  }
};

// 备份数据
const backupData = () => {
  isBackupModalOpen.value = true;
};

const closeBackupModal = () => {
  isBackupModalOpen.value = false;
};

const performBackup = async () => {
  try {
    // 模拟API请求延迟
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 备份数据
    backupDataStore.value = [...data.value];
    toast({
      title: "备份成功",
      description: "数据已成功备份",
      variant: "default",
    });
    closeBackupModal();
  } catch (error) {
    console.error("备份失败:", error);
    toast({
      title: "系统错误",
      description: "处理备份请求时出错",
      variant: "destructive",
    });
  }
};

// 还原数据
const restoreData = () => {
  if (backupDataStore.value.length === 0) {
    return toast({
      title: "无备份数据",
      description: "请先进行数据备份",
      variant: "warning",
    });
  }
  isRestoreModalOpen.value = true;
};

const closeRestoreModal = () => {
  isRestoreModalOpen.value = false;
};

const performRestore = async () => {
  try {
    // 模拟API请求延迟
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 还原数据
    data.value = [...backupDataStore.value];
    toast({
      title: "还原成功",
      description: "数据已成功还原到备份状态",
      variant: "default",
    });
    closeRestoreModal();
  } catch (error) {
    console.error("还原失败:", error);
    toast({
      title: "系统错误",
      description: "处理还原请求时出错",
      variant: "destructive",
    });
  }
};
</script>

<style scoped>
/* 表格列样式 */
.w-28 {
  width: 7rem;
}
</style>
