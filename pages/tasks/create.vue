<!-- create.vue -->
<script lang="ts" setup>
import { basicSetup } from 'codemirror'
import { useToast } from '~/components/ui/toast/use-toast'

const { toast } = useToast()

const defaultConfig = `{
  "changefeed_id": "string",
  "replica_config": {
    "bdr_mode": true,
    "case_sensitive": false,
    "check_gc_safe_point": true,
    "consistent": {
      "flush_interval": 0,
      "level": "string",
      "max_log_size": 0,
      "storage": "string"
    },
    "enable_old_value": true,
    "enable_sync_point": true,
    "filter": {
      "event_filters": [
        {
          "ignore_delete_value_expr": "string",
          "ignore_event": [
            "string"
          ],
          "ignore_insert_value_expr": "string",
          "ignore_sql": [
            "string"
          ],
          "ignore_update_new_value_expr": "string",
          "ignore_update_old_value_expr": "string",
          "matcher": [
            "string"
          ]
        }
      ],
      "ignore_txn_start_ts": [
        0
      ],
      "rules": [
        "string"
      ]
    },
    "force_replicate": true,
    "ignore_ineligible_table": true,
    "memory_quota": 0,
    "mounter": {
      "worker_num": 0
    },
    "sink": {
      "column_selectors": [
        {
          "columns": [
            "string"
          ],
          "matcher": [
            "string"
          ]
        }
      ],
      "csv": {
        "delimiter": "string",
        "include_commit_ts": true,
        "null": "string",
        "quote": "string"
      },
      "date_separator": "string",
      "dispatchers": [
        {
          "matcher": [
            "string"
          ],
          "partition": "string",
          "topic": "string"
        }
      ],
      "enable_partition_separator": true,
      "encoder_concurrency": 0,
      "protocol": "string",
      "schema_registry": "string",
      "terminator": "string",
      "transaction_atomicity": "string"
    },
    "sync_point_interval": "string",
    "sync_point_retention": "string"
  },
  "sink_uri": "string",
  "start_ts": 0,
  "target_ts": 0
}`

const code = ref(defaultConfig)
const taskCreating = ref(false)

async function handleCreateTask() {
  taskCreating.value = true

  const { error } = await useFetch('/api/cdc/newtask', { method: 'POST', body: code.value })
  if (error?.value) {
    console.log(JSON.stringify(error.value))
    toast({
      title: '任务创建失败',
      description: `错误信息: ${error.value?.statusMessage}`,
      variant: 'destructive',
    })
    taskCreating.value = false
  }
  else {
    taskCreating.value = false
    // Redirect to the task list page
    await navigateTo('/tasks')
  }
}
</script>

<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">
          新建同步任务
        </h2>
        <p class="text-muted-foreground">
          请参考手册编辑配置参数
        </p>
      </div>
    </div>
    <div class="flex">
      <Tabs default-value="json" class="w-full">
        <TabsList class="grid grid-cols-2">
          <TabsTrigger value="json">
            JSON 配置
          </TabsTrigger>
          <TabsTrigger value="ui" disabled>
            表单配置(coming)
          </TabsTrigger>
        </TabsList>
        <TabsContent value="json">
          <Card>
            <CardHeader>
              <h2 class="text-lg font-semibold">
                使用编辑器编写同步配置
              </h2>
            </CardHeader>
            <CardContent>
              <ClientOnly>
                <NuxtCodeMirror
                  v-model="code"
                  class="editor-container"
                  placeholder="Enter your code here..."
                  :auto-focus="true"
                  :editable="true"
                  :basic-setup="true"
                  :indent-with-tab="true"
                  :extensions="[basicSetup]"
                  theme="dark"
                >
                  Loading
                </NuxtCodeMirror>
              </ClientOnly>
              <Button class="mt-4" :disabled="taskCreating" :loading="taskCreating" @click="handleCreateTask">
                创建任务
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="ui">
          <Card>
            <CardHeader>
              <h2 class="text-lg font-semibold">
                使用编辑器编写同步配置
              </h2>
            </CardHeader>
            <CardContent>
              <!-- comming -->
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  </div>
</template>

<style>
.editor-container {
  resize: vertical;
  overflow: auto;
  box-sizing: border-box;
  height: 400px;
}

.editor-container .cm-editor {
  height: 100%;
  max-height: none;
}
</style>
