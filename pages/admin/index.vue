<!-- pages/admin/index.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">管理控制面板</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-xl font-bold mb-4">用户管理</h2>
        <p class="text-gray-600 mb-4">管理系统用户、角色和权限。</p>
        <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-200">
          查看用户列表
        </button>
      </div>
      
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-xl font-bold mb-4">系统设置</h2>
        <p class="text-gray-600 mb-4">配置系统参数和全局设置。</p>
        <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-200">
          系统设置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth',
  requiresRole: 'admin'
});
</script>