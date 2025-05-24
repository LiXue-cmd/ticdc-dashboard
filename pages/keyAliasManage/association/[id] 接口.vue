<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">关联密钥 - {{ keyAliasDetail.keyAlias || "加载中..." }}</h2>
        <p class="text-muted-foreground">管理与此别名关联的密钥</p>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" @click="goBack">返回</Button>
        <!-- <Button variant="destructive" @click="handleDelete">删除关联</Button> -->
      </div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-sm">
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-4">基本信息</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-muted-foreground">密钥ID</p>
            <p class="font-medium">{{ keyAliasDetail.invoice || "-" }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">算法</p>
            <p class="font-medium">{{ keyAliasDetail.algorithm || "-" }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">创建日期</p>
            <p class="font-medium">{{ keyAliasDetail.createDate || "-" }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">状态</p>
            <Badge 
              variant="outline"
              :class="keyAliasDetail.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
            >
              {{ keyAliasDetail.status === 'active' ? '启用' : '禁用' }}
            </Badge>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-4">密钥关联</h3>
        <p class="text-sm text-muted-foreground mb-4">使用穿梭框管理关联的密钥。已选密钥将与当前别名关联。</p>
        
        <div class="flex flex-col md:flex-row gap-4">
          <!-- 左侧未选择列表 -->
          <div class="flex-1">
            <div class="flex justify-between items-center mb-2">
              <h4 class="font-medium">可用密钥</h4>
              <div class="relative">
                <Input 
                  v-model="sourceFilter" 
                  placeholder="搜索..." 
                  class="pl-9 w-64"
                />
                <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div class="border border-gray-200 rounded-lg h-80 overflow-y-auto p-2">
              <div 
                v-for="item in filteredSourceKeys" 
                :key="item.id"
                class="p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                :class="{'bg-blue-50': selectedSourceKeys.includes(item.id)}"
                @click="toggleSourceSelection(item.id)"
              >
                <div class="flex items-center">
                  <Checkbox 
                    :checked="selectedSourceKeys.includes(item.id)"
                    class="mr-2"
                  />
                  <div class="flex-1">
                    <p class="font-medium">{{ item.name }}</p>
                    <p class="text-sm text-gray-500">{{ item.description }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex justify-between mt-2 text-sm text-gray-500">
              <p>共 {{ availableKeys.length }} 个密钥</p>
              <button 
                class="text-blue-600 hover:text-blue-700"
                @click="selectAllSourceKeys"
                :disabled="availableKeys.length === 0 || availableKeys.length === selectedSourceKeys.length"
              >
                全选
              </button>
            </div>
          </div>
          
          <!-- 中间操作按钮 -->
          <div class="flex flex-col justify-center items-center gap-2 my-4 md:my-0">
            <Button 
              size="sm"
              variant="outline"
              @click="moveToTarget"
              :disabled="selectedSourceKeys.length === 0"
            >
              <ArrowRightIcon class="h-4 w-4" />
            </Button>
            <Button 
              size="sm"
              variant="outline"
              @click="moveToSource"
              :disabled="selectedTargetKeys.length === 0"
            >
              <ArrowLeftIcon class="h-4 w-4" />
            </Button>
          </div>
          
          <!-- 右侧已选择列表 -->
          <div class="flex-1">
            <div class="flex justify-between items-center mb-2">
              <h4 class="font-medium">已关联密钥</h4>
              <div class="relative">
                <Input 
                  v-model="targetFilter" 
                  placeholder="搜索..." 
                  class="pl-9 w-64"
                />
                <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div class="border border-gray-200 rounded-lg h-80 overflow-y-auto p-2">
              <div 
                v-for="item in filteredTargetKeys" 
                :key="item.id"
                class="p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                :class="{'bg-blue-50': selectedTargetKeys.includes(item.id)}"
                @click="toggleTargetSelection(item.id)"
              >
                <div class="flex items-center">
                  <Checkbox 
                    :checked="selectedTargetKeys.includes(item.id)"
                    class="mr-2"
                  />
                  <div class="flex-1">
                    <p class="font-medium">{{ item.name }}</p>
                    <p class="text-sm text-gray-500">{{ item.description }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex justify-between mt-2 text-sm text-gray-500">
              <p>共 {{ selectedKeys.length }} 个关联密钥</p>
              <button 
                class="text-blue-600 hover:text-blue-700"
                @click="selectAllTargetKeys"
                :disabled="selectedKeys.length === 0 || selectedKeys.length === selectedTargetKeys.length"
              >
                全选
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3">
        <Button variant="outline" @click="goBack">取消</Button>
        <Button @click="saveAssociations">保存关联</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "@/components/ui/toast/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useFetch } from "#app";

const router = useRouter();
const route = useRoute();
const { toast } = useToast();

// 当前密钥别名详情
const keyAliasDetail = ref<any>({});

// 所有可用密钥
const availableKeys = ref<any[]>([
  { id: 1, name: "系统根密钥", description: "用于系统核心加密操作", algorithm: "RSA-4096", status: "active" },
  { id: 2, name: "用户数据加密密钥", description: "用于保护用户敏感数据", algorithm: "AES-256", status: "active" },
  { id: 3, name: "API签名密钥", description: "用于API请求签名验证", algorithm: "HMAC-SHA256", status: "active" },
  { id: 4, name: "支付系统密钥", description: "用于支付系统的加密操作", algorithm: "AES-128", status: "active" },
  { id: 5, name: "日志加密密钥", description: "用于加密系统审计日志", algorithm: "ChaCha20", status: "active" },
  { id: 6, name: "会话令牌密钥", description: "用于生成和验证会话令牌", algorithm: "HMAC-SHA512", status: "active" },
  { id: 7, name: "文件加密密钥", description: "用于加密存储的敏感文件", algorithm: "RSA-2048", status: "active" },
  { id: 8, name: "数据库加密密钥", description: "用于数据库字段级加密", algorithm: "AES-256", status: "active" },
  { id: 9, name: "备份加密密钥", description: "用于加密系统备份数据", algorithm: "ChaCha20-Poly1305", status: "active" },
  { id: 10, name: "配置文件密钥", description: "用于加密配置文件中的敏感信息", algorithm: "AES-128", status: "active" },
]);

// 当前已关联的密钥ID
const selectedKeys = ref<number[]>([]);

// 搜索过滤
const sourceFilter = ref("");
const targetFilter = ref("");

// 选中的项
const selectedSourceKeys = ref<number[]>([]);
const selectedTargetKeys = ref<number[]>([]);

// 计算属性 - 过滤后的可用密钥
const filteredSourceKeys = computed(() => {
  return availableKeys.value
    .filter(key => !selectedKeys.value.includes(key.id))
    .filter(key => 
      key.name.toLowerCase().includes(sourceFilter.value.toLowerCase()) ||
      key.description.toLowerCase().includes(sourceFilter.value.toLowerCase())
    );
});

// 计算属性 - 过滤后的已选密钥
const filteredTargetKeys = computed(() => {
  return availableKeys.value
    .filter(key => selectedKeys.value.includes(key.id))
    .filter(key => 
      key.name.toLowerCase().includes(targetFilter.value.toLowerCase()) ||
      key.description.toLowerCase().includes(targetFilter.value.toLowerCase())
    );
});

// 加载密钥别名详情
async function loadKeyAliasDetail() {
  const invoice = route.params.id as string;
  try {
    const { data } = await useFetch(`/api/cdc/keyAliasDetail/${invoice}`);
    if (data.value) {
      keyAliasDetail.value = data.value;
      // 加载已关联的密钥
      loadAssociatedKeys();
    } else {
      toast({
        title: "加载失败",
        description: "未找到该密钥别名",
        variant: "destructive",
      });
      router.push("/keyAliasManage");
    }
  } catch (error) {
    console.error("Error loading key alias detail:", error);
    toast({
      title: "加载失败",
      description: "获取密钥别名信息时出错",
      variant: "destructive",
    });
    router.push("/keyAliasManage");
  }
}

// 加载已关联的密钥
async function loadAssociatedKeys() {
  const invoice = route.params.id as string;
  try {
    const { data } = await useFetch(`/api/cdc/associatedKeys/${invoice}`);
    if (data.value) {
      selectedKeys.value = data.value.map((key: any) => key.id);
    }
  } catch (error) {
    console.error("Error loading associated keys:", error);
    toast({
      title: "加载失败",
      description: "获取关联密钥信息时出错",
      variant: "destructive",
    });
  }
}

// 切换选中状态 - 可用列表
function toggleSourceSelection(keyId: number) {
  if (selectedSourceKeys.value.includes(keyId)) {
    selectedSourceKeys.value = selectedSourceKeys.value.filter(id => id !== keyId);
  } else {
    selectedSourceKeys.value.push(keyId);
  }
}

// 切换选中状态 - 已选列表
function toggleTargetSelection(keyId: number) {
  if (selectedTargetKeys.value.includes(keyId)) {
    selectedTargetKeys.value = selectedTargetKeys.value.filter(id => id !== keyId);
  } else {
    selectedTargetKeys.value.push(keyId);
  }
}

// 全选可用列表
function selectAllSourceKeys() {
  selectedSourceKeys.value = filteredSourceKeys.value.map(key => key.id);
}

// 全选已选列表
function selectAllTargetKeys() {
  selectedTargetKeys.value = filteredTargetKeys.value.map(key => key.id);
}

// 移动到已选
function moveToTarget() {
  if (selectedSourceKeys.value.length === 0) return;
  
  selectedKeys.value = [...selectedKeys.value, ...selectedSourceKeys.value];
  selectedSourceKeys.value = [];
  selectedTargetKeys.value = [];
}

// 移动到可用
function moveToSource() {
  if (selectedTargetKeys.value.length === 0) return;
  
  selectedKeys.value = selectedKeys.value.filter(id => !selectedTargetKeys.value.includes(id));
  selectedSourceKeys.value = [];
  selectedTargetKeys.value = [];
}

// 保存关联
async function saveAssociations() {
  const invoice = route.params.id as string;
  
  try {
    const { error } = await useFetch(`/api/cdc/saveAssociations/${invoice}`, {
      method: "POST",
      body: {
        associatedKeyIds: selectedKeys.value
      }
    });
    
    if (error.value) {
      toast({
        title: "保存失败",
        description: `错误信息: ${error.value.statusMessage}`,
        variant: "destructive",
      });
    } else {
      toast({
        description: "关联已保存成功！",
        variant: "default",
      });
      router.push("/keyAliasManage");
    }
  } catch (error) {
    console.error("Error saving associations:", error);
    toast({
      title: "保存失败",
      description: "保存关联时出错",
      variant: "destructive",
    });
  }
}

// 返回上一页
function goBack() {
  router.back();
  // router.push("/keyAliasManage")
}

// 删除关联
async function handleDelete() {
  const { isConfirmed } = await confirm({
    title: "确认删除关联",
    description: "确定要删除此密钥别名的所有关联吗？此操作不会删除实际密钥。",
    confirmLabel: "确认删除",
    cancelLabel: "取消",
    confirmVariant: "destructive",
  });

  if (isConfirmed) {
    const invoice = route.params.id as string;
    
    try {
      const { error } = await useFetch(`/api/cdc/deleteAssociations/${invoice}`, {
        method: "DELETE",
      });
      
      if (error.value) {
        toast({
          title: "删除失败",
          description: `错误信息: ${error.value.statusMessage}`,
          variant: "destructive",
        });
      } else {
        selectedKeys.value = [];
        toast({
          description: "关联已删除！",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error deleting associations:", error);
      toast({
        title: "删除失败",
        description: "删除关联时出错",
        variant: "destructive",
      });
    }
  }
}

onMounted(() => {
  loadKeyAliasDetail();
});
</script>

<style scoped>
/* 穿梭框容器 */
.transfer-container {
  display: flex;
  gap: 1rem;
}

/* 列表容器 */
.list-container {
  flex: 1;
  min-width: 300px;
}

/* 操作按钮 */
.actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
  padding: 0 1rem;
}
</style>    