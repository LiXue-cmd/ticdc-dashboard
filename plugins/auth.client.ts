export default defineNuxtPlugin(async () => {
  const { data: sessionData, refresh } = useAuth()
  
  // 自动刷新 session
  if (sessionData.value) {
    // 每30分钟检查一次session状态
    setInterval(async () => {
      try {
        await refresh()
      } catch (error) {
        console.warn('Failed to refresh session:', error)
      }
    }, 30 * 60 * 1000) // 30 minutes
  }
})