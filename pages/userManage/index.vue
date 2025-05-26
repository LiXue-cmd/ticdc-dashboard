<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <!-- 页面标题栏 -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">用户管理</h2>
        <p class="text-muted-foreground">
          管理系统中所有用户，支持过滤、编辑和删除操作
        </p>
      </div>
    </div>

    <!-- 用户列表 -->
    <DataTable
      :columns="columns"
      :data="filteredUsers"
      :filterColumns="filterColumns"
      :is-loading="isLoading"
      no-data-text="暂无用户数据"
      addTaskRoute="/userManage/create"
      addTaskText="新增用户"
    />

    <!-- 删除确认对话框 -->
    <Dialog :open="isDeleteModalOpen" on-close="closeDeleteModal">
      <DialogContent class="w-80">
        <DialogTitle class="text-lg font-medium">确认删除</DialogTitle>
        <DialogDescription class="mt-2 text-muted-foreground">
          确定要删除
          <strong class="text-gray-900">{{ deletingUser.name }}</strong>
          吗？<br />
          此操作不可撤销，且会影响关联的所有资源。
        </DialogDescription>

        <div class="mt-4 flex justify-end gap-2">
          <Button variant="outline" @click="closeDeleteModal"> 取消 </Button>
          <Button variant="destructive" @click="handleDeleteUser"> 删除 </Button>
        </div>
      </DialogContent>
    </Dialog>

    <!-- 修改密码对话框 -->
    <Dialog :open="isChangePasswordModalOpen" on-close="closeChangePasswordModal">
      <DialogContent class="w-80">
        <DialogTitle class="text-lg font-medium">修改密码</DialogTitle>
        <DialogDescription class="mt-2 text-muted-foreground">
          为用户 <strong class="text-gray-900">{{ changingPasswordUser.name }}</strong> 修改登录密码
        </DialogDescription>

        <form @submit.prevent>
          <div class="mt-4 space-y-4">
            <div>
              <label for="newPassword" class="block text-sm font-medium text-gray-700">新密码</label>
              <Input
                type="password"
                id="newPassword"
                v-model="newPassword"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="输入6-16位新密码"
              />
            </div>
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">确认密码</label>
              <Input
                type="password"
                id="confirmPassword"
                v-model="confirmPassword"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="再次输入新密码"
              />
            </div>
          </div>

          <div class="mt-4 flex justify-end gap-2">
            <Button variant="outline" @click="closeChangePasswordModal"> 取消 </Button>
            <Button type="submit" @click="handleChangePassword"> 确认修改 </Button>
          </div>
        </form>
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

// 模拟用户数据
const mockUsers = [
  {
    id: 1,
    name: "系统管理员",
    description: "系统超级管理员，拥有所有权限",
    leader: "张三",
    phone: "13800138000",
    createDate: "2023-01-01",
    updateDate: "2023-01-05",
    status: "active",
  },
  {
    id: 2,
    name: "财务主管",
    description: "负责财务报表和预算管理",
    leader: "李四",
    phone: "13900139000",
    createDate: "2023-02-15",
    updateDate: "2023-02-20",
    status: "active",
  },
  {
    id: 3,
    name: "人力资源",
    description: "负责员工招聘和培训",
    leader: "王五",
    phone: "13700137000",
    createDate: "2023-03-10",
    updateDate: "2023-03-12",
    status: "inactive",
  },
  {
    id: 4,
    name: "开发工程师",
    description: "负责系统开发和维护",
    leader: "赵六",
    phone: "13600136000",
    createDate: "2023-04-20",
    updateDate: "2023-04-25",
    status: "active",
  },
  {
    id: 5,
    name: "测试工程师",
    description: "负责系统测试和质量保障",
    leader: "钱七",
    phone: "13500135000",
    createDate: "2023-05-05",
    updateDate: "2023-05-10",
    status: "active",
  },
];

// 状态管理
const router = useRouter();
const { toast } = useToast();
const isLoading = ref(false);
const searchQuery = ref("");
const users = ref<any[]>([]);

// 删除相关状态
const isDeleteModalOpen = ref(false);
const deletingUser = ref<any>({});

// 修改密码相关状态
const isChangePasswordModalOpen = ref(false);
const changingPasswordUser = ref<any>({});
const newPassword = ref("");
const confirmPassword = ref("");

const filterColumns = ref([{ accessorKey: "name", header: "用户名称" }]);

// 计算属性：过滤后的数据
const filteredUsers = computed(() => {
  if (!Array.isArray(users.value)) {
    console.error('users.value 不是数组:', users.value);
    return [];
  }
  
  return users.value.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.value.toLowerCase())
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
    accessorKey: "description",
    header: "简介",
    cell: ({ row }) => row.getValue("description") || "-",
    cellProps: { class: "max-w-[200px] overflow-ellipsis" },
  },
  {
    accessorKey: "leader",
    header: "负责人",
    cell: ({ row }) => row.getValue("leader") || "-",
    canSort: true,
  },
  {
    accessorKey: "phone",
    header: "电话",
    cell: ({ row }) => row.getValue("phone") || "-",
    canSort: true,
  },
  {
    accessorKey: "createDate",
    header: "创建日期",
    cell: ({ row }) => row.getValue("createDate") || "-",
    cellProps: { class: "w-28" },
  },
  {
    accessorKey: "updateDate",
    header: "更新日期",
    cell: ({ row }) => row.getValue("updateDate") || "-",
    cellProps: { class: "w-28" },
  },
  {
    accessorKey: "status",
    header: "状态",
    cell: ({ row }) => {
      const status = row.getValue("status");
      return h(Badge, {
        variant: "outline",
        // class: status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
      }, () => status === "active" ? "启用" : "禁用");
    },
    canSort: true,
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
          onClick: (user) => editUser(user.id),
          variant: "outline",
        },
        {
          type: "submenu",
          label: "状态",
          subType: "status",
          statuses: ["active", "inactive"],
          onStatusChange: (user, status) => updateStatus(user, status),
        },
        {
          type: "action",
          label: "修改密码",
          icon: "i-radix-icons-key",
          onClick: (user) => showChangePassword(user),
          variant: "outline",
        },
        {
          type: "action",
          label: "删除",
          icon: "i-radix-icons-trash",
          onClick: (user) => showDeleteConfirm(user),
          variant: "destructive",
        },
      ];
      return h(DataTableRowActions, { row, actions, iconName: "i-radix-icons-dots-horizontal" });
    },
    canHide: true,
  },
];

// 生命周期钩子
onMounted(() => loadUsers());

// 数据加载 - 使用模拟数据
const loadUsers = async () => {
  isLoading.value = true;
  
  try {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 使用模拟数据
    users.value = mockUsers;
    
    toast({
      title: "数据加载成功",
      description: "已使用模拟数据",
      variant: "default",
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    // 出错时仍使用模拟数据
    users.value = mockUsers;
    toast({
      title: "加载失败",
      description: "使用模拟数据替代",
      variant: "warning",
    });
  } finally {
    isLoading.value = false;
  }
};

// 编辑用户
const editUser = (id: number) => {
  router.push(`/userManage/edit/${id}`);
};

// 删除流程
const showDeleteConfirm = (user: any) => {
  deletingUser.value = user;
  isDeleteModalOpen.value = true;
};

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false;
  deletingUser.value = {};
};

const handleDeleteUser = async () => {
  const { id } = deletingUser.value;
  if (!id) return;
  
  try {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 从本地数据中删除
    if (Array.isArray(users.value)) {
      users.value = users.value.filter(user => user.id !== id);
      toast({ description: "用户删除成功", variant: "default" });
    } else {
      console.error('删除用户时 users.value 不是数组');
      toast({ title: "操作失败", description: "用户数据格式错误", variant: "destructive" });
    }
    
    closeDeleteModal();
  } catch (error) {
    console.error("删除失败:", error);
    toast({ title: "系统错误", description: "处理删除请求时出错", variant: "destructive" });
  }
};

// 修改密码流程
const showChangePassword = (user: any) => {
  changingPasswordUser.value = user;
  newPassword.value = "";
  confirmPassword.value = "";
  isChangePasswordModalOpen.value = true;
};

const closeChangePasswordModal = () => {
  isChangePasswordModalOpen.value = false;
  changingPasswordUser.value = {};
};

const handleChangePassword = async () => {
  // 密码验证
  if (newPassword.value.length < 6 || newPassword.value.length > 16) {
    return toast({ title: "格式错误", description: "密码需6-16位", variant: "destructive" });
  }
  if (newPassword.value !== confirmPassword.value) {
    return toast({ title: "验证失败", description: "两次密码不一致", variant: "destructive" });
  }

  const { id } = changingPasswordUser.value;
  if (!id) return;

  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 500));
    
    toast({ title: "修改成功", description: "请使用新密码登录", variant: "default" });
    closeChangePasswordModal();
  } catch (error) {
    console.error("修改密码失败:", error);
    toast({ title: "系统错误", description: "处理密码修改请求时出错", variant: "destructive" });
  }
};

// 更新用户状态
const updateStatus = (user: any, status: string) => {
  if (!Array.isArray(users.value)) {
    console.error('更新用户状态时 users.value 不是数组');
    return;
  }
  
  const index = users.value.findIndex(u => u.id === user.id);
  if (index === -1) return;
  
  // 创建新对象更新状态
  const updatedUser = { ...users.value[index], status };
  
  // 使用展开语法保持响应式更新
  users.value = [
    ...users.value.slice(0, index),
    updatedUser,
    ...users.value.slice(index + 1)
  ];
  
  toast({
    title: "状态更新成功",
    description: `${user.name} 已${status === 'active' ? '启用' : '禁用'}`,
    variant: "default",
  });
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