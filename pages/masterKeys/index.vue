<!-- /masterKeys/index.vue -->
<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">主密钥管理</h2>
        <p class="text-muted-foreground">这里是主密钥管理的描述</p>
      </div>
    </div>
    <DataTable
      :columns="columns"
      :data="masterKeys"
      :filterColumns="filterColumns"
      addTaskRoute="/masterKeys/create"
      addTaskText="新增主密钥"
      :statusFilterField="'status'"
      :statusOptions="[
        { label: '启用', value: 'active' },
        { label: '禁用', value: 'inactive' },
      ]"
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
const masterKeys = ref<any[]>([
  {
    invoice: "MK-2023001",
    keyAlias: "系统默认密钥",
    algorithm: "AES-256",
    tags: "系统,默认",
    notes: "系统初始化时自动生成的默认加密密钥",
    createDate: "2023-06-15",
    version: "v1.0",
    status: "active",
  },
  {
    invoice: "MK-2023002",
    keyAlias: "用户数据加密",
    algorithm: "RSA-2048",
    tags: "用户,数据,加密",
    notes: "用于保护用户敏感数据的非对称密钥",
    createDate: "2023-07-22",
    version: "v1.0",
    status: "active",
  },
  {
    invoice: "MK-2023003",
    keyAlias: "API签名密钥",
    algorithm: "HMAC-SHA256",
    tags: "API,签名",
    notes: "用于API请求签名验证的密钥",
    createDate: "2023-08-05",
    version: "v1.0",
    status: "inactive",
  },
  {
    invoice: "MK-2023004",
    keyAlias: "支付系统密钥",
    algorithm: "AES-128",
    tags: "支付,安全",
    notes: "用于支付系统的加密密钥",
    createDate: "2023-09-10",
    version: "v2.0",
    status: "active",
  },
  {
    invoice: "MK-2023005",
    keyAlias: "日志加密密钥",
    algorithm: "ChaCha20",
    tags: "日志,审计",
    notes: "用于加密系统审计日志的密钥",
    createDate: "2023-10-15",
    version: "v1.0",
    status: "active",
  },
]);
const newKey = ref({
  keyAlias: "",
  algorithm: "",
  keyType: "对称密钥",
  tags: "",
  notes: "",
  version: "",
  status: "active", // 默认启用
});

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
      // 动态生成操作项
      const actions = [
        {
          type: "action",
          label: "详情",
          icon: "i-radix-icons-pencil",
          onClick: (task) => openDetailModal(task.invoice), // 修改为 task.invoice
        },
        // {
        //   type: "action",
        //   label: "编辑",
        //   icon: "i-radix-icons-edit",
        //   onClick: (task) => openEditModal(task.invoice), // 添加编辑功能
        // },
        {
          type: "submenu",
          label: "状态",
          subType: "status",
          statuses: ["active", "inactive"],
          onStatusChange: (task, status) => updateStatus(task, status),
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
  const { data: feeds } = await useFetch("/api/cdc/masterKeys");
  if (feeds.value) {
    masterKeys.value = feeds.value;
  }
  console.debug("masterKeys", masterKeys.value);
}

onMounted(async () => {
  await loadMasterKeys();
});

const createKey = async () => {
  const { error } = await useFetch("/api/cdc/newMasterKey", {
    method: "POST",
    body: newKey.value,
  });
  if (error?.value) {
    console.log(JSON.stringify(error.value));
    toast({
      title: "主密钥创建失败",
      description: `错误信息: ${error.value?.statusMessage}`,
      variant: "destructive",
    });
  } else {
    await loadMasterKeys();
    closeCreateModal();
    toast({ description: "主密钥创建成功！" });
  }
};

const openDetailModal = (invoice: any) => {
  // 这里可以添加打开详情弹窗的逻辑
  console.log("Open detail modal for", invoice);
  router.push(`/masterKeys/details/${invoice}`);
};

const updateStatus = (task: any, targetStatus: string) => {
  const index = masterKeys.value.findIndex(
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

  // 更新 masterKeys 数组，触发响应式更新
  masterKeys.value = [
    ...masterKeys.value.slice(0, index),
    newTask,
    ...masterKeys.value.slice(index + 1),
  ];
};
</script>

<style scoped></style>
