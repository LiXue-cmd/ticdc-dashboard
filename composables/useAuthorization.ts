// composables/useAuthorization.ts
import { useState } from '#app'
// import { computed, Ref } from 'vue'
import type { Ref } from 'vue'

interface User {
  id: number,
  name: string,
  username: string,
  role: string,
  permissions: string[],
}

export const useAuthorization = () => {
  // 使用全局状态存储用户信息
  const user: Ref<User | null> = useState('user', () => null)

  // 检查用户是否拥有某个角色
  const hasRole = (role: string) => {
    return user.value?.role === role
  }

  // 检查用户是否拥有某个权限
  const can = (permission: string) => {
    return user.value?.permissions?.includes(permission) || false
  }

  // 设置用户信息
  const setUser = (newUser: User) => {
    console.log('setUser', newUser)
    user.value = newUser
  }

  // 清除用户信息（登出）
  const clearUser = () => {
    user.value = null
    // 在实际项目中，还应清除cookie或session
    navigateTo('/login');
  }

  return {
    user,
    hasRole,
    can,
    setUser,
    clearUser
  }
}