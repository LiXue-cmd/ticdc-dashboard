<!-- DataTable.vue -->
<template>
  <div class="space-y-4">
    <!-- 过滤字段和新增任务按钮 -->
    <div class="flex items-center justify-between">
      <!-- 过滤字段 -->
      <div class="flex flex-1 items-center space-x-2">
        <Input
          v-for="filterColumn in filterColumns"
          :key="filterColumn.accessorKey"
          :placeholder="`过滤 ${filterColumn.header}...`"
          :model-value="(table.getColumn(filterColumn.accessorKey)?.getFilterValue() as string) ?? ''"
          class="h-8 w-[150px] lg:w-[250px]"
          @input="table.getColumn(filterColumn.accessorKey)?.setFilterValue($event.target.value)"
        />
        <!-- 状态筛选下拉菜单（动态渲染） -->
      <template v-if="isStatusFilterEnabled">
        <DropdownMenu class="w-[120px]">
          <DropdownMenuTrigger as-child>
            <Button
              variant="outline"
              size="sm"
              class="h-8"
            >
              状态: {{ getStatusLabel(filterStatus.value) || '全部' }}
              <Icon name="i-radix-icons-chevron-down" class="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuCheckboxItem
              value="all"
              :checked="filterStatus.value === 'all'"
              @update:checked="(value) => setFilterStatus(value ? 'all' : undefined)"
            >
              全部
            </DropdownMenuCheckboxItem>
            <!-- 动态渲染父组件传递的状态选项 -->
            <DropdownMenuCheckboxItem
              v-for="option in props.statusOptions || []"
              :key="option.value"
              :value="option.value"
              :checked="filterStatus.value === option.value"
              @update:checked="(value) => setFilterStatus(value ? option.value : undefined)"
            >
              {{ option.label }}
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </template>
        
        <Button
          v-if="isFiltered || (isStatusFilterEnabled && filterStatus.value !== 'all')""
          variant="ghost"
          class="h-8 px-2 lg:px-3"
          @click="resetFilters"
        >
          重置
          <Icon name="i-radix-icons-cross-2" class="ml-2 h-4 w-4" />
        </Button>
      </div>
      <!-- 新增任务按钮和切换列显示菜单 -->
      <div class="flex items-center space-x-2">
        <NuxtLink :to="addTaskRoute" class="h-8 px-2">
          <Button variant="outline" size="sm">
            {{ addTaskText }}
          </Button>
        </NuxtLink>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              variant="outline"
              size="sm"
              class="ml-auto hidden h-8 lg:flex"
            >
              <Icon name="i-radix-icons-mixer-horizontal" class="mr-2 h-4 w-4" />
              View
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
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <TableHead v-for="header in headerGroup.headers" :key="header.id">
              <DataTableColumnHeader
                v-if="!header.isPlaceholder && header.column.columnDef.header"
                :column="header.column"
                :title="header.column.columnDef.header"
                class="cursor-pointer"
              />
              <FlexRender v-else-if="!header.isPlaceholder" :render="header.column.columnDef.header" :props="header.getContext()" />
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
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </TableCell>
            </TableRow>
          </template>
          <TableRow v-else>
            <TableCell
              :colspan="columns.length"
              class="h-24 text-center"
            >
              No results.
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
} from '@tanstack/vue-table'
import { ref, computed } from 'vue'
import { valueUpdater } from '@/lib/utils'
import {
  FlexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import DataTablePagination from './DataTablePagination.vue'
import DataTableColumnHeader from './DataTableColumnHeader.vue' // 引入新的表头组件
// import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
// import { Input, Button, Icon, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem } from '@/components/ui'
// import { NuxtLink } from '#app'

interface DataTableProps {
  columns: ColumnDef<any, any>[]
  data: any[]
  filterColumns?: ColumnDef<any, any>[]
  addTaskRoute?: string
  addTaskText?: string
  // 新增：状态筛选相关Props
  statusFilterField?: string // 状态字段名（如 'status'）
  statusOptions?: { label: string; value: string }[] // 状态选项列表
}
const props = defineProps<DataTableProps>()
// 组件内响应式状态
const filterStatus = ref<string | undefined>('all') // 当前筛选状态
const isStatusFilterEnabled = computed(() => !!props.statusFilterField) // 是否启用状态筛选

const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = ref<VisibilityState>({})
const rowSelection = ref({})

const table = useVueTable({
  get data() { return props.data },
  get columns() { return props.columns },
  state: {
    get sorting() { return sorting.value },
    get columnFilters() { return columnFilters.value },
    get columnVisibility() { return columnVisibility.value },
    get rowSelection() { return rowSelection.value },
  },
  enableRowSelection: true,
  onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),
  onColumnFiltersChange: updaterOrValue => valueUpdater(updaterOrValue, columnFilters),
  onColumnVisibilityChange: updaterOrValue => valueUpdater(updaterOrValue, columnVisibility),
  onRowSelectionChange: updaterOrValue => valueUpdater(updaterOrValue, rowSelection),
  getCoreRowModel: getCoreRowModel(),
  // getFilteredRowModel: getFilteredRowModel(),
  getFilteredRowModel: getFilteredRowModel((row) => {
    // 文本过滤（原有逻辑）
    const textFilterPasses = row.getIsFilteredByAnyColumn();
    
    // 状态过滤（仅当启用时生效）
    const statusFilterPasses = !isStatusFilterEnabled || 
      filterStatus.value === 'all' || 
      row.original[props.statusFilterField] === filterStatus.value; // 使用父组件字段名
    
    return textFilterPasses && statusFilterPasses;
  }),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFacetedRowModel: getFacetedRowModel(),
  getFacetedUniqueValues: getFacetedUniqueValues(),

})
// 重置所有筛选（包括状态和文本过滤）
const resetFilters = () => {
  table.resetColumnFilters();
  filterStatus.value = 'all'; // 重置状态筛选
};

// 状态标签映射函数
const getStatusLabel = (value: string | undefined) => {
  if (value === 'all') return '全部';
  const option = (props.statusOptions || []).find((item) => item.value === value);
  return option?.label || value;
};
const filterColumns = computed(() => props.filterColumns || props.columns)
const isFiltered = computed(() => table.getState().columnFilters.length > 0)
const addTaskRoute = computed(() => props.addTaskRoute || '/tasks/create')
const addTaskText = computed(() => props.addTaskText || '新建任务')

// 计算可切换的列
const toggleColumns = computed(() => table.getAllColumns()
  .filter(
    column =>
      typeof column.accessorFn !== 'undefined' && column.getCanHide(),
  ))
</script>

<style scoped>

</style>    