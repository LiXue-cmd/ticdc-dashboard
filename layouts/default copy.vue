<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">
              TiCDC Dashboard
            </h1>
          </div>

          <div class="flex items-center space-x-4">
            <!-- User Menu -->
            <div class="relative" v-if="user">
              <button
                @click="showUserMenu = !showUserMenu"
                class="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <img
                  class="h-8 w-8 rounded-full"
                  :src="user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=0ea5e9&color=fff`"
                  :alt="user.username"
                />
                <span class="text-gray-700">{{ user.username }}</span>
                <span
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'"
                >
                  {{ user.role }}
                </span>
              </button>

              <!-- User Dropdown -->
              <div
                v-if="showUserMenu"
                class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
              >
                <div class="py-1">
                  <NuxtLink
                    to="/profile"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </NuxtLink>
                  <NuxtLink
                    v-if="isAdmin"
                    to="/admin"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Admin Panel
                  </NuxtLink>
                  <button
                    @click="handleLogout"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { user, isAdmin, logout } = useAuthStore()
const showUserMenu = ref(false)

// 点击外部关闭菜单
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.relative')) {
      showUserMenu.value = false
    }
  })
})

const handleLogout = async () => {
  await logout()
  showUserMenu.value = false
}
</script>