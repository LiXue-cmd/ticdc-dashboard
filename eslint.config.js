<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full text-center">
      <div class="mb-8">
        <h1 class="text-6xl font-bold text-gray-300">{{ error.statusCode }}</h1>
        <h2 class="mt-4 text-2xl font-semibold text-gray-900">
          {{ getErrorTitle(error.statusCode) }}
        </h2>
        <p class="mt-2 text-gray-600">
          {{ error.statusMessage || getErrorMessage(error.statusCode) }}
        </p>
      </div>
      
      <div class="space-y-4">
        <button
          @click="handleError"
          class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Try Again
        </button>
        
        <NuxtLink
          to="/"
          class="block w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Go Home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const props = defineProps<{
  error: {
    statusCode: number
    statusMessage?: string
  }
}>()

const getErrorTitle = (statusCode: number) => {
  switch (statusCode) {
    case 401:
      return 'Unauthorized'
    case 403:
      return 'Forbidden'
    case 404:
      return 'Page Not Found'
    case 500:
      return 'Server Error'
    default:
      return 'An Error Occurred'
  }
}

const getErrorMessage = (statusCode: number) => {
  switch (statusCode) {
    case 401:
      return 'You need to sign in to access this page.'
    case 403:
      return 'You don\'t have permission to access this resource.'
    case 404:
      return 'The page you\'re looking for doesn\'t exist.'
    case 500:
      return 'Something went wrong on our end.'
    default:
      return 'An unexpected error occurred.'
  }
}

const handleError = () => {
  clearError({ redirect: '/' })
}
</script>