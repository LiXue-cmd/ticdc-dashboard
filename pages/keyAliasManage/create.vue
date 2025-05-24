<!-- /keyAliasManage/create.vue -->
<template>
  <div class="w-full max-w-2xl mx-auto p-6">
    <h2 class="text-2xl font-bold mb-4">新增密钥别名</h2>

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
      <div>
        <label class="block text-sm font-medium text-gray-700">算法</label>
        <Input
          type="text"
          v-model="newKey.algorithm"
          placeholder="请输入算法"
          class="mt-1 block w-full"
        />
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

      <div>
        <label class="block text-sm font-medium text-gray-700">标签</label>
        <Input
          type="text"
          v-model="newKey.tags"
          placeholder="请输入标签，多个标签用逗号分隔"
          class="mt-1 block w-full"
        />
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
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { toast } from "@/components/ui/toast";
import { useFetch } from "#app";

const router = useRouter();

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

const goBack = async () => {
  router.push("/keyAliasManage");
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
    const { data, error } = await useFetch("/api/cdc/newMasterKey", {
      method: "POST",
      body: newKey.value,
    });

    if (error.value) {
      throw new Error(`请求失败：${error.value.statusMessage}`);
    }

    if (data.value) {
      toast({
        title: "成功",
        description: "密钥别名创建成功",
        variant: "default",
      });
      router.push("/keyAliasManage"); // 创建成功后返回列表页
      // 重置表单
      resetForm();
    }
  } catch (err) {
    toast({
      title: "错误",
      description: err.message || "密钥别名创建失败",
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
    if (newPath === "/keyAliasManage/create") {
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
</style>
