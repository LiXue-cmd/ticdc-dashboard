<template>
  <div class="w-full max-w-2xl mx-auto p-6">
    <h2 class="text-2xl font-bold mb-4">加密设备配置</h2>

    <!-- 显示当前加密设备列表 -->
    <div class="bg-white p-4 rounded shadow mb-4">
      <h3 class="text-lg font-bold mb-2">当前加密设备列表</h3>
      <ul>
        <li v-for="device in encryptionDevices" :key="device.id">
          <p><strong>设备名称:</strong> {{ device.name }}</p>
          <p><strong>设备状态:</strong> {{ device.status }}</p>
          <p><strong>关联密钥:</strong> {{ device.associatedKey }}</p>
        </li>
      </ul>
    </div>

    <!-- 加密设备配置表单 -->
    <form class="mt-6 px-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">设备名称</label>
        <Input
          type="text"
          v-model="newDevice.name"
          placeholder="请输入设备名称"
          class="mt-1 block w-full"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">设备状态</label>
        <select v-model="newDevice.status" class="mt-1 block w-full">
          <option value="active">激活</option>
          <option value="inactive">未激活</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">关联密钥</label>
        <Input
          type="text"
          v-model="newDevice.associatedKey"
          placeholder="请输入关联密钥"
          class="mt-1 block w-full"
        />
      </div>
      <Button @click="addDevice">添加设备</Button>
    </form>

    <!-- 添加结果提示 -->
    <div v-if="addResult" class="bg-green-100 p-4 rounded mt-4">
      <p>{{ addResult }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// 模拟当前加密设备数据
const encryptionDevices = ref([
  {
    id: 1,
    name: "加密设备1",
    status: "active",
    associatedKey: "系统根密钥",
  },
  {
    id: 2,
    name: "加密设备2",
    status: "inactive",
    associatedKey: "用户数据加密密钥",
  },
]);

// 新加密设备数据
const newDevice = ref({
  name: "",
  status: "active",
  associatedKey: "",
});

// 添加结果提示
const addResult = ref("");

// 模拟添加加密设备操作
const addDevice = () => {
  if (newDevice.value.name && newDevice.value.associatedKey) {
    const newId = Math.max(...encryptionDevices.value.map((device) => device.id)) + 1;
    encryptionDevices.value.push({
      id: newId,
      ...newDevice.value,
    });
    addResult.value = "加密设备添加成功！";
    newDevice.value = {
      name: "",
      status: "active",
      associatedKey: "",
    };
  } else {
    addResult.value = "请输入有效的设备名称和关联密钥。";
  }
};
</script>

<style scoped>
/* 样式可根据需要自定义 */
</style>