<!-- /datakeymanage/create.vue -->
<template>
  <div class="w-full max-w-2xl mx-auto p-6">
    <h2 class="text-2xl font-bold mb-4">新增数据密钥</h2>

    <form class="mt-6 px-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">密钥别名</label>
        <Input
          type="text"
          v-model="newKey.keyAlias"
          placeholder="请输入密钥别名"
          class="mt-1 block w-full"
        />
      </div>

      <!-- 算法下拉选择 -->
      <div>
        <label class="block text-sm font-medium text-gray-700">算法</label>
        <Select v-model="newKey.algorithm">
          <SelectTrigger class="mt-1 w-full">
            <SelectValue placeholder="请选择算法" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="algorithm in algorithmOptions" :key="algorithm.value" :value="algorithm.value">
              {{ algorithm.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">密钥类型</label>
        <RadioGroup
          default-value="option-one"
          v-model="newKey.keyType"
          class="flex flex-row space-x-4"
        >
          <div class="flex items-center space-x-2">
            <RadioGroupItem id="option-one" value="option-one" />
            <Label for="option-one">对称密钥</Label>
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroupItem id="option-two" value="option-two" />
            <Label for="option-two">非对称密钥</Label>
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroupItem id="option-three" value="option-three" />
            <Label for="option-three">HMAC</Label>
          </div>
        </RadioGroup>
      </div>

      <!-- 标签多选下拉框 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">标签</label>
        
        <!-- 已选择的标签显示 -->
        <div class="flex flex-wrap gap-2 mb-2" v-if="selectedTags.length > 0">
          <div
            v-for="(tag, index) in selectedTags"
            :key="index"
            class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
          >
            {{ tag }}
            <button
              type="button"
              @click="removeTag(index)"
              class="text-green-600 hover:text-green-800 font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <!-- 标签选择下拉框 -->
        <Select v-model="selectedTagFromDropdown" @update:modelValue="addTagFromDropdown">
          <SelectTrigger class="mt-1 w-full">
            <SelectValue placeholder="选择或添加标签" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="tag in availableTagOptions" :key="tag" :value="tag">
              {{ tag }}
            </SelectItem>
          </SelectContent>
        </Select>

        <!-- 自定义标签输入 -->
        <div class="flex gap-2 mt-2">
          <Input
            type="text"
            v-model="customTag"
            placeholder="输入自定义标签"
            class="flex-1"
            @keyup.enter="addCustomTag"
          />
          <Button
            type="button"
            @click="addCustomTag"
            variant="outline"
            size="sm"
          >
            添加
          </Button>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">备注说明</label>
        <Textarea
          v-model="newKey.notes"
          placeholder="请输入备注说明"
          class="mt-1 block w-full h-24"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">版本</label>
        <Input
          type="text"
          v-model="newKey.version"
          placeholder="请输入版本"
          class="mt-1 block w-full"
        />
      </div>

      <div class="flex justify-end mt-6">
        <Button type="button" @click="goBack" variant="outline" class="mr-2"
          >取消</Button
        >
        <Button type="button" @click="handleSubmit">创建</Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { toast } from "@/components/ui/toast";
import { useFetch } from "#app";

const router = useRouter();

// 算法选项模拟数据（数据密钥常用算法）
const algorithmOptions = ref([
  { label: "AES-256-GCM", value: "AES-256-GCM" },
  { label: "AES-128-GCM", value: "AES-128-GCM" },
  { label: "AES-256-CBC", value: "AES-256-CBC" },
  { label: "AES-128-CBC", value: "AES-128-CBC" },
  { label: "AES-256-CTR", value: "AES-256-CTR" },
  { label: "AES-128-CTR", value: "AES-128-CTR" },
  { label: "ChaCha20-Poly1305", value: "ChaCha20-Poly1305" },
  { label: "SM4-GCM", value: "SM4-GCM" },
  { label: "SM4-CBC", value: "SM4-CBC" },
  { label: "HMAC-SHA256", value: "HMAC-SHA256" },
  { label: "HMAC-SHA512", value: "HMAC-SHA512" },
  { label: "HMAC-SM3", value: "HMAC-SM3" }
]);

// 预定义标签选项（数据密钥专用标签）
const predefinedTags = ref([
  "数据加密",
  "文件加密",
  "数据库加密",
  "存储加密",
  "传输加密",
  "字段加密",
  "敏感数据",
  "个人信息",
  "财务数据",
  "日志加密",
  "备份加密",
  "归档数据",
  "临时数据",
  "实时加密",
  "批量加密",
  "应用层加密",
  "中间件加密",
  "缓存加密",
  "会话数据",
  "配置加密"
]);

// 已选择的标签
const selectedTags = ref([]);
// 下拉框选择的标签
const selectedTagFromDropdown = ref("");
// 自定义标签输入
const customTag = ref("");

// 可选择的标签选项（排除已选择的）
const availableTagOptions = computed(() => {
  return predefinedTags.value.filter(tag => !selectedTags.value.includes(tag));
});

// 初始化表单数据
const newKey = ref({
  keyAlias: "",
  algorithm: "",
  keyType: "对称密钥", // 默认对称密钥
  tags: "",
  notes: "",
  version: "v1.0", // 默认版本
  status: "active", // 默认启用
});

// 从下拉框添加标签
const addTagFromDropdown = (tag) => {
  if (tag && !selectedTags.value.includes(tag)) {
    selectedTags.value.push(tag);
    selectedTagFromDropdown.value = ""; // 重置下拉框选择
    updateTagsString();
  }
};

// 添加自定义标签
const addCustomTag = () => {
  const tag = customTag.value.trim();
  if (tag && !selectedTags.value.includes(tag)) {
    selectedTags.value.push(tag);
    customTag.value = ""; // 清空输入框
    updateTagsString();
  }
};

// 删除标签
const removeTag = (index) => {
  selectedTags.value.splice(index, 1);
  updateTagsString();
};

// 更新标签字符串（用于提交表单）
const updateTagsString = () => {
  newKey.value.tags = selectedTags.value.join(",");
};

const goBack = async () => {
  router.push("/datakeymanage");
};

// 提交表单
const handleSubmit = async () => {
  if (
    !newKey.value.keyAlias ||
    !newKey.value.algorithm ||
    !newKey.value.version
  ) {
    toast({
      title: "错误",
      description: "请填写必填字段",
      variant: "destructive",
      duration: 3000,
    });
    return;
  }

  try {
    // 发送创建请求
    const { data, error } = await useFetch("/api/cdc/newDataKey", {
      method: "POST",
      body: newKey.value,
    });

    if (error.value) {
      throw new Error(`请求失败：${error.value.statusMessage}`);
    }

    if (data.value) {
      toast({
        title: "成功",
        description: "数据密钥创建成功",
        variant: "default",
      });
      router.push("/datakeymanage"); // 创建成功后返回列表页
      // 重置表单
      resetForm();
    }
  } catch (err) {
    toast({
      title: "错误",
      description: err.message || "数据密钥创建失败",
      variant: "destructive",
    });
  }
};

// 重置表单数据
const resetForm = () => {
  newKey.value = {
    keyAlias: "",
    algorithm: "",
    keyType: "对称密钥",
    tags: "",
    notes: "",
    version: "v1.0",
    status: "active",
  };
  selectedTags.value = [];
  selectedTagFromDropdown.value = "";
  customTag.value = "";
};

// 密钥类型映射函数（根据后端需求调整）
const mapKeyType = (keyType: string) => {
  switch (keyType) {
    case "对称密钥":
      return "symmetric";
    case "非对称密钥":
      return "asymmetric";
    case "HMAC":
      return "hmac";
    default:
      return "symmetric";
  }
};

// 监听路由参数变化（可选，根据实际需求添加）
watch(
  () => router.currentRoute.value.path,
  (newPath) => {
    if (newPath === "/datakeymanage/create") {
      resetForm();
    }
  },
  { immediate: true }
);
</script>

<style scoped>
/* 自定义表单样式（可根据项目UI风格调整） */
.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

label {
  color: #333;
}

input,
textarea {
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
}

/* 标签样式 */
.tag-chip {
  transition: all 0.2s ease-in-out;
}

.tag-chip:hover {
  background-color: #dcfce7;
}

/* 修复选择框箭头位置 */
:deep(.select-trigger) {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

:deep([data-radix-select-trigger]) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

:deep([data-radix-select-icon]) {
  position: absolute;
  right: 12px;
  pointer-events: none;
}
</style>