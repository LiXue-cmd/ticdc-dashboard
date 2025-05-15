<script setup lang="ts">
import type { TiTask } from '@/server/utils/ticdc'
import { columns } from '@/components/tasks/components/columns'
import DataTable from '@/components/tasks/components/DataTable.vue'
// import tasks from '@/components/tasks/data/tasks.json'

const tasks = ref<TiTask[]>([])

async function loadTasks() {
  const { data: feeds } = await useFetch('/api/cdc/tasks')
  if (feeds.value) {
    tasks.value = feeds.value
  }
  console.debug('tasks', tasks.value)
}

onMounted(async () => {
  await loadTasks()
})
</script>

<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">
          同步任务
        </h2>
        <p class="text-muted-foreground">
          Here&apos;s a list of your tasks for this month!
        </p>
      </div>
    </div>
    <DataTable :data="tasks" :columns="columns" />
  </div>
</template>

<style scoped>

</style>
