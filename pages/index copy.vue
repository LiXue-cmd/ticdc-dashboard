<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <div class="border-4 border-dashed border-gray-200 rounded-lg p-8">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">
            Welcome to TiCDC Dashboard
          </h1>
          
          <div v-if="user" class="mb-6">
            <p class="text-lg text-gray-600 mb-2">
              Hello, <strong>{{ user.username }}</strong>!
            </p>
            <p class="text-sm text-gray-500">
              Role: {{ user.role }} | Last login: {{ formatDate(user.lastLogin) }}
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <!-- Dashboard Cards -->
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">
                        Active Changefeeds
                      </dt>
                      <dd class="text-lg font-medium text-gray-900">
                        12
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
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">
                        Replication Lag
                      </dt>
                      <dd class="text-lg font-medium text-gray-900">
                        2.3s
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
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">
                        System Status
                      </dt>
                      <dd class="text-lg font-medium text-green-600">
                        Healthy
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-8 flex justify-center space-x-4">
            <NuxtLink
              v-if="isAdmin"
              to="/admin"
              class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
            >
              Admin Panel
            </NuxtLink>
            <NuxtLink
              to="/profile"
              class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              View Profile
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { user, isAdmin } = useAuthStore()

const formatDate = (date: Date | undefined) => {
  if (!date) return 'Never'
  return new Date(date).toLocaleString()
}
</script>