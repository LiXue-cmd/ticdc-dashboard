<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p class="mt-2 text-gray-600">Manage users and system settings</p>
      </div>

      <!-- Users Table -->
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <div class="px-4 py-5 sm:px-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">
            User Management
          </h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">
            View and manage system users
          </p>
        </div>
        
        <div v-if="loading" class="p-4 text-center">
          Loading users...
        </div>
        
        <div v-else-if="error" class="p-4 text-center text-red-600">
          {{ error }}
        </div>
        
        <ul v-else class="divide-y divide-gray-200">
          <li v-for="user in users" :key="user.id" class="px-4 py-4 sm:px-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <img
                  class="h-10 w-10 rounded-full"
                  :src="user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=0ea5e9&color=fff`"
                  :alt="user.username"
                />
                <div class="ml-4">
                  <div class="flex items-center">
                    <div class="text-sm font-medium text-gray-900">
                      {{ user.username }}
                    </div>
                    <span
                      class="ml-2 px-2 py-1 text-xs font-medium rounded-full"
                      :class="user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'"
                    >
                      {{ user.role }}
                    </span>
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ user.email }}
                  </div>
                </div>
              </div>
              <div class="text-sm text-gray-500">
                <div>Created: {{ formatDate(user.createdAt) }}</div>
                <div>Last login: {{ formatDate(user.lastLogin) }}</div>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- System Stats -->
      <div class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Regular Users
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ users?.filter(u => u.role === 'user').length || 0 }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Active Sessions
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ users?.filter(u => u.lastLogin && isRecentLogin(u.lastLogin)).length || 0 }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin']
})

const { user } = useAuthStore()
const users = ref([])
const loading = ref(true)
const error = ref('')

const formatDate = (date: Date | string | undefined) => {
  if (!date) return 'Never'
  return new Date(date).toLocaleString()
}

const isRecentLogin = (lastLogin: Date | string | undefined) => {
  if (!lastLogin) return false
  const now = new Date()
  const loginTime = new Date(lastLogin)
  const diffInHours = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)
  return diffInHours < 24 // Consider active if logged in within last 24 hours
}

// Fetch users data
onMounted(async () => {
  try {
    const response = await $fetch('/api/users')
    users.value = response.data
  } catch (err) {
    error.value = 'Failed to load users'
    console.error('Error loading users:', err)
  } finally {
    loading.value = false
  }
})
</script>