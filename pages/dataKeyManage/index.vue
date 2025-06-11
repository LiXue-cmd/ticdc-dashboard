<!-- /datakeymanage/index.vue -->
<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">数据密钥管理</h2>
        <p class="text-muted-foreground">这里是数据密钥管理的描述</p>
      </div>
    </div>
    <DataTable
      :columns="columns"
      :data="datakeymanage"
      :filterColumns="filterColumns"
      addTaskRoute="/datakeymanage/create"
      addTaskText="新增数据密钥"
      :statusFilterField="'status'"
      :statusOptions="[
        { label: '启用', value: 'active' },
        { label: '禁用', value: 'inactive' },
      ]"
      @batch-delete="handleBatchDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useToast } from "@/components/ui/toast/use-toast";
import DataTable from "@/components/tasks/components/DataTable.vue";
import type { ColumnDef } from "@tanstack/vue-table";
import { Badge } from "@/components/ui/badge";
import { h } from "vue";
import { useFetch } from "#app";
import DataTableRowActions from "@/components/tasks/components/DataTableRowActions.vue";
import { useRouter } from "vue-router";

const router = useRouter();
const { toast } = useToast();
const filterColumns = ref([
  { accessorKey: "keyAlias", header: "密钥别名" },
  { accessorKey: "algorithm", header: "算法" },
]);
const datakeymanage = ref<any[]>([
  {
    id: "MK-2023001",
    keyAlias: "系统默认密钥",
    algorithm: "AES-256",
    tags: "系统,默认",
    notes: "系统初始化时自动生成的默认加密密钥",
    createDate: "2023-06-15",
    version: "v1.0",
    status: "active",
  },
  {
    id: "MK-2023002",
    keyAlias: "用户数据加密",
    algorithm: "RSA-2048",
    tags: "用户,数据,加密",
    notes: "用于保护用户敏感数据的非对称密钥",
    createDate: "2023-07-22",
    version: "v1.0",
    status: "active",
  },
  {
    id: "MK-2023003",
    keyAlias: "API签名密钥",
    algorithm: "HMAC-SHA256",
    tags: "API,签名",
    notes: "用于API请求签名验证的密钥",
    createDate: "2023-08-05",
    version: "v1.0",
    status: "inactive",
  },
  {
    id: "MK-2023004",
    keyAlias: "支付系统密钥",
    algorithm: "AES-128",
    tags: "支付,安全",
    notes: "用于支付系统的加密密钥",
    createDate: "2023-09-10",
    version: "v2.0",
    status: "active",
  },
  {
    id: "MK-2023005",
    keyAlias: "日志加密密钥",
    algorithm: "ChaCha20",
    tags: "日志,审计",
    notes: "用于加密系统审计日志的密钥",
    createDate: "2023-10-15",
    version: "v1.0",
    status: "active",
  },
]);

const columns: ColumnDef<any>[] = [
  {
    accessorKey: "id",
    header: "密钥ID",
    cell: ({ row }) => h("div", { class: "w-40" }, row.getValue("id")),
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
    accessorKey: "algorithm",
    header: "算法",
    cell: ({ row }) => row.getValue("algorithm") || "-",
    canSort: true,
    canHide: true,
  },
  {
    accessorKey: "tags",
    header: "标签",
    cell: ({ row }) => row.getValue("tags") || "-",
    canSort: true,
    canHide: true, // 允许隐藏标签列
  },
  {
    accessorKey: "notes",
    header: "备注说明",
    cell: ({ row }) => row.getValue("notes") || "-",
    canHide: true, // 允许隐藏备注列（排序可能非必需，可省略 canSort）
  },
  {
    accessorKey: "createDate",
    header: "创建日期",
    cell: ({ row }) => row.getValue("createDate") || "-",
    canSort: true, // 支持按日期排序
    canHide: true,
  },
  {
    accessorKey: "version",
    header: "版本",
    cell: ({ row }) => row.getValue("version") || "-",
    canSort: true,
    canHide: true,
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
          class: status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
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
      // 动态生成操作项
      const actions = [
        {
          type: "action",
          label: "详情",
          icon: "i-radix-icons-pencil",
          onClick: (task) => openDetailModal(task.id), // 修改为 task.id
        },
        // {
        //   type: "action",
        //   label: "编辑",
        //   icon: "i-radix-icons-edit",
        //   onClick: (task) => openEditModal(task.id), // 添加编辑功能
        // },
        // 根据当前状态显示启用或禁用按钮
        row.getValue("status") === "active"
          ? {
              type: "action",
              label: "禁用",
              icon: "i-radix-icons-toggle-off",
              onClick: (task) => updateStatus(task, "inactive"),
              class: "text-red-600 hover:bg-red-50", // 添加红色样式
            }
          : {
              type: "action",
              label: "启用",
              icon: "i-radix-icons-toggle-on",
              onClick: (task) => updateStatus(task, "active"),
              class: "text-green-600 hover:bg-green-50", // 添加绿色样式
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
  const { data: feeds } = await useFetch("/api/cdc/datakeymanage");
  if (feeds.value) {
    datakeymanage.value = feeds.value;
  }
  console.debug("datakeymanage", datakeymanage.value);
}

onMounted(async () => {
  await loadMasterKeys();
});

const openDetailModal = (id: any) => {
  // 这里可以添加打开详情弹窗的逻辑
  console.log("Open detail modal for", id);
  router.push(`/datakeymanage/details/${id}`);
};

const updateStatus = (task: any, targetStatus: string) => {
  const index = datakeymanage.value.findIndex(
    (item) => item.id === task.id
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

  // 更新 datakeymanage 数组，触发响应式更新
  datakeymanage.value = [
    ...datakeymanage.value.slice(0, index),
    newTask,
    ...datakeymanage.value.slice(index + 1),
  ];
};
// 在 script setup 中添加的 handleBatchDelete 函数
const handleBatchDelete = async (selectedRows: any[]) => {
  if (!selectedRows || selectedRows.length === 0) {
    toast({
      title: "提示",
      description: "请选择要删除的数据密钥",
      variant: "default",
    });
    return;
  }

  // 检查是否有启用状态的密钥
  const activeKeys = selectedRows.filter(row => row.status === 'active');
  if (activeKeys.length > 0) {
    toast({
      title: "操作失败",
      description: `选中的密钥中有 ${activeKeys.length} 个处于启用状态，请先禁用后再删除`,
      variant: "destructive",
    });
    return;
  }

  // 检查是否有系统关键密钥（可根据实际业务需求调整判断条件）
  const systemKeys = selectedRows.filter(row => 
    row.tags?.includes('系统') || row.keyAlias?.includes('系统')
  );
  if (systemKeys.length > 0) {
    toast({
      title: "操作失败", 
      description: `选中的密钥中包含系统关键密钥，不允许删除`,
      variant: "destructive",
    });
    return;
  }

  try {
    // 获取要删除的密钥ID列表
    const idsToDelete = selectedRows.map(row => row);
    // const idsToDelete = selectedRows.map(row => row.id);
    
    console.log("准备删除的密钥ID:", idsToDelete);

    // 调用后端API进行批量删除
    // 注释掉的部分是实际API调用，现在使用模拟删除
    /*
    const { data, error } = await useFetch("/api/cdc/datakeymanage/batch-delete", {
      method: "POST",
      body: {
        ids: idsToDelete
      }
    });

    if (error.value) {
      throw new Error(error.value.message || "删除失败");
    }
    */

    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    // 从本地数据中移除已删除的项目
    datakeymanage.value = datakeymanage.value.filter(
      item => !idsToDelete.includes(item.id)
    );

    toast({
      title: "删除成功",
      description: `成功删除 ${selectedRows.length} 个数据密钥`,
      variant: "default",
    });

    console.log("批量删除操作完成");

  } catch (error) {
    console.error("批量删除失败:", error);
    
    toast({
      title: "删除失败",
      description: error instanceof Error ? error.message : "删除过程中发生未知错误",
      variant: "destructive",
    });
  }
};
</script>

<style scoped></style>
