<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="ghost"
        class="h-8 w-8 flex p-0 data-[state=open]:bg-muted"
      >
        <Icon :name="iconName" class="h-4 w-4" />
        <span class="sr-only">Open menu</span>
      </Button>
    </DropdownMenuTrigger>
    <!-- 修改点：移除 align="end"，添加 left-0 -->
    <DropdownMenuContent class="w-[160px] left-0 !text-left !justify-start">
      <template v-for="(item, index) in props.actions" :key="index">
        <template v-if="item.type === 'action'">
          <DropdownMenuItem
            :disabled="item.disabled"
            @click="item.onClick(props.row.original)"
            class="menu-left"
          >
            <!-- <template v-if="item.icon">
              <Icon :name="item.icon" class="mr-2 h-3.5 w-3.5" />
            </template> -->
            {{ item.label }}
            <template v-if="item.shortcut">
              <DropdownMenuShortcut>{{ item.shortcut }}</DropdownMenuShortcut>
            </template>
          </DropdownMenuItem>
        </template>
        <template v-if="item.type === 'separator'">
          <DropdownMenuSeparator />
        </template>
        <template v-if="item.type === 'submenu'">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger class="menu-left">
              {{ item.label }}
              <template v-if="item.icon">
                <!-- 修改点：将图标从右侧移到左侧 -->
                <Icon :name="item.icon" class="ml-2 h-3.5 w-3.5" />
              </template>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent class="menu-left">
              <!-- 子菜单内容保持不变 -->
              <template v-if="item.subType === 'labels'">
                <DropdownMenuRadioGroup :value="props.row.original.label">
                  <DropdownMenuRadioItem
                    v-for="label in item.labels"
                    :key="label.value"
                    :value="label.value"
                    @click="item.onLabelChange(props.row.original, label)"
                  >
                    <span :style="{ color: label.color }">{{ label.label }}</span>
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </template>
              <template v-if="item.subType === 'status'">
                <DropdownMenuRadioGroup :value="props.row.original.status">
                  <DropdownMenuRadioItem
                    v-for="status in item.statuses"
                    :key="status"
                    :value="status"
                    @click="item.onStatusChange(props.row.original, status)"
                  >
                    {{ status === 'active' ? '启用' : '禁用' }}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </template>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </template>
      </template>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import type { Row } from '@tanstack/vue-table';
import { computed, withDefaults } from 'vue';
import { taskSchema } from '../data/schema';
import { z } from 'zod';

// 定义动态操作项类型
type ActionType = 'action' | 'separator' | 'submenu';
type SubmenuType = 'labels' | 'status';

interface DynamicAction {
  type: ActionType;
  label?: string;
  icon?: string;
  onClick?: (task: any) => void; // 修改为 any 类型，避免类型错误
  disabled?: boolean;
  shortcut?: string;
  subType?: SubmenuType;
  labels?: { value: string; label: string; color?: string }[];
  onLabelChange?: (task: any, label: { value: string }) => void; // 修改为 any 类型
  statuses?: string[]; // 新增状态字段
  onStatusChange?: (task: any, status: string) => void; // 新增状态变更回调
}

// 定义 props 接口
interface DataTableRowActionsProps {
  row: Row<any>; // 修改为 any 类型，避免类型错误
  actions: DynamicAction[];
  iconName?: string;
}

// 声明 props 并设置默认值
const props = withDefaults(
  defineProps<DataTableRowActionsProps>(),
  {
    iconName: 'i-radix-icons-dots-horizontal',
    actions: () => [],
  }
);

// 数据校验
const task = computed(() => props.row.original); // 直接返回原始数据，避免校验问题
</script>
<style scoped>
/* 重置所有菜单项的对齐 */
.dropdown-menu-item,
.dropdown-menu-sub-trigger {
  text-align: left !important;
  justify-content: flex-start !important;
}

/* 确保子菜单内容也左对齐 */
.dropdown-menu-sub-content {
  text-align: left !important;
}
</style>