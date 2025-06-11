<template>
  <div class="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">
            User Profile
          </h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">
            Personal details and account information.
          </p>
        </div>
        
        <div class="border-t border-gray-200">
          <dl>
            <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">
                Avatar
              </dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <img
                  class="h-16 w-16 rounded-full"
                  :src="profile?.avatar || `https://ui-avatars.com/api/?name=${profile?.username}&background=0ea5e9&color=fff`"
                  :alt="profile?.username"
                />
              </dd>
            </div>
            
            <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">
                Username
              </dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ profile?.username }}
              </dd>
            </div>
            
            <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">
                Email address
              </dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ profile?.email }}
              </dd>
            </div>
            
            <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">
                Role
              </dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="profile?.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'"
                >
                  {{ profile?.role }}
                </span>
              </dd>
            </div>
            
            <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">
                Account created
              </dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ formatDate(profile?.createdAt) }}
              </dd>
            </div>
            
            <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">
                Last login
              </dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ formatDate(profile?.lastLogin) }}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Session Information -->
      <div class="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">
            Session Information
          </h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">
            Current session details and security information.
          </p>
        </div>
        
        <div class="border-t border-gray-200">
          <dl>
            <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">
                Session Status
              </dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </dd>
            </div>
            
            <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">
                Token Expires
              </dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ tokenExpiry }}
              </dd>
            </div>
            
            <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">
                Actions
              </dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <button
                  @click="refreshSession"
                  :disabled="refreshing"
                  class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mr-2 disabled:opacity-50"
                >
                  {{ refreshing ? 'Refreshing...' : 'Refresh Session' }}
                </button>
                <button
                  @click="handleLogout"
                  class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Sign Out
                </button>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { user, logout, refreshSession: refreshAuthSession } = useAuthStore()
interface Profile {
  avatar?: string
  username?: string
  email?: string
  role?: string
  createdAt?: string | Date
  lastLogin?: string | Date
}

const profile = ref<Profile>({})
const loading = ref(true)
const refreshing = ref(false)

const formatDate = (date: Date | string | undefined) => {
  if (!date) return 'Never'
  return new Date(date).toLocaleString()
}

const tokenExpiry = computed(() => {
  // Assume token expires in 24 hours from last refresh
  if (profile.value?.lastLogin) {
    const expiryTime = new Date(profile.value.lastLogin as string)
    expiryTime.setHours(expiryTime.getHours() + 24)
    return expiryTime.toLocaleString()
  }
  return 'Unknown'
})

const refreshSession = async () => {
  refreshing.value = true
  try {
    await refreshAuthSession()
    // Refresh profile data
    await loadProfile()
  } catch (error) {
    console.error('Failed to refresh session:', error)
  } finally {
    refreshing.value = false
  }
}

const handleLogout = async () => {
  await logout()
}

const loadProfile = async () => {
  try {
    const response = await $fetch('/api/profile')
    profile.value = response.data
  } catch (error) {
    console.error('Failed to load profile:', error)
  } finally {
    loading.value = false
  }
}

// Load profile on mount
onMounted(() => {
  loadProfile()
})
</script>