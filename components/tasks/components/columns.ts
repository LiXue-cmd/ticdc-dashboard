import type { ColumnDef } from '@tanstack/vue-table'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { h } from 'vue'
import { labels, statuses } from '../data/data'
import DataTableColumnHeader from './DataTableColumnHeader.vue'
import DataTableRowActions from './DataTableRowActions.vue'

export const columns: ColumnDef<TiTask>[] = [
  {
    id: 'select',
    header: ({ table }) => h(Checkbox, {
      'checked': table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate'),
      'onUpdate:checked': value => table.toggleAllPageRowsSelected(!!value),
      'ariaLabel': 'Select all',
      'class': 'translate-y-0.5',
    }),
    cell: ({ row }) => h(Checkbox, { 'checked': row.getIsSelected(), 'onUpdate:checked': value => row.toggleSelected(!!value), 'ariaLabel': 'Select row', 'class': 'translate-y-0.5' }),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: '任务' }),
    cell: ({ row }) => h('div', { class: 'w-40' }, row.getValue('id')),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: '标题' }),

    cell: ({ row }) => {
      const label = labels.find(label => label.value === row.original.state)

      return h('div', { class: 'flex space-x-2' }, [
        label ? h(Badge, { variant: 'outline' }, () => label.label) : null,
        h('span', { class: 'max-w-[500px] truncate font-medium' }, row.getValue('id')),
      ])
    },
  },
  {
    accessorKey: 'state',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: '状态' }),

    cell: ({ row }) => {
      const state = statuses.find(
        status => status.value === row.getValue('state'),
      )

      if (!state)
        return null

      return h('div', { class: 'flex w-[100px] items-center' }, [
        state.icon && h(state.icon, { class: 'mr-2 h-4 w-4 text-muted-foreground' }),
        h('span', state.label),
      ])
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => h(DataTableRowActions, { row }),
  },
]
