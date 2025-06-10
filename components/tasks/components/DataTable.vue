<!-- DataTable.vue -->
<template>
  <div class="space-y-4">
    <!-- 过滤字段和新增任务按钮 -->
    <div class="flex items-center justify-between">
      <!-- 过滤字段 -->
      <div class="flex flex-1 items-center space-x-2">
        <Input
          v-for="filterColumn in filterColumns"
          :key="filterColumn.accessorKey || (typeof filterColumn.header === 'string' ? filterColumn.header : undefined)"
          :placeholder="`过滤 ${typeof filterColumn.header === 'string' ? filterColumn.header : ''}...`"
          :model-value="(table.getColumn(filterColumn.accessorKey || (typeof filterColumn.header === 'string' ? filterColumn.header : ''))?.getFilterValue() as string) ?? ''"
          class="h-8 w-[150px] lg:w-[250px]"
          @input="(e: Event) => table.getColumn(filterColumn.accessorKey || (typeof filterColumn.header === 'string' ? filterColumn.header : ''))?.setFilterValue((e.target as HTMLInputElement).value)"
        />
        <!-- 状态筛选下拉菜单（动态渲染） -->
        <template v-if="isStatusFilterEnabled">
          <DropdownMenu class="w-[120px]">
            <DropdownMenuTrigger as-child>
              <Button variant="outline" size="sm" class="h-8">
                状态: {{ getStatusLabel(filterStatus) || "全部" }}
                <Icon name="i-radix-icons-chevron-down" class="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuCheckboxItem
                value="all"
                :checked="filterStatus === 'all'"
                @update:checked="
                  (value) => (filterStatus = value ? 'all' : undefined)
                "
              >
                全部
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                v-for="option in props.statusOptions || []"
                :key="option.value"
                :value="option.value"
                :checked="filterStatus === option.value"
                @update:checked="
                  (value) => (filterStatus = value ? option.value : undefined)
                "
              >
                {{ option.label }}
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </template>

        <Button
          v-if="isFiltered || (isStatusFilterEnabled && filterStatus !== 'all')"
          class="h-8 px-2 lg:px-3"
          @click="resetFilters"
        >
          重置
          <Icon name="i-radix-icons-cross-2" class="ml-2 h-4 w-4" />
        </Button>
      </div>
      <!-- 新增任务按钮和切换列显示菜单 -->
      <div class="flex items-center space-x-2">
        <!-- 批量删除按钮 -->
        <Button
          v-if="selectedRowsCount > 0"
          variant="destructive"
          size="sm"
          class="h-8"
          @click="handleBatchDelete"
        >
          <Icon name="i-radix-icons-trash" class="mr-2 h-4 w-4" />
          批量删除 ({{ selectedRowsCount }})
        </Button>
        
        <NuxtLink v-if="addTaskRoute" :to="addTaskRoute" class="h-8">
          <Button variant="outline" size="sm" class="px-2">
            {{ addTaskText }}
          </Button>
        </NuxtLink>
        <!-- 新增：额外操作插槽（如备份/还原按钮） -->
        <slot name="extra-actions" />
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              variant="outline"
              size="sm"
              class="ml-auto hidden h-8 lg:flex"
            >
              <Icon
                name="i-radix-icons-mixer-horizontal"
                class="mr-2 h-4 w-4"
              />
              视图
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-[150px]">
            <DropdownMenuLabel>切换列</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              v-for="column in toggleColumns"
              :key="column.id"
              class="capitalize"
              :checked="column.getIsVisible()"
              @update:checked="(value) => column.toggleVisibility(!!value)"
            >
              {{ column.columnDef.header }}
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
    <!-- 表格主体 -->
    <div class="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
          >
            <TableHead v-for="header in headerGroup.headers" :key="header.id">
              <DataTableColumnHeader
                v-if="!header.isPlaceholder && header.column.columnDef.header && typeof header.column.columnDef.header === 'string'"
                :column="header.column"
                :title="String(header.column.columnDef.header)"
                class="cursor-pointer"
              />
              <FlexRender
                v-else-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="table.getRowModel().rows?.length">
            <TableRow
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              :data-state="row.getIsSelected() && 'selected'"
            >
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                <FlexRender
                  :render="cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />
              </TableCell>
            </TableRow>
          </template>
          <TableRow v-else>
            <TableCell :colspan="tableColumns.length" class="h-24 text-center">
              {{ noDataText || 'No results.' }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    <!-- 分页组件 -->
    <DataTablePagination :table="table" />
  </div>
</template>

<script setup lang="ts">
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/vue-table";
import { ref, computed, watch, h } from "vue";
import { valueUpdater } from "@/lib/utils";
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from "@tanstack/vue-table";
import { Checkbox } from "@/components/ui/checkbox";
import DataTablePagination from "./DataTablePagination.vue";
import DataTableColumnHeader from "./DataTableColumnHeader.vue";

interface DataTableProps {
  columns: ColumnDef<any, any>[];
  data: any[];
  filterColumns?: ColumnDef<any, any>[];
  addTaskRoute?: string;
  addTaskText?: string;
  noDataText?: string;
  // 新增：状态筛选相关Props
  statusFilterField?: string; // 状态字段名（如 'status'）
  statusOptions?: { label: string; value: string }[]; // 状态选项列表
}

const props = withDefaults(defineProps<DataTableProps>(), {
  filterColumns: () => [],
  addTaskRoute: '',
  addTaskText: '新增',
  noDataText: 'No results.',
  statusFilterField: '',
  statusOptions: () => []
});

// 定义事件
const emit = defineEmits<{
  batchDelete: [selectedIds: any[]]
}>();

// 组件内响应式状态
const filterStatus = ref<string | undefined>("all"); // 当前筛选状态
const isStatusFilterEnabled = computed(() => !!props.statusFilterField); // 是否启用状态筛选

const sorting = ref<SortingState>([]);
const columnFilters = ref<ColumnFiltersState>([]);
const columnVisibility = ref<VisibilityState>({});
const rowSelection = ref({});

// 计算过滤后的数据
const filteredData = computed(() => {
  let result = props.data;

  // 应用状态筛选
  if (
    props.statusFilterField &&
    filterStatus.value !== "all" &&
    filterStatus.value !== undefined
  ) {
    result = result.filter(
      (row) => String(row[props.statusFilterField!]) === filterStatus.value
    );
  }

  return result;
});

// 构建包含选择框的完整列定义
const tableColumns = computed(() => {
  const selectColumn: ColumnDef<any, any> = {
    id: "select",
    header: ({ table }) => {
      return h(Checkbox, {
        checked: table.getIsAllPageRowsSelected() || 
                (table.getIsSomePageRowsSelected() ? 'indeterminate' : false),
        'onUpdate:checked': (value: boolean) => {
          table.toggleAllPageRowsSelected(!!value);
        },
        ariaLabel: "Select all",
      });
    },
    cell: ({ row }) => {
      return h(Checkbox, {
        checked: row.getIsSelected(),
        'onUpdate:checked': (value: boolean) => {
          row.toggleSelected(!!value);
        },
        ariaLabel: "Select row",
      });
    },
    enableSorting: false,
    enableHiding: false,
  };

  return [selectColumn, ...props.columns];
});

const table = useVueTable({
  get data() {
    return filteredData.value;
  },
  get columns() {
    return tableColumns.value;
  },
  state: {
    get sorting() {
      return sorting.value;
    },
    get columnFilters() {
      return columnFilters.value;
    },
    get columnVisibility() {
      return columnVisibility.value;
    },
    get rowSelection() {
      return rowSelection.value;
    },
  },
  enableRowSelection: true,
  onSortingChange: (updaterOrValue) => valueUpdater(updaterOrValue, sorting),
  onColumnFiltersChange: (updaterOrValue) =>
    valueUpdater(updaterOrValue, columnFilters),
  onColumnVisibilityChange: (updaterOrValue) =>
    valueUpdater(updaterOrValue, columnVisibility),
  onRowSelectionChange: (updaterOrValue) =>
    valueUpdater(updaterOrValue, rowSelection),
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
});

// 计算选中行数量
const selectedRowsCount = computed(() => {
  return Object.keys(rowSelection.value).length;
});

// 获取选中的行数据 - 修复版本
const getSelectedRowsData = () => {
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  return selectedRows.map(row => row.original);
};

// 批量删除处理 - 增强版本
const handleBatchDelete = () => {
  console.log('=== 批量删除调试信息 ===');
  console.log('1. 批量删除按钮被点击');
  console.log('2. 当前选中行数量:', selectedRowsCount.value);
  console.log('3. rowSelection 对象:', JSON.stringify(rowSelection.value, null, 2));
  console.log('4. 表格当前数据:', props.data);
  
  try {
    // 检查是否有选中的行
    if (selectedRowsCount.value === 0) {
      console.warn('没有选中任何行');
      alert('请先选择要删除的行');
      return;
    }
    
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    console.log('5. 选中的表格行对象:', selectedRows);
    
    const selectedData = selectedRows.map(row => row.original);
    console.log('6. 选中的原始数据:', selectedData);
    
    // 尝试多种 ID 字段名
    const selectedIds = selectedData.map(item => {
      const id = item.id || item._id || item.uuid || item.key || item.ID;
      console.log(`处理项目: ${JSON.stringify(item)}, 提取的ID: ${id}`);
      return id;
    }).filter(id => id !== undefined && id !== null);
    
    console.log('7. 最终提取的 ID 列表:', selectedIds);
    
    if (selectedIds.length === 0) {
      console.error('无法提取有效的 ID，请检查数据结构');
      console.log('数据示例:', selectedData[0]);
      alert('数据结構有误，无法获取ID');
      return;
    }
    
    console.log('8. 准备触发 batchDelete 事件');
    emit('batchDelete', selectedIds);
    console.log('9. batchDelete 事件已触发，传递的ID:', selectedIds);
    
  } catch (error) {
    console.error('批量删除处理出错:', error);
    alert('批量删除处理失败: ' + error.message);
  }
};

// 监听筛选状态变更，重置分页到第一页
watch(filterStatus, () => {
  table.setPageIndex(0);
});

// 监听数据变化，重置分页和选择状态
watch(
  () => props.data,
  () => {
    table.setPageIndex(0);
    // 清空选择状态
    rowSelection.value = {};
  },
  { deep: true }
);

// 重置所有筛选（包括状态和文本过滤）
const resetFilters = () => {
  table.resetColumnFilters(); // 清除文本过滤
  filterStatus.value = "all"; // 重置状态筛选
  table.setPageIndex(0); // 重置分页到第一页
  rowSelection.value = {}; // 清空选择状态
};

// 状态标签映射函数
const getStatusLabel = (value: string | undefined) => {
  if (value === "all") return "全部";
  const option = (props.statusOptions || []).find(
    (item) => item.value === value
  );
  return option?.label || value;
};

const filterColumns = computed(() => props.filterColumns?.length ? props.filterColumns : props.columns);
const isFiltered = computed(() => table.getState().columnFilters.length > 0);

// 计算可切换的列（排除选择框列）
const toggleColumns = computed(() =>
  table
    .getAllColumns()
    .filter(
      (column) =>
        typeof column.accessorFn !== "undefined" && 
        column.getCanHide() && 
        column.id !== "select"
    )
);

// 暴露清空选择的方法给父组件
defineExpose({
  clearSelection: () => {
    rowSelection.value = {};
  },
  // 暴露调试方法
  getSelectedData: getSelectedRowsData,
  getSelectionState: () => rowSelection.value
});
</script>

<style scoped>
/* 可选：添加筛选状态样式 */
.dropdown-menu-content {
  z-index: 1000;
}
</style>