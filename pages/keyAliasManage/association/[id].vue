<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">
          关联密钥 - {{ keyAliasDetail.keyAlias || "加载中..." }}
        </h2>
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
            <p class="text-sm text-muted-foreground">密钥别名</p>
            <p class="font-medium">{{ keyAliasDetail.keyAlias || "-" }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">创建日期</p>
            <p class="font-medium">{{ keyAliasDetail.createDate || "-" }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">更新日期</p>
            <p class="font-medium">{{ keyAliasDetail.updateDate || "-" }}</p>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-4">密钥关联</h3>
        <p class="text-sm text-muted-foreground mb-4">
          选择一个密钥与此别名关联。
        </p>
        
        <div class="relative">
          <!-- 搜索和选择框 -->
          <div class="relative">
            <Input 
              v-model="searchQuery" 
              placeholder="搜索或选择密钥..." 
              class="pl-9 w-full"
              @focus="showDropdown = true"
              @click="showDropdown = true"
            />
            <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <ChevronDownIcon 
              class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              @click.stop="showDropdown = !showDropdown"
            />
          </div>
          
          <!-- 下拉列表 -->
          <div 
            v-show="showDropdown"
            class="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10"
          >
            <!-- 无搜索结果 -->
            <div v-if="filteredKeys.length === 0" class="p-3 text-gray-500">
              没有找到匹配的密钥
            </div>
            
            <!-- 搜索结果列表 -->
            <div 
              v-for="key in filteredKeys" 
              :key="key.id"
              class="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
              :class="{'bg-blue-50': selectedKey?.id === key.id}"
              @click="selectKey(key)"
            >
              <div class="flex items-center">
                <Radio 
                  :checked="selectedKey?.id === key.id"
                  class="mr-3"
                />
                <div>
                  <p class="font-medium">{{ key.name }}</p>
                  <p class="text-sm text-gray-500">{{ key.description }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 当前选中的密钥信息 -->
          <div v-if="selectedKey" class="mt-4 p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center">
              <CheckIcon class="h-5 w-5 text-green-500 mr-2" />
              <div>
                <p class="font-medium">已选择: {{ selectedKey.name }}</p>
                <p class="text-sm text-gray-500">{{ selectedKey.description }}</p>
              </div>
              <button 
                class="ml-auto text-gray-400 hover:text-gray-600"
                @click="clearSelection"
              >
                <XIcon class="h-4 w-4" />
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
// import { Radio, Checkbox } from "@/components/ui/radio";

// 模拟接口返回数据
const mockKeyAliasDetail = (id: string) => ({
  invoice: id,
  keyAlias: "用户数据加密",
  algorithm: "RSA-2048",
  createDate: "2023-07-22",
  updateDate: "2023-07-23", // 添加更新日期
  status: "active",
  notes: "用于保护用户敏感数据的非对称密钥"
});

const mockAssociatedKeys = (id: string) => 
  id === "MK-2023002" ? 2 : null; // 模拟不同ID的关联密钥（返回密钥ID或null）

const router = useRouter();
const route = useRoute();
const { toast } = useToast();

// 当前密钥别名详情
const keyAliasDetail = ref<any>({});

// 所有可用密钥（模拟数据）
const availableKeys = ref<any[]>([
  { id: 1, name: "系统根密钥", description: "用于系统核心加密操作", algorithm: "RSA-4096", status: "active" },
  { id: 2, name: "用户数据加密密钥", description: "用于保护用户敏感数据", algorithm: "AES-256", status: "active" },
  { id: 3, name: "API签名密钥", description: "用于API请求签名验证", algorithm: "HMAC-SHA256", status: "active" },
  { id: 4, name: "支付系统密钥", description: "用于支付系统的加密操作", algorithm: "AES-128", status: "active" },
  { id: 5, name: "日志加密密钥", description: "用于加密系统审计日志", algorithm: "ChaCha20", status: "active" },
]);

// 当前选中的密钥
const selectedKey = ref<any | null>(null);

// 搜索查询
const searchQuery = ref("");

// 是否显示下拉列表
const showDropdown = ref(false);

// 计算属性 - 过滤后的密钥列表
const filteredKeys = computed(() => {
  if (!searchQuery.value.trim()) {
    return availableKeys.value;
  }
  
  const query = searchQuery.value.toLowerCase();
  return availableKeys.value.filter(key => 
    key.name.toLowerCase().includes(query) || 
    key.description.toLowerCase().includes(query) ||
    key.algorithm.toLowerCase().includes(query)
  );
});

// 加载密钥别名详情（模拟接口调用）
async function loadKeyAliasDetail() {
  const id = route.params.id as string;
  keyAliasDetail.value = mockKeyAliasDetail(id);
  
  // 加载已关联的密钥
  const associatedKeyId = mockAssociatedKeys(id);
  if (associatedKeyId) {
    selectedKey.value = availableKeys.value.find(key => key.id === associatedKeyId) || null;
  }
}

// 选择密钥
function selectKey(key: any) {
  selectedKey.value = key;
  searchQuery.value = key.name;
  showDropdown.value = false;
}

// 清除选择
function clearSelection() {
  selectedKey.value = null;
  searchQuery.value = "";
  showDropdown.value = true;
}

// 保存关联（模拟接口调用）
async function saveAssociations() {
  if (!selectedKey.value) {
    toast({
      description: "请选择一个密钥进行关联！",
      variant: "error",
    });
    return;
  }
  
  const id = route.params.id as string;
  toast({
    description: `已成功关联密钥：${selectedKey.value.name}`,
    variant: "default",
  });
  router.push("/keyaliasmanage");
}

// 返回上一页
function goBack() {
  router.back();
}

// 删除关联（模拟接口调用）
async function handleDelete() {
  const { isConfirmed } = await confirm({
    title: "确认删除关联",
    description: "确定要删除此密钥别名的关联吗？此操作不会删除实际密钥。",
    confirmLabel: "确认删除",
    cancelLabel: "取消",
    confirmVariant: "destructive",
  });

  if (isConfirmed) {
    selectedKey.value = null;
    toast({
      description: "关联已删除！",
      variant: "default",
    });
  }
}

onMounted(() => {
  loadKeyAliasDetail();
});
</script>

<style scoped>
/* 搜索框和下拉列表样式 */
.search-container {
  position: relative;
}

.dropdown {
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  margin-top: 4px;
  z-Index: 10;
}
</style>