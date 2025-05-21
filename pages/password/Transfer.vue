<template>
  <div class="flex space-x-8">
    <!-- 左侧待选列表 -->
    <div class="w-64">
      <h3 class="text-sm font-medium text-gray-600 mb-2">
        可用密码 ({{ availablePasswords.length }})
      </h3>
      <div class="border rounded-md shadow-sm">
        <ul class="space-y-1">
          <li
            v-for="password in availablePasswords"
            :key="password.id"
            class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            @click="toggleSelect(password)"
          >
            <span :class="{ 'text-blue-600 font-medium': selectedPasswords.includes(password.id) }">
              {{ password.alias }}
            </span>
          </li>
        </ul>
      </div>
    </div>

    <!-- 中间操作按钮 -->
    <div class="flex flex-col items-center space-y-4">
      <Button
        variant="outline"
        class="w-10 h-10 rounded-full flex items-center justify-center"
        @click="moveToSelected"
      >→</Button>
      <Button
        variant="outline"
        class="w-10 h-10 rounded-full flex items-center justify-center"
        @click="moveToAvailable"
      >←</Button>
    </div>

    <!-- 右侧已选列表 -->
    <div class="w-64">
      <h3 class="text-sm font-medium text-gray-600 mb-2">
        已关联密码 ({{ selectedPasswords.length }})
      </h3>
      <div class="border rounded-md shadow-sm">
        <ul class="space-y-1">
          <li
            v-for="id in selectedPasswords"
            :key="id"
            class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            @click="removeSelected(id)"
          >
            <span class="text-blue-600 font-medium">
              {{ getPasswordAlias(id) }}
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  availablePasswords: { type: Array, required: true },
  selectedPasswords: { type: Array, default: () => [] }
});
const emit = defineEmits(['update:selectedPasswords']);

const removeSelected = (id) => {
  const newSelected = props.selectedPasswords.filter(selectedId => selectedId !== id);
  emit('update:selectedPasswords', newSelected);
};

const toggleSelect = (password) => {
  const newSelected = props.selectedPasswords.includes(password.id) 
    ? props.selectedPasswords.filter(id => id !== password.id) 
    : [...props.selectedPasswords, password.id];
  emit('update:selectedPasswords', newSelected);
};

const moveToSelected = () => {
  const newIds = props.availablePasswords.map(p => p.id);
  emit('update:selectedPasswords', newIds);
};

const moveToAvailable = () => {
  emit('update:selectedPasswords', []);
};

const getPasswordAlias = (id) => {
  return props.availablePasswords.find(p => p.id === id)?.alias || '无';
};
</script>

<style scoped>
ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>