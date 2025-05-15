<script setup lang="ts">
import type { Table } from '@tanstack/vue-table'
import { computed } from 'vue'

interface DataTableViewOptionsProps {
  table: Table<TiTask>
}

const props = defineProps<DataTableViewOptionsProps>()

const columns = computed(() => props.table.getAllColumns()
  .filter(
    column =>
      typeof column.accessorFn !== 'undefined' && column.getCanHide(),
  ))
</script>

<template>
  <div class="flex items-center space-x-2">
    <NuxtLink to="/tasks/create" class="h-8 px-2">
      <Button variant="outline" size="sm">
        新建任务
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
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuCheckboxItem
          v-for="column in columns"
          :key="column.id"
          class="capitalize"
          :checked="column.getIsVisible()"
          @update:checked="(value) => column.toggleVisibility(!!value)"
        >
          {{ column.id }}
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
