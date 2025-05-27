export const useAuthStore = () => {
  const { data: session, status, signIn, signOut } = useAuth()

  const user = computed(() => session.value?.user)
  const isAuthenticated = computed(() => status.value === 'authenticated')
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isLoading = computed(() => status.value === 'loading')

  const login = async (credentials: LoginCredentials) => {
    try {
      const result = await signIn('credentials', {
        username: credentials.username,
        password: credentials.password,
        redirect: false
      })

      if (result?.error) {
        throw new Error('账号或密码错误')
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '登录失败' 
      }
    }
  }

  const logout = async () => {
    await signOut({ redirect: false })
    await navigateTo('/login')
  }

  const refreshSession = async () => {
    await refreshCookie('auth.session-token')
  }

  return {
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    login,
    logout,
    refreshSession
  }
}