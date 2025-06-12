<template>
  <div class="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
    <h2 class="text-xl font-bold mb-4">新增标签</h2>
    
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div>
        <label class="block text-sm font-medium text-gray-700">
          标签名称
          <span class="text-red-500">*</span>
        </label>
        <Input
          type="text"
          v-model.trim="form.name"
          :class="{
            'border-red-500': errors.name,
            'shadow-sm': !errors.name,
          }"
          required
          placeholder="请输入标签名称（1-30字）"
          aria-invalid="errors.name"
        />
        <p v-if="errors.name" class="text-sm text-red-500 mt-1">
          {{ errors.name }}
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">
          描述
        </label>
        <Textarea
          v-model.trim="form.description"
          rows="3"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="可选：标签用途说明（最多100字）"
        />
      </div>

      <div class="flex justify-end gap-2">
        <Button variant="outline" @click="goBack">
          取消
        </Button>
        <Button 
          :loading="isLoading"
          :disabled="isLoading || !form.name"
        >
          {{ isLoading ? '保存中...' : '保存' }}
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, type Ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "@/components/ui/toast/use-toast";
import { useFetch } from "#app";
// import { Button, Input, Textarea } from "@/components/ui/dialog";

const router = useRouter();
const { toast } = useToast();
const isLoading = ref(false);

// 表单数据
const form = ref({
  name: "",
  description: "",
});

// 表单验证错误
const errors = ref<{
  name?: string;
}>({});

// 表单验证规则
const validateName = (value: string) => {
  if (!value) return "标签名称不能为空";
  if (value.length < 1 || value.length > 30) {
    return "标签名称需1-30字";
  }
  if (!/^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/.test(value)) {
    return "标签名称仅支持中英文、数字、下划线和短横线";
  }
  return "";
};

// 实时验证
watch(form, (newVal) => {
  errors.value.name = validateName(newVal.name);
}, { deep: true });

// 保存处理函数
const handleSubmit = async () => {
  // 手动触发验证
  errors.value.name = validateName(form.value.name);

  // 验证不通过
  if (Object.values(errors.value).some(error => error)) {
    return toast({
      title: "验证失败",
      description: "请检查输入内容",
      variant: "destructive",
    });
  }

  isLoading.value = true;

  try {
    const { data, error } = await useFetch("/api/tags", {
      method: "POST",
      body: form.value,
    });

    if (error.value) {
      throw new Error(error.value.statusMessage || "保存失败");
    }

    if (data.value) {
      toast({
        description: "标签新增成功！",
        variant: "default",
      });
      router.push("/tags"); // 保存后返回列表页
    }
  } catch (err: any) {
    toast({
      title: "保存失败",
      description: err.message || "请重试",
      variant: "destructive",
    });
  } finally {
    isLoading.value = false;
  }
};

// 返回上一页
const goBack = () => {
  router.back();
};
</script>